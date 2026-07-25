"use client";

import { useState } from "react";
import { TrendCardTile } from "@/components/home/TrendGrid";
import {
  TREND_CARDS,
  TREND_CARD_BADGES,
  type TrendCardType,
} from "@/lib/data/trends";

const FILTERS: { id: TrendCardType | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "look", label: "Looks" },
  { id: "trend", label: "Trends" },
  { id: "product", label: "Products" },
  { id: "aftercare", label: "Aftercare" },
  { id: "pro", label: "Pros" },
];

const VALID_TYPES = new Set(Object.keys(TREND_CARD_BADGES));

export default function LooksTrendsGrid({ initialType }: { initialType?: string }) {
  const [active, setActive] = useState<TrendCardType | "all">(
    initialType && VALID_TYPES.has(initialType) ? (initialType as TrendCardType) : "all",
  );

  const cards =
    active === "all" ? TREND_CARDS : TREND_CARDS.filter((c) => c.type === active);

  return (
    <div className="mx-auto max-w-[1200px] px-5 pb-10">
      {/* Type filter chips — horizontal scroll on mobile */}
      <div
        role="tablist"
        aria-label="Card types"
        className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none]"
      >
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={active === f.id}
            onClick={() => setActive(f.id)}
            className={[
              "h-10 flex-none whitespace-nowrap rounded-pill border px-4 text-[13.5px] font-semibold transition",
              active === f.id
                ? "border-ink bg-ink text-white"
                : "border-line bg-white text-ink-soft hover:bg-surface-tint",
            ].join(" ")}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-5 columns-2 gap-3 md:columns-3 md:gap-4 lg:columns-4">
        {cards.map((card) => (
          <TrendCardTile key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
}
