import Link from "next/link";
import Image from "next/image";

export default function SiteFooter() {
  return (
    <footer className="border-t border-line-soft bg-white">
      <div className="mx-auto max-w-[1200px] px-5 py-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center">
              <Image
                src="/gobeauty-logo.png"
                alt="goBeauty.ai"
                width={1230}
                height={360}
                className="h-9 w-auto object-contain"
              />
            </Link>
            <p className="mt-3 max-w-xs text-[14px] leading-relaxed text-ink-muted">
              Upload a look. GoBeauty helps you get it — the right service,
              local pros, pro-recommended products, and aftercare.
            </p>
            <div className="mt-4 flex gap-3">
              {["𝕏", "IG", "TT"].map((s) => (
                <a
                  key={s}
                  href="#"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-[12px] font-bold text-ink-muted transition hover:border-brand-300 hover:text-brand-500"
                >
                  {s}
                </a>
              ))}
            </div>
          </div>

          <FooterCol
            title="Discover"
            items={[
              { label: "Get This Look", href: "/get-this-look" },
              { label: "Skin Analyzer", href: "/skin-analyzer" },
              { label: "Find Pros", href: "/find-pros" },
              { label: "Local Rankings", href: "/local-rankings" },
              { label: "Looks & Trends", href: "/looks-trends" },
              { label: "Blog", href: "/blog" },
              { label: "FAQ", href: "/faq" },
              { label: "AI Visibility", href: "/ai-visibility" },
            ]}
          />
          <FooterCol
            title="Shop"
            items={[
              { label: "All Products", href: "/products?view=all" },
              { label: "All Brands", href: "/brands/explore" },
              { label: "Pro-Recommended Products", href: "/shop-products" },
              { label: "Product Library", href: "/products" },
              { label: "Ingredients", href: "/ingredients" },
              { label: "Compare Products", href: "/compare" },
              { label: "Products for Salons", href: "/marketplace" },
            ]}
          />
          <FooterCol
            title="For Business"
            items={[
              { label: "For Beauty Professionals", href: "/beauty-pros" },
              { label: "For Beauty Brands", href: "/brands" },
              { label: "Services", href: "/services" },
              { label: "List Your Products", href: "/brands/list-your-products" },
              { label: "Beauty Suppliers", href: "/marketplace/suppliers" },
              { label: "Claim Your Profile", href: "/beauty-pros#claim" },
            ]}
          />
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-line-soft pt-6 text-[13px] text-ink-muted md:flex-row md:items-center md:justify-between">
          <div>© {new Date().getFullYear()} GoBeauty, Inc. All rights reserved.</div>
          <div className="flex flex-wrap gap-5">
            <Link href="/faq" className="hover:text-ink">FAQ</Link>
            <Link href="/ai-visibility" className="hover:text-ink">AI Visibility</Link>
            <Link href="/blog" className="hover:text-ink">Blog</Link>
            <Link href="/sms-consent" className="hover:text-ink">SMS Consent</Link>
            <Link href="/privacy" className="hover:text-ink">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-ink">Terms of Service</Link>
            <Link href="/cookies" className="hover:text-ink">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: { label: string; href: string }[] }) {
  return (
    <div>
      <h3 className="text-[12px] font-bold uppercase tracking-[0.1em] text-ink">{title}</h3>
      <ul className="mt-3 space-y-2.5 text-[14px] text-ink-soft">
        {items.map((it) => (
          <li key={it.label}>
            <Link href={it.href} className="transition hover:text-ink">{it.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
