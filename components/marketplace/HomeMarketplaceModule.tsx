import Link from "next/link";
import { HOME_MARKETPLACE_TILES } from "@/lib/marketplace/visuals";

/** Homepage marketplace entry — image-led, minimal copy. */
export default function HomeMarketplaceModule() {
  return (
    <section className="border-y border-line-soft bg-white py-12 md:py-16" id="salon-products">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-8 px-5 md:grid-cols-2 md:gap-12">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-brand-600">
            For salons &amp; spas
          </p>
          <h2 className="mt-2 font-display text-[1.75rem] leading-tight text-ink md:text-[2.25rem]">
            Products your business can use and sell
          </h2>
          <p className="mt-3 max-w-[400px] text-[15px] text-ink-soft">
            Treatments · aftercare · retail · samples
          </p>
          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
            <Link
              href="/marketplace"
              className="inline-flex h-12 items-center justify-center rounded-pill bg-brand-500 px-7 text-[15px] font-semibold text-white shadow-[0_4px_14px_rgba(232,90,130,0.30)] transition hover:bg-brand-600"
            >
              Explore Salon Products
            </Link>
            <Link
              href="/brands/list-your-products"
              className="inline-flex h-12 items-center justify-center rounded-pill border border-line bg-white px-7 text-[15px] font-semibold text-ink transition hover:bg-surface-tint"
            >
              List Your Products
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          {HOME_MARKETPLACE_TILES.map((c, i) => (
            <Link
              key={c.label}
              href="/marketplace"
              className={[
                "group relative overflow-hidden rounded-2xl shadow-card",
                i % 2 === 1 ? "mt-4 sm:mt-6" : "",
              ].join(" ")}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={c.image}
                alt=""
                className="h-auto max-h-[420px] w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
              <span className="absolute bottom-3 left-3 text-[14px] font-bold text-white drop-shadow">
                {c.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
