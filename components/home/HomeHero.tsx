"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// PRD v2 §6.2 — hero prompt chips, one or two rows on mobile.
const PROMPT_CHIPS = [
  "Glass skin",
  "Korean bridal nails",
  "Natural lash lift",
  "Post-facial aftercare",
];

export default function HomeHero() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const go = (q?: string) => {
    const text = (q ?? query).trim();
    router.push(text ? `/get-this-look?q=${encodeURIComponent(text)}` : "/get-this-look");
  };

  return (
    <section className="relative overflow-hidden" id="hero">
      {/* Mobile backdrop — full-bleed cover photo under a white wash for legibility */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 md:hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/cover.webp"
          alt=""
          className="h-full w-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/85 via-white/65 to-white" />
      </div>

      {/* Desktop backdrop — soft editorial warm white / light pink (PRD §10) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 hidden h-full bg-gradient-to-b from-[#fdeef3] via-[#fbf5f7] to-transparent md:block"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-28 -z-10 hidden h-[440px] w-[440px] rounded-full bg-gradient-to-tr from-brand-200/60 to-violet-100/40 blur-3xl md:block"
      />

      <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-8 px-5 pb-10 pt-10 md:grid-cols-[1.15fr_1fr] md:gap-12 md:pb-16 md:pt-16">
        {/* Copy + input */}
        <div>
          <h1 className="font-display text-[2.35rem] leading-[1.08] text-ink md:text-[3.5rem]">
            Your <span className="text-brand-600">AI Beauty Advisor</span>.
          </h1>
          <p className="mt-3 max-w-[420px] text-[16px] leading-relaxed text-ink-soft md:mt-4 md:text-[17px]">
            Upload a look — get the right service, pro, products, and aftercare.
          </p>

          {/* Single prominent input card — thumb-friendly, upload separated (PRD §6.2) */}
          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              go();
            }}
            className="mt-6 rounded-2xl border border-line bg-white p-2 shadow-card transition focus-within:border-brand-300 focus-within:shadow-[0_0_0_4px_rgba(232,90,130,0.10)]"
          >
            <div className="flex items-center gap-2 px-2 pt-1">
              <svg
                className="h-5 w-5 flex-none text-ink-muted"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Describe your look or beauty goal…"
                className="h-11 min-w-0 flex-1 border-0 bg-transparent text-[16px] text-ink outline-none placeholder:text-ink-faint"
              />
            </div>
            <div className="mt-1 flex gap-2 p-1">
              <button
                type="button"
                onClick={() => go()}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-brand-500 text-[15px] font-semibold text-white shadow-[0_4px_12px_rgba(232,90,130,0.28)] transition hover:bg-brand-600"
              >
                <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <circle cx="8.5" cy="10.5" r="1.5" />
                  <path d="M3 17l5-5 4 4 3-3 6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Upload a look
              </button>
              <button
                type="submit"
                className="inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-line bg-white text-[15px] font-semibold text-ink transition hover:bg-surface-tint"
              >
                Build My Beauty Path
              </button>
            </div>
          </form>

          {/* Prompt chips */}
          <div className="mt-4 flex flex-wrap gap-2">
            {PROMPT_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => go(chip)}
                className="rounded-pill border border-line bg-white/80 px-3.5 py-2 text-[13.5px] font-semibold text-ink-soft transition hover:border-brand-300 hover:text-brand-600"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Trust line — no invented numbers (PRD §6.2) */}
          <p className="mt-5 text-[13px] text-ink-muted">
            Used by beauty lovers, salon owners, and beauty professionals.
          </p>
        </div>

        {/* Editorial visual — skin-forward, not nail-only (PRD §10); desktop only */}
        <div className="hidden justify-end md:flex">
          <div className="relative w-full max-w-[420px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/cover.webp"
              alt="Glowing skin with soft glam makeup at a vanity"
              className="w-full max-h-[520px] rounded-[28px] object-cover shadow-[0_18px_50px_rgba(20,12,36,0.14)]"
            />
            <div className="absolute -left-8 bottom-8 rounded-2xl border border-line-soft bg-white/95 px-4 py-3 shadow-cardHover backdrop-blur">
              <p className="text-[12px] font-bold uppercase tracking-wider text-brand-600">
                Beauty Path
              </p>
              <p className="mt-0.5 text-[13.5px] font-semibold text-ink">
                Service · Pro · Products · Aftercare
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
