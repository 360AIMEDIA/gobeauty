import Link from "next/link";
import { AUDIENCE_IMAGES } from "@/lib/marketplace/visuals";

// PRD v2 §6.6 — image-led B2B entries, short labels.
export default function AudienceEntryCards() {
  return (
    <section id="for-businesses" className="bg-[#16181d] py-12 md:py-16">
      <div className="mx-auto max-w-[1200px] px-5">
        <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-brand-300">
          Grow with GoBeauty
        </p>
        <h2 className="mt-2 max-w-[480px] font-display text-[1.75rem] leading-tight text-white md:text-[2.25rem]">
          Make sure they find you
        </h2>

        <div className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
          {AUDIENCE_IMAGES.map((e) => (
            <Link
              key={e.href}
              href={e.href}
              className="group relative overflow-hidden rounded-2xl"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={e.image}
                alt=""
                className="h-auto max-h-[420px] w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/40 to-ink/10" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="text-[12px] font-bold uppercase tracking-wide text-brand-200">
                  {e.eyebrow}
                </p>
                <h3 className="mt-1 text-[17px] font-bold text-white">{e.copy}</h3>
                <span className="mt-4 inline-flex h-10 items-center justify-center rounded-pill bg-brand-500 px-5 text-[13.5px] font-semibold text-white shadow-[0_4px_14px_rgba(232,90,130,0.35)] transition group-hover:bg-brand-600">
                  {e.cta}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
