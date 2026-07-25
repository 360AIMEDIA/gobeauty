// Curated trend/look/product/aftercare/pro cards for the homepage
// "Trending Now" grid and the /looks-trends channel (PRD v2 §6.3, §7.5).
// Each card routes into its channel; swap for a CMS/API feed later without
// touching component code — keep the TrendCard shape stable.

export type TrendCardType = "look" | "trend" | "product" | "aftercare" | "pro";

export interface TrendCard {
  id: string;
  type: TrendCardType;
  title: string;
  image: string;
  tags: string[];
  href: string;
  /** Only for pro cards — keeps location context visible (PRD §6.3). */
  location?: string;
  /** Crop hint for the masonry feed — varied heights like an Instagram/Pinterest mobile feed. */
  aspect?: "wide" | "square" | "portrait" | "tall";
}

export const TREND_CARD_BADGES: Record<
  TrendCardType,
  { label: string; className: string }
> = {
  look: { label: "Look", className: "bg-brand-500/10 text-brand-600" },
  trend: { label: "Trend", className: "bg-violet-100 text-violet-700" },
  product: { label: "Product", className: "bg-emerald-100 text-emerald-700" },
  aftercare: { label: "Aftercare", className: "bg-amber-100 text-amber-700" },
  pro: { label: "Pro", className: "bg-sky-100 text-sky-700" },
};

const u = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=800&q=80&auto=format&fit=crop`;

export const TREND_CARDS: TrendCard[] = [
  {
    id: "glass-skin-glow",
    type: "trend",
    title: "Glass Skin Glow",
    image: u("1570172619644-dfd03ed5d881"),
    tags: ["K-beauty", "Facial"],
    href: "/looks-trends",
    aspect: "tall",
  },
  {
    id: "korean-bridal-nails",
    type: "look",
    title: "Korean Bridal Nails",
    image: "/assets/nail_06_nude_shimmer.jpg",
    tags: ["Nails", "Bridal"],
    href: "/looks-trends",
    aspect: "square",
  },
  {
    id: "soft-korean-perm",
    type: "look",
    title: "Soft Korean Perm",
    image: u("1560066984-138dadb4c035"),
    tags: ["Hair", "Salon"],
    href: "/looks-trends",
    aspect: "portrait",
  },
  {
    id: "natural-lash-lift",
    type: "trend",
    title: "Natural Lash Lift",
    image: u("1487412947147-5cebf100ffc2"),
    tags: ["Lashes", "Low-maintenance"],
    href: "/looks-trends",
    aspect: "wide",
  },
  {
    id: "chrome-french-tips",
    type: "look",
    title: "Chrome French Tips",
    image: "/assets/nail_13_burgundy.jpg",
    tags: ["Nails", "French"],
    href: "/looks-trends",
    aspect: "portrait",
  },
  {
    id: "post-facial-aftercare",
    type: "aftercare",
    title: "Post-Facial Aftercare Plan",
    image: u("1556228578-8c89e6adf883"),
    tags: ["Skin barrier", "Routine"],
    href: "/shop-products",
    aspect: "tall",
  },
  {
    id: "barrier-repair-picks",
    type: "product",
    title: "Barrier Repair Picks",
    image: u("1620331311520-246422fd82f9"),
    tags: ["Pro-recommended", "Sensitive skin"],
    href: "/shop-products",
    aspect: "square",
  },
  {
    id: "top-facial-pros",
    type: "pro",
    title: "Top-rated Facial Pros Near You",
    image: u("1540555700478-4be289fbecef"),
    tags: ["Hydrating facial"],
    href: "/find-pros",
    location: "New Jersey",
    aspect: "tall",
  },
  {
    id: "cuticle-oil-pros-love",
    type: "product",
    title: "Cuticle Oils Pros Love",
    image: u("1598440947619-2c35fc9aa908"),
    tags: ["Nail aftercare"],
    href: "/shop-products",
    aspect: "square",
  },
  {
    id: "3d-cherry-almond",
    type: "look",
    title: "3D Cherry Almond Art",
    image: "/assets/nail_05_3d_cherry.jpg",
    tags: ["Nails", "Nail art"],
    href: "/looks-trends",
    aspect: "portrait",
  },
  {
    id: "scalp-care-reset",
    type: "trend",
    title: "Scalp Care Reset",
    image: u("1522337660859-02fbefca4702"),
    tags: ["Hair", "Scalp serum"],
    href: "/looks-trends",
    aspect: "wide",
  },
  {
    id: "keratin-aftercare",
    type: "aftercare",
    title: "Keratin Aftercare Checklist",
    image: u("1519823551278-64ac92734fb1"),
    tags: ["Hair", "Sulfate-free"],
    href: "/shop-products",
    aspect: "portrait",
  },
  {
    id: "top-nail-studios-edison",
    type: "pro",
    title: "Top Nail Studios in Edison",
    image: "/assets/salon_07_pink_chandelier.jpg",
    tags: ["Gel manicure"],
    href: "/local-rankings",
    location: "Edison, NJ",
    aspect: "tall",
  },
  {
    id: "clean-girl-nails",
    type: "look",
    title: "Clean Girl Nails",
    image: "/assets/nail_12_grad.jpg",
    tags: ["Nails", "Minimal"],
    href: "/looks-trends",
    aspect: "square",
  },
  {
    id: "hydrating-facial-glow",
    type: "trend",
    title: "Hydrating Facial Glow",
    image: u("1616683693504-3ea7e9ad6fec"),
    tags: ["Skin", "Facial spa"],
    href: "/looks-trends",
    aspect: "tall",
  },
  {
    id: "post-wax-care",
    type: "aftercare",
    title: "Post-Wax Care Guide",
    image: u("1552693673-1bf958298935"),
    tags: ["Waxing", "Soothing"],
    href: "/shop-products",
    aspect: "square",
  },
  {
    id: "burgundy-french-swirls",
    type: "look",
    title: "Burgundy French with Gold Swirls",
    image: "/assets/nail_08_floral.jpg",
    tags: ["Nails", "Autumn"],
    href: "/looks-trends",
    aspect: "portrait",
  },
  {
    id: "spf-after-medspa",
    type: "product",
    title: "SPF Picks After Med Spa Treatments",
    image: u("1608248543803-ba4f8c70ae0b"),
    tags: ["Med spa", "Aftercare"],
    href: "/shop-products",
    aspect: "wide",
  },
  {
    id: "lash-studio-jersey-city",
    type: "pro",
    title: "Top Lash Studios in Jersey City",
    image: "/assets/salon_03_modern.jpg",
    tags: ["Lash extensions"],
    href: "/local-rankings",
    location: "Jersey City, NJ",
    aspect: "portrait",
  },
  {
    id: "glazed-donut-skin",
    type: "trend",
    title: "Glazed Donut Skin Routine",
    image: u("1526758097130-bab247274f58"),
    tags: ["Skin", "Routine"],
    href: "/looks-trends",
    aspect: "tall",
  },
];
