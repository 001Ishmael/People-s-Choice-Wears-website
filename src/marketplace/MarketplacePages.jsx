import { useState, useEffect } from "react";
import { GOLD, GOLD_LIGHT, BLACK, INK, NAVY, CREAM, CREAM_DARK, MUTED, WHITE, fmtLe, waLink } from "../lib/theme.js";
import { isSupabase } from "../lib/supabase.js";
import { listMarketplaceProducts, listMarketplaceVendors, getVendorBySlug, listFabrics } from "../lib/marketplace.js";

/* ---------- shared bits ---------- */
function Hero({ eyebrow, title, sub }) {
  return (
    <section style={{ background: `radial-gradient(ellipse at 70% 10%, ${NAVY} 0%, transparent 55%), ${BLACK}` }}>
      <div className="max-w-5xl mx-auto px-4 py-12 text-center">
        <p className="text-xs uppercase tracking-[0.35em]" style={{ color: GOLD }}>{eyebrow}</p>
        <h1 className="mt-3" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: "clamp(1.9rem,5vw,3rem)", color: CREAM }}>{title}</h1>
        {sub && <p className="mt-3 mx-auto max-w-xl text-sm" style={{ color: "#C2BAA9" }}>{sub}</p>}
      </div>
    </section>
  );
}
const STOCK_LABEL = { available: "In stock", low_stock: "Low stock", out_of_stock: "Out of stock" };
const STOCK_COLOR = { available: "#2E7D32", low_stock: "#B8860B", out_of_stock: "#C0392B" };
function Badge({ children, bg = GOLD, color = BLACK }) {
  return <span style={{ background: bg, color, fontSize: 10, padding: "2px 8px", borderRadius: 999, letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 600 }}>{children}</span>;
}
function Empty({ children }) { return <p className="text-center py-16 text-sm" style={{ color: MUTED }}>{children}</p>; }
function Loading() { return <p className="text-center py-16 text-sm" style={{ color: MUTED }}>Loading…</p>; }
function NotConnected() { return <Empty>The marketplace database isn’t connected yet.</Empty>; }

/* ---------- /marketplace ---------- */
export function MarketplacePage({ go }) {
  const [items, setItems] = useState(null);
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  useEffect(() => {
    if (!isSupabase) { setItems([]); return; }
    let on = true; setItems(null);
    listMarketplaceProducts({ search: q }).then((d) => on && setItems(d)).catch(() => on && setItems([]));
    return () => { on = false; };
  }, [q]);

  return (
    <div>
      <Hero eyebrow="People’s Choice Marketplace" title="Shop from our vendors" sub="Discover clothing, accessories and more from approved fashion businesses across Sierra Leone." />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-2 mb-6">
          <input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && setQ(search)} placeholder="Search products…" className="flex-1 px-3 py-2.5 rounded-sm text-sm" style={{ background: WHITE, border: `1px solid ${CREAM_DARK}` }} />
          <button onClick={() => setQ(search)} className="px-5 py-2.5 rounded-sm text-sm font-medium" style={{ background: GOLD, color: BLACK }}>Search</button>
        </div>
        {!isSupabase ? <NotConnected /> : items === null ? <Loading /> : !items.length ? <Empty>No products yet. Check back soon — our vendors are adding their collections.</Empty> : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ p }) {
  const v = p.vendor || {};
  const img = (p.images && p.images[0]) || null;
  const wa = v.whatsapp || v.phone;
  return (
    <div className="rounded-sm overflow-hidden flex flex-col" style={{ background: WHITE, border: `1px solid ${CREAM_DARK}` }}>
      <div className="relative" style={{ aspectRatio: "1/1", background: CREAM }}>
        {img ? <img src={img} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center" style={{ color: MUTED }}>No image</div>}
        <div className="absolute top-2 left-2 flex gap-1">{p.is_featured && <Badge>Featured</Badge>}</div>
      </div>
      <div className="p-3 flex flex-col gap-1 flex-1">
        <p className="text-sm font-medium leading-tight" style={{ color: INK }}>{p.name}</p>
        <p className="text-xs flex items-center gap-1" style={{ color: MUTED }}>{v.business_name}{v.is_verified && <span title="Verified" style={{ color: GOLD }}>✔</span>}</p>
        <p className="text-sm font-semibold" style={{ color: INK }}>{fmtLe(p.price)}</p>
        <span style={{ fontSize: 11, color: STOCK_COLOR[p.stock_status] }}>{STOCK_LABEL[p.stock_status]}</span>
        {wa && <a href={waLink(`Hello ${v.business_name}, I'm interested in "${p.name}" (${fmtLe(p.price)}) on People's Choice Marketplace.`)} target="_blank" rel="noreferrer" className="mt-1 text-center px-3 py-2 rounded-sm text-xs font-medium" style={{ background: "#25D366", color: "#fff" }}>WhatsApp vendor</a>}
      </div>
    </div>
  );
}

/* ---------- /vendors ---------- */
export function VendorsPage({ go }) {
  const [vendors, setVendors] = useState(null);
  useEffect(() => {
    if (!isSupabase) { setVendors([]); return; }
    let on = true; listMarketplaceVendors().then((d) => on && setVendors(d)).catch(() => on && setVendors([]));
    return () => { on = false; };
  }, []);
  return (
    <div>
      <Hero eyebrow="Our Vendors" title="Fashion businesses on People’s Choice" sub="Verified clothing brands, boutiques, tailors, designers and fabric stores." />
      <div className="max-w-6xl mx-auto px-4 py-8">
        {!isSupabase ? <NotConnected /> : vendors === null ? <Loading /> : !vendors.length ? <Empty>No vendors yet.</Empty> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {vendors.map((v) => (
              <button key={v.id} onClick={() => go("vendor", v.slug)} className="text-left rounded-sm overflow-hidden" style={{ background: WHITE, border: `1px solid ${CREAM_DARK}` }}>
                <div style={{ height: 90, background: v.cover_image_url ? `center/cover url(${v.cover_image_url})` : NAVY }} />
                <div className="p-4 flex items-center gap-3">
                  <div style={{ width: 48, height: 48, borderRadius: 8, background: CREAM, flexShrink: 0, overflow: "hidden" }}>
                    {v.logo_url && <img src={v.logo_url} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium flex items-center gap-1" style={{ color: INK }}>{v.business_name}{v.is_verified && <span style={{ color: GOLD }}>✔</span>}</p>
                    <p className="text-xs" style={{ color: MUTED }}>{(v.vendor_type || "").replace(/_/g, " ")}{v.location ? ` · ${v.location}` : ""}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- /vendor/:slug ---------- */
export function VendorProfilePage({ slug, go }) {
  const [data, setData] = useState(undefined);
  useEffect(() => {
    if (!isSupabase || !slug) { setData(null); return; }
    let on = true; setData(undefined);
    getVendorBySlug(slug).then((d) => on && setData(d)).catch(() => on && setData(null));
    return () => { on = false; };
  }, [slug]);

  if (!isSupabase) return <NotConnected />;
  if (data === undefined) return <Loading />;
  if (!data) return <div className="max-w-3xl mx-auto px-4 py-16 text-center"><Empty>Shop not found.</Empty><button onClick={() => go("vendors")} className="text-sm" style={{ color: GOLD }}>← All vendors</button></div>;
  const { vendor: v, products, fabrics } = data;
  const wa = v.whatsapp || v.phone;
  return (
    <div>
      <div style={{ height: 180, background: v.cover_image_url ? `center/cover url(${v.cover_image_url})` : `radial-gradient(ellipse at 50% 0,${NAVY},${BLACK})` }} />
      <div className="max-w-6xl mx-auto px-4">
        <div className="-mt-10 flex items-end gap-4">
          <div style={{ width: 88, height: 88, borderRadius: 12, background: WHITE, border: `2px solid ${GOLD}`, overflow: "hidden", flexShrink: 0 }}>
            {v.logo_url && <img src={v.logo_url} alt="" className="w-full h-full object-cover" />}
          </div>
          <div className="pb-1">
            <h1 className="flex items-center gap-2" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 26, color: INK }}>{v.business_name}{v.is_verified && <Badge>Verified</Badge>}</h1>
            <p className="text-xs" style={{ color: MUTED }}>{(v.vendor_type || "").replace(/_/g, " ")}{v.location ? ` · ${v.location}` : ""}</p>
          </div>
        </div>
        {v.description && <p className="mt-4 text-sm max-w-2xl" style={{ color: INK }}>{v.description}</p>}
        <div className="mt-3 flex gap-2">
          {wa && <a href={waLink(`Hello ${v.business_name}, I found your shop on People's Choice.`)} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-sm text-xs font-medium" style={{ background: "#25D366", color: "#fff" }}>WhatsApp</a>}
          {v.phone && <a href={`tel:${v.phone}`} className="px-4 py-2 rounded-sm text-xs font-medium" style={{ background: INK, color: WHITE }}>Call</a>}
        </div>

        <h2 className="mt-8 mb-3" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 20, color: INK }}>Products</h2>
        {!products.length ? <Empty>No products yet.</Empty> : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => <ProductCard key={p.id} p={{ ...p, vendor: v }} />)}
          </div>
        )}

        {fabrics.length > 0 && (<>
          <h2 className="mt-10 mb-3" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 20, color: INK }}>Fabrics</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{fabrics.map((p) => <FabricCard key={p.id} p={{ ...p, vendor: v }} />)}</div>
        </>)}
        <div className="py-10"><button onClick={() => go("vendors")} className="text-sm" style={{ color: GOLD }}>← All vendors</button></div>
      </div>
    </div>
  );
}

/* ---------- /fabrics ---------- */
function FabricCard({ p }) {
  const v = p.vendor || {};
  const img = (p.images && p.images[0]) || null;
  const wa = v.whatsapp || v.phone;
  const price = p.price_per_yard ? `${fmtLe(p.price_per_yard)}/yd` : p.retail_price ? fmtLe(p.retail_price) : "Ask price";
  return (
    <div className="rounded-sm overflow-hidden flex flex-col" style={{ background: WHITE, border: `1px solid ${CREAM_DARK}` }}>
      <div style={{ aspectRatio: "1/1", background: CREAM }}>{img ? <img src={img} alt={p.fabric_name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center" style={{ color: MUTED }}>No image</div>}</div>
      <div className="p-3 flex flex-col gap-1 flex-1">
        <p className="text-sm font-medium leading-tight" style={{ color: INK }}>{p.fabric_name}</p>
        <p className="text-xs" style={{ color: MUTED }}>{[p.fabric_type, p.color].filter(Boolean).join(" · ")}</p>
        <p className="text-sm font-semibold" style={{ color: INK }}>{price}</p>
        <p className="text-[11px]" style={{ color: MUTED }}>{v.business_name}{v.is_verified && <span style={{ color: GOLD }}> ✔</span>}</p>
        {wa && <a href={waLink(`Hello ${v.business_name}, I'm interested in your fabric "${p.fabric_name}" on People's Choice.`)} target="_blank" rel="noreferrer" className="mt-1 text-center px-3 py-2 rounded-sm text-xs font-medium" style={{ background: "#25D366", color: "#fff" }}>WhatsApp</a>}
      </div>
    </div>
  );
}
export function FabricsPage({ go }) {
  const [items, setItems] = useState(null);
  const [search, setSearch] = useState(""); const [q, setQ] = useState("");
  useEffect(() => {
    if (!isSupabase) { setItems([]); return; }
    let on = true; setItems(null);
    listFabrics({ search: q }).then((d) => on && setItems(d)).catch(() => on && setItems([]));
    return () => { on = false; };
  }, [q]);
  return (
    <div>
      <Hero eyebrow="Fabric Marketplace" title="Fabrics & tailoring materials" sub="Buy fabrics by the yard from trusted suppliers — then request custom tailoring." />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-2 mb-6">
          <input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && setQ(search)} placeholder="Search fabrics…" className="flex-1 px-3 py-2.5 rounded-sm text-sm" style={{ background: WHITE, border: `1px solid ${CREAM_DARK}` }} />
          <button onClick={() => setQ(search)} className="px-5 py-2.5 rounded-sm text-sm font-medium" style={{ background: GOLD, color: BLACK }}>Search</button>
        </div>
        {!isSupabase ? <NotConnected /> : items === null ? <Loading /> : !items.length ? <Empty>No fabrics listed yet.</Empty> : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{items.map((p) => <FabricCard key={p.id} p={p} />)}</div>
        )}
      </div>
    </div>
  );
}

/* ---------- /pricing/vendor-plans ---------- */
const PLANS = [
  { name: "Free Trial", price: "Free", limit: "5 products", perks: ["Basic marketplace listing", "WhatsApp contact button"] },
  { name: "Starter", price: "Le 150 / mo", limit: "10 products", perks: ["Basic listing", "WhatsApp contact button"] },
  { name: "Business", price: "Le 400 / mo", limit: "30 products", perks: ["Better visibility", "Stock management", "Inquiry tracking"] },
  { name: "Premium", price: "Le 900 / mo", limit: "Unlimited*", perks: ["Featured badge eligible", "Priority listing", "Homepage promotion eligible", "Advanced dashboard"] },
];
export function VendorPlansPage({ go }) {
  return (
    <div>
      <Hero eyebrow="Vendor Plans" title="Choose your plan" sub="Start free. Upgrade any time as your shop grows. Prices are indicative — confirm on WhatsApp." />
      <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PLANS.map((p) => (
          <div key={p.name} className="rounded-sm p-5 flex flex-col" style={{ background: WHITE, border: `1px solid ${CREAM_DARK}` }}>
            <p className="text-xs uppercase tracking-widest" style={{ color: GOLD }}>{p.name}</p>
            <p className="mt-2" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 24, color: INK }}>{p.price}</p>
            <p className="text-xs mb-3" style={{ color: MUTED }}>{p.limit}</p>
            <ul className="text-xs space-y-1 flex-1" style={{ color: INK }}>{p.perks.map((x) => <li key={x}>• {x}</li>)}</ul>
            <button onClick={() => go("vendorRegister")} className="mt-4 px-4 py-2.5 rounded-sm text-sm font-medium" style={{ background: GOLD, color: BLACK }}>Apply</button>
          </div>
        ))}
      </div>
      <p className="text-center text-xs pb-10" style={{ color: MUTED }}>Extra paid add-ons: verified badge, featured product/vendor, top search, homepage banner, delivery partnership, photography & social promotion.</p>
    </div>
  );
}

/* ---------- /sell-on-pcwears ---------- */
export function SellOnPage({ go }) {
  const reasons = [
    ["Reach more buyers", "Get in front of customers shopping across Freetown and Sierra Leone."],
    ["Easy to start", "Apply free, get approved, and upload your products in minutes."],
    ["Sell your way", "Customers reach you directly on WhatsApp — you keep your relationships."],
    ["Grow your brand", "Featured placement, verification, photography and content services as you scale."],
  ];
  return (
    <div>
      <Hero eyebrow="Sell on People’s Choice" title="Grow your fashion business" sub="Join Sierra Leone’s fashion marketplace. It’s free to start." />
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="grid sm:grid-cols-2 gap-4">
          {reasons.map(([t, d]) => (
            <div key={t} className="rounded-sm p-5" style={{ background: WHITE, border: `1px solid ${CREAM_DARK}` }}>
              <p className="font-medium mb-1" style={{ color: INK }}>{t}</p>
              <p className="text-sm" style={{ color: MUTED }}>{d}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-8 flex flex-wrap gap-3 justify-center">
          <button onClick={() => go("vendorRegister")} className="px-6 py-3 rounded-sm text-sm font-medium" style={{ background: GOLD, color: BLACK }}>Open your shop</button>
          <button onClick={() => go("vendorPlans")} className="px-6 py-3 rounded-sm text-sm font-medium" style={{ background: INK, color: WHITE }}>See plans</button>
          <button onClick={() => go("vendorLogin")} className="px-6 py-3 rounded-sm text-sm font-medium" style={{ border: `1px solid ${CREAM_DARK}`, color: INK }}>Vendor login</button>
        </div>
      </div>
    </div>
  );
}
