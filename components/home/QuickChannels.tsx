import Link from "next/link";
import { CHANNEL_IMAGES } from "@/lib/marketplace/visuals";

// PRD v2 §6.4 — visual channel cards, minimal body copy.
export default function QuickChannels() {
  return (
    <section className="border-y border-line-soft bg-surface-soft py-10 md:py-14">
      <div className="mx-auto max-w-[1200px] px-5">
        <h2 className="font-display text-[1.75rem] leading-tight text-ink md:text-[2.25rem]">
          Start where you are
        </h2>
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {CHANNEL_IMAGES.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="group relative overflow-hidden rounded-2xl shadow-card transition hover:-translate-y-0.5 hover:shadow-cardHover"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={c.image}
                alt=""
                className="h-auto max-h-[380px] w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/25 to-ink/5" />
              <div className="absolute inset-x-0 bottom-0 p-3.5 sm:p-4">
                <h3 className="text-[15px] font-bold text-white sm:text-[16px]">{c.title}</h3>
                <p className="mt-0.5 text-[12.5px] text-white/80 sm:text-[13px]">{c.body}</p>
                <span className="mt-2 inline-block text-[12.5px] font-bold text-white/95 transition group-hover:translate-x-0.5">
                  Explore →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
