import Link from "next/link";

// PRD v2 §6.5 — image-led local ranking teaser.
const LOCAL_CARDS = [
  {
    service: "Korean Nail Salons",
    location: "New York City",
    image: "/assets/salon_04_white_gold.jpg",
    href: "/local-rankings",
  },
  {
    service: "Lash Lift",
    location: "Edison, NJ",
    image:
      "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&q=80&auto=format&fit=crop",
    href: "/local-rankings",
  },
  {
    service: "Hydrating Facial",
    location: "Jersey City, NJ",
    image:
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80&auto=format&fit=crop",
    href: "/local-rankings",
  },
  {
    service: "Keratin Treatment",
    location: "Brooklyn, NY",
    image:
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80&auto=format&fit=crop",
    href: "/local-rankings",
  },
];

export default function PopularNearYou() {
  return (
    <section className="bg-white py-10 md:py-14" id="popular-near-you">
      <div className="mx-auto max-w-[1200px] px-5">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-[1.75rem] leading-tight text-ink md:text-[2.25rem]">
            Popular near you
          </h2>
          <Link
            href="/local-rankings"
            className="hidden flex-none text-[14px] font-semibold text-brand-600 transition hover:text-brand-700 md:block"
          >
            All rankings →
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {LOCAL_CARDS.map((c) => (
            <Link
              key={`${c.service}-${c.location}`}
              href={c.href}
              className="group relative overflow-hidden rounded-2xl shadow-card transition hover:-translate-y-0.5 hover:shadow-cardHover"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={c.image}
                alt={`${c.service} in ${c.location}`}
                loading="lazy"
                className="h-auto max-h-[380px] w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-3.5">
                <span className="text-[11px] font-bold uppercase tracking-wide text-brand-200">
                  Best
                </span>
                <h3 className="mt-0.5 text-[14.5px] font-bold leading-snug text-white sm:text-[15.5px]">
                  {c.service}
                </h3>
                <p className="text-[12.5px] text-white/80">{c.location}</p>
              </div>
            </Link>
          ))}
        </div>

        <Link
          href="/local-rankings"
          className="mt-5 flex h-11 items-center justify-center rounded-pill border border-line text-[14.5px] font-semibold text-ink transition hover:bg-surface-tint md:hidden"
        >
          Explore local rankings
        </Link>
      </div>
    </section>
  );
}
