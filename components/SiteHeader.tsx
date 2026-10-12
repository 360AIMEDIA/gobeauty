"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/useAuth";
import CartLink from "@/components/gb/CartLink";

// PRD v2 §5 — top-level channel navigation.
// Products is a mega menu (marketplace doc §2); other items stay simple links.
const NAV_LINKS = [
  { label: "Get This Look", href: "/get-this-look" },
  { label: "Skin Analyzer", href: "/skin-analyzer" },
  { label: "Find Pros", href: "/find-pros" },
  { label: "Local Rankings", href: "/local-rankings" },
  { label: "Looks & Trends", href: "/looks-trends" },
];

const PRODUCTS_FOR_YOURSELF = [
  { label: "Skin Analyzer", href: "/skin-analyzer" },
  { label: "Shop Pro-Recommended Products", href: "/shop-products" },
  { label: "All Products", href: "/products?view=all" },
  { label: "All Brands", href: "/brands/explore" },
  { label: "Product Library", href: "/products" },
  { label: "Ingredients", href: "/ingredients" },
  { label: "Compare Products", href: "/compare" },
];

const PRODUCTS_FOR_SALON = [
  { label: "Products for Salons", href: "/marketplace" },
  { label: "Samples & Starter Kits", href: "/marketplace?use=samples" },
  { label: "Professional Brands", href: "/marketplace/suppliers" },
  { label: "Equipment & Demos", href: "/marketplace?use=equipment" },
];

const BUSINESS_LINKS = [
  { label: "For Beauty Professionals", href: "/beauty-pros" },
  { label: "For Beauty Brands", href: "/brands" },
  { label: "Services", href: "/services" },
  { label: "Marketplace", href: "/marketplace/suppliers" },
];

/** GEO content hubs — FAQ + Blog for AI/search discovery */
const LEARN_LINKS = [
  { label: "Blog", href: "/blog" },
  { label: "FAQ", href: "/faq" },
  { label: "AI Visibility", href: "/ai-visibility" },
];

const PRODUCTS_ACTIVE_PREFIXES = [
  "/shop-products",
  "/products",
  "/ingredients",
  "/compare",
  "/marketplace",
];

function maskUsername(name: string) {
  if (!name) return "";
  if (name.length <= 4) return name[0] + "***";
  return name.slice(0, 2) + "***" + name.slice(-2);
}

/** Small “i” icon that reveals a section description on hover/focus. */
function SectionInfoTip({ label, description }: { label: string; description: string }) {
  return (
    <span className="group/tip relative inline-flex">
      <button
        type="button"
        className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-line text-[10px] font-bold leading-none text-ink-faint transition hover:border-brand-300 hover:text-brand-600 focus:outline-none focus-visible:border-brand-400 focus-visible:text-brand-600"
        aria-label={`${label}: ${description}`}
      >
        i
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 top-full z-[60] mt-1.5 w-52 -translate-x-1/2 rounded-lg bg-ink px-2.5 py-2 text-left text-[11.5px] font-medium leading-snug text-white opacity-0 shadow-lg transition group-hover/tip:opacity-100 group-focus-within/tip:opacity-100"
      >
        {description}
        <span
          aria-hidden
          className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-ink"
        />
      </span>
    </span>
  );
}

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { user, profile, openAuth, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Close overlays on navigation.
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setProductsOpen(false);
  }, [pathname]);

  // Lock body scroll while the mobile menu is open so the sheet stays usable.
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    setSearchOpen(false);
    router.push(q ? `/get-this-look?q=${encodeURIComponent(q)}` : "/get-this-look");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line-soft bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-4 px-4 md:px-5">
        {/* Logo — left (PRD §5 mobile header rule) */}
        <Link href="/" aria-label="goBeauty.ai home" className="flex flex-none items-center">
          <Image
            src="/gobeauty-logo.png"
            alt="goBeauty.ai"
            width={1230}
            height={360}
            className="h-10 w-auto object-contain md:h-11"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <nav
          aria-label="Primary"
          className="hidden min-w-0 items-center gap-4 text-[13.5px] font-semibold text-ink-soft lg:flex xl:gap-5"
        >
          {NAV_LINKS.slice(0, 3).map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={[
                "whitespace-nowrap transition hover:text-ink",
                pathname?.startsWith(l.href) ? "text-brand-600" : "",
              ].join(" ")}
            >
              {l.label}
            </Link>
          ))}

          {/* Products mega menu — FOR YOURSELF / FOR YOUR SALON (marketplace §2) */}
          <div className="group relative">
            <button
              type="button"
              className={[
                "flex items-center gap-1 whitespace-nowrap transition hover:text-ink",
                PRODUCTS_ACTIVE_PREFIXES.some((p) => pathname?.startsWith(p))
                  ? "text-brand-600"
                  : "",
              ].join(" ")}
              aria-haspopup="menu"
            >
              Products
              <svg
                className="h-3.5 w-3.5 transition group-hover:rotate-180"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="invisible absolute left-1/2 top-full z-50 w-[min(92vw,440px)] -translate-x-1/2 pt-2 opacity-0 transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
              <div className="rounded-2xl border border-line-soft bg-white p-4 shadow-cardHover">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="flex items-center gap-1.5 px-2">
                      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-faint">
                        For yourself
                      </p>
                      <SectionInfoTip
                        label="For yourself"
                        description="Find products for your beauty goal, routine, ingredients, and aftercare."
                      />
                    </div>
                    <div className="mt-2">
                      {PRODUCTS_FOR_YOURSELF.map((l) => (
                        <Link
                          key={l.href}
                          href={l.href}
                          className={[
                            "block rounded-xl px-2.5 py-2 text-[13.5px] font-semibold transition hover:bg-surface-tint hover:text-ink",
                            pathname?.startsWith(l.href.split("?")[0])
                              ? "text-brand-600"
                              : "text-ink-soft",
                          ].join(" ")}
                        >
                          {l.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 px-2">
                      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-faint">
                        For your salon
                      </p>
                      <SectionInfoTip
                        label="For your salon"
                        description="Find products to use in services, recommend to clients, and sell after appointments."
                      />
                    </div>
                    <div className="mt-2">
                      {PRODUCTS_FOR_SALON.map((l) => (
                        <Link
                          key={l.href}
                          href={l.href}
                          className={[
                            "block rounded-xl px-2.5 py-2 text-[13.5px] font-semibold transition hover:bg-surface-tint hover:text-ink",
                            pathname?.startsWith(l.href.split("?")[0])
                              ? "text-brand-600"
                              : "text-ink-soft",
                          ].join(" ")}
                        >
                          {l.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {NAV_LINKS.slice(3).map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={[
                "whitespace-nowrap transition hover:text-ink",
                pathname?.startsWith(l.href) ? "text-brand-600" : "",
              ].join(" ")}
            >
              {l.label}
            </Link>
          ))}

          <span aria-hidden className="h-4 w-px bg-line" />
          {/* Business links collapsed into a dropdown — CSS-only (hover +
              focus-within) so the bar stays narrow as links grow */}
          <div className="group relative">
            <button
              type="button"
              className={[
                "flex items-center gap-1 whitespace-nowrap transition hover:text-ink",
                BUSINESS_LINKS.some((l) => pathname?.startsWith(l.href))
                  ? "text-brand-600"
                  : "",
              ].join(" ")}
              aria-haspopup="menu"
            >
              For Business
              <svg
                className="h-3.5 w-3.5 transition group-hover:rotate-180"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="invisible absolute right-0 top-full pt-2 opacity-0 transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
              <div className="w-60 rounded-2xl border border-line-soft bg-white p-2 shadow-cardHover">
                {BUSINESS_LINKS.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={[
                      "block rounded-xl px-3.5 py-2.5 text-[13.5px] font-semibold transition hover:bg-surface-tint hover:text-ink",
                      pathname?.startsWith(l.href) ? "text-brand-600" : "text-ink-soft",
                    ].join(" ")}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {LEARN_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={[
                "whitespace-nowrap transition hover:text-ink",
                pathname?.startsWith(l.href) ? "text-brand-600" : "",
              ].join(" ")}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Desktop account actions */}
        <div className="hidden flex-none items-center gap-3 lg:flex">
          <CartLink />
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/u/me"
                className="flex items-center gap-2 rounded-pill border border-line bg-surface-soft px-3 py-1.5"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-[11px] font-bold text-white">
                  {(profile?.username ?? "U")[0].toUpperCase()}
                </span>
                <span className="text-[13px] font-semibold text-ink">
                  {profile ? maskUsername(profile.username) : "···"}
                </span>
              </Link>
              <button
                onClick={signOut}
                className="text-[13.5px] font-medium text-ink-muted transition hover:text-ink"
              >
                Sign out
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => openAuth("sign-in")}
                className="text-[14px] font-medium text-ink-soft transition hover:text-ink"
              >
                Sign In
              </button>
              <Link
                href="/get-this-look"
                className="rounded-pill bg-brand-500 px-4 py-2 text-[13.5px] font-semibold text-white shadow-sm transition hover:bg-brand-600"
              >
                Upload a Look
              </Link>
            </>
          )}
        </div>

        {/* Mobile: search + menu icons on the right (PRD §5) */}
        <div className="flex items-center gap-1 lg:hidden">
          <CartLink compact />
          <button
            className="flex h-11 w-11 items-center justify-center rounded-lg text-ink-soft transition hover:bg-surface-tint"
            onClick={() => {
              setSearchOpen(!searchOpen);
              setMenuOpen(false);
            }}
            aria-label="Search"
            aria-expanded={searchOpen}
          >
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
            </svg>
          </button>
          <button
            className="flex h-11 w-11 items-center justify-center rounded-lg text-ink-soft transition hover:bg-surface-tint"
            onClick={() => {
              setMenuOpen((open) => {
                if (open) setProductsOpen(false);
                return !open;
              });
              setSearchOpen(false);
            }}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <svg width="21" height="21" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg width="21" height="21" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile search sheet */}
      {searchOpen && (
        <div className="border-t border-line-soft bg-white px-4 pb-4 pt-3 lg:hidden">
          <form
            role="search"
            onSubmit={submitSearch}
            className="flex items-center gap-2 rounded-pill border border-line bg-white px-4 py-1 focus-within:border-brand-300"
          >
            <svg className="h-[18px] w-[18px] flex-none text-ink-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a look, service, or ‘glass skin’…"
              className="h-11 min-w-0 flex-1 border-0 bg-transparent text-[16px] text-ink outline-none placeholder:text-ink-faint"
            />
            <button
              type="submit"
              className="flex-none rounded-pill bg-brand-500 px-4 py-2 text-[13px] font-semibold text-white"
            >
              Go
            </button>
          </form>
        </div>
      )}

      {/* Mobile menu sheet — constrained to viewport + scrollable so nothing is cut off */}
      {menuOpen && (
        <div
          className="overflow-y-auto overscroll-contain border-t border-line-soft bg-white lg:hidden"
          style={{
            // Header is h-16; leave room for bottom tab bar + safe area.
            maxHeight: "calc(100dvh - 4rem - 4.5rem - env(safe-area-inset-bottom, 0px))",
          }}
        >
          <nav className="flex flex-col px-5 pb-5 pt-3" aria-label="Mobile primary">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={[
                  "flex h-11 items-center text-[15px] font-semibold transition hover:text-brand-600",
                  pathname?.startsWith(l.href) ? "text-brand-600" : "text-ink",
                ].join(" ")}
              >
                {l.label}
              </Link>
            ))}

            {/* Products collapsed by default to keep the sheet short */}
            <button
              type="button"
              onClick={() => setProductsOpen((v) => !v)}
              className={[
                "mt-1 flex h-11 w-full items-center justify-between text-left text-[15px] font-semibold transition hover:text-brand-600",
                PRODUCTS_ACTIVE_PREFIXES.some((p) => pathname?.startsWith(p))
                  ? "text-brand-600"
                  : "text-ink",
              ].join(" ")}
              aria-expanded={productsOpen}
            >
              Products
              <svg
                className={[
                  "h-4 w-4 text-ink-muted transition",
                  productsOpen ? "rotate-180" : "",
                ].join(" ")}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {productsOpen && (
              <div className="mb-1 rounded-xl bg-surface-soft/80 px-3 py-1.5">
                <p className="pt-1 text-[10.5px] font-bold uppercase tracking-[0.12em] text-ink-faint">
                  For yourself
                </p>
                {PRODUCTS_FOR_YOURSELF.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="flex h-10 items-center text-[14px] font-semibold text-ink-soft transition hover:text-brand-600"
                  >
                    {l.label}
                  </Link>
                ))}
                <p className="mt-1.5 pt-1 text-[10.5px] font-bold uppercase tracking-[0.12em] text-ink-faint">
                  For your salon
                </p>
                {PRODUCTS_FOR_SALON.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="flex h-10 items-center text-[14px] font-semibold text-ink-soft transition hover:text-brand-600"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            )}

            <div className="mt-1 border-t border-line-soft pt-1">
              {BUSINESS_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={[
                    "flex h-11 items-center text-[14.5px] font-medium transition hover:text-ink",
                    pathname?.startsWith(l.href) ? "text-brand-600" : "text-ink-soft",
                  ].join(" ")}
                >
                  {l.label}
                </Link>
              ))}
            </div>

            <div className="mt-1 border-t border-line-soft pt-1">
              {LEARN_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={[
                    "flex h-11 items-center text-[14.5px] font-medium transition hover:text-ink",
                    pathname?.startsWith(l.href) ? "text-brand-600" : "text-ink-soft",
                  ].join(" ")}
                >
                  {l.label}
                </Link>
              ))}
            </div>

            {user ? (
              <div className="mt-2 flex items-center justify-between rounded-xl border border-line bg-surface-soft px-4 py-2.5">
                <Link href="/u/me" className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-500 text-[12px] font-bold text-white">
                    {(profile?.username ?? "U")[0].toUpperCase()}
                  </span>
                  <span className="text-[14px] font-semibold text-ink">
                    {profile ? maskUsername(profile.username) : "···"}
                  </span>
                </Link>
                <button onClick={signOut} className="text-[13px] text-ink-muted hover:text-ink">
                  Sign out
                </button>
              </div>
            ) : (
              <div className="mt-2 flex gap-3">
                <button
                  onClick={() => openAuth("sign-in")}
                  className="h-10 flex-1 rounded-pill border border-line text-center text-[14px] font-semibold text-ink"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuth("sign-up")}
                  className="h-10 flex-1 rounded-pill bg-brand-500 text-center text-[14px] font-semibold text-white"
                >
                  Sign up
                </button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
