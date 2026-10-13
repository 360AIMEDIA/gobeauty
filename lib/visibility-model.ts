export const CHECKS = [
  { id: "crawl", name: "Crawl access", max: 12, looksFor: "robots.txt allows the crawlers these AI systems use." },
  { id: "indexable", name: "Indexable page", max: 14, looksFor: "The URL returns readable HTML and is not marked noindex." },
  { id: "snippet", name: "Title and description", max: 8, looksFor: "A specific page title and a meta description an answer can quote." },
  { id: "place", name: "Service and place", max: 10, looksFor: "The page says what the business does and where it works." },
  { id: "answers", name: "Answer-first sections", max: 14, looksFor: "Headings are followed by a short direct answer, about 40–70 words." },
  { id: "schema", name: "Structured data", max: 16, looksFor: "JSON-LD identifies the business, and ideally an FAQ." },
  { id: "contact", name: "Contact record", max: 8, looksFor: "Name, street address, and phone are on the page." },
  { id: "path", name: "Contact path", max: 4, looksFor: "A phone link, contact page, or form gives a next step." },
  { id: "llms", name: "llms.txt", max: 8, looksFor: "A public /llms.txt file summarizes the business for AI crawlers." },
  { id: "fresh", name: "Freshness", max: 6, looksFor: "A recent update date appears in the page, schema, or Last-Modified header." }
] as const;

export type CheckId = (typeof CHECKS)[number]["id"];

export const PLATFORMS = [
  { id: "chatgpt", name: "ChatGPT", crawlers: ["gptbot", "oai-searchbot"] },
  { id: "perplexity", name: "Perplexity", crawlers: ["perplexitybot"] },
  { id: "gemini", name: "Gemini", crawlers: ["google-extended"] },
  { id: "google", name: "Google AI", crawlers: ["googlebot"] }
] as const;

export type PlatformId = (typeof PLATFORMS)[number]["id"];

export type ScanCheck = {
  id: CheckId;
  name: string;
  score: number;
  max: number;
  finding: string;
};

export type ScanPlatform = {
  id: PlatformId;
  name: string;
  score: number;
  note: string;
};

export type ScanResult = {
  url: string;
  finalUrl: string;
  scannedAt: string;
  total: number;
  platforms: ScanPlatform[];
  checks: ScanCheck[];
};
