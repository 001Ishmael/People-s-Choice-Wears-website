import { useState, useEffect, useMemo } from "react";
import { sGet, sSet } from "./lib/store.js";

/* ============================================================
   PC WEARS — People's Choice Wears  ·  v2 (Premium)
   Luxury fashion & lifestyle · 25 Sanders Street, Freetown, SL
   "Crafted with Choice. Worn with Pride."
   ============================================================ */

const GOLD = "#C9A24B";
const GOLD_LIGHT = "#E3C77E";
const BLACK = "#0B0A08";
const INK = "#161310";
const NAVY = "#0E1828";
const NAVY_SOFT = "#16243A";
const CREAM = "#F5EFE3";
const CREAM_DARK = "#E7DECB";
const MUTED = "#8C8576";
const WHITE = "#FFFFFF";

const WA_NUMBER = "23279468780";
const WA_DISPLAY = "+232 79 468 780";
const ADDRESS = "25 Sanders Street, Freetown, Sierra Leone";
const EMAIL = "hello@pcwears.sl"; // placeholder — replace with your real email
const DEFAULT_ADMIN_PASS = "pcwears2026";

/* Only platforms with real links are shown — no broken icons. */
const SOCIALS = [
  { id: "facebook", name: "Facebook", url: "https://www.facebook.com/share/1DD9hgr8oB/" },
  { id: "tiktok", name: "TikTok", url: "https://www.tiktok.com/@peopleschoicewears?_r=1&_t=ZS-97AbIUrG4Bt" },
  { id: "whatsapp", name: "WhatsApp", url: `https://wa.me/${WA_NUMBER}` },
];

const CATEGORIES = [
  { id: "africana", name: "Africana Wears", icon: "🧵" },
  { id: "mens", name: "Men's Wear", icon: "🤵" },
  { id: "ladies", name: "Ladies' Wear", icon: "👗" },
  { id: "hair", name: "Hair & Wigs", icon: "💁🏾‍♀️" },
  { id: "perfumes", name: "Perfumes", icon: "🌸" },
  { id: "watches", name: "Watches", icon: "⌚" },
  { id: "shoes", name: "Shoes", icon: "👞" },
  { id: "sandals", name: "Sandals & Slippers", icon: "🩴" },
  { id: "glasses", name: "Smart Glasses", icon: "🕶️" },
  { id: "accessories", name: "Accessories", icon: "💎" },
  { id: "cosmetics", name: "Cosmetics", icon: "💄" },
];
const catName = (id) => (CATEGORIES.find((c) => c.id === id) || {}).name || id;
const catIcon = (id) => (CATEGORIES.find((c) => c.id === id) || {}).icon || "🛍️";

const SEED_PRODUCTS = [
  { id: "p1", name: "Royal Black & Gold Africana Set", category: "africana", price: 850, description: "Two-piece tailored Africana set in premium black fabric with gold embroidery. Made in Freetown.", sizes: ["S", "M", "L", "XL"], colors: ["Black/Gold", "Cream/Gold"], stock: "available", featured: true, newArrival: true, bestSeller: true, image: null },
  { id: "p2", name: "Kente Print Senator Suit", category: "africana", price: 700, description: "Classic senator cut with bold kente accent panels. Sharp, comfortable, and proudly African.", sizes: ["M", "L", "XL", "XXL"], colors: ["Navy", "Wine", "Black"], stock: "available", featured: true, newArrival: false, bestSeller: true, image: null },
  { id: "p3", name: "Gentleman's Slim-Fit Shirt", category: "mens", price: 280, description: "Crisp slim-fit shirt for office or occasion. Breathable cotton blend.", sizes: ["S", "M", "L", "XL"], colors: ["White", "Sky Blue", "Black"], stock: "available", featured: false, newArrival: true, bestSeller: false, image: null },
  { id: "p4", name: "Elegance Evening Gown", category: "ladies", price: 950, description: "Floor-length evening gown with gold detailing. Turns every entrance into a moment.", sizes: ["S", "M", "L"], colors: ["Emerald", "Black", "Gold"], stock: "available", featured: true, newArrival: true, bestSeller: false, image: null },
  { id: "p5", name: "Ankara Two-Piece (Ladies)", category: "ladies", price: 520, description: "Vibrant Ankara crop top and trouser set. Ready-made, ready to shine.", sizes: ["S", "M", "L", "XL"], colors: ["Multi"], stock: "available", featured: false, newArrival: false, bestSeller: true, image: null },
  { id: "p6", name: "Brazilian Body Wave Wig 22\"", category: "hair", price: 1200, description: "100% human hair, 22-inch body wave, pre-plucked lace front. Natural density.", sizes: ["22\""], colors: ["Natural Black", "Brown Mix"], stock: "available", featured: true, newArrival: true, bestSeller: true, image: null },
  { id: "p7", name: "Bone Straight Wig 18\"", category: "hair", price: 980, description: "Silky bone straight human hair wig, 18 inches. Sleek and low maintenance.", sizes: ["18\""], colors: ["Natural Black"], stock: "available", featured: false, newArrival: false, bestSeller: false, image: null },
  { id: "p8", name: "Aventos Eau de Parfum", category: "perfumes", price: 750, description: "Long-lasting designer-inspired scent. Fresh, bold, and unforgettable.", sizes: ["100ml"], colors: [], stock: "available", featured: true, newArrival: false, bestSeller: true, image: null },
  { id: "p9", name: "Oud Royale Perfume Oil", category: "perfumes", price: 350, description: "Concentrated oud perfume oil. A few drops last all day.", sizes: ["12ml"], colors: [], stock: "available", featured: false, newArrival: true, bestSeller: false, image: null },
  { id: "p10", name: "Executive Gold Chronograph", category: "watches", price: 680, description: "Stainless steel chronograph watch with gold finish. Water resistant.", sizes: [], colors: ["Gold", "Silver", "Black"], stock: "available", featured: true, newArrival: false, bestSeller: false, image: null },
  { id: "p11", name: "Classic Leather Strap Watch", category: "watches", price: 420, description: "Minimal dial with genuine leather strap. Everyday elegance.", sizes: [], colors: ["Brown", "Black"], stock: "coming_soon", featured: false, newArrival: true, bestSeller: false, image: null },
  { id: "p12", name: "Oxford Leather Shoes", category: "shoes", price: 600, description: "Polished leather Oxford shoes. The finishing touch for any suit or Africana set.", sizes: ["40", "41", "42", "43", "44", "45"], colors: ["Black", "Brown"], stock: "available", featured: false, newArrival: false, bestSeller: true, image: null },
  { id: "p13", name: "Comfort Palm Slippers", category: "sandals", price: 180, description: "Handmade leather palm slippers. Durable, stylish, made for Freetown weather.", sizes: ["40", "41", "42", "43", "44"], colors: ["Black", "Brown", "Tan"], stock: "available", featured: false, newArrival: true, bestSeller: false, image: null },
  { id: "p14", name: "Smart Audio Glasses", category: "glasses", price: 550, description: "Bluetooth audio sunglasses — take calls and play music, hands free, UV protected.", sizes: [], colors: ["Black"], stock: "available", featured: true, newArrival: true, bestSeller: false, image: null },
  { id: "p15", name: "Gold Cuban Link Chain", category: "accessories", price: 320, description: "Statement Cuban link chain with premium gold plating. Anti-tarnish.", sizes: ["20\"", "24\""], colors: ["Gold", "Silver"], stock: "available", featured: false, newArrival: false, bestSeller: true, image: null },
  { id: "p16", name: "Leather Card Wallet", category: "accessories", price: 150, description: "Slim genuine leather wallet. Six card slots plus cash pocket.", sizes: [], colors: ["Black", "Brown"], stock: "sold_out", featured: false, newArrival: false, bestSeller: false, image: null },
  { id: "c1", name: "Matte Liquid Lipstick Set", category: "cosmetics", price: 220, description: "Long-wear matte liquid lipsticks in six rich, everyday shades.", sizes: [], colors: ["Nude", "Rose", "Wine", "Brick", "Berry", "Red"], stock: "available", featured: true, newArrival: true, bestSeller: true, image: null },
  { id: "c2", name: "Radiance Foundation", category: "cosmetics", price: 280, description: "Buildable medium-to-full coverage foundation with a natural glow finish. Wide shade range.", sizes: ["30ml"], colors: ["Honey", "Caramel", "Chestnut", "Espresso"], stock: "available", featured: true, newArrival: false, bestSeller: true, image: null },
  { id: "c3", name: "Pro Eyeshadow Palette", category: "cosmetics", price: 320, description: "16 highly pigmented mattes and shimmers for day-to-glam looks.", sizes: [], colors: ["Warm Neutrals", "Bold Glam"], stock: "available", featured: false, newArrival: true, bestSeller: false, image: null },
  { id: "c4", name: "Glow Setting Spray", category: "cosmetics", price: 160, description: "Locks makeup in place all day with a dewy, fresh finish.", sizes: ["100ml"], colors: [], stock: "available", featured: false, newArrival: false, bestSeller: true, image: null },
  { id: "c5", name: "Lash & Brow Kit", category: "cosmetics", price: 140, description: "Volumising mascara, brow pencil and gel for defined, polished brows.", sizes: [], colors: ["Black", "Brown"], stock: "available", featured: false, newArrival: true, bestSeller: false, image: null },
  { id: "c6", name: "Skincare Glow Trio", category: "cosmetics", price: 360, description: "Gentle cleanser, vitamin-C serum and moisturiser for radiant, even skin.", sizes: [], colors: [], stock: "coming_soon", featured: true, newArrival: true, bestSeller: false, image: null },
];

const TESTIMONIALS = [
  { name: "Aminata K.", city: "Freetown", text: "My Africana set was tailored perfectly and delivered on time. The quality is premium — I always get compliments." },
  { name: "Mohamed S.", city: "Lumley", text: "Ordered a senator suit and a watch. Smooth process on WhatsApp, fast delivery. PC Wears is my plug." },
  { name: "Isatu B.", city: "Wilberforce", text: "The wig is gorgeous and looks so natural. Customer service was patient and helpful the whole way." },
];
const SEED_POSTS = [
  { id: "b1", title: "5 Ways to Style an Africana Set for Any Occasion", date: "2026-05-20", cover: "🧵", excerpt: "One great Africana set can take you from church to a wedding to the office. Here's how to restyle it five ways.",
    body: "A well-tailored Africana set is the most versatile piece in your wardrobe. Start with a clean, structured cut in a neutral base like black, cream or navy so it pairs with everything.\n\nFor formal events, add gold accessories and polished Oxford shoes. For a relaxed daytime look, roll the sleeves, swap in leather palm slippers, and keep jewellery minimal. Heading to the office? Layer a crisp shirt underneath and keep the palette tonal.\n\nThe secret is contrast and confidence: let one bold element lead — the fabric print, a gold chain, or a statement watch — and keep the rest quiet. Crafted with choice, worn with pride." },
  { id: "b2", title: "Choosing Colors That Flatter Your Skin Tone", date: "2026-05-05", cover: "🎨", excerpt: "Gold, emerald, deep navy or wine? A simple guide to the shades that make rich skin tones glow.",
    body: "Color is the fastest way to elevate an outfit. For deep and warm skin tones, jewel shades like emerald, royal blue, wine and mustard create a striking, luxurious contrast.\n\nGold and cream are universally flattering and sit at the heart of the PC Wears palette — they read as premium and pair beautifully with black. If you love bright colors, balance them with a neutral so the look stays elegant rather than busy.\n\nWhen in doubt, build around one hero color and add metallic accents. Not sure what suits you? Ask our AI Style Advisor for a personal recommendation." },
  { id: "b3", title: "Caring for Your Human Hair Wig", date: "2026-04-18", cover: "💁🏾‍♀️", excerpt: "Keep your wig looking salon-fresh for longer with these simple care habits.",
    body: "A quality human-hair wig is an investment, and a little care keeps it gorgeous for months. Wash gently with sulphate-free shampoo every 7–10 wears, condition from mid-length to ends, and let it air-dry on a stand.\n\nStore it on a mannequin or in a silk bag to keep the style intact, and use heat tools sparingly with a heat protectant. Brush from the ends upward to avoid shedding.\n\nWith the right routine, your bone-straight or body-wave wig stays soft, shiny and natural-looking far longer." },
];
const SEED_TEAM = [
  { id: "t1", name: "Mohamed Ishmael Fofanah", role: "Founder & CEO", bio: "Visionary founder of PC Wears and the People's Choice brand, leading innovation, fashion, technology, and business growth.", phone: WA_NUMBER, email: "", social: "", image: null, active: true },
  { id: "t2", name: "Mr Michael Kamara", role: "Head Fashion Designer", bio: "Leads the creative fashion design process, tailoring quality, custom outfit development, and production standards.", phone: "", email: "", social: "", image: null, active: true },
  { id: "t3", name: "Mr Lamin Bangura", role: "Manager", bio: "Supports business operations, customer coordination, order management, production follow-up, and daily workflow.", phone: "", email: "", social: "", image: null, active: true },
  { id: "t4", name: "Madam Haja Fatmata Fofanah", role: "Manager", bio: "Supports customer service, sales coordination, staff supervision, and business record keeping.", phone: "", email: "", social: "", image: null, active: true },
];

const ROLES = {
  owner:   { label: "Owner / Admin", tabs: ["dashboard","customers","orders","products","inventory","team","blog","staff","settings"] },
  manager: { label: "Manager",       tabs: ["dashboard","customers","orders","products","inventory","team","blog"] },
  sales:   { label: "Sales Staff",   tabs: ["dashboard","customers","orders"] },
  tailor:  { label: "Tailor / Production", tabs: ["dashboard","orders"] },
  viewer:  { label: "Viewer",        tabs: ["dashboard","customers","orders"] },
};
const TAB_LABELS = { dashboard:"Dashboard", customers:"Customers", orders:"Orders", products:"Products", inventory:"Inventory", team:"Team", blog:"Blog", staff:"Staff", settings:"Settings" };

const MEN_MEASURE = ["Shoulder","Chest","Waist","Hip","Sleeve length","Top length","Trouser waist","Trouser length","Thigh","Neck","Cap size"];
const WOMEN_MEASURE = ["Bust","Waist","Hip","Shoulder","Sleeve length","Dress length","Blouse length","Skirt length","Trouser length"];

const ORDER_STATUS = [["pending","Pending"],["in_progress","In Progress"],["ready","Ready"],["delivered","Delivered"],["cancelled","Cancelled"]];
const ORDER_STATUS_COLOR = { pending: GOLD, in_progress: "#2980B9", ready: "#8E44AD", delivered: "#2E7D32", cancelled: "#C0392B" };
const PAY_METHODS = ["Cash","Orange Money","Afrimoney","Bank Transfer","Other"];
const PAY_TYPES = ["Full Payment","Half Payment","Deposit","Balance Payment"];

const orderTotal = (o) => o.total != null && o.total !== "" ? Number(o.total) : (Number(o.price || 0) * Number(o.qty || 1) - Number(o.discount || 0));
const orderPaid = (o) => Array.isArray(o.payments) && o.payments.length ? o.payments.reduce((s, p) => s + Number(p.amount || 0), 0) : Number(o.amountPaid || 0);
const orderBalance = (o) => Math.max(0, orderTotal(o) - orderPaid(o));
const payStatus = (o) => { const t = orderTotal(o), p = orderPaid(o); if (t > 0 && p >= t) return "Paid"; if (p > 0) return p >= t / 2 ? "Part Payment" : "Deposit"; return "Unpaid"; };
const genId = (list, prefix) => prefix + "-" + String((list?.length || 0) + 1).padStart(4, "0");
const csvEscape = (v) => `"${String(v == null ? "" : v).replace(/"/g, '""')}"`;
function downloadCSV(filename, rows) {
  const csv = rows.map((r) => r.map(csvEscape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = filename; a.click();
}



/* ============================================================
   DATA LAYER  — all persistence goes through src/lib/store.js
   (localStorage by default; fill in the Supabase adapter there to
   sync across every device). Nothing in this file needs to change.
   ============================================================ */

/* ---------------- helpers ---------------- */
const fmtLe = (n) => "Le " + Number(n || 0).toLocaleString("en-US");
const waLink = (msg) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const todayISO = () => new Date().toISOString().slice(0, 10);
const STOCK_LABEL = { available: "Available", sold_out: "Sold Out", coming_soon: "Coming Soon" };

function resizeImage(file, maxDim = 700) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL("image/jpeg", 0.72));
      };
      img.onerror = reject; img.src = e.target.result;
    };
    reader.onerror = reject; reader.readAsDataURL(file);
  });
}

/* ---------------- icons ---------------- */
const WaIcon = ({ size = 20, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2zm0 18.2c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.6-6.1c-.3-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.3-.7.8-.8 1-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.6-1.2.1-.2 0-.4 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1.1 2.7c.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2-.1-.1-.2-.2-.5-.3z" /></svg>
);
const FbIcon = ({ size = 18, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true"><path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.7l-.4 2.9h-2.3v7A10 10 0 0 0 22 12z" /></svg>
);
const TtIcon = ({ size = 18, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true"><path d="M16.6 5.8a4.3 4.3 0 0 1-1-2.8h-3v12.3a2.4 2.4 0 1 1-2.4-2.4c.2 0 .5 0 .7.1V9.9a5.5 5.5 0 1 0 4.7 5.4V9.3a7.2 7.2 0 0 0 4.2 1.3V7.6a4.3 4.3 0 0 1-3.2-1.8z" /></svg>
);
const Heart = ({ size = 18, filled, color = GOLD }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : "none"} stroke={color} strokeWidth="1.8" aria-hidden="true"><path d="M12 21s-7-4.5-9.3-9C1.2 9 2.4 5.8 5.5 5.2 7.4 4.8 9 5.8 12 8.5c3-2.7 4.6-3.7 6.5-3.3 3.1.6 4.3 3.8 2.8 6.8C19 16.5 12 21 12 21z" /></svg>
);
const SocialGlyph = ({ id, size = 18, color }) =>
  id === "facebook" ? <FbIcon size={size} color={color} /> :
  id === "tiktok" ? <TtIcon size={size} color={color} /> :
  <WaIcon size={size} color={color} />;

function SocialRow({ color = GOLD, size = 18, gap = "gap-3" }) {
  return (
    <div className={`flex items-center ${gap}`}>
      {SOCIALS.map((s) => (
        <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.name}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:-translate-y-0.5"
          style={{ border: `1px solid ${color}55` }}>
          <SocialGlyph id={s.id} size={size} color={color} />
        </a>
      ))}
    </div>
  );
}

/* ---------------- signature pieces ---------------- */
function KenteStrip({ height = 8 }) {
  return (
    <svg width="100%" height={height} preserveAspectRatio="none" viewBox="0 0 400 8" aria-hidden="true" style={{ display: "block" }}>
      <rect width="400" height="8" fill={BLACK} />
      {Array.from({ length: 25 }).map((_, i) => (
        <g key={i} transform={`translate(${i * 16},0)`}>
          <rect x="0" y="0" width="8" height="8" fill={i % 3 === 0 ? GOLD : i % 3 === 1 ? CREAM : GOLD_LIGHT} opacity={i % 2 ? 0.9 : 0.55} />
          <rect x="10" y="2" width="4" height="4" fill={GOLD} opacity="0.8" />
        </g>
      ))}
    </svg>
  );
}
function Crest({ size = 44 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path d="M10 10h28v18c0 9-7 14-14 17-7-3-14-8-14-17V10z" fill={BLACK} stroke={GOLD} strokeWidth="2.5" />
      <path d="M14 8l3-4 3 3 4-4 4 4 3-3 3 4" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <text x="24" y="30" textAnchor="middle" fontFamily="'Cormorant Garamond', Georgia, serif" fontWeight="700" fontSize="17" fill={GOLD}>PC</text>
    </svg>
  );
}
function GoldButton({ children, onClick, full, outline, small, disabled, href, light }) {
  const style = {
    background: outline ? "transparent" : `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`,
    color: outline ? (light ? CREAM : GOLD) : BLACK,
    border: outline ? `1.5px solid ${light ? CREAM : GOLD}` : "1.5px solid transparent",
    fontFamily: "'Jost', sans-serif", letterSpacing: "0.06em",
    opacity: disabled ? 0.4 : 1, width: full ? "100%" : undefined,
  };
  const cls = `inline-flex items-center justify-center gap-2 rounded-sm font-medium uppercase transition-transform active:scale-95 ${small ? "px-4 py-2 text-xs" : "px-6 py-3 text-sm"}`;
  if (href) return <a href={href} target="_blank" rel="noopener noreferrer" className={cls} style={style}>{children}</a>;
  return <button onClick={onClick} disabled={disabled} className={cls} style={style}>{children}</button>;
}
function Badge({ children, gold }) {
  return <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider rounded-sm" style={{ background: gold ? GOLD : INK, color: gold ? BLACK : CREAM, fontFamily: "'Jost', sans-serif" }}>{children}</span>;
}
function ProductImage({ product, big }) {
  if (product.image) return <img src={product.image} alt={product.name} className="object-cover w-full h-full" />;
  return (
    <div className="w-full h-full flex flex-col items-center justify-center" style={{ background: `radial-gradient(circle at 30% 25%, ${NAVY_SOFT}, ${BLACK})` }}>
      <span style={{ fontSize: big ? 64 : 40 }}>{catIcon(product.category)}</span>
      <span className="mt-2 uppercase tracking-widest" style={{ color: GOLD, fontSize: big ? 12 : 9, fontFamily: "'Jost', sans-serif" }}>{catName(product.category)}</span>
    </div>
  );
}
function SectionTitle({ eyebrow, title, dark, action }) {
  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        <p className="text-[11px] uppercase tracking-[0.3em] mb-1" style={{ color: GOLD }}>{eyebrow}</p>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: "clamp(1.6rem, 4vw, 2.3rem)", color: dark ? CREAM : INK }}>{title}</h2>
      </div>
      {action && <button onClick={action} className="text-xs uppercase tracking-widest pb-1 whitespace-nowrap" style={{ color: GOLD, borderBottom: `1px solid ${GOLD}` }}>View all</button>}
    </div>
  );
}

/* ================= APP ================= */
export default function App() {
  const [route, setRoute] = useState({ page: "home", productId: null });
  const [posts, setPosts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [team, setTeam] = useState([]);
  const [staff, setStaff] = useState([]);
  const [fabrics, setFabrics] = useState([]);
  const [role, setRole] = useState(null);
  const [staffName, setStaffName] = useState("");
  const [products, setProducts] = useState(null);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [adminPass, setAdminPass] = useState(DEFAULT_ADMIN_PASS);
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [quickView, setQuickView] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const p = await sGet("pcw2:products", null, true);
      if (p && Array.isArray(p) && p.length) setProducts(p);
      else { setProducts(SEED_PRODUCTS); sSet("pcw2:products", SEED_PRODUCTS, true); }
      setOrders(await sGet("pcw2:orders", [], true));
      const bp = await sGet("pcw2:posts", null, true);
      if (bp && Array.isArray(bp) && bp.length) setPosts(bp);
      else { setPosts(SEED_POSTS); sSet("pcw2:posts", SEED_POSTS, true); }
      setCustomers(await sGet("pcw2:customers", [], true));
      setFabrics(await sGet("pcw2:fabrics", [], true));
      const tm = await sGet("pcw2:team", null, true);
      if (tm && Array.isArray(tm) && tm.length) setTeam(tm);
      else { setTeam(SEED_TEAM); sSet("pcw2:team", SEED_TEAM, true); }
      setStaff(await sGet("pcw2:staff", [], true));
      setCart(await sGet("pcw2:cart", [], false));
      setWishlist(await sGet("pcw2:wishlist", [], false));
      const pass = await sGet("pcw2:adminpass", null, true);
      if (pass) setAdminPass(pass);
      setTimeout(() => setLoading(false), 900);
    })();
  }, []);

  const saveProducts = (n) => { setProducts(n); sSet("pcw2:products", n, true); };
  const saveOrders = (n) => { setOrders(n); sSet("pcw2:orders", n, true); };
  const saveCart = (n) => { setCart(n); sSet("pcw2:cart", n, false); };
  const saveWishlist = (n) => { setWishlist(n); sSet("pcw2:wishlist", n, false); };
  const savePosts = (n) => { setPosts(n); sSet("pcw2:posts", n, true); };
  const saveCustomers = (n) => { setCustomers(n); sSet("pcw2:customers", n, true); };
  const saveTeam = (n) => { setTeam(n); sSet("pcw2:team", n, true); };
  const saveStaff = (n) => { setStaff(n); sSet("pcw2:staff", n, true); };
  const saveFabrics = (n) => { setFabrics(n); sSet("pcw2:fabrics", n, true); };

  const go = (page, productId = null) => { setRoute({ page, productId }); setMenuOpen(false); setQuickView(null); window.scrollTo({ top: 0 }); };
  const showToast = (m) => { setToast(m); setTimeout(() => setToast(null), 2200); };

  const addToCart = (product, qty = 1, size = "", color = "") => {
    const key = product.id + "|" + size + "|" + color;
    const ex = cart.find((c) => c.key === key);
    saveCart(ex ? cart.map((c) => c.key === key ? { ...c, qty: c.qty + qty } : c) : [...cart, { key, id: product.id, name: product.name, price: product.price, qty, size, color }]);
    showToast("Added to cart ✓"); setDrawerOpen(true);
  };
  const toggleWish = (id) => { saveWishlist(wishlist.includes(id) ? wishlist.filter((x) => x !== id) : [...wishlist, id]); };

  const cartCount = cart.reduce((s, c) => s + c.qty, 0);
  const cartTotal = cart.reduce((s, c) => s + c.qty * c.price, 0);

  if (loading || !products) return <LoadingScreen />;

  const waContext = {
    home: "Hello PC Wears, I'd like to make an inquiry.",
    shop: "Hello PC Wears, I have a question about your products.",
    product: route.productId ? `Hello PC Wears, I'm interested in ${(products.find((p) => p.id === route.productId) || {}).name || "a product"}.` : "Hello PC Wears, I have a product inquiry.",
    custom: "Hello PC Wears, I'd like to ask about a custom outfit.",
  }[route.page] || "Hello PC Wears, I'd like to make an inquiry.";

  const pp = { products, saveProducts, orders, saveOrders, posts, savePosts, customers, saveCustomers, team, saveTeam, staff, saveStaff, fabrics, saveFabrics, role, setRole, staffName, setStaffName, cart, saveCart, wishlist, toggleWish, go, addToCart, cartTotal, showToast, adminPass, setAdminPass, isAdmin, setIsAdmin, setQuickView };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: CREAM, color: INK, fontFamily: "'Jost', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Jost:wght@300;400;500;600&display=swap');
        html { scroll-behavior: smooth; }
        ::selection { background: ${GOLD}; color: ${BLACK}; }
        input:focus, select:focus, textarea:focus, button:focus-visible, a:focus-visible { outline: 2px solid ${GOLD}; outline-offset: 2px; }
        @keyframes pcwFade { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        .pcw-rise { animation: pcwFade .5s ease both; }
        @media (prefers-reduced-motion: reduce) { * { transition: none !important; animation: none !important; } }
        @media print { body * { visibility: hidden !important; } #pcw-print, #pcw-print * { visibility: visible !important; } #pcw-print { position: absolute; left: 0; top: 0; width: 100%; } .no-print { display: none !important; } }
      `}</style>

      {/* header */}
      <header className="sticky top-0 z-40" style={{ background: BLACK, borderBottom: `1px solid ${GOLD}33` }}>
        <div className="text-center text-[11px] tracking-[0.25em] uppercase py-1.5" style={{ background: NAVY, color: GOLD_LIGHT }}>
          Free pickup at 25 Sanders St · Delivery across Freetown
        </div>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <button onClick={() => go("home")} className="flex items-center gap-2.5 text-left">
            <Crest size={38} />
            <span>
              <span className="block leading-none" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700, color: CREAM, letterSpacing: "0.04em" }}>PC WEARS</span>
              <span className="block text-[9px] uppercase tracking-[0.25em]" style={{ color: GOLD }}>People's Choice Wears</span>
            </span>
          </button>
          <nav className="hidden md:flex items-center gap-6 text-sm uppercase tracking-wider">
            {[["home", "Home"], ["shop", "Shop"], ["cosmetics", "Cosmetics"], ["stylist", "Style AI"], ["blog", "Blog"], ["team", "Team"], ["custom", "Custom Order"], ["about", "About"], ["contact", "Contact"]].map(([k, l]) => (
              <button key={k} onClick={() => go(k)} style={{ color: route.page === k ? GOLD : CREAM }} className="hover:opacity-80">{l}</button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <div className="hidden lg:block"><SocialRow color={CREAM} size={15} gap="gap-2" /></div>
            <button onClick={() => go("shop")} className="px-2.5 py-2 rounded-sm" style={{ border: `1px solid ${GOLD}55`, color: GOLD }} aria-label="Search products">🔍</button>
            <button onClick={() => go("wishlist")} className="relative px-2.5 py-2 rounded-sm" style={{ border: `1px solid ${GOLD}55`, color: GOLD }} aria-label="Wishlist">
              <Heart size={16} filled={wishlist.length > 0} />
              {wishlist.length > 0 && <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-semibold" style={{ background: GOLD, color: BLACK }}>{wishlist.length}</span>}
            </button>
            <button onClick={() => setDrawerOpen(true)} className="relative px-3 py-2 rounded-sm" style={{ border: `1px solid ${GOLD}`, color: GOLD }} aria-label={`Cart, ${cartCount} items`}>
              🛒{cartCount > 0 && <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-semibold" style={{ background: GOLD, color: BLACK }}>{cartCount}</span>}
            </button>
            <button className="md:hidden text-2xl ml-1" style={{ color: CREAM }} onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">☰</button>
          </div>
        </div>
        {menuOpen && (
          <nav className="md:hidden flex flex-col px-4 pb-4 gap-1 text-sm uppercase tracking-wider" style={{ background: BLACK }}>
            {[["home", "Home"], ["shop", "Shop"], ["cosmetics", "Cosmetics"], ["stylist", "Style AI"], ["blog", "Blog"], ["team", "Team"], ["wishlist", "Wishlist"], ["custom", "Custom Order"], ["about", "About"], ["contact", "Contact"], ["admin", "Admin"]].map(([k, l]) => (
              <button key={k} onClick={() => go(k)} className="text-left py-2.5 border-b" style={{ color: route.page === k ? GOLD : CREAM, borderColor: `${GOLD}22` }}>{l}</button>
            ))}
            <div className="pt-3"><SocialRow color={CREAM} /></div>
          </nav>
        )}
        <KenteStrip height={6} />
      </header>

      {/* pages */}
      <main className="flex-1">
        {route.page === "home" && <HomePage {...pp} />}
        {route.page === "shop" && <ShopPage {...pp} />}
        {route.page === "cosmetics" && <CosmeticsPage {...pp} />}
        {route.page === "stylist" && <StylistPage {...pp} />}
        {route.page === "blog" && <BlogPage {...pp} />}
        {route.page === "post" && <BlogPostPage {...pp} postId={route.productId} />}
        {route.page === "team" && <TeamPage {...pp} />}
        {route.page === "wishlist" && <WishlistPage {...pp} />}
        {route.page === "product" && <ProductPage {...pp} productId={route.productId} />}
        {route.page === "cart" && <CartPage {...pp} setDrawerOpen={setDrawerOpen} />}
        {route.page === "custom" && <CustomOrderPage {...pp} />}
        {route.page === "about" && <AboutPage go={go} />}
        {route.page === "contact" && <ContactPage />}
        {route.page === "admin" && <AdminPage {...pp} />}
      </main>

      {/* footer */}
      <footer style={{ background: BLACK, color: CREAM }}>
        <KenteStrip height={6} />
        <div className="max-w-6xl mx-auto px-4 py-10 grid gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3"><Crest size={36} /><span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 700 }}>PC WEARS</span></div>
            <p className="text-sm mb-4" style={{ color: MUTED }}>Crafted with Choice. Worn with Pride.</p>
            <SocialRow color={CREAM} />
          </div>
          <div className="text-sm">
            <h4 className="uppercase tracking-widest mb-3" style={{ color: GOLD }}>Contact</h4>
            <p className="mb-1">{ADDRESS}</p>
            <p className="mb-1">WhatsApp: <a href={waLink("Hello PC Wears!")} target="_blank" rel="noopener noreferrer" style={{ color: GOLD }}>{WA_DISPLAY}</a></p>
            <p style={{ color: MUTED }}>{EMAIL}</p>
          </div>
          <div className="text-sm">
            <h4 className="uppercase tracking-widest mb-3" style={{ color: GOLD }}>Shop</h4>
            <div className="grid grid-cols-2 gap-1">
              {CATEGORIES.slice(0, 8).map((c) => <button key={c.id} onClick={() => go("shop")} className="text-left hover:opacity-80" style={{ color: CREAM }}>{c.name}</button>)}
            </div>
            <div className="mt-3 flex flex-col gap-1">
              <button onClick={() => go("cosmetics")} className="text-left hover:opacity-80" style={{ color: GOLD }}>PC Cosmetics</button>
              <button onClick={() => go("stylist")} className="text-left hover:opacity-80" style={{ color: GOLD }}>AI Style Advisor</button>
              <button onClick={() => go("blog")} className="text-left hover:opacity-80" style={{ color: GOLD }}>Blog</button>
            </div>
          </div>
          <div className="text-sm">
            <h4 className="uppercase tracking-widest mb-3" style={{ color: GOLD }}>Newsletter</h4>
            <Newsletter showToast={showToast} />
            <button onClick={() => go("admin")} className="mt-4 text-xs uppercase tracking-widest" style={{ color: MUTED }}>Admin login</button>
          </div>
        </div>
        <p className="text-center pb-6 text-xs" style={{ color: MUTED }}>© {new Date().getFullYear()} PC Wears · Freetown, Sierra Leone</p>
      </footer>

      {/* cart drawer */}
      <CartDrawer open={drawerOpen} setOpen={setDrawerOpen} cart={cart} saveCart={saveCart} cartTotal={cartTotal} go={go} />

      {/* quick view */}
      {quickView && <QuickView product={quickView} onClose={() => setQuickView(null)} addToCart={addToCart} go={go} wishlist={wishlist} toggleWish={toggleWish} />}

      {/* floating cluster */}
      {route.page !== "admin" && (
        <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2">
          <a href={SOCIALS[0].url} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-11 h-11 rounded-full flex items-center justify-center shadow-lg" style={{ background: "#1877F2" }}><FbIcon size={20} color="#fff" /></a>
          <a href={SOCIALS[1].url} target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="w-11 h-11 rounded-full flex items-center justify-center shadow-lg" style={{ background: BLACK, border: `1px solid ${GOLD}` }}><TtIcon size={20} color="#fff" /></a>
          <a href={waLink(waContext)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-full pl-3 pr-4 py-3 shadow-lg active:scale-95 transition-transform" style={{ background: "#25D366", color: WHITE }} aria-label="Chat with PC Wears on WhatsApp">
            <WaIcon size={22} /><span className="text-sm font-medium hidden sm:inline">Chat with PC Wears</span>
          </a>
        </div>
      )}

      {toast && <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-sm text-sm shadow-lg" style={{ background: BLACK, color: GOLD, border: `1px solid ${GOLD}` }}>{toast}</div>}
    </div>
  );
}

/* ================= LOADING ================= */
function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5" style={{ background: BLACK }}>
      <style>{`@keyframes pcwPulse{0%,100%{opacity:.4;transform:scale(.97)}50%{opacity:1;transform:scale(1.03)}}`}</style>
      <div style={{ animation: "pcwPulse 1.4s ease-in-out infinite" }}><Crest size={76} /></div>
      <p className="uppercase tracking-[0.4em] text-xs" style={{ color: GOLD, fontFamily: "'Jost', sans-serif" }}>PC Wears</p>
      <p className="text-sm italic" style={{ color: MUTED, fontFamily: "'Cormorant Garamond', serif", fontSize: 16 }}>Crafted with Choice. Worn with Pride.</p>
    </div>
  );
}

/* ================= NEWSLETTER ================= */
function Newsletter({ showToast }) {
  const [email, setEmail] = useState(""); const [done, setDone] = useState(false);
  const submit = async () => {
    if (!/.+@.+\..+/.test(email)) { showToast("Enter a valid email"); return; }
    const list = await sGet("pcw2:newsletter", [], true);
    await sSet("pcw2:newsletter", [...list, { email, at: todayISO() }], true);
    setDone(true); showToast("Subscribed ✓");
  };
  if (done) return <p className="text-sm" style={{ color: GOLD }}>You're on the list. Welcome to PC Wears.</p>;
  return (
    <div>
      <p className="text-xs mb-2" style={{ color: MUTED }}>New drops & offers, first.</p>
      <div className="flex">
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" className="flex-1 px-3 py-2 text-sm rounded-l-sm min-w-0" style={{ background: INK, color: CREAM, border: `1px solid ${GOLD}44` }} />
        <button onClick={submit} className="px-3 text-sm font-medium rounded-r-sm" style={{ background: GOLD, color: BLACK }}>Join</button>
      </div>
    </div>
  );
}

/* ================= HOME ================= */
function HomePage({ products, go, addToCart, setQuickView, wishlist, toggleWish }) {
  const newArrivals = products.filter((p) => p.newArrival).slice(0, 4);
  const bestSellers = products.filter((p) => p.bestSeller).slice(0, 4);
  return (
    <div>
      <section className="relative overflow-hidden" style={{ background: `radial-gradient(ellipse at 75% 15%, ${NAVY} 0%, transparent 55%), ${BLACK}` }}>
        <div className="max-w-6xl mx-auto px-4 py-20 md:py-28 text-center pcw-rise">
          <Crest size={74} />
          <p className="mt-5 text-xs uppercase tracking-[0.35em]" style={{ color: GOLD }}>People's Choice Wears · Freetown</p>
          <h1 className="mt-4 mx-auto max-w-3xl" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: "clamp(2.3rem, 6.5vw, 4rem)", lineHeight: 1.06, color: CREAM }}>
            Luxury Fashion & Lifestyle <em style={{ color: GOLD }}>from Sierra Leone</em>
          </h1>
          <p className="mt-4 mx-auto max-w-xl text-base" style={{ color: "#C2BAA9" }}>Premium Africana fashion and lifestyle essentials. Step into confidence with PC Wears.</p>
          <p className="mt-2 text-sm italic" style={{ color: GOLD_LIGHT, fontFamily: "'Cormorant Garamond', serif", fontSize: 18 }}>"Crafted with Choice. Worn with Pride."</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <GoldButton onClick={() => go("shop")}>Shop Now</GoldButton>
            <GoldButton outline light href={waLink("Hello PC Wears, I'd like to place an order.")}><WaIcon size={16} color={CREAM} /> Order on WhatsApp</GoldButton>
          </div>
        </div>
        <KenteStrip />
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12">
        <SectionTitle eyebrow="Browse" title="Shop by Category" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CATEGORIES.slice(0, 8).map((c) => (
            <button key={c.id} onClick={() => go("shop")} className="p-5 rounded-sm text-center transition-transform hover:-translate-y-0.5" style={{ background: WHITE, border: `1px solid ${CREAM_DARK}` }}>
              <span className="text-3xl">{c.icon}</span><span className="block mt-2 text-sm font-medium">{c.name}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-12">
        <SectionTitle eyebrow="Just landed" title="New Arrivals" action={() => go("shop")} />
        <ProductGrid items={newArrivals} go={go} addToCart={addToCart} setQuickView={setQuickView} wishlist={wishlist} toggleWish={toggleWish} />
      </section>

      <section style={{ background: NAVY }} className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <SectionTitle eyebrow="Customer favourites" title="Best Sellers" dark action={() => go("shop")} />
          <ProductGrid items={bestSellers} go={go} addToCart={addToCart} setQuickView={setQuickView} wishlist={wishlist} toggleWish={toggleWish} dark />
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12">
        <SectionTitle eyebrow="The PC Wears promise" title="Why Choose PC Wears" />
        <div className="grid sm:grid-cols-3 gap-4">
          {[["✂️", "Crafted with choice", "Quality Africana tailoring and hand-picked pieces you won't find everywhere."],
            ["💬", "Order in one message", "No account, no forms. Browse, tap, and confirm directly on WhatsApp."],
            ["🛵", "Pickup or delivery", "Collect at 25 Sanders Street or get delivery anywhere in Freetown."]].map(([i, h, t]) => (
            <div key={h} className="p-6 rounded-sm" style={{ background: WHITE, border: `1px solid ${CREAM_DARK}` }}>
              <span className="text-2xl">{i}</span>
              <h3 className="mt-3 mb-1" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 700 }}>{h}</h3>
              <p className="text-sm" style={{ color: MUTED }}>{t}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: BLACK }} className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <SectionTitle eyebrow="Loved by our customers" title="What People Say" dark />
          <div className="grid sm:grid-cols-3 gap-4">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="p-6 rounded-sm" style={{ background: NAVY_SOFT, border: `1px solid ${GOLD}22` }}>
                <p className="text-sm leading-relaxed" style={{ color: CREAM }}>"{t.text}"</p>
                <p className="mt-4 text-xs uppercase tracking-widest" style={{ color: GOLD }}>{t.name} · {t.city}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-14 text-center">
        <p className="text-[11px] uppercase tracking-[0.3em] mb-2" style={{ color: GOLD }}>Follow the brand</p>
        <h2 className="mb-5" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: "clamp(1.6rem,4vw,2.3rem)" }}>Join the PC Wears community</h2>
        <div className="flex justify-center"><SocialRow size={20} /></div>
      </section>
    </div>
  );
}

/* ================= PRODUCT GRID + CARD ================= */
function ProductGrid({ items, go, addToCart, setQuickView, wishlist, toggleWish, dark }) {
  if (!items.length) return <p className="text-sm" style={{ color: dark ? MUTED : MUTED }}>No products here yet — check back soon.</p>;
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {items.map((p) => <ProductCard key={p.id} p={p} go={go} addToCart={addToCart} setQuickView={setQuickView} wishlist={wishlist} toggleWish={toggleWish} dark={dark} />)}
    </div>
  );
}
function ProductCard({ p, go, addToCart, setQuickView, wishlist, toggleWish, dark }) {
  const soldOut = p.stock === "sold_out", soon = p.stock === "coming_soon";
  const wished = wishlist?.includes(p.id);
  return (
    <div className="group flex flex-col rounded-sm overflow-hidden transition-transform hover:-translate-y-0.5" style={{ background: dark ? NAVY_SOFT : WHITE, border: `1px solid ${dark ? "#23344e" : CREAM_DARK}` }}>
      <div className="relative aspect-square">
        <button onClick={() => go("product", p.id)} className="block w-full h-full" aria-label={`View ${p.name}`}><ProductImage product={p} /></button>
        <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
          {p.newArrival && <Badge gold>New</Badge>}
          {p.bestSeller && <Badge>Best Seller</Badge>}
          {soldOut && <Badge>Sold Out</Badge>}
          {soon && <Badge>Coming Soon</Badge>}
        </div>
        <button onClick={() => toggleWish(p.id)} className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: dark ? "#0008" : "#fff", border: `1px solid ${GOLD}55` }} aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}>
          <Heart size={15} filled={wished} />
        </button>
        {setQuickView && !soldOut && !soon && (
          <button onClick={() => setQuickView(p)} className="absolute bottom-0 inset-x-0 py-2 text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: BLACK, color: GOLD }}>Quick View</button>
        )}
      </div>
      <div className="flex flex-col flex-1 p-3">
        <p className="text-[10px] uppercase tracking-widest" style={{ color: GOLD }}>{catName(p.category)}</p>
        <button onClick={() => go("product", p.id)} className="text-left mt-0.5" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 17, lineHeight: 1.2, color: dark ? CREAM : INK }}>{p.name}</button>
        <p className="text-xs mt-1 flex-1" style={{ color: MUTED, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.description}</p>
        <p className="mt-2 font-semibold" style={{ color: dark ? GOLD : INK }}>{fmtLe(p.price)}</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <GoldButton small onClick={() => addToCart(p)} disabled={soldOut || soon}>{soon ? "Soon" : "Add to Cart"}</GoldButton>
          <GoldButton small outline light={dark} href={waLink(`Hello PC Wears, I'm interested in buying ${p.name} for ${fmtLe(p.price)}. Please confirm availability.`)}><WaIcon size={13} color={dark ? CREAM : GOLD} /> Order</GoldButton>
        </div>
      </div>
    </div>
  );
}

/* ================= SHOP ================= */
function ShopPage({ products, go, addToCart, setQuickView, wishlist, toggleWish }) {
  const [cat, setCat] = useState("all");
  const [search, setSearch] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [flag, setFlag] = useState("all");
  const [sort, setSort] = useState("featured");

  const filtered = useMemo(() => {
    let r = products.filter((p) => {
      if (cat !== "all" && p.category !== cat) return false;
      if (flag === "new" && !p.newArrival) return false;
      if (flag === "best" && !p.bestSeller) return false;
      if (maxPrice && p.price > Number(maxPrice)) return false;
      if (search && !(p.name + " " + p.description).toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
    if (sort === "low") r = [...r].sort((a, b) => a.price - b.price);
    else if (sort === "high") r = [...r].sort((a, b) => b.price - a.price);
    else if (sort === "featured") r = [...r].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    return r;
  }, [products, cat, search, maxPrice, flag, sort]);

  const inputStyle = { background: WHITE, border: `1px solid ${CREAM_DARK}`, color: INK };
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <SectionTitle eyebrow="The collection" title="Shop PC Wears" />
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5 mb-6">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products…" className="px-3 py-2.5 rounded-sm text-sm" style={inputStyle} aria-label="Search" />
        <select value={cat} onChange={(e) => setCat(e.target.value)} className="px-3 py-2.5 rounded-sm text-sm" style={inputStyle} aria-label="Category">
          <option value="all">All categories</option>{CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="px-3 py-2.5 rounded-sm text-sm" style={inputStyle} aria-label="Price">
          <option value="">Any price</option><option value="200">Under Le 200</option><option value="500">Under Le 500</option><option value="800">Under Le 800</option><option value="1200">Under Le 1,200</option>
        </select>
        <select value={flag} onChange={(e) => setFlag(e.target.value)} className="px-3 py-2.5 rounded-sm text-sm" style={inputStyle} aria-label="Collection">
          <option value="all">All products</option><option value="new">New arrivals</option><option value="best">Best sellers</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="px-3 py-2.5 rounded-sm text-sm" style={inputStyle} aria-label="Sort">
          <option value="featured">Sort: Featured</option><option value="low">Price: Low to High</option><option value="high">Price: High to Low</option>
        </select>
      </div>
      <p className="text-xs uppercase tracking-widest mb-4" style={{ color: MUTED }}>{filtered.length} product{filtered.length !== 1 ? "s" : ""}</p>
      <ProductGrid items={filtered} go={go} addToCart={addToCart} setQuickView={setQuickView} wishlist={wishlist} toggleWish={toggleWish} />
    </div>
  );
}

/* ================= WISHLIST ================= */
function WishlistPage({ products, wishlist, go, addToCart, setQuickView, toggleWish }) {
  const items = products.filter((p) => wishlist.includes(p.id));
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <SectionTitle eyebrow="Saved for later" title="Your Wishlist" />
      {items.length ? <ProductGrid items={items} go={go} addToCart={addToCart} setQuickView={setQuickView} wishlist={wishlist} toggleWish={toggleWish} />
        : <div className="text-center py-16"><Heart size={40} /><p className="mt-3 text-sm" style={{ color: MUTED }}>No favourites yet. Tap the heart on any product to save it here.</p><div className="mt-5"><GoldButton onClick={() => go("shop")}>Browse the Collection</GoldButton></div></div>}
    </div>
  );
}

/* ================= QUICK VIEW ================= */
function QuickView({ product: p, onClose, addToCart, go, wishlist, toggleWish }) {
  const [size, setSize] = useState(p.sizes?.[0] || "");
  const [color, setColor] = useState(p.colors?.[0] || "");
  const opt = (a) => ({ border: `1.5px solid ${a ? GOLD : CREAM_DARK}`, background: a ? GOLD : WHITE, color: a ? BLACK : INK });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "#000a" }} onClick={onClose}>
      <div className="w-full max-w-2xl rounded-sm overflow-hidden grid sm:grid-cols-2 pcw-rise" style={{ background: CREAM }} onClick={(e) => e.stopPropagation()}>
        <div className="aspect-square"><ProductImage product={p} big /></div>
        <div className="p-5">
          <div className="flex justify-between items-start">
            <p className="text-[11px] uppercase tracking-[0.3em]" style={{ color: GOLD }}>{catName(p.category)}</p>
            <button onClick={onClose} className="text-xl leading-none" style={{ color: MUTED }} aria-label="Close">✕</button>
          </div>
          <h3 className="mt-1" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 24, lineHeight: 1.1 }}>{p.name}</h3>
          <p className="mt-2 text-xl font-semibold">{fmtLe(p.price)}</p>
          <p className="mt-2 text-sm" style={{ color: "#5C554A" }}>{p.description}</p>
          {p.sizes?.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{p.sizes.map((s) => <button key={s} onClick={() => setSize(s)} className="px-3 py-1 text-sm rounded-sm" style={opt(size === s)}>{s}</button>)}</div>}
          {p.colors?.length > 0 && <div className="mt-2 flex flex-wrap gap-2">{p.colors.map((c) => <button key={c} onClick={() => setColor(c)} className="px-3 py-1 text-sm rounded-sm" style={opt(color === c)}>{c}</button>)}</div>}
          <div className="mt-4 grid gap-2">
            <GoldButton full onClick={() => { addToCart(p, 1, size, color); onClose(); }}>Add to Cart</GoldButton>
            <div className="grid grid-cols-2 gap-2">
              <GoldButton small outline onClick={() => { onClose(); go("product", p.id); }}>Full Details</GoldButton>
              <GoldButton small outline href={waLink(`Hello PC Wears, I'm interested in ${p.name} for ${fmtLe(p.price)}.`)}><WaIcon size={13} color={GOLD} /> Order</GoldButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= PRODUCT DETAIL ================= */
function ProductPage({ products, productId, go, addToCart, wishlist, toggleWish, setQuickView }) {
  const p = products.find((x) => x.id === productId);
  const [size, setSize] = useState(""); const [color, setColor] = useState(""); const [qty, setQty] = useState(1);
  useEffect(() => { if (p) { setSize(p.sizes?.[0] || ""); setColor(p.colors?.[0] || ""); setQty(1); } }, [productId]);
  if (!p) return <div className="max-w-6xl mx-auto px-4 py-16 text-center"><p>Product not found.</p><div className="mt-4"><GoldButton onClick={() => go("shop")}>Back to Shop</GoldButton></div></div>;
  const soldOut = p.stock === "sold_out", soon = p.stock === "coming_soon";
  const wished = wishlist.includes(p.id);
  const related = products.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4);
  const waMsg = `Hello PC Wears, I'm interested in buying ${p.name}${size || color ? ` (${[size && "Size: " + size, color && "Color: " + color].filter(Boolean).join(", ")})` : ""} for ${fmtLe(p.price)}. Please confirm availability.`;
  const opt = (a) => ({ border: `1.5px solid ${a ? GOLD : CREAM_DARK}`, background: a ? GOLD : WHITE, color: a ? BLACK : INK });
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <button onClick={() => go("shop")} className="text-xs uppercase tracking-widest mb-6" style={{ color: GOLD }}>← Back to shop</button>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="relative aspect-square rounded-sm overflow-hidden" style={{ border: `1px solid ${CREAM_DARK}` }}>
          <ProductImage product={p} big />
          <button onClick={() => toggleWish(p.id)} className="absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#fff", border: `1px solid ${GOLD}55` }} aria-label="Wishlist"><Heart size={18} filled={wished} /></button>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em]" style={{ color: GOLD }}>{catName(p.category)}</p>
          <h1 className="mt-1" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: "clamp(1.8rem, 4vw, 2.6rem)", lineHeight: 1.1 }}>{p.name}</h1>
          <div className="flex items-center gap-2 mt-2">{p.newArrival && <Badge gold>New Arrival</Badge>}{p.bestSeller && <Badge>Best Seller</Badge>}{soldOut && <Badge>Sold Out</Badge>}{soon && <Badge>Coming Soon</Badge>}</div>
          <p className="mt-4 text-2xl font-semibold">{fmtLe(p.price)}</p>
          <p className="mt-4 text-sm leading-relaxed" style={{ color: "#5C554A" }}>{p.description}</p>
          {p.sizes?.length > 0 && <div className="mt-6"><p className="text-xs uppercase tracking-widest mb-2" style={{ color: MUTED }}>Size</p><div className="flex flex-wrap gap-2">{p.sizes.map((s) => <button key={s} onClick={() => setSize(s)} className="px-3.5 py-1.5 text-sm rounded-sm" style={opt(size === s)}>{s}</button>)}</div></div>}
          {p.colors?.length > 0 && <div className="mt-4"><p className="text-xs uppercase tracking-widest mb-2" style={{ color: MUTED }}>Color</p><div className="flex flex-wrap gap-2">{p.colors.map((c) => <button key={c} onClick={() => setColor(c)} className="px-3.5 py-1.5 text-sm rounded-sm" style={opt(color === c)}>{c}</button>)}</div></div>}
          <div className="mt-5"><p className="text-xs uppercase tracking-widest mb-2" style={{ color: MUTED }}>Quantity</p>
            <div className="inline-flex items-center rounded-sm" style={{ border: `1px solid ${CREAM_DARK}`, background: WHITE }}>
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-2 text-lg" aria-label="Decrease">−</button><span className="px-4 font-medium">{qty}</span><button onClick={() => setQty(qty + 1)} className="px-4 py-2 text-lg" aria-label="Increase">+</button>
            </div>
          </div>
          <div className="mt-7 grid sm:grid-cols-2 gap-3">
            <GoldButton full onClick={() => addToCart(p, qty, size, color)} disabled={soldOut || soon}>{soldOut ? "Sold Out" : soon ? "Coming Soon" : "Add to Cart"}</GoldButton>
            <GoldButton full outline href={waLink(waMsg)}><WaIcon size={16} color={GOLD} /> Order via WhatsApp</GoldButton>
          </div>
          <p className="mt-4 text-xs" style={{ color: MUTED }}>Pickup at {ADDRESS} or delivery within Freetown (fee may apply).</p>
        </div>
      </div>
      {related.length > 0 && <div className="mt-14"><SectionTitle eyebrow="You may also like" title="Related Products" /><ProductGrid items={related} go={go} addToCart={addToCart} setQuickView={setQuickView} wishlist={wishlist} toggleWish={toggleWish} /></div>}
    </div>
  );
}

/* ================= CART DRAWER ================= */
function CartDrawer({ open, setOpen, cart, saveCart, cartTotal, go }) {
  const update = (key, d) => saveCart(cart.map((c) => c.key === key ? { ...c, qty: Math.max(1, c.qty + d) } : c));
  const remove = (key) => saveCart(cart.filter((c) => c.key !== key));
  return (
    <>
      {open && <div className="fixed inset-0 z-50" style={{ background: "#0008" }} onClick={() => setOpen(false)} />}
      <aside className="fixed top-0 right-0 h-full w-full max-w-sm z-50 flex flex-col transition-transform duration-300" style={{ background: CREAM, transform: open ? "translateX(0)" : "translateX(100%)" }} aria-hidden={!open}>
        <div className="flex items-center justify-between px-4 py-4" style={{ background: BLACK, color: CREAM }}>
          <span className="uppercase tracking-widest text-sm">Your Cart</span>
          <button onClick={() => setOpen(false)} className="text-xl" aria-label="Close cart">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {!cart.length ? <p className="text-sm text-center py-10" style={{ color: MUTED }}>Your cart is empty.</p> :
            cart.map((c) => (
              <div key={c.key} className="flex items-center gap-2 py-3 border-b" style={{ borderColor: CREAM_DARK }}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{c.name}</p>
                  {(c.size || c.color) && <p className="text-xs" style={{ color: MUTED }}>{[c.size, c.color].filter(Boolean).join(" · ")}</p>}
                  <p className="text-xs" style={{ color: GOLD }}>{fmtLe(c.price)}</p>
                </div>
                <div className="inline-flex items-center rounded-sm" style={{ border: `1px solid ${CREAM_DARK}` }}>
                  <button onClick={() => update(c.key, -1)} className="px-2 py-1" aria-label="Decrease">−</button><span className="px-2 text-sm">{c.qty}</span><button onClick={() => update(c.key, 1)} className="px-2 py-1" aria-label="Increase">+</button>
                </div>
                <button onClick={() => remove(c.key)} style={{ color: MUTED }} aria-label="Remove">✕</button>
              </div>
            ))}
        </div>
        {cart.length > 0 && (
          <div className="p-4 border-t" style={{ borderColor: CREAM_DARK }}>
            <div className="flex justify-between mb-3"><span className="text-sm" style={{ color: MUTED }}>Total</span><span className="font-semibold">{fmtLe(cartTotal)}</span></div>
            <GoldButton full onClick={() => { setOpen(false); go("cart"); }}>View Cart & Checkout</GoldButton>
          </div>
        )}
      </aside>
    </>
  );
}

/* ================= CART PAGE ================= */
function CartPage({ cart, saveCart, cartTotal, go }) {
  const [note, setNote] = useState(""); const [name, setName] = useState(""); const [fulfil, setFulfil] = useState("delivery");
  const update = (key, d) => saveCart(cart.map((c) => c.key === key ? { ...c, qty: Math.max(1, c.qty + d) } : c));
  const remove = (key) => saveCart(cart.filter((c) => c.key !== key));
  const msg = () => {
    let m = "Hello PC Wears, I want to place an order:\n";
    if (name.trim()) m = `Hello PC Wears, my name is ${name.trim()}. I want to place an order:\n`;
    cart.forEach((c, i) => { const v = [c.size, c.color].filter(Boolean).join(", "); m += `${i + 1}. ${c.name}${v ? ` (${v})` : ""} - Qty ${c.qty} - ${fmtLe(c.price * c.qty)}\n`; });
    m += `Total: ${fmtLe(cartTotal)}\n`;
    m += fulfil === "pickup" ? `Pickup at ${ADDRESS}.\n` : "Delivery within Freetown.\n";
    if (note.trim()) m += `Note: ${note.trim()}\n`;
    m += "Please confirm availability and delivery.";
    return m;
  };
  if (!cart.length) return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center"><span className="text-5xl">🛒</span>
      <h1 className="mt-4" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 30 }}>Your cart is empty</h1>
      <p className="mt-2 text-sm" style={{ color: MUTED }}>Browse the collection and add something you love.</p>
      <div className="mt-6"><GoldButton onClick={() => go("shop")}>Continue Shopping</GoldButton></div></div>
  );
  const inputStyle = { background: WHITE, border: `1px solid ${CREAM_DARK}` };
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <SectionTitle eyebrow="Almost there" title="Your Cart" />
      <div className="rounded-sm overflow-hidden" style={{ background: WHITE, border: `1px solid ${CREAM_DARK}` }}>
        {cart.map((c) => (
          <div key={c.key} className="flex items-center gap-3 p-4 border-b" style={{ borderColor: CREAM_DARK }}>
            <div className="flex-1 min-w-0"><p className="font-medium truncate" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17 }}>{c.name}</p>{(c.size || c.color) && <p className="text-xs" style={{ color: MUTED }}>{[c.size, c.color].filter(Boolean).join(" · ")}</p>}<p className="text-sm mt-0.5" style={{ color: GOLD }}>{fmtLe(c.price)} each</p></div>
            <div className="inline-flex items-center rounded-sm" style={{ border: `1px solid ${CREAM_DARK}` }}><button onClick={() => update(c.key, -1)} className="px-3 py-1.5" aria-label="Decrease">−</button><span className="px-2 text-sm font-medium">{c.qty}</span><button onClick={() => update(c.key, 1)} className="px-3 py-1.5" aria-label="Increase">+</button></div>
            <p className="w-24 text-right font-semibold text-sm">{fmtLe(c.price * c.qty)}</p>
            <button onClick={() => remove(c.key)} className="text-lg px-1" style={{ color: MUTED }} aria-label="Remove">✕</button>
          </div>
        ))}
        <div className="p-4 flex justify-between items-center"><div className="text-sm" style={{ color: MUTED }}><p>Subtotal: {fmtLe(cartTotal)}</p><p className="text-xs">Delivery fee may apply depending on location.</p></div><p className="text-xl font-semibold">Total: <span style={{ color: GOLD }}>{fmtLe(cartTotal)}</span></p></div>
      </div>
      <div className="mt-6 grid md:grid-cols-2 gap-4">
        <div className="p-5 rounded-sm" style={{ background: WHITE, border: `1px solid ${CREAM_DARK}` }}>
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: GOLD }}>Your details</p>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full px-3 py-2 rounded-sm text-sm mb-3" style={inputStyle} />
          {[["delivery", "Delivery within Freetown"], ["pickup", `Pickup at ${ADDRESS}`]].map(([v, l]) => (
            <label key={v} className="flex items-center gap-2 py-1.5 text-sm cursor-pointer"><input type="radio" name="fulfil" checked={fulfil === v} onChange={() => setFulfil(v)} style={{ accentColor: GOLD }} />{l}</label>
          ))}
          <p className="text-xs mt-2" style={{ color: MUTED }}>Payment confirmation will be handled through WhatsApp after availability is confirmed.</p>
        </div>
        <div className="p-5 rounded-sm" style={{ background: WHITE, border: `1px solid ${CREAM_DARK}` }}><p className="text-xs uppercase tracking-widest mb-3" style={{ color: GOLD }}>Note (optional)</p><textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4} placeholder="Delivery time, location, sizing notes…" className="w-full px-3 py-2 rounded-sm text-sm" style={inputStyle} /></div>
      </div>
      <div className="mt-6 flex flex-wrap gap-3"><GoldButton href={waLink(msg())}><WaIcon size={16} color={BLACK} /> Checkout via WhatsApp</GoldButton><GoldButton outline onClick={() => go("shop")}>Continue Shopping</GoldButton></div>
    </div>
  );
}

/* ================= CUSTOM ORDER ================= */
function CustomOrderPage({ orders, saveOrders, showToast }) {
  const blank = { name: "", phone: "", gender: "", outfit: "", fabric: "", color: "", size: "", refImage: null, date: "", fulfil: "delivery", notes: "" };
  const [f, setF] = useState(blank); const [submitted, setSubmitted] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const inputStyle = { background: WHITE, border: `1px solid ${CREAM_DARK}` };
  const handleImage = async (e) => { const file = e.target.files?.[0]; if (!file) return; try { setF({ ...f, refImage: await resizeImage(file, 500) }); } catch { showToast("Could not read image"); } };
  const msg = () => {
    let m = "Hello PC Wears, I'd like a custom outfit:\n";
    m += `Name: ${f.name}\nPhone: ${f.phone}\n`;
    if (f.gender) m += `Gender: ${f.gender}\n`;
    m += `Outfit: ${f.outfit}\n`;
    if (f.fabric) m += `Fabric: ${f.fabric}\n`;
    if (f.color) m += `Color: ${f.color}\n`;
    if (f.size) m += `Size/Measurements: ${f.size}\n`;
    if (f.date) m += `Needed by: ${f.date}\n`;
    m += f.fulfil === "pickup" ? "Pickup at your shop.\n" : "Delivery within Freetown.\n";
    if (f.notes) m += `Message: ${f.notes}\n`;
    if (f.refImage) m += "(I have a reference photo — I'll send it in this chat.)\n";
    m += "Please confirm price and availability.";
    return m;
  };
  const submit = () => {
    if (!f.name.trim() || !f.phone.trim() || !f.outfit.trim()) { showToast("Fill name, phone and outfit type"); return; }
    saveOrders([{ id: uid(), orderId: genId(orders, "PCW"), invoiceNo: genId(orders, "INV"), createdAt: todayISO(), customerId: "", customer: f.name, phone: f.phone, category: "custom", product: `Custom: ${f.outfit}${f.fabric ? ` (${f.fabric})` : ""}`, fabricType: f.fabric || "", fabricColor: f.color || "", qty: 1, price: 0, discount: 0, total: 0, deliveryDate: f.date || "", tailor: "", status: "pending", fulfil: f.fulfil, payments: [], instructions: [f.gender && `Gender: ${f.gender}`, f.size && `Size: ${f.size}`, f.notes].filter(Boolean).join(" · "), refImage: f.refImage, source: "custom-form" }, ...orders]);
    setSubmitted(true); window.open(waLink(msg()), "_blank");
  };
  if (submitted) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center"><span className="text-5xl">✨</span>
      <h1 className="mt-4" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 30 }}>Request sent</h1>
      <p className="mt-3 text-sm" style={{ color: MUTED }}>Your custom request was saved and a WhatsApp chat opened so PC Wears can confirm price and timeline. If you added a reference photo, attach it in the chat.</p>
      <div className="mt-6"><GoldButton onClick={() => { setF(blank); setSubmitted(false); }}>Make Another Request</GoldButton></div></div>
  );
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <SectionTitle eyebrow="Made for you" title="Custom Outfit Order" />
      <p className="text-sm mb-6 -mt-2" style={{ color: MUTED }}>From ready-made wear to custom fashion, PC Wears keeps you fresh. Tell us what you want made.</p>
      <div className="grid gap-3">
        <div className="grid sm:grid-cols-2 gap-3"><input value={f.name} onChange={set("name")} placeholder="Full name *" className="px-3 py-2.5 rounded-sm text-sm" style={inputStyle} /><input value={f.phone} onChange={set("phone")} placeholder="Phone number *" className="px-3 py-2.5 rounded-sm text-sm" style={inputStyle} /></div>
        <div className="grid sm:grid-cols-2 gap-3"><select value={f.gender} onChange={set("gender")} className="px-3 py-2.5 rounded-sm text-sm" style={inputStyle}><option value="">Gender (optional)</option><option>Male</option><option>Female</option><option>Other</option></select><input value={f.outfit} onChange={set("outfit")} placeholder="Outfit type * (e.g. gown, senator)" className="px-3 py-2.5 rounded-sm text-sm" style={inputStyle} /></div>
        <div className="grid sm:grid-cols-2 gap-3"><input value={f.fabric} onChange={set("fabric")} placeholder="Fabric preference" className="px-3 py-2.5 rounded-sm text-sm" style={inputStyle} /><input value={f.color} onChange={set("color")} placeholder="Preferred color" className="px-3 py-2.5 rounded-sm text-sm" style={inputStyle} /></div>
        <input value={f.size} onChange={set("size")} placeholder="Size / measurements note" className="px-3 py-2.5 rounded-sm text-sm" style={inputStyle} />
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="text-sm"><span className="block text-xs uppercase tracking-widest mb-1" style={{ color: MUTED }}>Needed by</span><input type="date" value={f.date} onChange={set("date")} className="w-full px-3 py-2.5 rounded-sm text-sm" style={inputStyle} /></label>
          <label className="text-sm"><span className="block text-xs uppercase tracking-widest mb-1" style={{ color: MUTED }}>Delivery or pickup</span><select value={f.fulfil} onChange={set("fulfil")} className="w-full px-3 py-2.5 rounded-sm text-sm" style={inputStyle}><option value="delivery">Delivery within Freetown</option><option value="pickup">Pickup at 25 Sanders Street</option></select></label>
        </div>
        <label className="text-sm"><span className="block text-xs uppercase tracking-widest mb-1" style={{ color: MUTED }}>Reference design / photo (optional)</span><input type="file" accept="image/*" onChange={handleImage} className="w-full text-sm" />{f.refImage && <img src={f.refImage} alt="Reference" className="mt-2 h-28 rounded-sm object-cover" />}</label>
        <textarea value={f.notes} onChange={set("notes")} rows={3} placeholder="Extra message" className="px-3 py-2.5 rounded-sm text-sm" style={inputStyle} />
        <GoldButton onClick={submit}><WaIcon size={16} color={BLACK} /> Submit via WhatsApp</GoldButton>
        <p className="text-xs" style={{ color: MUTED }}>Your request is also saved to the PC Wears dashboard so the team can follow up.</p>
      </div>
    </div>
  );
}

/* ================= ABOUT ================= */
function AboutPage({ go }) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <SectionTitle eyebrow="Our story" title="About PC Wears" />
      <div className="space-y-4 text-sm leading-relaxed" style={{ color: "#5C554A" }}>
        <p>PC Wears — People's Choice Wears — is a fashion and lifestyle brand based in Freetown, Sierra Leone, offering stylish Africana wears, ready-made outfits, accessories, perfumes, watches, shoes, hair products and more. The brand focuses on confidence, quality, elegance, and African pride.</p>
        <p>Every piece is hand-picked or hand-crafted with one promise in mind: <em style={{ color: GOLD, fontFamily: "'Cormorant Garamond', serif", fontSize: 16 }}>"Crafted with Choice. Worn with Pride."</em> Your style. Your confidence. Your choice.</p>
        <p>Ordering is simple. Browse the collection, add to cart, and confirm everything on WhatsApp — no accounts, no complications. Pick up at our shop on Sanders Street or have your order delivered within the city.</p>
      </div>
      <div className="mt-8 flex flex-wrap gap-3"><GoldButton onClick={() => go("shop")}>Shop the Collection</GoldButton><GoldButton outline href={waLink("Hello PC Wears, I'd love to know more about your brand.")}><WaIcon size={16} color={GOLD} /> Say Hello</GoldButton></div>
      <div className="mt-8"><SocialRow /></div>
    </div>
  );
}

/* ================= CONTACT ================= */
function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <SectionTitle eyebrow="We're here" title="Contact PC Wears" />
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="p-6 rounded-sm" style={{ background: WHITE, border: `1px solid ${CREAM_DARK}` }}><h3 className="uppercase tracking-widest text-xs mb-2" style={{ color: GOLD }}>WhatsApp / Phone</h3><p className="text-lg font-medium">{WA_DISPLAY}</p><div className="mt-4"><GoldButton small href={waLink("Hello PC Wears, I'd like to make an inquiry.")}><WaIcon size={14} color={BLACK} /> Chat Now</GoldButton></div></div>
        <div className="p-6 rounded-sm" style={{ background: WHITE, border: `1px solid ${CREAM_DARK}` }}><h3 className="uppercase tracking-widest text-xs mb-2" style={{ color: GOLD }}>Visit the shop</h3><p className="text-sm">{ADDRESS}</p><p className="text-xs mt-2" style={{ color: MUTED }}>Pickup available · Delivery within Freetown (fee may apply)</p></div>
        <div className="p-6 rounded-sm" style={{ background: WHITE, border: `1px solid ${CREAM_DARK}` }}><h3 className="uppercase tracking-widest text-xs mb-2" style={{ color: GOLD }}>Email</h3><p className="text-sm">{EMAIL}</p><p className="text-xs mt-1" style={{ color: MUTED }}>Replace with your real email address.</p></div>
        <div className="p-6 rounded-sm" style={{ background: WHITE, border: `1px solid ${CREAM_DARK}` }}><h3 className="uppercase tracking-widest text-xs mb-2" style={{ color: GOLD }}>Business hours</h3><p className="text-sm">Mon – Sat · 9:00am – 8:00pm</p><p className="text-sm">Sunday · By appointment</p></div>
      </div>
      <div className="mt-4 p-6 rounded-sm" style={{ background: WHITE, border: `1px solid ${CREAM_DARK}` }}>
        <h3 className="uppercase tracking-widest text-xs mb-3" style={{ color: GOLD }}>Find us</h3>
        <div className="h-44 rounded-sm flex items-center justify-center text-center" style={{ background: `repeating-linear-gradient(45deg, ${CREAM_DARK}, ${CREAM_DARK} 10px, ${CREAM} 10px, ${CREAM} 20px)` }}>
          <span className="text-sm px-4" style={{ color: MUTED }}>📍 Google Map placeholder — embed your shop location here</span>
        </div>
      </div>
      <div className="mt-4 p-6 rounded-sm" style={{ background: NAVY, color: CREAM }}><h3 className="uppercase tracking-widest text-xs mb-3" style={{ color: GOLD }}>Follow us</h3><SocialRow color={CREAM} /></div>
    </div>
  );
}

/* ================= ADMIN ================= */
function AdminPage(props) { return props.isAdmin ? <AdminDashboard {...props} /> : <AdminLogin {...props} />; }
function AdminLogin({ adminPass, setIsAdmin, staff, setRole, setStaffName }) {
  const [pass, setPass] = useState(""); const [err, setErr] = useState("");
  const tryLogin = () => {
    if (pass === adminPass) { setRole("owner"); setStaffName("Owner"); setIsAdmin(true); return; }
    const member = (staff || []).find((s) => s.passcode && s.passcode === pass && s.active !== false);
    if (member) { setRole(member.role); setStaffName(member.name); setIsAdmin(true); return; }
    setErr("Incorrect passcode. Try again.");
  };
  return (
    <div className="max-w-sm mx-auto px-4 py-20">
      <div className="text-center mb-6"><Crest size={56} /></div>
      <h1 className="text-center mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 28 }}>Staff Login</h1>
      <p className="text-center text-xs mb-6" style={{ color: MUTED }}>Owner uses the admin password. Staff use the passcode set for them.</p>
      <input type="password" value={pass} onChange={(e) => { setPass(e.target.value); setErr(""); }} onKeyDown={(e) => e.key === "Enter" && tryLogin()} placeholder="Password or staff passcode" className="w-full px-3 py-3 rounded-sm text-sm mb-3" style={{ background: WHITE, border: `1px solid ${err ? "#C0392B" : CREAM_DARK}` }} />
      {err && <p className="text-xs mb-3" style={{ color: "#C0392B" }}>{err}</p>}
      <GoldButton full onClick={tryLogin}>Log In</GoldButton>
      <p className="text-xs mt-4 text-center" style={{ color: MUTED }}>Default owner password: <code>{DEFAULT_ADMIN_PASS}</code> — change it in Settings after first login.</p>
    </div>
  );
}
function AdminDashboard(props) {
  const { role, staffName } = props;
  const allowed = (ROLES[role] || ROLES.viewer).tabs;
  const [tab, setTab] = useState(allowed[0] || "dashboard");
  const canEdit = role === "owner" || role === "manager" || role === "sales" || (role === "tailor" && tab === "orders");
  const readOnly = role === "viewer";
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 30 }}>PC Wears Dashboard</h1>
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase tracking-widest px-3 py-1 rounded-sm" style={{ background: INK, color: GOLD }}>{staffName} · {(ROLES[role] || {}).label || "Staff"}</span>
          <GoldButton small outline onClick={() => { props.setIsAdmin(false); props.setRole(null); }}>Log Out</GoldButton>
        </div>
      </div>
      <p className="text-xs mb-5" style={{ color: MUTED }}>Records are saved through the app's data layer. Connect Supabase in <code>src/lib/store.js</code> to make them permanent and shared across all devices.</p>
      <div className="flex gap-2 mb-6 flex-wrap">{allowed.map((k) => <button key={k} onClick={() => setTab(k)} className="px-4 py-2 rounded-sm text-sm uppercase tracking-wider" style={{ background: tab === k ? BLACK : WHITE, color: tab === k ? GOLD : INK, border: `1px solid ${tab === k ? BLACK : CREAM_DARK}` }}>{TAB_LABELS[k]}</button>)}</div>
      {tab === "dashboard" && <AdminSummary {...props} setTab={setTab} />}
      {tab === "customers" && <AdminCustomers {...props} readOnly={readOnly} />}
      {tab === "orders" && <AdminOrders {...props} readOnly={readOnly} />}
      {tab === "products" && <AdminProducts {...props} />}
      {tab === "inventory" && <AdminInventory {...props} />}
      {tab === "team" && <AdminTeam {...props} />}
      {tab === "blog" && <AdminBlog {...props} />}
      {tab === "staff" && <AdminStaff {...props} />}
      {tab === "settings" && <AdminSettings {...props} />}
    </div>
  );
}
function AdminProducts({ products, saveProducts, showToast }) {
  const [editing, setEditing] = useState(null);
  if (editing) return <ProductForm products={products} saveProducts={saveProducts} showToast={showToast} editing={editing === "new" ? null : editing} done={() => setEditing(null)} />;
  const toggle = (id, field) => saveProducts(products.map((p) => p.id === id ? { ...p, [field]: !p[field] } : p));
  const setStock = (id, v) => saveProducts(products.map((p) => p.id === id ? { ...p, stock: v } : p));
  const remove = (id) => { if (window.confirm("Delete this product? This cannot be undone.")) { saveProducts(products.filter((p) => p.id !== id)); showToast("Product deleted"); } };
  const chip = (on) => ({ background: on ? GOLD : CREAM_DARK, color: on ? BLACK : MUTED });
  return (
    <div>
      <div className="flex justify-between items-center mb-4"><p className="text-sm" style={{ color: MUTED }}>{products.length} products</p><GoldButton small onClick={() => setEditing("new")}>+ Add New Product</GoldButton></div>
      <div className="grid gap-3">
        {products.map((p) => (
          <div key={p.id} className="flex flex-wrap items-center gap-3 p-3 rounded-sm" style={{ background: WHITE, border: `1px solid ${CREAM_DARK}` }}>
            <div className="w-14 h-14 rounded-sm overflow-hidden shrink-0"><ProductImage product={p} /></div>
            <div className="flex-1 min-w-[160px]"><p className="font-medium text-sm">{p.name}</p><p className="text-xs" style={{ color: MUTED }}>{catName(p.category)} · {fmtLe(p.price)}</p></div>
            <div className="flex flex-wrap gap-1.5 text-[10px] uppercase tracking-wider">
              <button onClick={() => toggle(p.id, "featured")} className="px-2 py-1 rounded-sm" style={chip(p.featured)}>Featured</button>
              <button onClick={() => toggle(p.id, "newArrival")} className="px-2 py-1 rounded-sm" style={chip(p.newArrival)}>New</button>
              <button onClick={() => toggle(p.id, "bestSeller")} className="px-2 py-1 rounded-sm" style={chip(p.bestSeller)}>Best Seller</button>
              <select value={p.stock} onChange={(e) => setStock(p.id, e.target.value)} className="px-2 py-1 rounded-sm text-[10px] uppercase" style={{ border: `1px solid ${CREAM_DARK}` }}>
                <option value="available">Available</option><option value="sold_out">Sold Out</option><option value="coming_soon">Coming Soon</option>
              </select>
            </div>
            <div className="flex gap-2"><GoldButton small outline onClick={() => setEditing(p)}>Edit</GoldButton><button onClick={() => remove(p.id)} className="px-3 py-2 text-xs rounded-sm uppercase tracking-wider" style={{ border: "1.5px solid #C0392B", color: "#C0392B" }}>Delete</button></div>
          </div>
        ))}
      </div>
    </div>
  );
}
function ProductForm({ products, saveProducts, showToast, editing, done }) {
  const [f, setF] = useState(editing || { name: "", category: CATEGORIES[0].id, price: "", description: "", sizes: [], colors: [], stock: "available", featured: false, newArrival: true, bestSeller: false, image: null });
  const [sizesText, setSizesText] = useState((editing?.sizes || []).join(", "));
  const [colorsText, setColorsText] = useState((editing?.colors || []).join(", "));
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const inputStyle = { background: WHITE, border: `1px solid ${CREAM_DARK}` };
  const handleImage = async (e) => { const file = e.target.files?.[0]; if (!file) return; try { setF({ ...f, image: await resizeImage(file) }); showToast("Image added"); } catch { showToast("Could not read image"); } };
  const save = () => {
    if (!f.name.trim() || !f.price) { showToast("Name and price are required"); return; }
    const parsed = { ...f, price: Number(f.price), sizes: sizesText.split(",").map((s) => s.trim()).filter(Boolean), colors: colorsText.split(",").map((s) => s.trim()).filter(Boolean) };
    if (editing) saveProducts(products.map((p) => p.id === editing.id ? { ...parsed, id: editing.id } : p));
    else saveProducts([{ ...parsed, id: uid() }, ...products]);
    showToast(editing ? "Product updated" : "Product added"); done();
  };
  const check = (k, l) => <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={!!f[k]} onChange={(e) => setF({ ...f, [k]: e.target.checked })} style={{ accentColor: GOLD }} /> {l}</label>;
  return (
    <div className="max-w-2xl">
      <button onClick={done} className="text-xs uppercase tracking-widest mb-4" style={{ color: GOLD }}>← Back to products</button>
      <h2 className="mb-4" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 24 }}>{editing ? "Edit Product" : "Add New Product"}</h2>
      <div className="grid gap-3">
        <input value={f.name} onChange={set("name")} placeholder="Product name *" className="px-3 py-2.5 rounded-sm text-sm" style={inputStyle} />
        <div className="grid sm:grid-cols-2 gap-3"><select value={f.category} onChange={set("category")} className="px-3 py-2.5 rounded-sm text-sm" style={inputStyle}>{CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select><input type="number" min="0" value={f.price} onChange={set("price")} placeholder="Price in Leones *" className="px-3 py-2.5 rounded-sm text-sm" style={inputStyle} /></div>
        <textarea value={f.description} onChange={set("description")} rows={3} placeholder="Description" className="px-3 py-2.5 rounded-sm text-sm" style={inputStyle} />
        <div className="grid sm:grid-cols-2 gap-3"><input value={sizesText} onChange={(e) => setSizesText(e.target.value)} placeholder="Sizes (comma separated)" className="px-3 py-2.5 rounded-sm text-sm" style={inputStyle} /><input value={colorsText} onChange={(e) => setColorsText(e.target.value)} placeholder="Colors (comma separated)" className="px-3 py-2.5 rounded-sm text-sm" style={inputStyle} /></div>
        <div className="grid sm:grid-cols-2 gap-3 items-center">
          <label className="text-sm"><span className="block text-xs uppercase tracking-widest mb-1" style={{ color: MUTED }}>Product image</span><input type="file" accept="image/*" onChange={handleImage} className="w-full text-sm" /></label>
          <label className="text-sm"><span className="block text-xs uppercase tracking-widest mb-1" style={{ color: MUTED }}>Stock status</span><select value={f.stock} onChange={set("stock")} className="w-full px-3 py-2.5 rounded-sm text-sm" style={inputStyle}><option value="available">Available</option><option value="sold_out">Sold Out</option><option value="coming_soon">Coming Soon</option></select></label>
        </div>
        {f.image && <span className="flex items-center gap-3"><img src={f.image} alt="Preview" className="h-24 w-24 rounded-sm object-cover" /><button onClick={() => setF({ ...f, image: null })} className="text-xs underline" style={{ color: "#C0392B" }}>Remove image</button></span>}
        <div className="flex flex-wrap gap-5 p-4 rounded-sm" style={{ background: WHITE, border: `1px solid ${CREAM_DARK}` }}>{check("featured", "Featured")}{check("newArrival", "New arrival")}{check("bestSeller", "Best seller")}</div>
        <div className="flex gap-3"><GoldButton onClick={save}>{editing ? "Save Changes" : "Add Product"}</GoldButton><GoldButton outline onClick={done}>Cancel</GoldButton></div>
      </div>
    </div>
  );
}
/* ================= ADMIN: ORDERS (full) ================= */
function AdminOrders({ orders, saveOrders, customers, products, staff, showToast, readOnly }) {
  const [editing, setEditing] = useState(null);
  const [invoiceFor, setInvoiceFor] = useState(null);
  const [search, setSearch] = useState("");
  const [statusF, setStatusF] = useState("all");
  const [payF, setPayF] = useState("all");
  const [catF, setCatF] = useState("all");
  const [tailorF, setTailorF] = useState("all");
  const [from, setFrom] = useState(""); const [to, setTo] = useState("");

  if (editing) return <OrderForm orders={orders} saveOrders={saveOrders} customers={customers} products={products} staff={staff} showToast={showToast} editing={editing === "new" ? null : editing} done={() => setEditing(null)} />;
  if (invoiceFor) return <InvoiceDoc order={invoiceFor} customers={customers} kind={invoiceFor._kind || "invoice"} onClose={() => setInvoiceFor(null)} />;

  const tailors = [...new Set(orders.map((o) => o.tailor).filter(Boolean))];
  const list = orders.filter((o) => {
    if (statusF !== "all" && (o.status || "pending") !== statusF) return false;
    if (payF !== "all" && payStatus(o) !== payF) return false;
    if (catF !== "all" && o.category !== catF) return false;
    if (tailorF !== "all" && o.tailor !== tailorF) return false;
    if (from && (o.createdAt || "") < from) return false;
    if (to && (o.createdAt || "") > to) return false;
    if (search) { const s = (o.orderId + " " + o.customer + " " + o.phone + " " + o.product).toLowerCase(); if (!s.includes(search.toLowerCase())) return false; }
    return true;
  });

  const update = (id, patch) => saveOrders(orders.map((o) => o.id === id ? { ...o, ...patch } : o));
  const remove = (id) => { if (window.confirm("Delete this order?")) { saveOrders(orders.filter((o) => o.id !== id)); showToast("Order deleted"); } };
  const exportCsv = () => {
    const rows = [["Order ID","Invoice","Customer","Phone","Category","Product/Style","Qty","Total","Paid","Balance","Payment","Status","Tailor","Created","Due"],
      ...orders.map((o) => [o.orderId, o.invoiceNo, o.customer, o.phone, o.category, o.product, o.qty, orderTotal(o), orderPaid(o), orderBalance(o), payStatus(o), o.status, o.tailor, o.createdAt, o.deliveryDate])];
    downloadCSV("pcwears-orders.csv", rows);
  };
  const inputStyle = { background: WHITE, border: `1px solid ${CREAM_DARK}` };
  const remindBalance = (o) => waLink(`Hello ${o.customer}, this is PC Wears. A friendly reminder that your order ${o.orderId || ""} has an outstanding balance of ${fmtLe(orderBalance(o))}. Thank you! ${WA_DISPLAY}`);
  const remindReady = (o) => waLink(`Hello ${o.customer}, great news from PC Wears — your order ${o.orderId || ""} is READY for pickup at ${ADDRESS} or delivery. Thank you for choosing PC Wears!`);
  const remindDue = (o) => waLink(`Hello ${o.customer}, this is PC Wears. Your order ${o.orderId || ""} is due on ${o.deliveryDate || "soon"}. We'll be in touch shortly. Thank you!`);

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3 items-center">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search order ID, customer, phone, product…" className="flex-1 min-w-[200px] px-3 py-2.5 rounded-sm text-sm" style={inputStyle} />
        <GoldButton small outline onClick={exportCsv}>Export CSV</GoldButton>
        {!readOnly && <GoldButton small onClick={() => setEditing("new")}>+ New Order</GoldButton>}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
        <select value={statusF} onChange={(e) => setStatusF(e.target.value)} className="px-2 py-2 rounded-sm text-xs" style={inputStyle}><option value="all">All statuses</option>{ORDER_STATUS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
        <select value={payF} onChange={(e) => setPayF(e.target.value)} className="px-2 py-2 rounded-sm text-xs" style={inputStyle}><option value="all">All payments</option>{["Paid","Part Payment","Deposit","Unpaid"].map((p) => <option key={p} value={p}>{p}</option>)}</select>
        <select value={catF} onChange={(e) => setCatF(e.target.value)} className="px-2 py-2 rounded-sm text-xs" style={inputStyle}><option value="all">All categories</option>{CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}<option value="custom">Custom design</option></select>
        <select value={tailorF} onChange={(e) => setTailorF(e.target.value)} className="px-2 py-2 rounded-sm text-xs" style={inputStyle}><option value="all">All tailors</option>{tailors.map((t) => <option key={t} value={t}>{t}</option>)}</select>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="px-2 py-2 rounded-sm text-xs" style={inputStyle} aria-label="From date" />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="px-2 py-2 rounded-sm text-xs" style={inputStyle} aria-label="To date" />
      </div>
      {!list.length && <p className="text-sm py-8 text-center" style={{ color: MUTED }}>No orders match. Create one with the New Order button — WhatsApp orders can be recorded here too.</p>}
      <div className="grid gap-3">
        {list.map((o) => {
          const bal = orderBalance(o), ps = payStatus(o);
          return (
            <div key={o.id} className="p-4 rounded-sm" style={{ background: WHITE, border: `1px solid ${CREAM_DARK}`, borderLeft: `4px solid ${ORDER_STATUS_COLOR[o.status || "pending"]}` }}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-[200px]">
                  <p className="text-[11px] uppercase tracking-widest" style={{ color: GOLD }}>{o.orderId || "—"}{o.invoiceNo ? ` · ${o.invoiceNo}` : ""}</p>
                  <p className="font-medium text-sm">{o.customer} <span style={{ color: MUTED }}>· {o.phone}</span></p>
                  <p className="text-sm mt-0.5">{o.product}{o.fabricColor ? ` · ${o.fabricColor}` : ""} — Qty {o.qty} — <span style={{ color: GOLD }}>{fmtLe(orderTotal(o))}</span></p>
                  <p className="text-xs mt-1" style={{ color: MUTED }}>Paid {fmtLe(orderPaid(o))} · <span style={{ color: bal > 0 ? "#C0392B" : "#2E7D32" }}>{ps}{bal > 0 ? ` (${fmtLe(bal)} left)` : ""}</span>{o.tailor ? ` · Tailor: ${o.tailor}` : ""}{o.deliveryDate ? ` · due ${o.deliveryDate}` : ""}</p>
                  {o.instructions && <p className="text-xs mt-1 italic" style={{ color: MUTED }}>{o.instructions}</p>}
                  {o.refImage && <img src={o.refImage} alt="Reference" className="mt-2 h-20 rounded-sm object-cover" />}
                </div>
                <div className="flex flex-col gap-2 items-end no-print">
                  {!readOnly && <select value={o.status || "pending"} onChange={(e) => update(o.id, { status: e.target.value })} className="px-2 py-1.5 rounded-sm text-xs" style={{ ...inputStyle, borderColor: ORDER_STATUS_COLOR[o.status || "pending"] }}>{ORDER_STATUS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>}
                  <div className="flex flex-wrap gap-1.5 justify-end">
                    <button onClick={() => setInvoiceFor({ ...o, _kind: "invoice" })} className="px-2 py-1 text-[11px] rounded-sm" style={{ border: `1px solid ${GOLD}`, color: GOLD }}>Invoice</button>
                    <button onClick={() => setInvoiceFor({ ...o, _kind: "receipt" })} className="px-2 py-1 text-[11px] rounded-sm" style={{ border: `1px solid ${GOLD}`, color: GOLD }}>Receipt</button>
                    <button onClick={() => setInvoiceFor({ ...o, _kind: "measurement" })} className="px-2 py-1 text-[11px] rounded-sm" style={{ border: `1px solid ${GOLD}`, color: GOLD }}>Measure</button>
                    {!readOnly && <button onClick={() => setEditing(o)} className="px-2 py-1 text-[11px] rounded-sm" style={{ border: `1px solid ${CREAM_DARK}` }}>Edit</button>}
                  </div>
                  <div className="flex flex-wrap gap-1.5 justify-end">
                    {bal > 0 && <a href={remindBalance(o)} target="_blank" rel="noopener noreferrer" className="px-2 py-1 text-[11px] rounded-sm" style={{ background: "#25D366", color: "#fff" }}>Remind balance</a>}
                    {o.status === "ready" && <a href={remindReady(o)} target="_blank" rel="noopener noreferrer" className="px-2 py-1 text-[11px] rounded-sm" style={{ background: "#25D366", color: "#fff" }}>Order ready</a>}
                    {o.deliveryDate && o.status !== "delivered" && <a href={remindDue(o)} target="_blank" rel="noopener noreferrer" className="px-2 py-1 text-[11px] rounded-sm" style={{ background: "#25D366", color: "#fff" }}>Due soon</a>}
                  </div>
                  {!readOnly && o.status !== "delivered" && <button onClick={() => update(o.id, { status: "delivered" })} className="text-[11px] underline" style={{ color: "#2E7D32" }}>Mark delivered</button>}
                  {!readOnly && <button onClick={() => remove(o.id)} className="text-[11px] underline" style={{ color: "#C0392B" }}>Delete</button>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OrderForm({ orders, saveOrders, customers, products, staff, showToast, editing, done }) {
  const base = editing || { customerId: "", customer: "", phone: "", category: "africana", product: "", styleName: "", fabricType: "", fabricColor: "", qty: 1, price: "", discount: "", status: "pending", deliveryDate: "", tailor: "", instructions: "", fulfil: "delivery", refImage: null, payments: [] };
  const [f, setF] = useState({ ...base, payments: base.payments || [] });
  const [pay, setPay] = useState({ amount: "", type: "Deposit", method: "Cash", staff: "", note: "" });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const inputStyle = { background: WHITE, border: `1px solid ${CREAM_DARK}` };
  const tailors = (staff || []).filter((s) => s.role === "tailor");

  const pickCustomer = (id) => {
    const c = customers.find((x) => x.id === id);
    setF({ ...f, customerId: id, customer: c ? c.name : f.customer, phone: c ? c.phone : f.phone, refImage: c && c.refImage ? c.refImage : f.refImage });
  };
  const handleImage = async (e) => { const file = e.target.files?.[0]; if (!file) return; try { setF({ ...f, refImage: await resizeImage(file, 600) }); } catch { showToast("Could not read image"); } };
  const total = Number(f.price || 0) * Number(f.qty || 1) - Number(f.discount || 0);
  const addPayment = () => {
    if (!pay.amount) { showToast("Enter payment amount"); return; }
    setF({ ...f, payments: [...(f.payments || []), { ...pay, amount: Number(pay.amount), date: todayISO(), id: uid() }] });
    setPay({ amount: "", type: "Balance Payment", method: "Cash", staff: pay.staff, note: "" });
  };
  const removePayment = (id) => setF({ ...f, payments: f.payments.filter((p) => p.id !== id) });
  const paid = (f.payments || []).reduce((s, p) => s + Number(p.amount || 0), 0);

  const save = () => {
    if (!f.customer.trim() || !f.product.trim()) { showToast("Customer and product/style are required"); return; }
    const record = { ...f, qty: Number(f.qty) || 1, price: Number(f.price) || 0, discount: Number(f.discount) || 0, total };
    if (editing) saveOrders(orders.map((o) => o.id === editing.id ? { ...record, id: editing.id, orderId: editing.orderId, invoiceNo: editing.invoiceNo, createdAt: editing.createdAt } : o));
    else saveOrders([{ ...record, id: uid(), orderId: genId(orders, "PCW"), invoiceNo: genId(orders, "INV"), createdAt: todayISO() }, ...orders]);
    showToast(editing ? "Order updated" : "Order created"); done();
  };

  return (
    <div className="max-w-2xl">
      <button onClick={done} className="text-xs uppercase tracking-widest mb-4" style={{ color: GOLD }}>← Back to orders</button>
      <h2 className="mb-4" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 24 }}>{editing ? `Edit Order ${editing.orderId || ""}` : "New Order"}</h2>
      <div className="grid gap-3">
        {customers.length > 0 && (
          <label className="text-sm"><span className="block text-xs uppercase tracking-widest mb-1" style={{ color: MUTED }}>Link existing customer (optional)</span>
            <select value={f.customerId} onChange={(e) => pickCustomer(e.target.value)} className="w-full px-3 py-2.5 rounded-sm text-sm" style={inputStyle}><option value="">— New / walk-in —</option>{customers.map((c) => <option key={c.id} value={c.id}>{c.name} · {c.phone}</option>)}</select>
          </label>
        )}
        <div className="grid sm:grid-cols-2 gap-3"><input value={f.customer} onChange={set("customer")} placeholder="Customer name *" className="px-3 py-2.5 rounded-sm text-sm" style={inputStyle} /><input value={f.phone} onChange={set("phone")} placeholder="Phone / WhatsApp" className="px-3 py-2.5 rounded-sm text-sm" style={inputStyle} /></div>
        <div className="grid sm:grid-cols-2 gap-3">
          <select value={f.category} onChange={set("category")} className="px-3 py-2.5 rounded-sm text-sm" style={inputStyle}>{CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}<option value="custom">Custom design</option></select>
          <input value={f.product} onChange={set("product")} placeholder="Outfit / product / style *" className="px-3 py-2.5 rounded-sm text-sm" style={inputStyle} />
        </div>
        <div className="grid sm:grid-cols-2 gap-3"><input value={f.fabricType} onChange={set("fabricType")} placeholder="Fabric type" className="px-3 py-2.5 rounded-sm text-sm" style={inputStyle} /><input value={f.fabricColor} onChange={set("fabricColor")} placeholder="Fabric color" className="px-3 py-2.5 rounded-sm text-sm" style={inputStyle} /></div>
        <div className="grid grid-cols-3 gap-3">
          <label className="text-xs" style={{ color: MUTED }}>Qty<input type="number" min="1" value={f.qty} onChange={set("qty")} className="w-full px-3 py-2.5 rounded-sm text-sm mt-1" style={inputStyle} /></label>
          <label className="text-xs" style={{ color: MUTED }}>Price (Le)<input type="number" min="0" value={f.price} onChange={set("price")} className="w-full px-3 py-2.5 rounded-sm text-sm mt-1" style={inputStyle} /></label>
          <label className="text-xs" style={{ color: MUTED }}>Discount (Le)<input type="number" min="0" value={f.discount} onChange={set("discount")} className="w-full px-3 py-2.5 rounded-sm text-sm mt-1" style={inputStyle} /></label>
        </div>
        <div className="flex justify-between items-center p-3 rounded-sm" style={{ background: INK, color: CREAM }}><span className="text-sm">Order total</span><span className="font-semibold" style={{ color: GOLD }}>{fmtLe(total)}</span></div>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="text-xs" style={{ color: MUTED }}>Status<select value={f.status} onChange={set("status")} className="w-full px-3 py-2.5 rounded-sm text-sm mt-1" style={inputStyle}>{ORDER_STATUS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
          <label className="text-xs" style={{ color: MUTED }}>Expected delivery<input type="date" value={f.deliveryDate} onChange={set("deliveryDate")} className="w-full px-3 py-2.5 rounded-sm text-sm mt-1" style={inputStyle} /></label>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <input list="pcw-tailors" value={f.tailor} onChange={set("tailor")} placeholder="Assigned tailor / staff" className="px-3 py-2.5 rounded-sm text-sm" style={inputStyle} />
          <datalist id="pcw-tailors">{tailors.map((t) => <option key={t.id} value={t.name} />)}</datalist>
          <select value={f.fulfil} onChange={set("fulfil")} className="px-3 py-2.5 rounded-sm text-sm" style={inputStyle}><option value="delivery">Delivery</option><option value="pickup">Pickup</option></select>
        </div>
        <textarea value={f.instructions} onChange={set("instructions")} rows={2} placeholder="Special instructions" className="px-3 py-2.5 rounded-sm text-sm" style={inputStyle} />
        <label className="text-sm"><span className="block text-xs uppercase tracking-widest mb-1" style={{ color: MUTED }}>Reference style image</span><input type="file" accept="image/*" onChange={handleImage} className="w-full text-sm" />{f.refImage && <img src={f.refImage} alt="Reference" className="mt-2 h-24 rounded-sm object-cover" />}</label>

        <div className="p-4 rounded-sm" style={{ background: WHITE, border: `1px solid ${CREAM_DARK}` }}>
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: GOLD }}>Payments — paid {fmtLe(paid)} · balance {fmtLe(Math.max(0, total - paid))} · {payStatus({ total, payments: f.payments })}</p>
          {(f.payments || []).map((p) => (
            <div key={p.id} className="flex items-center justify-between text-sm py-1.5 border-b" style={{ borderColor: CREAM_DARK }}>
              <span>{fmtLe(p.amount)} · {p.method} · {p.type}{p.staff ? ` · ${p.staff}` : ""} <span style={{ color: MUTED }}>{p.date}</span></span>
              <button onClick={() => removePayment(p.id)} style={{ color: "#C0392B" }} aria-label="Remove payment">✕</button>
            </div>
          ))}
          <div className="grid sm:grid-cols-5 gap-2 items-end mt-3">
            <input type="number" value={pay.amount} onChange={(e) => setPay({ ...pay, amount: e.target.value })} placeholder="Amount" className="px-2 py-2 rounded-sm text-sm" style={inputStyle} />
            <select value={pay.type} onChange={(e) => setPay({ ...pay, type: e.target.value })} className="px-2 py-2 rounded-sm text-sm" style={inputStyle}>{PAY_TYPES.map((t) => <option key={t}>{t}</option>)}</select>
            <select value={pay.method} onChange={(e) => setPay({ ...pay, method: e.target.value })} className="px-2 py-2 rounded-sm text-sm" style={inputStyle}>{PAY_METHODS.map((m) => <option key={m}>{m}</option>)}</select>
            <input value={pay.staff} onChange={(e) => setPay({ ...pay, staff: e.target.value })} placeholder="Received by" className="px-2 py-2 rounded-sm text-sm" style={inputStyle} />
            <GoldButton small onClick={addPayment}>Add</GoldButton>
          </div>
        </div>

        <div className="flex gap-3"><GoldButton onClick={save}>{editing ? "Save Order" : "Create Order"}</GoldButton><GoldButton outline onClick={done}>Cancel</GoldButton></div>
      </div>
    </div>
  );
}

/* ================= INVOICE / RECEIPT / MEASUREMENT DOCUMENT ================= */
function InvoiceDoc({ order, customers, kind, onClose }) {
  const cust = customers.find((c) => c.id === order.customerId);
  const total = orderTotal(order), paid = orderPaid(order), bal = orderBalance(order);
  const title = kind === "receipt" ? "Payment Receipt" : kind === "measurement" ? "Measurement Sheet" : "Invoice";
  const docNo = kind === "receipt" ? (order.invoiceNo || order.orderId || "").replace("INV", "RCP") : kind === "measurement" ? (order.orderId || "").replace("PCW", "MEA") : (order.invoiceNo || order.orderId || "");
  const waShare = waLink(`Hello ${order.customer}, here is your ${title.toLowerCase()} from PC Wears.\nRef: ${docNo}\nOrder: ${order.product} x${order.qty}\nTotal: ${fmtLe(total)} · Paid: ${fmtLe(paid)} · Balance: ${fmtLe(bal)}\nThank you for choosing PC Wears!`);
  const measure = cust?.measurements || {};
  const measureFields = (cust?.gender === "Female" ? WOMEN_MEASURE : MEN_MEASURE);
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: "#0009" }}>
      <div className="min-h-full flex flex-col items-center py-8 px-3">
        <div className="w-full max-w-2xl flex flex-wrap gap-2 justify-end mb-3 no-print">
          <GoldButton small onClick={() => window.print()}>Print</GoldButton>
          <GoldButton small outline onClick={() => window.print()}>Download PDF</GoldButton>
          <GoldButton small outline href={waShare}><WaIcon size={13} color={GOLD} /> Share on WhatsApp</GoldButton>
          <button onClick={onClose} className="px-4 py-2 text-xs rounded-sm uppercase tracking-wider" style={{ background: BLACK, color: CREAM }}>Close</button>
        </div>
        <div id="pcw-print" className="w-full max-w-2xl p-8" style={{ background: WHITE, color: INK }}>
          <div className="flex items-start justify-between pb-4 mb-4" style={{ borderBottom: `2px solid ${GOLD}` }}>
            <div className="flex items-center gap-3"><Crest size={50} /><div><p style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 26 }}>PC WEARS</p><p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: GOLD }}>People's Choice Wears</p><p className="text-xs italic mt-0.5" style={{ color: MUTED }}>Crafted with Choice. Worn with Pride.</p></div></div>
            <div className="text-right text-xs" style={{ color: MUTED }}><p className="text-lg font-semibold" style={{ color: INK }}>{title}</p><p>{docNo}</p><p>{todayISO()}</p></div>
          </div>
          <div className="flex flex-wrap justify-between gap-4 text-xs mb-5" style={{ color: "#4A453C" }}>
            <div><p className="uppercase tracking-widest mb-1" style={{ color: GOLD }}>From</p><p>PC Wears</p><p>{ADDRESS}</p><p>WhatsApp: {WA_DISPLAY}</p></div>
            <div className="text-right"><p className="uppercase tracking-widest mb-1" style={{ color: GOLD }}>Bill to</p><p className="font-medium" style={{ color: INK }}>{order.customer}</p><p>{order.phone}</p>{cust?.address && <p>{cust.address}</p>}</div>
          </div>

          {kind === "measurement" ? (
            <table className="w-full text-sm mb-5"><tbody>
              {measureFields.map((m) => <tr key={m} style={{ borderBottom: `1px solid ${CREAM_DARK}` }}><td className="py-1.5" style={{ color: MUTED }}>{m}</td><td className="py-1.5 text-right font-medium">{measure[m] || "—"}</td></tr>)}
              {measure["Extra note"] && <tr><td className="py-1.5" style={{ color: MUTED }}>Note</td><td className="py-1.5 text-right">{measure["Extra note"]}</td></tr>}
            </tbody></table>
          ) : (
            <table className="w-full text-sm mb-4">
              <thead><tr style={{ background: CREAM }}><th className="text-left p-2">Description</th><th className="text-center p-2">Qty</th><th className="text-right p-2">Price</th><th className="text-right p-2">Amount</th></tr></thead>
              <tbody>
                <tr style={{ borderBottom: `1px solid ${CREAM_DARK}` }}>
                  <td className="p-2">{order.product}{order.fabricType ? ` · ${order.fabricType}` : ""}{order.fabricColor ? ` · ${order.fabricColor}` : ""}<br /><span className="text-xs" style={{ color: MUTED }}>{catName(order.category)}{order.styleName ? ` · ${order.styleName}` : ""}</span></td>
                  <td className="text-center p-2">{order.qty}</td>
                  <td className="text-right p-2">{fmtLe(order.price)}</td>
                  <td className="text-right p-2">{fmtLe(Number(order.price || 0) * Number(order.qty || 1))}</td>
                </tr>
              </tbody>
            </table>
          )}

          {kind !== "measurement" && (
            <div className="flex justify-end mb-5"><div className="w-56 text-sm">
              {Number(order.discount) > 0 && <div className="flex justify-between py-1"><span style={{ color: MUTED }}>Discount</span><span>− {fmtLe(order.discount)}</span></div>}
              <div className="flex justify-between py-1" style={{ borderTop: `1px solid ${CREAM_DARK}` }}><span style={{ color: MUTED }}>Total</span><span className="font-semibold">{fmtLe(total)}</span></div>
              <div className="flex justify-between py-1"><span style={{ color: MUTED }}>Paid</span><span style={{ color: "#2E7D32" }}>{fmtLe(paid)}</span></div>
              <div className="flex justify-between py-1" style={{ borderTop: `1px solid ${CREAM_DARK}` }}><span className="font-medium">Balance</span><span className="font-semibold" style={{ color: bal > 0 ? "#C0392B" : "#2E7D32" }}>{fmtLe(bal)}</span></div>
              <p className="text-right text-xs mt-1" style={{ color: GOLD }}>{payStatus(order)}</p>
            </div></div>
          )}

          {kind === "receipt" && (order.payments || []).length > 0 && (
            <div className="mb-5"><p className="uppercase tracking-widest text-xs mb-2" style={{ color: GOLD }}>Payments received</p>
              <table className="w-full text-xs"><tbody>{order.payments.map((p) => <tr key={p.id} style={{ borderBottom: `1px solid ${CREAM_DARK}` }}><td className="py-1">{p.date}</td><td className="py-1">{p.method}</td><td className="py-1">{p.type}</td><td className="py-1 text-right">{fmtLe(p.amount)}</td></tr>)}</tbody></table>
            </div>
          )}

          {order.deliveryDate && <p className="text-xs mb-4" style={{ color: MUTED }}>Expected delivery: {order.deliveryDate} · {order.fulfil === "pickup" ? "Pickup at shop" : "Delivery within Freetown"}</p>}

          <div className="flex justify-between items-end mt-8 pt-4" style={{ borderTop: `1px solid ${CREAM_DARK}` }}>
            <div className="text-xs" style={{ color: MUTED }}><p className="mb-6">_____________________________</p><p>Authorized signature</p></div>
            <p className="text-sm italic" style={{ fontFamily: "'Cormorant Garamond', serif", color: GOLD }}>Thank you for shopping with PC Wears!</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminSettings({ adminPass, setAdminPass, showToast, products, saveProducts }) {
  const [newPass, setNewPass] = useState(""); const inputStyle = { background: WHITE, border: `1px solid ${CREAM_DARK}` };
  const changePass = () => { if (newPass.trim().length < 6) { showToast("Password must be at least 6 characters"); return; } setAdminPass(newPass.trim()); sSet("pcw2:adminpass", newPass.trim(), true); setNewPass(""); showToast("Password updated"); };
  const restore = () => { if (window.confirm("Add the sample catalogue back alongside current products?")) { const ids = new Set(products.map((p) => p.id)); saveProducts([...products, ...SEED_PRODUCTS.filter((p) => !ids.has(p.id))]); showToast("Sample products restored"); } };
  return (
    <div className="max-w-md grid gap-5">
      <div className="p-5 rounded-sm" style={{ background: WHITE, border: `1px solid ${CREAM_DARK}` }}><h3 className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Change admin password</h3><input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} placeholder="New password (min 6 characters)" className="w-full px-3 py-2.5 rounded-sm text-sm mb-3" style={inputStyle} /><GoldButton small onClick={changePass}>Update Password</GoldButton></div>
      <div className="p-5 rounded-sm" style={{ background: WHITE, border: `1px solid ${CREAM_DARK}` }}><h3 className="text-sm uppercase tracking-widest mb-3" style={{ color: GOLD }}>Sample catalogue</h3><p className="text-xs mb-3" style={{ color: MUTED }}>The shop launched with sample products so it never looks empty. Delete them from the Products tab as you add real items, or restore them here.</p><GoldButton small outline onClick={restore}>Restore Sample Products</GoldButton></div>
      <div className="p-5 rounded-sm" style={{ background: NAVY, color: CREAM }}><h3 className="text-sm uppercase tracking-widest mb-2" style={{ color: GOLD }}>Store details</h3><p className="text-sm">WhatsApp: {WA_DISPLAY}</p><p className="text-sm">{ADDRESS}</p><p className="text-xs mt-2" style={{ color: MUTED }}>To sync products across all devices, connect a database — see the project README "Connect a database".</p></div>
    </div>
  );
}

/* ================= PC COSMETICS ================= */
function CosmeticsPage({ products, go, addToCart, setQuickView, wishlist, toggleWish }) {
  const items = products.filter((p) => p.category === "cosmetics");
  const [sort, setSort] = useState("featured");
  const sorted = useMemo(() => {
    let r = [...items];
    if (sort === "low") r.sort((a, b) => a.price - b.price);
    else if (sort === "high") r.sort((a, b) => b.price - a.price);
    else r.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    return r;
  }, [items, sort]);
  return (
    <div>
      <section className="relative overflow-hidden" style={{ background: `radial-gradient(ellipse at 25% 20%, ${NAVY} 0%, transparent 55%), ${BLACK}` }}>
        <div className="max-w-6xl mx-auto px-4 py-16 text-center pcw-rise">
          <span className="text-4xl">💄</span>
          <p className="mt-3 text-xs uppercase tracking-[0.35em]" style={{ color: GOLD }}>PC Cosmetics</p>
          <h1 className="mt-3 mx-auto max-w-2xl" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: "clamp(2rem,5.5vw,3.2rem)", lineHeight: 1.08, color: CREAM }}>
            Beauty that <em style={{ color: GOLD }}>matches your glow</em>
          </h1>
          <p className="mt-3 mx-auto max-w-lg text-sm" style={{ color: "#C2BAA9" }}>Lipsticks, foundation, palettes, skincare and more — curated for rich, radiant skin.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <GoldButton outline light href={waLink("Hello PC Wears, I'd like to ask about your cosmetics.")}><WaIcon size={16} color={CREAM} /> Ask on WhatsApp</GoldButton>
          </div>
        </div>
        <KenteStrip />
      </section>
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <SectionTitle eyebrow="Shop beauty" title="PC Cosmetics" />
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="px-3 py-2 rounded-sm text-sm" style={{ background: WHITE, border: `1px solid ${CREAM_DARK}` }} aria-label="Sort">
            <option value="featured">Featured</option><option value="low">Price: Low to High</option><option value="high">Price: High to Low</option>
          </select>
        </div>
        {sorted.length ? <ProductGrid items={sorted} go={go} addToCart={addToCart} setQuickView={setQuickView} wishlist={wishlist} toggleWish={toggleWish} />
          : <p className="text-sm" style={{ color: MUTED }}>Cosmetics are coming soon. Add them from the admin dashboard under the "Cosmetics" category.</p>}
      </div>
    </div>
  );
}

/* ================= AI STYLE ADVISOR ================= */
/* Tries the Anthropic API (works in this preview). On a deployed site
   without an API key it falls back to a built-in stylist so advice
   always works. See README "Make the Style Advisor fully live". */
function localStyleAdvice(q) {
  const t = q.toLowerCase();
  const tips = [];
  if (/wedding|party|event|gala|formal|owambe/.test(t))
    tips.push("For weddings and formal events, a tailored Africana set or gown in a jewel tone (emerald, royal blue, wine) with gold accessories reads luxurious. Keep one element bold and the rest tonal.");
  if (/office|work|business|interview/.test(t))
    tips.push("For office or business looks, choose structured cuts in navy, charcoal, cream or black. A crisp shirt under a senator suit with leather Oxfords looks sharp and professional.");
  if (/casual|daytime|everyday|church/.test(t))
    tips.push("For everyday wear, lighter Ankara prints with palm slippers or clean sneakers stay comfortable yet stylish. Roll the sleeves and keep jewellery minimal.");
  if (/dark|deep|chocolate|brown skin|melanin/.test(t))
    tips.push("Deep, warm skin tones glow in emerald, mustard, royal blue, wine and crisp white. Gold metallics flatter beautifully — silver works too for a cooler contrast.");
  if (/light|fair/.test(t))
    tips.push("Lighter skin tones suit deep jewel tones and earthy shades; soft pastels and navy also work well. Avoid colors too close to your skin tone so the outfit still pops.");
  if (/color|colour|match|pair|combination/.test(t))
    tips.push("A reliable formula: pick one hero color, one neutral (black, cream, navy or white), and one metallic accent (gold). Three is balanced; more than four starts to feel busy.");
  if (/men|man|male|senator|suit/.test(t))
    tips.push("Men: a navy or black senator suit is the most versatile base. Add a kente accent or gold watch for occasions, keep it plain for the office.");
  if (/woman|women|ladies|gown|dress/.test(t))
    tips.push("Ladies: a fitted gown in a jewel tone with gold detailing makes a statement; an Ankara two-piece is the flexible everyday choice.");
  if (!tips.length)
    tips.push("Tell me the occasion (wedding, office, casual), your favourite colors, and whether you prefer Africana or modern cuts, and I'll suggest a complete look. As a starting point, a black or navy base with gold accents is elegant for almost anything.");
  tips.push("Browse these styles in our Shop, or message PC Wears on WhatsApp at " + WA_DISPLAY + " for a personal recommendation.");
  return tips.join("\n\n");
}

function StylistPage() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm the PC Wears Style Advisor 💛 Tell me the occasion, your favourite colors, or your skin tone, and I'll suggest outfits, designs and color combinations. How can I help you look your best?" },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  const send = async () => {
    const q = input.trim();
    if (!q || busy) return;
    const next = [...messages, { role: "user", content: q }];
    setMessages(next); setInput(""); setBusy(true);
    const system = "You are the PC Wears Style Advisor, a warm, expert fashion stylist for PC Wears — a luxury fashion and lifestyle brand in Freetown, Sierra Leone. You give friendly, practical advice on outfit designs, fabrics, and color combinations, with a focus on Africana wears, ready-made outfits, and modern styling for African skin tones. Keep replies concise (under 160 words), encouraging, and specific. When relevant, suggest categories PC Wears sells (Africana wears, men's/ladies' wear, hair & wigs, perfumes, watches, shoes, cosmetics, accessories) and remind them they can order on WhatsApp at " + WA_DISPLAY + ". Never invent prices.";
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system,
          messages: next.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      if (!res.ok) throw new Error("api");
      const data = await res.json();
      const text = (data.content || []).map((i) => (i.type === "text" ? i.text : "")).filter(Boolean).join("\n").trim();
      setMessages([...next, { role: "assistant", content: text || localStyleAdvice(q) }]);
    } catch {
      setMessages([...next, { role: "assistant", content: localStyleAdvice(q) }]);
    } finally {
      setBusy(false);
    }
  };

  const prompts = ["What should I wear to a wedding?", "Colors for dark skin tone?", "Office outfit ideas for men", "How do I match gold accessories?"];
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <SectionTitle eyebrow="Ask our AI" title="Style Advisor" />
      <p className="text-sm mb-5 -mt-2" style={{ color: MUTED }}>Get instant advice on outfit designs and color combinations for any occasion.</p>
      <div className="rounded-sm overflow-hidden flex flex-col" style={{ background: WHITE, border: `1px solid ${CREAM_DARK}`, height: "60vh", minHeight: 420 }}>
        <div className="flex items-center gap-2 px-4 py-3" style={{ background: BLACK, color: CREAM }}>
          <Crest size={26} /><span className="text-sm uppercase tracking-widest" style={{ color: GOLD }}>PC Wears Style Advisor</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className="max-w-[85%] px-3.5 py-2.5 rounded-lg text-sm whitespace-pre-wrap" style={m.role === "user" ? { background: GOLD, color: BLACK } : { background: CREAM, color: INK, border: `1px solid ${CREAM_DARK}` }}>{m.content}</div>
            </div>
          ))}
          {busy && <div className="flex justify-start"><div className="px-3.5 py-2.5 rounded-lg text-sm" style={{ background: CREAM, color: MUTED, border: `1px solid ${CREAM_DARK}` }}>Styling your look…</div></div>}
        </div>
        {messages.length <= 1 && (
          <div className="px-4 pb-2 flex flex-wrap gap-2">
            {prompts.map((p) => <button key={p} onClick={() => setInput(p)} className="text-xs px-3 py-1.5 rounded-full" style={{ border: `1px solid ${GOLD}`, color: GOLD }}>{p}</button>)}
          </div>
        )}
        <div className="p-3 flex gap-2 border-t" style={{ borderColor: CREAM_DARK }}>
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Ask about outfits, designs or colors…" className="flex-1 px-3 py-2.5 rounded-sm text-sm" style={{ background: CREAM, border: `1px solid ${CREAM_DARK}` }} />
          <GoldButton small onClick={send} disabled={busy}>Send</GoldButton>
        </div>
      </div>
      <p className="text-xs mt-3" style={{ color: MUTED }}>Tip: tell it the occasion, your colors and your skin tone for the best suggestions. For orders, message {WA_DISPLAY} on WhatsApp.</p>
    </div>
  );
}

/* ================= BLOG ================= */
function BlogPage({ posts, go }) {
  const sorted = [...posts].sort((a, b) => (a.date < b.date ? 1 : -1));
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <SectionTitle eyebrow="Style journal" title="PC Wears Blog" />
      {!sorted.length ? <p className="text-sm" style={{ color: MUTED }}>No posts yet. Add articles from the admin dashboard under the Blog tab.</p> :
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((p) => (
            <button key={p.id} onClick={() => go("post", p.id)} className="text-left flex flex-col rounded-sm overflow-hidden transition-transform hover:-translate-y-0.5" style={{ background: WHITE, border: `1px solid ${CREAM_DARK}` }}>
              <div className="aspect-[16/10] flex items-center justify-center text-5xl" style={{ background: `radial-gradient(circle at 30% 25%, ${NAVY_SOFT}, ${BLACK})` }}>{p.cover || "📝"}</div>
              <div className="p-4 flex-1 flex flex-col">
                <p className="text-[10px] uppercase tracking-widest" style={{ color: GOLD }}>{p.date}</p>
                <h3 className="mt-1 mb-1" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 19, lineHeight: 1.2 }}>{p.title}</h3>
                <p className="text-xs flex-1" style={{ color: MUTED }}>{p.excerpt}</p>
                <span className="mt-3 text-xs uppercase tracking-widest" style={{ color: GOLD }}>Read more →</span>
              </div>
            </button>
          ))}
        </div>}
    </div>
  );
}
function BlogPostPage({ posts, postId, go }) {
  const p = posts.find((x) => x.id === postId);
  if (!p) return <div className="max-w-3xl mx-auto px-4 py-16 text-center"><p>Post not found.</p><div className="mt-4"><GoldButton onClick={() => go("blog")}>Back to Blog</GoldButton></div></div>;
  const others = posts.filter((x) => x.id !== p.id).slice(0, 3);
  return (
    <article className="max-w-2xl mx-auto px-4 py-10">
      <button onClick={() => go("blog")} className="text-xs uppercase tracking-widest mb-6" style={{ color: GOLD }}>← Back to blog</button>
      <div className="aspect-[16/9] rounded-sm flex items-center justify-center text-6xl mb-6" style={{ background: `radial-gradient(circle at 30% 25%, ${NAVY_SOFT}, ${BLACK})` }}>{p.cover || "📝"}</div>
      <p className="text-[11px] uppercase tracking-[0.3em]" style={{ color: GOLD }}>{p.date}</p>
      <h1 className="mt-1 mb-5" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: "clamp(1.8rem,4vw,2.6rem)", lineHeight: 1.1 }}>{p.title}</h1>
      <div className="text-sm leading-relaxed space-y-4" style={{ color: "#4A453C" }}>
        {p.body.split("\n\n").map((para, i) => <p key={i}>{para}</p>)}
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <GoldButton onClick={() => go("shop")}>Shop the Look</GoldButton>
        <GoldButton outline onClick={() => go("stylist")}>Ask the Style Advisor</GoldButton>
      </div>
      {others.length > 0 && (
        <div className="mt-12">
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: GOLD }}>More from the journal</p>
          <div className="grid gap-2">
            {others.map((o) => <button key={o.id} onClick={() => go("post", o.id)} className="text-left p-3 rounded-sm" style={{ background: WHITE, border: `1px solid ${CREAM_DARK}` }}><span className="text-sm font-medium" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16 }}>{o.cover} {o.title}</span></button>)}
          </div>
        </div>
      )}
    </article>
  );
}

/* ================= ADMIN: BLOG ================= */
function AdminBlog({ posts, savePosts, showToast }) {
  const [editing, setEditing] = useState(null);
  if (editing) {
    return <BlogForm posts={posts} savePosts={savePosts} showToast={showToast} editing={editing === "new" ? null : editing} done={() => setEditing(null)} />;
  }
  const remove = (id) => { if (window.confirm("Delete this post?")) { savePosts(posts.filter((p) => p.id !== id)); showToast("Post deleted"); } };
  return (
    <div>
      <div className="flex justify-between items-center mb-4"><p className="text-sm" style={{ color: MUTED }}>{posts.length} posts</p><GoldButton small onClick={() => setEditing("new")}>+ New Post</GoldButton></div>
      <div className="grid gap-3">
        {posts.map((p) => (
          <div key={p.id} className="flex items-center gap-3 p-3 rounded-sm" style={{ background: WHITE, border: `1px solid ${CREAM_DARK}` }}>
            <span className="text-2xl">{p.cover || "📝"}</span>
            <div className="flex-1 min-w-0"><p className="font-medium text-sm truncate">{p.title}</p><p className="text-xs" style={{ color: MUTED }}>{p.date}</p></div>
            <GoldButton small outline onClick={() => setEditing(p)}>Edit</GoldButton>
            <button onClick={() => remove(p.id)} className="px-3 py-2 text-xs rounded-sm uppercase tracking-wider" style={{ border: "1.5px solid #C0392B", color: "#C0392B" }}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
function BlogForm({ posts, savePosts, showToast, editing, done }) {
  const [f, setF] = useState(editing || { title: "", date: todayISO(), cover: "📝", excerpt: "", body: "" });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const inputStyle = { background: WHITE, border: `1px solid ${CREAM_DARK}` };
  const save = () => {
    if (!f.title.trim() || !f.body.trim()) { showToast("Title and body are required"); return; }
    if (editing) savePosts(posts.map((p) => p.id === editing.id ? { ...f, id: editing.id } : p));
    else savePosts([{ ...f, id: uid() }, ...posts]);
    showToast(editing ? "Post updated" : "Post published"); done();
  };
  return (
    <div className="max-w-2xl">
      <button onClick={done} className="text-xs uppercase tracking-widest mb-4" style={{ color: GOLD }}>← Back to posts</button>
      <h2 className="mb-4" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 24 }}>{editing ? "Edit Post" : "New Post"}</h2>
      <div className="grid gap-3">
        <input value={f.title} onChange={set("title")} placeholder="Post title *" className="px-3 py-2.5 rounded-sm text-sm" style={inputStyle} />
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm"><span className="block text-xs uppercase tracking-widest mb-1" style={{ color: MUTED }}>Date</span><input type="date" value={f.date} onChange={set("date")} className="w-full px-3 py-2.5 rounded-sm text-sm" style={inputStyle} /></label>
          <label className="text-sm"><span className="block text-xs uppercase tracking-widest mb-1" style={{ color: MUTED }}>Cover emoji</span><input value={f.cover} onChange={set("cover")} placeholder="📝" className="w-full px-3 py-2.5 rounded-sm text-sm" style={inputStyle} /></label>
        </div>
        <textarea value={f.excerpt} onChange={set("excerpt")} rows={2} placeholder="Short excerpt (shown on the blog list)" className="px-3 py-2.5 rounded-sm text-sm" style={inputStyle} />
        <textarea value={f.body} onChange={set("body")} rows={8} placeholder="Write your post. Leave a blank line between paragraphs." className="px-3 py-2.5 rounded-sm text-sm" style={inputStyle} />
        <div className="flex gap-3"><GoldButton onClick={save}>{editing ? "Save Changes" : "Publish Post"}</GoldButton><GoldButton outline onClick={done}>Cancel</GoldButton></div>
      </div>
    </div>
  );
}

/* ================= PUBLIC: MEET OUR TEAM ================= */
function TeamPage({ team }) {
  const visible = (team || []).filter((m) => m.active !== false);
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <SectionTitle eyebrow="The people behind the brand" title="Meet Our Team" />
      <p className="text-sm mb-8 -mt-2" style={{ color: MUTED }}>A dedicated team crafting quality, style and service at PC Wears.</p>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {visible.map((m) => (
          <div key={m.id} className="rounded-sm overflow-hidden flex flex-col" style={{ background: WHITE, border: `1px solid ${CREAM_DARK}` }}>
            <div className="aspect-square flex items-center justify-center" style={{ background: `radial-gradient(circle at 30% 25%, ${NAVY_SOFT}, ${BLACK})` }}>
              {m.image ? <img src={m.image} alt={m.name} className="w-full h-full object-cover" /> : <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 44, color: GOLD }}>{m.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}</span>}
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 19, lineHeight: 1.15 }}>{m.name}</h3>
              <p className="text-[11px] uppercase tracking-widest mt-0.5" style={{ color: GOLD }}>{m.role}</p>
              <p className="text-xs mt-2 flex-1" style={{ color: MUTED }}>{m.bio}</p>
              <div className="flex gap-2 mt-3">
                {m.phone && <a href={waLink(`Hello ${m.name} at PC Wears.`)} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full flex items-center justify-center" style={{ border: `1px solid ${GOLD}55` }} aria-label="WhatsApp"><WaIcon size={15} color={GOLD} /></a>}
                {m.social && <a href={m.social} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full flex items-center justify-center text-xs" style={{ border: `1px solid ${GOLD}55`, color: GOLD }} aria-label="Social">@</a>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= ADMIN: DASHBOARD SUMMARY ================= */
function StatCard({ label, value, accent }) {
  return (
    <div className="p-4 rounded-sm" style={{ background: NAVY, color: CREAM }}>
      <p className="text-2xl font-semibold" style={{ color: accent || GOLD }}>{value}</p>
      <p className="text-[10px] uppercase tracking-widest mt-0.5" style={{ color: MUTED }}>{label}</p>
    </div>
  );
}
function AdminSummary({ customers, orders, setTab }) {
  const now = new Date();
  const byStatus = (s) => orders.filter((o) => (o.status || "pending") === s).length;
  const totalSales = orders.reduce((s, o) => s + orderTotal(o), 0);
  const totalPaid = orders.reduce((s, o) => s + orderPaid(o), 0);
  const outstanding = orders.reduce((s, o) => s + orderBalance(o), 0);
  const depositsToday = orders.reduce((s, o) => s + ((o.payments || []).filter((p) => p.date === todayISO()).reduce((a, p) => a + Number(p.amount || 0), 0)), 0);
  const within7 = (d) => { if (!d) return false; const diff = (new Date(d) - now) / 86400000; return diff >= -0.5 && diff <= 7; };
  const dueThisWeek = orders.filter((o) => within7(o.deliveryDate) && o.status !== "delivered" && o.status !== "cancelled").length;
  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
        <StatCard label="Total customers" value={customers.length} />
        <StatCard label="Total orders" value={orders.length} />
        <StatCard label="Pending" value={byStatus("pending")} />
        <StatCard label="In progress" value={byStatus("in_progress")} accent="#5DADE2" />
        <StatCard label="Ready" value={byStatus("ready")} accent="#BB8FCE" />
        <StatCard label="Delivered" value={byStatus("delivered")} accent="#7DCEA0" />
        <StatCard label="Due this week" value={dueThisWeek} accent="#F1948A" />
        <StatCard label="Deposits today" value={fmtLe(depositsToday)} />
      </div>
      <div className="grid sm:grid-cols-3 gap-3 mb-6">
        <div className="p-5 rounded-sm" style={{ background: WHITE, border: `1px solid ${CREAM_DARK}` }}><p className="text-xs uppercase tracking-widest" style={{ color: MUTED }}>Total sales</p><p className="text-2xl font-semibold mt-1">{fmtLe(totalSales)}</p></div>
        <div className="p-5 rounded-sm" style={{ background: WHITE, border: `1px solid ${CREAM_DARK}` }}><p className="text-xs uppercase tracking-widest" style={{ color: MUTED }}>Amount paid</p><p className="text-2xl font-semibold mt-1" style={{ color: "#2E7D32" }}>{fmtLe(totalPaid)}</p></div>
        <div className="p-5 rounded-sm" style={{ background: WHITE, border: `1px solid ${CREAM_DARK}` }}><p className="text-xs uppercase tracking-widest" style={{ color: MUTED }}>Outstanding balance</p><p className="text-2xl font-semibold mt-1" style={{ color: "#C0392B" }}>{fmtLe(outstanding)}</p></div>
      </div>
      <div className="flex flex-wrap gap-3"><GoldButton small onClick={() => setTab("customers")}>Manage Customers</GoldButton><GoldButton small outline onClick={() => setTab("orders")}>Manage Orders</GoldButton></div>
    </div>
  );
}

/* ================= ADMIN: CUSTOMERS ================= */
function AdminCustomers({ customers, saveCustomers, orders, showToast, readOnly }) {
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  if (editing) return <CustomerForm customers={customers} saveCustomers={saveCustomers} showToast={showToast} editing={editing === "new" ? null : editing} done={() => setEditing(null)} />;
  const list = customers.filter((c) => (c.name + " " + c.phone + " " + (c.email || "")).toLowerCase().includes(search.toLowerCase()));
  const remove = (id) => { if (window.confirm("Delete this customer?")) { saveCustomers(customers.filter((c) => c.id !== id)); showToast("Customer deleted"); } };
  const exportCsv = () => {
    const rows = [["Name","Phone","Email","Gender","Address","Added","Note"], ...customers.map((c) => [c.name, c.phone, c.email, c.gender, c.address, c.createdAt, c.note])];
    downloadCSV("pcwears-customers.csv", rows);
  };
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, phone, email…" className="flex-1 min-w-[180px] px-3 py-2.5 rounded-sm text-sm" style={{ background: WHITE, border: `1px solid ${CREAM_DARK}` }} />
        <GoldButton small outline onClick={exportCsv}>Export CSV</GoldButton>
        {!readOnly && <GoldButton small onClick={() => setEditing("new")}>+ Add Customer</GoldButton>}
      </div>
      {!list.length && <p className="text-sm py-8 text-center" style={{ color: MUTED }}>No customers yet. Add your first customer to start keeping records.</p>}
      <div className="grid gap-3">
        {list.map((c) => {
          const cOrders = orders.filter((o) => o.customerId === c.id);
          const owed = cOrders.reduce((s, o) => s + orderBalance(o), 0);
          return (
            <div key={c.id} className="p-4 rounded-sm" style={{ background: WHITE, border: `1px solid ${CREAM_DARK}` }}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex-1 min-w-[180px]">
                  <p className="font-medium text-sm">{c.name} <span style={{ color: MUTED }}>· {c.phone}</span></p>
                  <p className="text-xs mt-0.5" style={{ color: MUTED }}>{[c.gender, c.email, c.address].filter(Boolean).join(" · ")}</p>
                  <p className="text-xs mt-1" style={{ color: MUTED }}>{cOrders.length} order{cOrders.length !== 1 ? "s" : ""}{owed > 0 ? ` · ${fmtLe(owed)} outstanding` : ""}{c.gender ? "" : ""}</p>
                  {c.note && <p className="text-xs mt-1 italic" style={{ color: MUTED }}>{c.note}</p>}
                  {c.measurements && Object.keys(c.measurements).length > 0 && <p className="text-[11px] mt-1" style={{ color: GOLD }}>Measurements on file ✓</p>}
                </div>
                {!readOnly && <div className="flex gap-2"><GoldButton small outline onClick={() => setEditing(c)}>Edit</GoldButton><button onClick={() => remove(c.id)} className="px-3 py-2 text-xs rounded-sm uppercase tracking-wider" style={{ border: "1.5px solid #C0392B", color: "#C0392B" }}>Delete</button></div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
function CustomerForm({ customers, saveCustomers, showToast, editing, done }) {
  const [f, setF] = useState(editing || { name: "", phone: "", email: "", address: "", gender: "Male", note: "", measurements: {}, refImage: null });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const setM = (k) => (e) => setF({ ...f, measurements: { ...f.measurements, [k]: e.target.value } });
  const inputStyle = { background: WHITE, border: `1px solid ${CREAM_DARK}` };
  const fields = f.gender === "Female" ? WOMEN_MEASURE : MEN_MEASURE;
  const handleImage = async (e) => { const file = e.target.files?.[0]; if (!file) return; try { setF({ ...f, refImage: await resizeImage(file, 600) }); showToast("Image attached"); } catch { showToast("Could not read image"); } };
  const save = () => {
    if (!f.name.trim() || !f.phone.trim()) { showToast("Name and phone are required"); return; }
    if (editing) saveCustomers(customers.map((c) => c.id === editing.id ? { ...f, id: editing.id } : c));
    else saveCustomers([{ ...f, id: uid(), createdAt: todayISO() }, ...customers]);
    showToast(editing ? "Customer updated" : "Customer added"); done();
  };
  return (
    <div className="max-w-2xl">
      <button onClick={done} className="text-xs uppercase tracking-widest mb-4" style={{ color: GOLD }}>← Back to customers</button>
      <h2 className="mb-4" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 24 }}>{editing ? "Edit Customer" : "Add Customer"}</h2>
      <div className="grid gap-3">
        <div className="grid sm:grid-cols-2 gap-3"><input value={f.name} onChange={set("name")} placeholder="Full name *" className="px-3 py-2.5 rounded-sm text-sm" style={inputStyle} /><input value={f.phone} onChange={set("phone")} placeholder="Phone / WhatsApp *" className="px-3 py-2.5 rounded-sm text-sm" style={inputStyle} /></div>
        <div className="grid sm:grid-cols-2 gap-3"><input value={f.email} onChange={set("email")} placeholder="Email (optional)" className="px-3 py-2.5 rounded-sm text-sm" style={inputStyle} /><select value={f.gender} onChange={set("gender")} className="px-3 py-2.5 rounded-sm text-sm" style={inputStyle}><option>Male</option><option>Female</option><option>Other</option></select></div>
        <input value={f.address} onChange={set("address")} placeholder="Address / delivery location" className="px-3 py-2.5 rounded-sm text-sm" style={inputStyle} />
        <textarea value={f.note} onChange={set("note")} rows={2} placeholder="Customer note" className="px-3 py-2.5 rounded-sm text-sm" style={inputStyle} />
        <div className="p-4 rounded-sm" style={{ background: WHITE, border: `1px solid ${CREAM_DARK}` }}>
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: GOLD }}>{f.gender === "Female" ? "Women's" : "Men's"} measurements</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {fields.map((m) => <input key={m} value={f.measurements?.[m] || ""} onChange={setM(m)} placeholder={m} className="px-2.5 py-2 rounded-sm text-sm" style={inputStyle} />)}
          </div>
          <textarea value={f.measurements?.["Extra note"] || ""} onChange={setM("Extra note")} rows={2} placeholder="Extra tailoring note" className="mt-2 w-full px-2.5 py-2 rounded-sm text-sm" style={inputStyle} />
        </div>
        <label className="text-sm"><span className="block text-xs uppercase tracking-widest mb-1" style={{ color: MUTED }}>Reference style image (optional)</span><input type="file" accept="image/*" onChange={handleImage} className="w-full text-sm" />{f.refImage && <img src={f.refImage} alt="Reference" className="mt-2 h-28 rounded-sm object-cover" />}</label>
        <div className="flex gap-3"><GoldButton onClick={save}>{editing ? "Save Changes" : "Add Customer"}</GoldButton><GoldButton outline onClick={done}>Cancel</GoldButton></div>
      </div>
    </div>
  );
}

/* ================= ADMIN: TEAM ================= */
function AdminTeam({ team, saveTeam, showToast }) {
  const [editing, setEditing] = useState(null);
  if (editing) return <TeamForm team={team} saveTeam={saveTeam} showToast={showToast} editing={editing === "new" ? null : editing} done={() => setEditing(null)} />;
  const remove = (id) => { if (window.confirm("Delete this team member?")) { saveTeam(team.filter((t) => t.id !== id)); showToast("Removed"); } };
  const toggle = (id) => saveTeam(team.map((t) => t.id === id ? { ...t, active: !(t.active !== false) } : t));
  const move = (i, dir) => { const j = i + dir; if (j < 0 || j >= team.length) return; const n = [...team]; [n[i], n[j]] = [n[j], n[i]]; saveTeam(n); };
  return (
    <div>
      <div className="flex justify-between items-center mb-4"><p className="text-sm" style={{ color: MUTED }}>{team.length} members · shown on the public Team page</p><GoldButton small onClick={() => setEditing("new")}>+ Add Member</GoldButton></div>
      <div className="grid gap-3">
        {team.map((t, i) => (
          <div key={t.id} className="flex flex-wrap items-center gap-3 p-3 rounded-sm" style={{ background: WHITE, border: `1px solid ${CREAM_DARK}` }}>
            <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 flex items-center justify-center" style={{ background: NAVY_SOFT, color: GOLD, fontWeight: 700 }}>{t.image ? <img src={t.image} alt={t.name} className="w-full h-full object-cover" /> : t.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}</div>
            <div className="flex-1 min-w-[150px]"><p className="font-medium text-sm">{t.name}</p><p className="text-xs" style={{ color: MUTED }}>{t.role}</p></div>
            <div className="flex items-center gap-1">
              <button onClick={() => move(i, -1)} className="px-2 py-1 text-xs rounded-sm" style={{ border: `1px solid ${CREAM_DARK}` }} aria-label="Move up">↑</button>
              <button onClick={() => move(i, 1)} className="px-2 py-1 text-xs rounded-sm" style={{ border: `1px solid ${CREAM_DARK}` }} aria-label="Move down">↓</button>
            </div>
            <button onClick={() => toggle(t.id)} className="px-2 py-1 rounded-sm text-[10px] uppercase tracking-wider" style={{ background: t.active !== false ? "#2E7D32" : CREAM_DARK, color: t.active !== false ? WHITE : MUTED }}>{t.active !== false ? "Visible" : "Hidden"}</button>
            <GoldButton small outline onClick={() => setEditing(t)}>Edit</GoldButton>
            <button onClick={() => remove(t.id)} className="px-3 py-2 text-xs rounded-sm uppercase tracking-wider" style={{ border: "1.5px solid #C0392B", color: "#C0392B" }}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
function TeamForm({ team, saveTeam, showToast, editing, done }) {
  const [f, setF] = useState(editing || { name: "", role: "", bio: "", phone: "", email: "", social: "", image: null, active: true });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const inputStyle = { background: WHITE, border: `1px solid ${CREAM_DARK}` };
  const handleImage = async (e) => { const file = e.target.files?.[0]; if (!file) return; try { setF({ ...f, image: await resizeImage(file, 500) }); showToast("Image added"); } catch { showToast("Could not read image"); } };
  const save = () => {
    if (!f.name.trim() || !f.role.trim()) { showToast("Name and role are required"); return; }
    if (editing) saveTeam(team.map((t) => t.id === editing.id ? { ...f, id: editing.id } : t));
    else saveTeam([...team, { ...f, id: uid() }]);
    showToast(editing ? "Updated" : "Member added"); done();
  };
  return (
    <div className="max-w-2xl">
      <button onClick={done} className="text-xs uppercase tracking-widest mb-4" style={{ color: GOLD }}>← Back to team</button>
      <h2 className="mb-4" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 24 }}>{editing ? "Edit Member" : "Add Member"}</h2>
      <div className="grid gap-3">
        <div className="grid sm:grid-cols-2 gap-3"><input value={f.name} onChange={set("name")} placeholder="Full name *" className="px-3 py-2.5 rounded-sm text-sm" style={inputStyle} /><input value={f.role} onChange={set("role")} placeholder="Position / title *" className="px-3 py-2.5 rounded-sm text-sm" style={inputStyle} /></div>
        <textarea value={f.bio} onChange={set("bio")} rows={3} placeholder="Short biography" className="px-3 py-2.5 rounded-sm text-sm" style={inputStyle} />
        <div className="grid sm:grid-cols-2 gap-3"><input value={f.phone} onChange={set("phone")} placeholder="WhatsApp number (digits, e.g. 23279...)" className="px-3 py-2.5 rounded-sm text-sm" style={inputStyle} /><input value={f.email} onChange={set("email")} placeholder="Email" className="px-3 py-2.5 rounded-sm text-sm" style={inputStyle} /></div>
        <input value={f.social} onChange={set("social")} placeholder="Social media link (optional)" className="px-3 py-2.5 rounded-sm text-sm" style={inputStyle} />
        <label className="text-sm"><span className="block text-xs uppercase tracking-widest mb-1" style={{ color: MUTED }}>Profile image</span><input type="file" accept="image/*" onChange={handleImage} className="w-full text-sm" />{f.image && <img src={f.image} alt="Preview" className="mt-2 h-24 w-24 rounded-full object-cover" />}</label>
        <div className="flex gap-3"><GoldButton onClick={save}>{editing ? "Save Changes" : "Add Member"}</GoldButton><GoldButton outline onClick={done}>Cancel</GoldButton></div>
      </div>
    </div>
  );
}

/* ================= ADMIN: STAFF (roles) ================= */
function AdminStaff({ staff, saveStaff, showToast }) {
  const [f, setF] = useState({ name: "", role: "sales", passcode: "" });
  const inputStyle = { background: WHITE, border: `1px solid ${CREAM_DARK}` };
  const add = () => {
    if (!f.name.trim() || !f.passcode.trim()) { showToast("Name and passcode required"); return; }
    if (f.passcode.trim().length < 4) { showToast("Passcode should be at least 4 characters"); return; }
    saveStaff([...staff, { ...f, id: uid(), active: true }]); setF({ name: "", role: "sales", passcode: "" }); showToast("Staff added");
  };
  const remove = (id) => { if (window.confirm("Remove this staff login?")) saveStaff(staff.filter((s) => s.id !== id)); };
  const toggle = (id) => saveStaff(staff.map((s) => s.id === id ? { ...s, active: !(s.active !== false) } : s));
  return (
    <div className="max-w-2xl">
      <p className="text-sm mb-4" style={{ color: MUTED }}>Create logins for your team. Each staff member logs in with their passcode and only sees what their role allows. The Owner always uses the admin password.</p>
      <div className="p-4 rounded-sm mb-5 grid sm:grid-cols-4 gap-2 items-end" style={{ background: WHITE, border: `1px solid ${CREAM_DARK}` }}>
        <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Staff name" className="px-3 py-2.5 rounded-sm text-sm" style={inputStyle} />
        <select value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })} className="px-3 py-2.5 rounded-sm text-sm" style={inputStyle}>
          {Object.entries(ROLES).filter(([k]) => k !== "owner").map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <input value={f.passcode} onChange={(e) => setF({ ...f, passcode: e.target.value })} placeholder="Passcode" className="px-3 py-2.5 rounded-sm text-sm" style={inputStyle} />
        <GoldButton small onClick={add}>Add Staff</GoldButton>
      </div>
      <div className="grid gap-2">
        {!staff.length && <p className="text-sm" style={{ color: MUTED }}>No staff logins yet.</p>}
        {staff.map((s) => (
          <div key={s.id} className="flex items-center gap-3 p-3 rounded-sm" style={{ background: WHITE, border: `1px solid ${CREAM_DARK}` }}>
            <div className="flex-1"><p className="font-medium text-sm">{s.name}</p><p className="text-xs" style={{ color: MUTED }}>{(ROLES[s.role] || {}).label} · passcode: {s.passcode}</p></div>
            <button onClick={() => toggle(s.id)} className="px-2 py-1 rounded-sm text-[10px] uppercase tracking-wider" style={{ background: s.active !== false ? "#2E7D32" : CREAM_DARK, color: s.active !== false ? WHITE : MUTED }}>{s.active !== false ? "Active" : "Disabled"}</button>
            <button onClick={() => remove(s.id)} className="px-3 py-2 text-xs rounded-sm uppercase tracking-wider" style={{ border: "1.5px solid #C0392B", color: "#C0392B" }}>Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= ADMIN: INVENTORY (fabric stock) ================= */
function AdminInventory({ fabrics, saveFabrics, products, showToast }) {
  const [f, setF] = useState({ name: "", color: "", qty: "", unit: "yards" });
  const inputStyle = { background: WHITE, border: `1px solid ${CREAM_DARK}` };
  const add = () => { if (!f.name.trim()) { showToast("Fabric name required"); return; } saveFabrics([{ ...f, id: uid(), qty: Number(f.qty) || 0 }, ...fabrics]); setF({ name: "", color: "", qty: "", unit: "yards" }); showToast("Fabric added"); };
  const adjust = (id, d) => saveFabrics(fabrics.map((x) => x.id === id ? { ...x, qty: Math.max(0, Number(x.qty) + d) } : x));
  const remove = (id) => saveFabrics(fabrics.filter((x) => x.id !== id));
  const lowStock = products.filter((p) => p.stock === "sold_out").length;
  return (
    <div className="max-w-3xl">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
        <StatCard label="Fabric records" value={fabrics.length} />
        <StatCard label="Products" value={products.length} />
        <StatCard label="Sold-out products" value={lowStock} accent="#F1948A" />
      </div>
      <p className="text-sm mb-2" style={{ color: GOLD }}>Fabric stock</p>
      <div className="p-4 rounded-sm mb-4 grid sm:grid-cols-5 gap-2 items-end" style={{ background: WHITE, border: `1px solid ${CREAM_DARK}` }}>
        <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Fabric name" className="px-3 py-2.5 rounded-sm text-sm sm:col-span-2" style={inputStyle} />
        <input value={f.color} onChange={(e) => setF({ ...f, color: e.target.value })} placeholder="Color" className="px-3 py-2.5 rounded-sm text-sm" style={inputStyle} />
        <input type="number" value={f.qty} onChange={(e) => setF({ ...f, qty: e.target.value })} placeholder="Qty" className="px-3 py-2.5 rounded-sm text-sm" style={inputStyle} />
        <GoldButton small onClick={add}>Add</GoldButton>
      </div>
      <div className="grid gap-2">
        {!fabrics.length && <p className="text-sm" style={{ color: MUTED }}>No fabric stock recorded yet. Product stock status is managed under the Products tab.</p>}
        {fabrics.map((x) => (
          <div key={x.id} className="flex items-center gap-3 p-3 rounded-sm" style={{ background: WHITE, border: `1px solid ${CREAM_DARK}` }}>
            <div className="flex-1"><p className="font-medium text-sm">{x.name}{x.color ? ` · ${x.color}` : ""}</p><p className="text-xs" style={{ color: x.qty <= 2 ? "#C0392B" : MUTED }}>{x.qty} {x.unit} in stock{x.qty <= 2 ? " · low!" : ""}</p></div>
            <div className="inline-flex items-center rounded-sm" style={{ border: `1px solid ${CREAM_DARK}` }}><button onClick={() => adjust(x.id, -1)} className="px-3 py-1.5" aria-label="Decrease">−</button><span className="px-2 text-sm">{x.qty}</span><button onClick={() => adjust(x.id, 1)} className="px-3 py-1.5" aria-label="Increase">+</button></div>
            <button onClick={() => remove(x.id)} className="px-3 py-2 text-xs rounded-sm uppercase tracking-wider" style={{ border: "1.5px solid #C0392B", color: "#C0392B" }}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
