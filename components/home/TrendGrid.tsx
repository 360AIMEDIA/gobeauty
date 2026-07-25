"use client";

import Link from "next/link";
import { useState } from "react";
import {
  TREND_CARDS,
  TREND_CARD_BADGES,
  type TrendCard,
} from "@/lib/data/trends";

// PRD v2 §6.3 — finite Pinterest-like grid: Show More / Collapse, no
// infinite homepage scroll. Mobile starts smaller than desktop.
const INITIAL_COUNT = 8;

// Varied crop heights so the masonry feed staggers like an Instagram/Pinterest
// mobile feed instead of aligning into uniform rows.
const ASPECT_CLASS: Record<NonNullable<TrendCard["aspect"]>, string> = {
  wide: "aspect-[4/3]",
  square: "aspect-square",
  portrait: "aspect-[3/4]",
  tall: "aspect-[2/3]",
};

export function TrendCardTile({ card }: { card: TrendCard }) {
  const badge = TREND_CARD_BADGES[card.type];
  return (
    <Link
      href={card.href}
      className="group mb-3 block break-inside-avoid overflow-hidden rounded-2xl border border-line-soft bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-cardHover md:mb-4"
    >
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={card.image}
          alt={card.title}
          loading="lazy"
          className={[
            "w-full object-cover transition duration-300 group-hover:scale-[1.02]",
            ASPECT_CLASS[card.aspect ?? "portrait"],
          ].join(" ")}
        />
        <span
          className={`absolute left-2.5 top-2.5 rounded-pill px-2.5 py-1 text-[11px] font-bold backdrop-blur-sm ${badge.className}`}
        >
          {badge.label}
        </span>
        <button
          type="button"
          aria-label={`Save ${card.title}`}
          onClick={(e) => e.preventDefault()}
          className="absolute right-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink-soft shadow-sm transition hover:text-brand-500"
        >
          <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path
              d="M12 21s-7-4.6-9.3-9A5.4 5.4 0 0 1 12 6.5 5.4 5.4 0 0 1 21.3 12c-2.3 4.4-9.3 9-9.3 9z"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      <div className="px-3 pb-3.5 pt-2.5">
        <h3 className="text-[14px] font-bold leading-snug text-ink">
          {card.title}
        </h3>
        <p className="mt-1 text-[12px] text-ink-muted">
          {card.tags.join(" · ")}
          {card.location ? ` · ${card.location}` : ""}
        </p>
      </div>
    </Link>
  );
}

export default function TrendGrid() {
  const [expanded, setExpanded] = useState(false);
  const cards = expanded ? TREND_CARDS : TREND_CARDS.slice(0, INITIAL_COUNT);

  return (
    <section className="bg-white py-10 md:py-14" id="trending">
      <div className="mx-auto max-w-[1200px] px-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-[1.75rem] leading-tight text-ink md:text-[2.25rem]">
              Trending now
            </h2>
            <p className="mt-1.5 text-[14.5px] text-ink-soft">
              Looks, products, aftercare, and pros people are exploring.
            </p>
          </div>
          <Link
            href="/looks-trends"
            className="hidden flex-none text-[14px] font-semibold text-brand-600 transition hover:text-brand-700 md:block"
          >
            View Looks &amp; Trends →
          </Link>
        </div>

        <div className="mt-6 columns-2 gap-3 md:columns-3 md:gap-4 lg:columns-4">
          {cards.map((card) => (
            <TrendCardTile key={card.id} card={card} />
          ))}
        </div>

        <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="h-11 w-full rounded-pill border border-line bg-white px-6 text-[14.5px] font-semibold text-ink transition hover:bg-surface-tint sm:w-auto"
          >
            {expanded ? "Collapse" : "Show more trends"}
          </button>
          <Link
            href="/looks-trends"
            className="flex h-11 w-full items-center justify-center rounded-pill bg-ink px-6 text-[14.5px] font-semibold text-white transition hover:bg-ink-soft sm:w-auto"
          >
            View Looks &amp; Trends
          </Link>
        </div>
      </div>
    </section>
  );
}
