import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { CHECKS, PLATFORMS, type CheckId, type PlatformId, type ScanCheck, type ScanPlatform, type ScanResult } from "./visibility-model";

const PLATFORM_WEIGHTS: Record<PlatformId, Record<CheckId, number>> = {
  chatgpt: { crawl: 16, indexable: 10, snippet: 6, place: 6, answers: 12, schema: 12, contact: 6, path: 4, llms: 18, fresh: 10 },
  perplexity: { crawl: 8, indexable: 16, snippet: 8, place: 8, answers: 18, schema: 10, contact: 6, path: 4, llms: 14, fresh: 8 },
  gemini: { crawl: 10, indexable: 12, snippet: 6, place: 8, answers: 12, schema: 22, contact: 8, path: 6, llms: 10, fresh: 6 },
  google: { crawl: 8, indexable: 18, snippet: 8, place: 8, answers: 16, schema: 14, contact: 8, path: 6, llms: 8, fresh: 6 }
};

type Evidence = {
  ratios: Record<CheckId, number>;
  findings: Record<CheckId, string>;
  crawler: Record<PlatformId, number>;
  crawlerNote: Record<PlatformId, string>;
};

const STATES = [
  "alabama", "alaska", "arizona", "arkansas", "california", "colorado", "connecticut", "delaware", "florida", "georgia",
  "hawaii", "idaho", "illinois", "indiana", "iowa", "kansas", "kentucky", "louisiana", "maine", "maryland",
  "massachusetts", "michigan", "minnesota", "mississippi", "missouri", "montana", "nebraska", "nevada", "new hampshire",
  "new jersey", "new mexico", "new york", "north carolina", "north dakota", "ohio", "oklahoma", "oregon", "pennsylvania",
  "rhode island", "south carolina", "south dakota", "tennessee", "texas", "utah", "vermont", "virginia", "washington",
  "west virginia", "wisconsin", "wyoming", "district of columbia"
];

const SERVICE = /\b(lawyer|attorney|law firm|law office|esq\.?|legal services|practice|clinic|dentist|physician|plumber|restaurant|salon|agency|consultant)\b/i;

export class ScanError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ScanError";
  }
}

export function isBlockedIp(ip: string): boolean {
  const normalized = ip.toLowerCase().replace(/^\[|\]$/g, "");
  if (normalized === "::1" || normalized === "::" || normalized.startsWith("fe80:") || normalized.startsWith("fc") || normalized.startsWith("fd")) return true;
  const mapped = normalized.match(/:ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isBlockedIp(mapped[1]);
  if (normalized.includes(":")) return false;
  const parts = normalized.split(".").map((part) => Number(part));
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part) || part < 0 || part > 255)) return true;
  const [a, b] = parts;
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  return false;
}

export async function assertPublicHttpUrl(input: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    throw new ScanError("Enter a full website URL, including https://.");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") throw new ScanError("Only http and https websites can be scanned.");
  if (url.username || url.password) throw new ScanError("Remove the username and password from the URL.");
  const host = url.hostname.toLowerCase().replace(/\.$/, "");
  if (!host || host === "localhost" || host.endsWith(".local") || host.endsWith(".internal") || host.endsWith(".localhost")) {
    throw new ScanError("That address cannot be scanned.");
  }
  if (isIP(host)) {
    if (isBlockedIp(host)) throw new ScanError("That address cannot be scanned.");
    return url;
  }
  let records: { address: string }[];
  try {
    records = await lookup(host, { all: true, verbatim: true });
  } catch {
    throw new ScanError("The website could not be found.");
  }
  if (records.length === 0 || records.some((record) => isBlockedIp(record.address))) {
    throw new ScanError("That address cannot be scanned.");
  }
  return url;
}

function decode(value: string): string {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, code: string) => {
      const n = Number(code);
      return n > 0 && n < 65536 ? String.fromCharCode(n) : " ";
    });
}

function visibleText(html: string): string {
  return decode(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  ).replace(/\s+/g, " ").trim();
}

function words(value: string): number {
  return value ? value.split(/\s+/).filter(Boolean).length : 0;
}

function metaContent(html: string, key: string): string {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
  for (const tag of tags) {
    const name = tag.match(/(?:name|property)=["']([^"']+)["']/i)?.[1]?.toLowerCase();
    if (name !== key) continue;
    return decode(tag.match(/content=["']([^"']*)["']/i)?.[1] ?? "");
  }
  return "";
}

type RobotGroup = { agents: string[]; allow: string[]; disallow: string[] };

export function parseRobots(text: string): RobotGroup[] {
  const groups: RobotGroup[] = [];
  let agents: string[] = [];
  let allow: string[] = [];
  let disallow: string[] = [];
  let inRules = false;
  const flush = () => {
    if (agents.length) groups.push({ agents: [...agents], allow: [...allow], disallow: [...disallow] });
    agents = [];
    allow = [];
    disallow = [];
    inRules = false;
  };
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/#.*/g, "").trim();
    if (!line) {
      if (inRules) flush();
      continue;
    }
    const split = line.indexOf(":");
    if (split < 0) continue;
    const key = line.slice(0, split).trim().toLowerCase();
    const value = line.slice(split + 1).trim();
    if (key === "user-agent") {
      if (inRules) flush();
      agents.push(value.toLowerCase());
    } else if (key === "allow" || key === "disallow") {
      inRules = true;
      if (key === "allow") allow.push(value);
      else disallow.push(value);
    }
  }
  flush();
  return groups;
}

export function crawlerAllowed(groups: RobotGroup[], agent: string, path: string): boolean {
  const specific = groups.filter((group) => group.agents.includes(agent.toLowerCase()));
  const rules = specific.length ? specific : groups.filter((group) => group.agents.includes("*"));
  let blocked = false;
  let longest = -1;
  for (const group of rules) {
    for (const rule of group.disallow) {
      if (!rule) continue;
      if (path.startsWith(rule) && rule.length >= longest) {
        longest = rule.length;
        blocked = true;
      }
    }
    for (const rule of group.allow) {
      if (rule && path.startsWith(rule) && rule.length >= longest) {
        longest = rule.length;
        blocked = false;
      }
    }
  }
  return !blocked;
}

function walkJson(node: unknown, visit: (record: Record<string, unknown>) => void) {
  if (!node) return;
  if (Array.isArray(node)) {
    node.forEach((item) => walkJson(item, visit));
    return;
  }
  if (typeof node !== "object") return;
  const record = node as Record<string, unknown>;
  visit(record);
  if (record["@graph"]) walkJson(record["@graph"], visit);
}

function jsonLd(html: string): Record<string, unknown>[] {
  const blocks = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  const records: Record<string, unknown>[] = [];
  for (const block of blocks) {
    try {
      walkJson(JSON.parse(block[1]), (record) => records.push(record));
    } catch {
      continue;
    }
  }
  return records;
}

function typesOf(record: Record<string, unknown>): string[] {
  const value = record["@type"];
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string");
  return [];
}

function asText(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) return value.map(asText).filter(Boolean).join(" ");
  if (value && typeof value === "object" && "name" in value) return asText((value as { name?: unknown }).name);
  return "";
}

function ageRatio(iso: string): number | null {
  const time = Date.parse(iso);
  if (Number.isNaN(time)) return null;
  const days = (Date.now() - time) / 86400000;
  if (days < 0) return 0.7;
  if (days <= 540) return 1;
  if (days <= 1080) return 0.65;
  return 0.3;
}

function headingAnswers(html: string): { heading: string; count: number }[] {
  const marks = [...html.matchAll(/<h([2-3])\b[^>]*>([\s\S]*?)<\/h\1>/gi)];
  return marks.map((mark, index) => {
    const start = (mark.index ?? 0) + mark[0].length;
    const end = index + 1 < marks.length ? (marks[index + 1].index ?? html.length) : html.length;
    return { heading: visibleText(mark[2]).slice(0, 80), count: words(visibleText(html.slice(start, end)).slice(0, 1200)) };
  });
}

export function scoreFetched(input: {
  finalUrl: string;
  status: number;
  html: string;
  headers: { get(name: string): string | null };
  robotsStatus: number;
  robotsText: string;
  llmsStatus: number;
  llmsText: string;
}): Evidence {
  const path = new URL(input.finalUrl).pathname || "/";
  const groups = input.robotsStatus === 200 ? parseRobots(input.robotsText.slice(0, 200_000)) : [];
  const crawler: Record<PlatformId, number> = { chatgpt: 1, perplexity: 1, gemini: 1, google: 1 };
  const crawlerNote: Record<PlatformId, string> = {
    chatgpt: "GPTBot and OAI-SearchBot are allowed.",
    perplexity: "PerplexityBot is allowed.",
    gemini: "Google-Extended is allowed.",
    google: "Googlebot is allowed."
  };
  const crawlerLabel: Record<string, string> = {
    gptbot: "GPTBot",
    "oai-searchbot": "OAI-SearchBot",
    perplexitybot: "PerplexityBot",
    "google-extended": "Google-Extended",
    googlebot: "Googlebot"
  };
  const blockedNames: string[] = [];
  if (input.robotsStatus === 200) {
    for (const platform of PLATFORMS) {
      const allowed = platform.crawlers.filter((agent) => crawlerAllowed(groups, agent, path));
      crawler[platform.id] = allowed.length / platform.crawlers.length;
      if (crawler[platform.id] === 1) continue;
      const names = platform.crawlers.filter((agent) => !allowed.includes(agent)).map((agent) => crawlerLabel[agent] ?? agent);
      blockedNames.push(...names);
      crawlerNote[platform.id] = `${names.join(" and ")} is blocked in robots.txt.`;
    }
  } else {
    for (const platform of PLATFORMS) crawlerNote[platform.id] = "No robots.txt. Crawlers are allowed unless the host blocks them elsewhere.";
  }
  const crawlRatio = input.robotsStatus === 200
    ? PLATFORMS.reduce((sum, platform) => sum + crawler[platform.id], 0) / PLATFORMS.length
    : 0.75;
  const crawlFinding = input.robotsStatus !== 200
    ? "No robots.txt was found. Crawlers are allowed by default. A file that names the AI crawlers is clearer."
    : blockedNames.length
      ? `robots.txt blocks ${[...new Set(blockedNames)].join(", ")}.`
      : "robots.txt allows GPTBot, OAI-SearchBot, PerplexityBot, Google-Extended, and Googlebot on this path.";

  const text = visibleText(input.html);
  const title = visibleText((input.html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "")).slice(0, 180);
  const robotsMeta = `${metaContent(input.html, "robots")} ${input.headers.get("x-robots-tag") ?? ""}`.toLowerCase();
  const noindex = robotsMeta.includes("noindex");
  const wordCount = words(text);
  let indexable = 0;
  if (input.status === 200) indexable += 0.4;
  if (wordCount >= 300) indexable += 0.4;
  else if (wordCount >= 120) indexable += 0.2;
  if (!noindex) indexable += 0.2;
  else indexable = Math.min(indexable, 0.2);
  const description = metaContent(input.html, "description").replace(/\s+/g, " ").trim();
  const genericTitle = /^(home|welcome|untitled|index)$/i.test(title.trim());
  let snippet = 0;
  if (title && !genericTitle) {
    snippet += title.length >= 20 && title.length <= 70 ? 0.5 : title.length >= 12 ? 0.3 : 0.15;
  }
  if (description.length >= 50 && description.length <= 170) snippet += 0.5;
  else if (description.length >= 30) snippet += 0.25;
  else if (description) snippet += 0.1;
  const snippetFinding = !title
    ? "No page title was found."
    : genericTitle
      ? "The title is generic. Add the service and place."
      : description
        ? `Title is ${title.length} characters. Meta description is ${description.length} characters.`
        : "The title is specific. No meta description was found.";
  const hasTel = /href=["']tel:/i.test(input.html);
  const hasContactLink = /href=["'][^"']*(contact|consult|appointment|schedule|intake)/i.test(input.html);
  const hasForm = /<form\b/i.test(input.html);
  const hasCta = /\b(contact us|call now|free consultation|schedule a|request a consult|speak with an attorney)\b/i.test(text);
  const pathRatio = (hasTel ? 0.45 : 0) + (hasContactLink || hasForm ? 0.55 : hasCta ? 0.3 : 0);
  const pathBits = [hasTel ? "phone link" : "", hasContactLink ? "contact link" : "", hasForm ? "form" : "", !hasContactLink && !hasForm && hasCta ? "written call to action" : ""].filter(Boolean);
  const pathFinding = pathBits.length ? `Next step found: ${pathBits.join(", ")}.` : "No phone link, contact page, or form was found.";
  const indexFinding = noindex
    ? "The page is marked noindex, so search and AI crawlers are told not to keep it."
    : input.status !== 200
      ? `The URL responded with HTTP ${input.status}.`
      : wordCount < 120
        ? "The HTML has very little readable text. A script-only page is hard for a crawler to quote."
        : `Readable page: “${title || "untitled"}”, about ${wordCount.toLocaleString("en-US")} words, not marked noindex.`;

  const records = jsonLd(input.html);
  const schemaTypes = [...new Set(records.flatMap(typesOf))];
  const schemaText = records.map((record) => `${asText(record.name)} ${asText(record.address)} ${asText(record.telephone)}`).join(" ");
  const h1 = visibleText((input.html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? "")).slice(0, 160);
  const placeText = `${title} ${h1} ${text.slice(0, 4000)} ${schemaText}`.toLowerCase();
  const hasService = SERVICE.test(placeText) || schemaTypes.some((type) => /Legal|LocalBusiness|ProfessionalService|Attorney|Organization|Physician|Dentist/i.test(type));
  const hasPlace = STATES.some((state) => placeText.includes(state)) || /\b(serving|located in|office in|near)\b/i.test(placeText) || /\b[A-Z][a-z]+,\s*[A-Z]{2}\b/.test(`${title} ${h1} ${schemaText}`) || /addressLocality|streetAddress|postalCode/i.test(input.html);
  const placeRatio = (hasService ? 0.55 : 0) + (hasPlace ? 0.45 : 0);
  const placeFinding = hasService && hasPlace
    ? "The page names a service and a place."
    : !hasService && !hasPlace
      ? "The page does not clearly say what is offered or where the business works."
      : hasService
        ? "A service is named. A city, state, or service area is not clear."
        : "A place is named. The service itself is not clear in the title, heading, or schema.";

  const answers = headingAnswers(input.html);
  const ideal = answers.filter((item) => item.count >= 40 && item.count <= 70);
  const near = answers.filter((item) => item.count >= 20 && item.count <= 110 && !(item.count >= 40 && item.count <= 70));
  const answerRatio = Math.min(1, (ideal.length + near.length * 0.5) / 2);
  const answerFinding = ideal.length
    ? `${ideal.length} heading${ideal.length === 1 ? "" : "s"} followed by a 40–70 word answer.`
    : near.length
      ? "Headings have nearby text, but not a tight 40–70 word answer."
      : answers.length
        ? "Headings were found, without a short answer directly under them."
        : "No H2 or H3 headings were found.";

  const strongSchema = schemaTypes.some((type) => /LegalService|Attorney|Lawyer|LocalBusiness|ProfessionalService|Organization|Person|Physician|Dentist/i.test(type));
  const faqSchema = schemaTypes.some((type) => /FAQPage/i.test(type));
  const schemaRatio = strongSchema && faqSchema ? 1 : strongSchema ? 0.75 : schemaTypes.length ? 0.4 : 0;
  const schemaFinding = schemaTypes.length
    ? `JSON-LD types: ${schemaTypes.slice(0, 6).join(", ")}${schemaTypes.length > 6 ? "…" : ""}.`
    : "No JSON-LD structured data was found.";

  const phone = /(?:\+?1[\s.-]?)?(?:\(\d{3}\)|\d{3})[\s.-]\d{3}[\s.-]\d{4}/.test(`${text} ${schemaText}`) || records.some((record) => asText(record.telephone));
  const address = records.some((record) => {
    const value = record.address;
    return Boolean(value && typeof value === "object" && ("streetAddress" in value || "addressLocality" in value));
  }) || /\d{1,6}\s+[A-Za-z0-9.'\s]{2,40}\s(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Court|Ct|Suite|Ste)\b/i.test(text);
  const name = Boolean(asText(records.find((record) => asText(record.name))?.name) || metaContent(input.html, "og:site_name") || h1);
  const contactRatio = (name ? 0.25 : 0) + (address ? 0.4 : 0) + (phone ? 0.35 : 0);
  const missing = [name ? "" : "name", address ? "" : "street address", phone ? "" : "phone"].filter(Boolean);
  const contactFinding = missing.length === 0
    ? "Name, street address, and phone are present."
    : `Missing ${missing.length === 1 ? missing[0] : `${missing.slice(0, -1).join(", ")} and ${missing[missing.length - 1]}`}.`;

  const llmsBody = input.llmsText.trim();
  const llmsHtml = /<!doctype html|<html/i.test(llmsBody.slice(0, 300));
  const llmsRatio = input.llmsStatus === 200 && !llmsHtml && llmsBody.length >= 120 ? 1 : input.llmsStatus === 200 && !llmsHtml && llmsBody.length >= 40 ? 0.45 : 0;
  const llmsFinding = llmsRatio === 1
    ? "llms.txt is published and long enough to describe the business."
    : llmsRatio > 0
      ? "llms.txt exists, but it is too short to be useful."
      : "No llms.txt file was found at the site root.";

  const modified = records.map((record) => asText(record.dateModified)).find(Boolean) || metaContent(input.html, "article:modified_time");
  const published = records.map((record) => asText(record.datePublished)).find(Boolean);
  const headerDate = input.headers.get("last-modified") ?? "";
  const dated = [modified, headerDate, published].map((value) => (value ? ageRatio(value) : null)).find((value) => value !== null && value !== undefined);
  const year = Number((text.match(/©\s*(20\d{2})/) ?? [])[1] ?? 0);
  const currentYear = new Date().getUTCFullYear();
  const freshRatio = dated ?? (year >= currentYear - 1 ? 0.35 : 0);
  const freshFinding = modified
    ? `Schema or meta update date: ${modified.slice(0, 32)}.`
    : headerDate
      ? `Last-Modified header: ${headerDate}.`
      : published
        ? `Only a published date was found: ${published.slice(0, 32)}.`
        : year
          ? `No update date. The page shows © ${year}.`
          : "No update date was found in the page, schema, or Last-Modified header.";

  return {
    ratios: {
      crawl: crawlRatio,
      indexable,
      snippet,
      place: placeRatio,
      answers: answerRatio,
      schema: schemaRatio,
      contact: contactRatio,
      path: Math.min(1, pathRatio),
      llms: llmsRatio,
      fresh: freshRatio
    },
    findings: {
      crawl: crawlFinding,
      indexable: indexFinding,
      snippet: snippetFinding,
      place: placeFinding,
      answers: answerFinding,
      schema: schemaFinding,
      contact: contactFinding,
      path: pathFinding,
      llms: llmsFinding,
      fresh: freshFinding
    },
    crawler,
    crawlerNote
  };
}

function allocate(ratios: Record<CheckId, number>, weights: Record<CheckId, number>, crawlOverride?: number): { points: Record<CheckId, number>; total: number } {
  const ids = CHECKS.map((check) => check.id);
  const raw = ids.map((id) => (id === "crawl" && crawlOverride !== undefined ? crawlOverride : ratios[id]) * weights[id]);
  const total = Math.max(0, Math.min(100, Math.round(raw.reduce((sum, value) => sum + value, 0))));
  const pointsList = raw.map((value) => Math.floor(value));
  let left = total - pointsList.reduce((sum, value) => sum + value, 0);
  const order = raw
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction);
  for (let i = 0; left > 0 && i < order.length; i += 1) {
    pointsList[order[i].index] += 1;
    left -= 1;
  }
  const points = Object.fromEntries(ids.map((id, index) => [id, pointsList[index]])) as Record<CheckId, number>;
  return { points, total };
}

function toResult(url: string, finalUrl: string, evidence: Evidence): ScanResult {
  const weights = Object.fromEntries(CHECKS.map((check) => [check.id, check.max])) as Record<CheckId, number>;
  const totalScore = allocate(evidence.ratios, weights);
  const checks: ScanCheck[] = CHECKS.map((check) => ({
    id: check.id,
    name: check.name,
    score: totalScore.points[check.id],
    max: check.max,
    finding: evidence.findings[check.id]
  }));
  const platforms: ScanPlatform[] = PLATFORMS.map((platform) => {
    const scored = allocate(evidence.ratios, PLATFORM_WEIGHTS[platform.id], evidence.crawler[platform.id]);
    const weakest = CHECKS.slice().sort((a, b) => {
      const ar = a.id === "crawl" ? evidence.crawler[platform.id] : evidence.ratios[a.id];
      const br = b.id === "crawl" ? evidence.crawler[platform.id] : evidence.ratios[b.id];
      return ar - br;
    })[0];
    const note = evidence.crawler[platform.id] < 1
      ? evidence.crawlerNote[platform.id]
      : `Lowest check for this platform: ${weakest.name}.`;
    return { id: platform.id, name: platform.name, score: scored.total, note };
  });
  return { url, finalUrl, scannedAt: new Date().toISOString(), total: totalScore.total, platforms, checks };
}

type Fetched = { status: number; headers: Headers; body: string; finalUrl: URL };

async function fetchPublic(start: URL, accept: string): Promise<Fetched> {
  let current = start;
  for (let hop = 0; hop < 4; hop += 1) {
    await assertPublicHttpUrl(current.toString());
    const response = await fetch(current, {
      redirect: "manual",
      headers: {
        Accept: accept,
        "User-Agent": "GoBeautyVisibilityScan/1.0 (+https://www.gobeauty.ai/ai-visibility)"
      },
      signal: AbortSignal.timeout(12000)
    });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) throw new ScanError("The website redirected without a destination.");
      const next = new URL(location, current);
      if (next.protocol !== "http:" && next.protocol !== "https:") throw new ScanError("The website redirected to an unsupported address.");
      current = next;
      continue;
    }
    const buffer = await response.arrayBuffer();
    if (buffer.byteLength > 1_500_000) throw new ScanError("That page is too large to scan.");
    return { status: response.status, headers: response.headers, body: new TextDecoder("utf-8").decode(buffer), finalUrl: current };
  }
  throw new ScanError("The website redirected too many times.");
}

export async function scanWebsite(input: string): Promise<ScanResult> {
  const url = await assertPublicHttpUrl(input);
  let page: Fetched;
  try {
    page = await fetchPublic(url, "text/html,application/xhtml+xml");
  } catch (error) {
    if (error instanceof ScanError) throw error;
    throw new ScanError("The website did not respond in time.");
  }
  const type = page.headers.get("content-type") ?? "";
  if (page.status === 200 && type && !/html|xml/i.test(type) && !/<html|<!doctype html/i.test(page.body.slice(0, 400))) {
    throw new ScanError("That URL is not an HTML page.");
  }
  const origin = page.finalUrl.origin;
  const readOptional = async (path: string) => {
    try {
      const file = await fetchPublic(new URL(path, origin), "text/plain,text/markdown,text/html");
      return { status: file.status, body: file.body };
    } catch {
      return { status: 0, body: "" };
    }
  };
  const [robots, llms] = await Promise.all([readOptional("/robots.txt"), readOptional("/llms.txt")]);
  const evidence = scoreFetched({
    finalUrl: page.finalUrl.toString(),
    status: page.status,
    html: page.body,
    headers: page.headers,
    robotsStatus: robots.status,
    robotsText: robots.body,
    llmsStatus: llms.status,
    llmsText: llms.body
  });
  return toResult(url.toString(), page.finalUrl.toString(), evidence);
}
