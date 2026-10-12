"use client";

import { useState } from "react";
import Link from "next/link";
import { CHECKS, type ScanResult } from "@/lib/visibility-model";

const CATEGORIES = ["Hair salon", "Nail salon", "Spa", "Med spa", "Beauty brand", "Retail", "Other"];

const STATES = [
  ["AL", "Alabama"], ["AK", "Alaska"], ["AZ", "Arizona"], ["AR", "Arkansas"], ["CA", "California"],
  ["CO", "Colorado"], ["CT", "Connecticut"], ["DE", "Delaware"], ["DC", "District of Columbia"], ["FL", "Florida"],
  ["GA", "Georgia"], ["HI", "Hawaii"], ["ID", "Idaho"], ["IL", "Illinois"], ["IN", "Indiana"],
  ["IA", "Iowa"], ["KS", "Kansas"], ["KY", "Kentucky"], ["LA", "Louisiana"], ["ME", "Maine"],
  ["MD", "Maryland"], ["MA", "Massachusetts"], ["MI", "Michigan"], ["MN", "Minnesota"], ["MS", "Mississippi"],
  ["MO", "Missouri"], ["MT", "Montana"], ["NE", "Nebraska"], ["NV", "Nevada"], ["NH", "New Hampshire"],
  ["NJ", "New Jersey"], ["NM", "New Mexico"], ["NY", "New York"], ["NC", "North Carolina"], ["ND", "North Dakota"],
  ["OH", "Ohio"], ["OK", "Oklahoma"], ["OR", "Oregon"], ["PA", "Pennsylvania"], ["RI", "Rhode Island"],
  ["SC", "South Carolina"], ["SD", "South Dakota"], ["TN", "Tennessee"], ["TX", "Texas"], ["UT", "Utah"],
  ["VT", "Vermont"], ["VA", "Virginia"], ["WA", "Washington"], ["WV", "West Virginia"], ["WI", "Wisconsin"], ["WY", "Wyoming"],
];

type Intake = {
  url: string;
  email: string;
  name: string;
  category: string;
  city: string;
  state: string;
  contactName: string;
};

const empty: Intake = { url: "", email: "", name: "", category: "", city: "", state: "", contactName: "" };

const field =
  "mt-1.5 w-full rounded-xl border border-line bg-white px-3.5 py-3 text-[15px] text-ink outline-none transition focus:border-brand-400";

export default function AiVisibilityForm() {
  const [intake, setIntake] = useState<Intake>(empty);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [leadNote, setLeadNote] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);

  function setField(key: keyof Intake, value: string) {
    setIntake((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setScanning(true);
    setError("");
    setLeadNote("");
    setStatus("Reading the public page, robots.txt, and llms.txt.");
    setResult(null);
    const payload = {
      url: intake.url.trim(),
      email: intake.email.trim(),
      name: intake.name.trim(),
      category: intake.category,
      city: intake.city.trim(),
      state: intake.state,
      contactName: intake.contactName.trim(),
    };
    try {
      const [scanRes, leadRes] = await Promise.all([
        fetch("/api/visibility-scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: payload.url }),
        }),
        fetch("/api/visibility-lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }),
      ]);
      const scanJson = await scanRes.json();
      const leadJson = await leadRes.json().catch(() => ({ ok: false }));
      if (!scanRes.ok || !scanJson.ok) {
        setError(scanJson.error || "The scan could not be completed.");
        setStatus("");
        return;
      }
      setResult(scanJson.result);
      setLeadNote(
        leadRes.ok && leadJson.ok
          ? `We recorded ${payload.email} with this request. A person can follow up. The score is not emailed.`
          : "The score is ready. The follow-up could not be saved.",
      );
      setStatus("");
      document.getElementById("score")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch {
      setError("The scan could not be completed.");
      setStatus("");
    } finally {
      setScanning(false);
    }
  }

  const platforms = result?.platforms ?? [
    { id: "chatgpt", name: "ChatGPT", score: null as number | null, note: "Crawl access, answer sections, llms.txt" },
    { id: "perplexity", name: "Perplexity", score: null as number | null, note: "A readable page and direct answers" },
    { id: "gemini", name: "Gemini", score: null as number | null, note: "Structured data" },
    { id: "google", name: "Google AI", score: null as number | null, note: "An indexable page" },
  ];

  return (
    <div className="bg-beauty-blush">
      <header className="border-b border-line-soft bg-white">
        <div className="mx-auto max-w-[960px] px-5 py-6 md:py-8">
          <nav className="mb-3 flex items-center gap-1.5 text-[12px] font-medium text-ink-muted">
            <Link href="/" className="hover:text-brand-600">Home</Link>
            <span aria-hidden className="text-ink-faint">/</span>
            <span className="text-ink">AI Visibility</span>
          </nav>
          <h1 className="font-display text-[1.85rem] leading-none text-ink md:text-[2.4rem]">
            See the score for a beauty business.
          </h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-muted">
            Website, work email, and city. The total is 0–100. Each item below has its own points, and those points add up to the total.
          </p>
        </div>
      </header>

      <div className="mx-auto grid max-w-[960px] items-start gap-8 px-5 py-8 lg:grid-cols-[1.05fr_.95fr]">
        <form onSubmit={submit} className="rounded-3xl border border-line bg-white p-5 shadow-card sm:p-7">
          <h2 className="font-display text-[1.6rem] text-ink">Start the check</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block text-[13px] font-semibold text-ink sm:col-span-2">
              Business website
              <input className={field} name="url" required placeholder="https://" value={intake.url} onChange={(e) => setField("url", e.target.value)} />
            </label>
            <label className="block text-[13px] font-semibold text-ink sm:col-span-2">
              Work email
              <input className={field} name="email" type="email" required placeholder="name@salon.com" value={intake.email} onChange={(e) => setField("email", e.target.value)} />
            </label>
            <label className="block text-[13px] font-semibold text-ink">
              Business name
              <input className={field} name="name" required value={intake.name} onChange={(e) => setField("name", e.target.value)} />
            </label>
            <label className="block text-[13px] font-semibold text-ink">
              Category
              <select className={field} name="category" required value={intake.category} onChange={(e) => setField("category", e.target.value)}>
                <option value="">Select</option>
                {CATEGORIES.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label className="block text-[13px] font-semibold text-ink">
              City
              <input className={field} name="city" required value={intake.city} onChange={(e) => setField("city", e.target.value)} />
            </label>
            <label className="block text-[13px] font-semibold text-ink">
              State
              <select className={field} name="state" required value={intake.state} onChange={(e) => setField("state", e.target.value)}>
                <option value="">Select</option>
                {STATES.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
              </select>
            </label>
            <label className="block text-[13px] font-semibold text-ink sm:col-span-2">
              Contact name <span className="font-medium text-ink-muted">(optional)</span>
              <input className={field} name="contactName" value={intake.contactName} onChange={(e) => setField("contactName", e.target.value)} />
            </label>
          </div>
          <button
            type="submit"
            disabled={scanning}
            className="mt-5 w-full rounded-pill bg-brand-500 px-6 py-3.5 text-[15px] font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60"
          >
            {scanning ? "Scanning…" : "See my score"}
          </button>
          {status ? <p className="mt-3 text-[13px] text-ink-muted">{status}</p> : null}
          {error ? <p className="mt-3 text-[13px] text-[#9a3412]">{error}</p> : null}
        </form>

        <aside className="rounded-3xl bg-white p-5 text-[14px] leading-relaxed text-ink-soft sm:p-7">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-600">What we ask</p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>The public website the check should read.</li>
            <li>A work email, so a person can follow up. The score stays on this page.</li>
            <li>The business name, category, and city, so the follow-up is about the right place.</li>
          </ul>
        </aside>
      </div>

      <section id="score" className="mx-auto max-w-[960px] px-5 pb-12">
        <div className="rounded-3xl border border-line bg-white p-5 shadow-card sm:p-7">
          <div className="grid items-start gap-6 md:grid-cols-[.7fr_1.3fr]">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-faint">Total</p>
              <p className="font-display text-6xl text-brand-700">{result ? result.total : "—"}</p>
              <p className="text-[13px] text-ink-muted">out of 100</p>
              <p className="mt-3 text-[13px] leading-relaxed text-ink-muted">
                {result ? `${intake.name} · ${intake.city}, ${intake.state}. Scanned ${result.finalUrl}.` : "The score appears here after the check."}
              </p>
              {leadNote ? <p className="mt-3 text-[13px] text-ink">{leadNote}</p> : null}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {platforms.map((platform) => (
                <article key={platform.id} className="rounded-2xl bg-surface-tint p-4">
                  <p className="text-[13px] font-semibold text-ink-muted">{platform.name}</p>
                  <p className="font-display text-3xl text-ink">{platform.score ?? "—"}</p>
                  <p className="mt-1 text-[13px] text-ink-muted">{platform.note}</p>
                </article>
              ))}
            </div>
          </div>
          <div className="mt-7 space-y-4">
            {(result?.checks ?? CHECKS.map((check) => ({ ...check, score: 0, finding: check.looksFor }))).map((check) => (
              <article key={check.id} className="grid items-center gap-2 sm:grid-cols-[210px_1fr_72px]">
                <div>
                  <p className="text-[14px] font-semibold text-ink">{check.name}</p>
                  <p className="text-[13px] text-ink-muted">{check.finding}</p>
                </div>
                <div className="h-2 overflow-hidden rounded-pill bg-line-soft">
                  <div className="h-full rounded-pill bg-brand-500" style={{ width: `${check.max ? (check.score / check.max) * 100 : 0}%` }} />
                </div>
                <p className="text-right text-[13px] font-semibold text-brand-700">{result ? `${check.score}/${check.max}` : `0–${check.max}`}</p>
              </article>
            ))}
          </div>
        </div>
        <p className="mt-5 text-[13px] leading-relaxed text-ink-muted">
          This reads the public page, robots.txt, and llms.txt. It does not query ChatGPT, Perplexity, Gemini, or Google, and it does not promise a ranking, bookings, or cases. Platform scores reuse the same evidence with different weights.
        </p>
      </section>
    </div>
  );
}
