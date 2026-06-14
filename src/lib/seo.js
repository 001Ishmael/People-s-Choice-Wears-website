/* ============================================================
   PC Wears — SEO helper
   Per-page <title>, meta description, canonical, Open Graph,
   Twitter cards, and robots (noindex for private pages).
   Used by App.jsx on every route change (the app is an SPA, so
   these tags are kept in sync with the current page in the browser).
   ============================================================ */

export const SITE = "https://www.pcwears.com";
const OG_IMAGE = `${SITE}/og-image.jpg`;
const BRAND = "PC Wears";

/* page key  <->  URL path */
export const PATHS = {
  home: "/", shop: "/shop", cosmetics: "/cosmetics", team: "/team",
  custom: "/custom-order", about: "/about", contact: "/contact", blog: "/blog",
  stylist: "/style-advisor", invest: "/partner",
  vendorRegister: "/vendor-register",
  cart: "/cart", wishlist: "/wishlist", account: "/account",
  product: "/product", post: "/blog", admin: "/admin",
};
export const PAGE_BY_PATH = {
  "/": "home", "/shop": "shop", "/cosmetics": "cosmetics", "/team": "team",
  "/custom-order": "custom", "/about": "about", "/contact": "contact", "/blog": "blog",
  "/style-advisor": "stylist", "/partner": "invest",
  "/vendor-register": "vendorRegister",
  "/cart": "cart", "/wishlist": "wishlist", "/account": "account",
  "/product": "product", "/admin": "admin",
};

/* pages we do NOT want Google to index */
const NOINDEX = new Set(["admin", "account", "cart", "wishlist"]);

const META = {
  home: {
    title: `${BRAND} | Luxury Fashion & Lifestyle in Freetown, Sierra Leone`,
    desc: "PC Wears (People's Choice Wears) is a luxury clothing brand in Freetown, Sierra Leone. Shop Africana wears, ready-made outfits, custom tailoring, cosmetics, perfumes, shoes, watches and accessories. Order on WhatsApp.",
  },
  shop: {
    title: `Shop Fashion & Lifestyle | ${BRAND} Sierra Leone`,
    desc: "Browse Africana wears, men's and ladies' ready-made outfits, hair, perfumes, watches, shoes and accessories from PC Wears — a clothing brand in Freetown, Sierra Leone.",
  },
  cosmetics: {
    title: `PC Cosmetics | Beauty, Skincare & Makeup in Freetown`,
    desc: "Shop PC Cosmetics — lipsticks, foundation, palettes, skincare and beauty essentials for rich skin tones, from PC Wears in Freetown, Sierra Leone.",
  },
  team: {
    title: `Meet Our Team | ${BRAND}`,
    desc: "Meet the team behind PC Wears — the people crafting quality fashion, custom tailoring and service in Freetown, Sierra Leone.",
  },
  custom: {
    title: `Custom Tailoring & Africana Outfits | ${BRAND}`,
    desc: "Order custom-made Africana wear and outfits from PC Wears in Freetown. Choose your style, fabric and colour — we tailor it for you. Request a quote on WhatsApp.",
  },
  about: {
    title: `About ${BRAND} | Clothing Brand in Freetown, Sierra Leone`,
    desc: "PC Wears (People's Choice Wears) is a fashion and lifestyle brand in Freetown, Sierra Leone, offering Africana wears, custom tailoring, cosmetics, perfumes and accessories.",
  },
  contact: {
    title: `Contact ${BRAND} | 25 Sanders Street, Freetown`,
    desc: "Contact PC Wears in Freetown, Sierra Leone. Visit 25 Sanders Street or order on WhatsApp at +232 79 468 780. Pickup and delivery within Freetown.",
  },
  blog: {
    title: `Style Journal | ${BRAND} Blog`,
    desc: "Fashion tips and style ideas from PC Wears — styling Africana wear, choosing colours for your skin tone, wig care and more.",
  },
  stylist: {
    title: `AI Style Advisor | ${BRAND}`,
    desc: "Get free outfit and colour advice from the PC Wears AI Style Advisor — tailored for Africana fashion and Sierra Leonean style.",
  },
  invest: {
    title: `Partner With ${BRAND}`,
    desc: "Register your interest in partnering with PC Wears, a growing fashion business in Freetown, Sierra Leone.",
  },
  vendorRegister: { title: `Sell on People${"\u2019"}s Choice | Open Your Shop`, desc: "Register your fashion business on the People's Choice Fashion Marketplace. Clothing brands, boutiques, tailors, designers and fabric stores can sell to customers across Freetown and Sierra Leone." },
  account: { title: `My Account | ${BRAND}`, desc: "Sign in to your PC Wears account to track orders and get new-stock alerts." },
  cart: { title: `Your Cart | ${BRAND}`, desc: "Review your PC Wears cart and check out on WhatsApp." },
  wishlist: { title: `Your Wishlist | ${BRAND}`, desc: "Your saved PC Wears favourites." },
  product: { title: `Product | ${BRAND}`, desc: "Shop this item from PC Wears, Freetown, Sierra Leone." },
  admin: { title: `Staff Dashboard | ${BRAND}`, desc: "" },
};

function tag(selector, create) {
  let el = document.head.querySelector(selector);
  if (!el) { el = create(); document.head.appendChild(el); }
  return el;
}
function setMeta(attr, name, content) {
  const el = tag(`meta[${attr}="${name}"]`, () => {
    const m = document.createElement("meta");
    m.setAttribute(attr, name);
    return m;
  });
  el.setAttribute("content", content);
}
function setLink(rel, href) {
  const el = tag(`link[rel="${rel}"]`, () => {
    const l = document.createElement("link");
    l.setAttribute("rel", rel);
    return l;
  });
  el.setAttribute("href", href);
}

export function applySeo(page) {
  const m = META[page] || META.home;
  const path = PATHS[page] || "/";
  const url = SITE + (path === "/" ? "/" : path);
  const noindex = NOINDEX.has(page);

  document.title = m.title;
  setMeta("name", "description", m.desc);
  setMeta("name", "robots", noindex ? "noindex, nofollow" : "index, follow");
  setLink("canonical", url);

  // Open Graph
  setMeta("property", "og:title", m.title);
  setMeta("property", "og:description", m.desc);
  setMeta("property", "og:url", url);
  setMeta("property", "og:type", "website");
  setMeta("property", "og:site_name", BRAND);
  setMeta("property", "og:image", OG_IMAGE);

  // Twitter / X
  setMeta("name", "twitter:card", "summary_large_image");
  setMeta("name", "twitter:title", m.title);
  setMeta("name", "twitter:description", m.desc);
  setMeta("name", "twitter:image", OG_IMAGE);
}
