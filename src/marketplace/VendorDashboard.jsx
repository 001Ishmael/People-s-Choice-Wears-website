import { useState, useEffect } from "react";
import { GOLD, BLACK, INK, NAVY, CREAM, CREAM_DARK, MUTED, WHITE, fmtLe } from "../lib/theme.js";
import { isSupabase, supabase } from "../lib/supabase.js";
import {
  currentVendor, vendorUpdateProfile, vendorListProducts, vendorSaveProduct, vendorDeleteProduct,
  vendorListFabrics, vendorSaveFabric, vendorDeleteFabric, vendorListInquiries,
  vendorRequestVerification, vendorRequestPromotion, vendorRequestSubscription, vendorListSubscriptions,
  vendorSignOut,
} from "../lib/marketplace.js";

const input = { background: WHITE, border: `1px solid ${CREAM_DARK}`, color: INK };
const STOCK = [["available", "Available"], ["low_stock", "Low stock"], ["out_of_stock", "Out of stock"]];
const STATUS_COLOR = { approved: "#2E7D32", pending: "#B8860B", suspended: "#C0392B", rejected: "#C0392B" };

export default function VendorDashboard({ go, vendor, setVendor }) {
  const [tab, setTab] = useState("overview");
  const [v, setV] = useState(vendor || null);
  const [loading, setLoading] = useState(!vendor);

  useEffect(() => {
    if (!isSupabase) { setLoading(false); return; }
    if (!v) { currentVendor().then((d) => { setV(d); setVendor && setVendor(d); setLoading(false); }).catch(() => setLoading(false)); }
  }, []);

  if (!isSupabase) return <Center>The marketplace database isn’t connected yet.</Center>;
  if (loading) return <Center>Loading your dashboard…</Center>;
  if (!v) return (
    <Center>
      <p className="mb-4">You’re not signed in as a vendor.</p>
      <button onClick={() => go("vendorLogin")} className="px-5 py-2.5 rounded-sm text-sm font-medium" style={{ background: GOLD, color: BLACK }}>Go to vendor login</button>
    </Center>
  );

  const isFabric = v.vendor_type === "fabric_store";
  const fabricEnabled = isFabric;
  const tabs = [
    ["overview", "Overview"], ["profile", "My Profile"], ["products", "My Products"],
    ...(fabricEnabled ? [["fabrics", "Fabric Stock"]] : []),
    ["inquiries", "Inquiries"], ["subscription", "Subscription"], ["promote", "Promotion"],
    ["verify", "Verification"], ["grow", "Grow My Brand"], ["settings", "Settings"],
  ];

  const logout = async () => { await vendorSignOut(); setVendor && setVendor(null); go("vendorLogin"); };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 24, color: INK }}>{v.business_name}</h1>
          <p className="text-xs" style={{ color: MUTED }}>
            Status: <b style={{ color: STATUS_COLOR[v.status] || INK }}>{v.status}</b>
            {v.is_verified && <span style={{ color: GOLD }}> · Verified ✔</span>}
            {" · "}Plan: <b>{v.subscription_plan}</b>
          </p>
        </div>
        <button onClick={logout} className="px-4 py-2 rounded-sm text-xs font-medium" style={{ border: `1px solid ${CREAM_DARK}`, color: INK }}>Log out</button>
      </div>

      {v.status !== "approved" && (
        <div className="p-3 rounded-sm mb-4 text-sm" style={{ background: "#FFF6E0", border: "1px solid #E2C879", color: INK }}>
          Your shop is <b>{v.status}</b>. You can set up products now; they’ll appear publicly once PC Wears approves your shop.
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-2 mb-5" style={{ borderBottom: `1px solid ${CREAM_DARK}` }}>
        {tabs.map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className="px-3 py-2 text-sm whitespace-nowrap" style={{ color: tab === k ? INK : MUTED, borderBottom: tab === k ? `2px solid ${GOLD}` : "2px solid transparent", fontWeight: tab === k ? 600 : 400 }}>{l}</button>
        ))}
      </div>

      {tab === "overview" && <Overview v={v} setTab={setTab} />}
      {tab === "profile" && <Profile v={v} onSaved={(nv) => { setV(nv); setVendor && setVendor(nv); }} />}
      {tab === "products" && <Products v={v} />}
      {tab === "fabrics" && fabricEnabled && <Fabrics v={v} />}
      {tab === "inquiries" && <Inquiries v={v} />}
      {tab === "subscription" && <Subscription v={v} />}
      {tab === "promote" && <Promote v={v} />}
      {tab === "verify" && <Verify v={v} />}
      {tab === "grow" && <Grow v={v} />}
      {tab === "settings" && <Settings />}
    </div>
  );
}

function Center({ children }) { return <div className="max-w-md mx-auto px-4 py-20 text-center text-sm" style={{ color: MUTED }}>{children}</div>; }
function Field({ label, children }) { return <label className="block"><span className="block mb-1" style={{ color: MUTED, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>{children}</label>; }

function Overview({ v, setTab }) {
  const [counts, setCounts] = useState({ products: "…", inquiries: "…" });
  useEffect(() => {
    (async () => {
      try {
        const p = await vendorListProducts(v.id); const i = await vendorListInquiries(v.id);
        setCounts({ products: p.length, inquiries: i.length });
      } catch (e) { setCounts({ products: 0, inquiries: 0 }); }
    })();
  }, []);
  const card = (label, val, onClick) => (
    <button onClick={onClick} className="text-left rounded-sm p-4" style={{ background: WHITE, border: `1px solid ${CREAM_DARK}` }}>
      <p className="text-2xl font-semibold" style={{ color: INK }}>{val}</p>
      <p className="text-xs" style={{ color: MUTED }}>{label}</p>
    </button>
  );
  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {card("Products", counts.products, () => setTab("products"))}
        {card("Inquiries", counts.inquiries, () => setTab("inquiries"))}
        {card("Plan", v.subscription_plan, () => setTab("subscription"))}
        {card("Limit", v.product_limit, () => setTab("subscription"))}
      </div>
      <p className="text-sm" style={{ color: MUTED }}>Welcome to your vendor dashboard. Add products, manage stock, and respond to customer inquiries. Need more visibility? Request a promotion or verification.</p>
    </div>
  );
}

function Profile({ v, onSaved }) {
  const [f, setF] = useState({ business_name: v.business_name || "", owner_name: v.owner_name || "", phone: v.phone || "", whatsapp: v.whatsapp || "", location: v.location || "", business_category: v.business_category || "", description: v.description || "" });
  const [logoFile, setLogoFile] = useState(null); const [coverFile, setCoverFile] = useState(null);
  const [busy, setBusy] = useState(false); const [msg, setMsg] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const save = async () => {
    setBusy(true); setMsg("");
    try { const nv = await vendorUpdateProfile(v.id, f, { logoFile, coverFile }); onSaved(nv); setMsg("Profile saved."); }
    catch (e) { setMsg(e.message || "Save failed."); } finally { setBusy(false); }
  };
  return (
    <div className="max-w-2xl grid gap-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Business name"><input value={f.business_name} onChange={set("business_name")} style={input} className="w-full px-3 py-2.5 rounded-sm text-sm" /></Field>
        <Field label="Owner name"><input value={f.owner_name} onChange={set("owner_name")} style={input} className="w-full px-3 py-2.5 rounded-sm text-sm" /></Field>
        <Field label="Phone"><input value={f.phone} onChange={set("phone")} style={input} className="w-full px-3 py-2.5 rounded-sm text-sm" /></Field>
        <Field label="WhatsApp"><input value={f.whatsapp} onChange={set("whatsapp")} style={input} className="w-full px-3 py-2.5 rounded-sm text-sm" /></Field>
        <Field label="Location"><input value={f.location} onChange={set("location")} style={input} className="w-full px-3 py-2.5 rounded-sm text-sm" /></Field>
        <Field label="Category"><input value={f.business_category} onChange={set("business_category")} style={input} className="w-full px-3 py-2.5 rounded-sm text-sm" /></Field>
      </div>
      <Field label="Description"><textarea rows={3} value={f.description} onChange={set("description")} style={input} className="w-full px-3 py-2.5 rounded-sm text-sm" /></Field>
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Replace logo"><input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} className="text-xs" /></Field>
        <Field label="Replace cover"><input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} className="text-xs" /></Field>
      </div>
      {msg && <p className="text-sm" style={{ color: msg.includes("saved") ? "#2E7D32" : "#C0392B" }}>{msg}</p>}
      <div><button onClick={save} disabled={busy} className="px-5 py-2.5 rounded-sm text-sm font-medium" style={{ background: GOLD, color: BLACK }}>{busy ? "Saving…" : "Save profile"}</button></div>
    </div>
  );
}

function emptyProduct() { return { name: "", description: "", category: "", subcategory: "", price: "", stock_quantity: "", stock_status: "available", sizes: "", colors: "", material: "", location: "", is_featured: false, status: "active" }; }
function Products({ v }) {
  const [list, setList] = useState(null); const [editing, setEditing] = useState(null); const [files, setFiles] = useState([]); const [busy, setBusy] = useState(false); const [msg, setMsg] = useState("");
  const load = () => vendorListProducts(v.id).then(setList).catch(() => setList([]));
  useEffect(() => { load(); }, []);
  const atLimit = list && list.length >= (v.product_limit || 5);
  const save = async () => {
    if (!editing.name) { setMsg("Product name is required."); return; }
    setBusy(true); setMsg("");
    try { await vendorSaveProduct(v.id, editing, files); setEditing(null); setFiles([]); await load(); }
    catch (e) { setMsg(e.message || "Save failed."); } finally { setBusy(false); }
  };
  const del = async (id) => { if (!window.confirm("Delete this product?")) return; await vendorDeleteProduct(id); load(); };

  if (editing) {
    const set = (k) => (e) => setEditing({ ...editing, [k]: e.target.value });
    return (
      <div className="max-w-2xl grid gap-3">
        <button onClick={() => { setEditing(null); setFiles([]); }} className="text-xs uppercase tracking-widest text-left" style={{ color: GOLD }}>← Back to products</button>
        <Field label="Product name *"><input value={editing.name} onChange={set("name")} style={input} className="w-full px-3 py-2.5 rounded-sm text-sm" /></Field>
        <Field label="Description"><textarea rows={2} value={editing.description} onChange={set("description")} style={input} className="w-full px-3 py-2.5 rounded-sm text-sm" /></Field>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Category"><input value={editing.category} onChange={set("category")} style={input} className="w-full px-3 py-2.5 rounded-sm text-sm" /></Field>
          <Field label="Subcategory"><input value={editing.subcategory} onChange={set("subcategory")} style={input} className="w-full px-3 py-2.5 rounded-sm text-sm" /></Field>
          <Field label="Price (Le)"><input type="number" value={editing.price} onChange={set("price")} style={input} className="w-full px-3 py-2.5 rounded-sm text-sm" /></Field>
          <Field label="Stock quantity"><input type="number" value={editing.stock_quantity} onChange={set("stock_quantity")} style={input} className="w-full px-3 py-2.5 rounded-sm text-sm" /></Field>
          <Field label="Stock status"><select value={editing.stock_status} onChange={set("stock_status")} style={input} className="w-full px-3 py-2.5 rounded-sm text-sm">{STOCK.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></Field>
          <Field label="Material"><input value={editing.material} onChange={set("material")} style={input} className="w-full px-3 py-2.5 rounded-sm text-sm" /></Field>
          <Field label="Sizes (comma separated)"><input value={editing.sizes} onChange={set("sizes")} style={input} className="w-full px-3 py-2.5 rounded-sm text-sm" /></Field>
          <Field label="Colors (comma separated)"><input value={editing.colors} onChange={set("colors")} style={input} className="w-full px-3 py-2.5 rounded-sm text-sm" /></Field>
        </div>
        <Field label="Images (you can select several)"><input type="file" accept="image/*" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} className="text-xs" /></Field>
        {msg && <p className="text-sm" style={{ color: "#C0392B" }}>{msg}</p>}
        <div className="flex gap-2"><button onClick={save} disabled={busy} className="px-5 py-2.5 rounded-sm text-sm font-medium" style={{ background: GOLD, color: BLACK }}>{busy ? "Saving…" : "Save product"}</button></div>
      </div>
    );
  }
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm" style={{ color: MUTED }}>{list ? `${list.length} / ${v.product_limit} products` : "…"}</p>
        <button disabled={atLimit} onClick={() => { setEditing(emptyProduct()); setMsg(""); }} className="px-4 py-2 rounded-sm text-sm font-medium" style={{ background: atLimit ? CREAM_DARK : GOLD, color: BLACK }}>+ Add product</button>
      </div>
      {atLimit && <p className="text-xs mb-3" style={{ color: "#C0392B" }}>You’ve reached your plan’s product limit. Upgrade your plan to add more.</p>}
      {list === null ? <p className="text-sm py-8 text-center" style={{ color: MUTED }}>Loading…</p> : !list.length ? <p className="text-sm py-8 text-center" style={{ color: MUTED }}>No products yet. Add your first.</p> : (
        <div className="grid gap-2">
          {list.map((p) => (
            <div key={p.id} className="flex items-center gap-3 p-2 rounded-sm" style={{ background: WHITE, border: `1px solid ${CREAM_DARK}` }}>
              <div style={{ width: 48, height: 48, background: CREAM, borderRadius: 6, overflow: "hidden", flexShrink: 0 }}>{p.images?.[0] && <img src={p.images[0]} className="w-full h-full object-cover" alt="" />}</div>
              <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate" style={{ color: INK }}>{p.name}</p><p className="text-xs" style={{ color: MUTED }}>{fmtLe(p.price)} · {p.stock_status} · {p.status}</p></div>
              <button onClick={() => setEditing({ ...p, sizes: (p.sizes || []).join(", "), colors: (p.colors || []).join(", ") })} className="text-xs" style={{ color: GOLD }}>Edit</button>
              <button onClick={() => del(p.id)} className="text-xs" style={{ color: "#C0392B" }}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function emptyFabric() { return { fabric_name: "", fabric_type: "", color: "", pattern: "", material: "", price_per_yard: "", available_yards: "", minimum_order_quantity: 1, fabric_width: "", wholesale_price: "", retail_price: "", delivery_option: "", stock_status: "available", status: "active" }; }
function Fabrics({ v }) {
  const [list, setList] = useState(null); const [editing, setEditing] = useState(null); const [files, setFiles] = useState([]); const [busy, setBusy] = useState(false); const [msg, setMsg] = useState("");
  const load = () => vendorListFabrics(v.id).then(setList).catch(() => setList([]));
  useEffect(() => { load(); }, []);
  const save = async () => {
    if (!editing.fabric_name) { setMsg("Fabric name is required."); return; }
    setBusy(true); setMsg("");
    try { await vendorSaveFabric(v.id, editing, files); setEditing(null); setFiles([]); await load(); }
    catch (e) { setMsg(e.message || "Save failed."); } finally { setBusy(false); }
  };
  const del = async (id) => { if (!window.confirm("Delete this fabric?")) return; await vendorDeleteFabric(id); load(); };
  if (editing) {
    const set = (k) => (e) => setEditing({ ...editing, [k]: e.target.value });
    return (
      <div className="max-w-2xl grid gap-3">
        <button onClick={() => { setEditing(null); setFiles([]); }} className="text-xs uppercase tracking-widest text-left" style={{ color: GOLD }}>← Back to fabrics</button>
        <Field label="Fabric name *"><input value={editing.fabric_name} onChange={set("fabric_name")} style={input} className="w-full px-3 py-2.5 rounded-sm text-sm" /></Field>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Fabric type"><input value={editing.fabric_type} onChange={set("fabric_type")} style={input} className="w-full px-3 py-2.5 rounded-sm text-sm" /></Field>
          <Field label="Color"><input value={editing.color} onChange={set("color")} style={input} className="w-full px-3 py-2.5 rounded-sm text-sm" /></Field>
          <Field label="Pattern"><input value={editing.pattern} onChange={set("pattern")} style={input} className="w-full px-3 py-2.5 rounded-sm text-sm" /></Field>
          <Field label="Material"><input value={editing.material} onChange={set("material")} style={input} className="w-full px-3 py-2.5 rounded-sm text-sm" /></Field>
          <Field label="Price per yard (Le)"><input type="number" value={editing.price_per_yard} onChange={set("price_per_yard")} style={input} className="w-full px-3 py-2.5 rounded-sm text-sm" /></Field>
          <Field label="Available yards"><input type="number" value={editing.available_yards} onChange={set("available_yards")} style={input} className="w-full px-3 py-2.5 rounded-sm text-sm" /></Field>
          <Field label="Min order qty"><input type="number" value={editing.minimum_order_quantity} onChange={set("minimum_order_quantity")} style={input} className="w-full px-3 py-2.5 rounded-sm text-sm" /></Field>
          <Field label="Fabric width"><input value={editing.fabric_width} onChange={set("fabric_width")} style={input} className="w-full px-3 py-2.5 rounded-sm text-sm" /></Field>
          <Field label="Wholesale price"><input type="number" value={editing.wholesale_price} onChange={set("wholesale_price")} style={input} className="w-full px-3 py-2.5 rounded-sm text-sm" /></Field>
          <Field label="Retail price"><input type="number" value={editing.retail_price} onChange={set("retail_price")} style={input} className="w-full px-3 py-2.5 rounded-sm text-sm" /></Field>
          <Field label="Stock status"><select value={editing.stock_status} onChange={set("stock_status")} style={input} className="w-full px-3 py-2.5 rounded-sm text-sm">{STOCK.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></Field>
          <Field label="Delivery / pickup"><input value={editing.delivery_option} onChange={set("delivery_option")} placeholder="e.g. Delivery in Freetown" style={input} className="w-full px-3 py-2.5 rounded-sm text-sm" /></Field>
        </div>
        <Field label="Images"><input type="file" accept="image/*" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} className="text-xs" /></Field>
        {msg && <p className="text-sm" style={{ color: "#C0392B" }}>{msg}</p>}
        <div><button onClick={save} disabled={busy} className="px-5 py-2.5 rounded-sm text-sm font-medium" style={{ background: GOLD, color: BLACK }}>{busy ? "Saving…" : "Save fabric"}</button></div>
      </div>
    );
  }
  return (
    <div>
      <div className="flex justify-end mb-3"><button onClick={() => { setEditing(emptyFabric()); setMsg(""); }} className="px-4 py-2 rounded-sm text-sm font-medium" style={{ background: GOLD, color: BLACK }}>+ Add fabric</button></div>
      {list === null ? <p className="text-sm py-8 text-center" style={{ color: MUTED }}>Loading…</p> : !list.length ? <p className="text-sm py-8 text-center" style={{ color: MUTED }}>No fabrics yet.</p> : (
        <div className="grid gap-2">{list.map((p) => (
          <div key={p.id} className="flex items-center gap-3 p-2 rounded-sm" style={{ background: WHITE, border: `1px solid ${CREAM_DARK}` }}>
            <div style={{ width: 48, height: 48, background: CREAM, borderRadius: 6, overflow: "hidden", flexShrink: 0 }}>{p.images?.[0] && <img src={p.images[0]} className="w-full h-full object-cover" alt="" />}</div>
            <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate" style={{ color: INK }}>{p.fabric_name}</p><p className="text-xs" style={{ color: MUTED }}>{p.price_per_yard ? fmtLe(p.price_per_yard) + "/yd" : ""} · {p.available_yards} yds · {p.stock_status}</p></div>
            <button onClick={() => setEditing(p)} className="text-xs" style={{ color: GOLD }}>Edit</button>
            <button onClick={() => del(p.id)} className="text-xs" style={{ color: "#C0392B" }}>Delete</button>
          </div>
        ))}</div>
      )}
    </div>
  );
}

function Inquiries({ v }) {
  const [list, setList] = useState(null);
  useEffect(() => { vendorListInquiries(v.id).then(setList).catch(() => setList([])); }, []);
  if (list === null) return <p className="text-sm py-8 text-center" style={{ color: MUTED }}>Loading…</p>;
  if (!list.length) return <p className="text-sm py-8 text-center" style={{ color: MUTED }}>No inquiries yet.</p>;
  return <div className="grid gap-2">{list.map((i) => (
    <div key={i.id} className="p-3 rounded-sm" style={{ background: WHITE, border: `1px solid ${CREAM_DARK}` }}>
      <p className="text-sm" style={{ color: INK }}>{i.message || "(no message)"}</p>
      <p className="text-xs mt-1" style={{ color: MUTED }}>{[i.customer_name, i.customer_phone, i.customer_email].filter(Boolean).join(" · ")} · {i.inquiry_type} · {(i.created_at || "").slice(0, 10)}</p>
    </div>
  ))}</div>;
}

function Subscription({ v }) {
  const [subs, setSubs] = useState(null); const [msg, setMsg] = useState("");
  const load = () => vendorListSubscriptions(v.id).then(setSubs).catch(() => setSubs([]));
  useEffect(() => { load(); }, []);
  const req = async (plan, amount) => { try { await vendorRequestSubscription(v.id, plan, amount); setMsg(`Requested ${plan}. PC Wears will confirm and activate after payment.`); load(); } catch (e) { setMsg(e.message); } };
  return (
    <div className="max-w-2xl">
      <p className="text-sm mb-3" style={{ color: INK }}>Current plan: <b>{v.subscription_plan}</b> · Product limit: <b>{v.product_limit}</b></p>
      <div className="grid sm:grid-cols-3 gap-3 mb-4">
        <PlanBtn name="Starter" amount={150} onClick={() => req("Starter", 150)} />
        <PlanBtn name="Business" amount={400} onClick={() => req("Business", 400)} />
        <PlanBtn name="Premium" amount={900} onClick={() => req("Premium", 900)} />
      </div>
      {msg && <p className="text-sm mb-3" style={{ color: "#2E7D32" }}>{msg}</p>}
      <p className="text-xs mb-2" style={{ color: MUTED }}>Your requests:</p>
      {subs === null ? <p className="text-sm" style={{ color: MUTED }}>…</p> : !subs.length ? <p className="text-sm" style={{ color: MUTED }}>No requests yet.</p> :
        <div className="grid gap-2">{subs.map((s) => <div key={s.id} className="text-sm p-2 rounded-sm" style={{ background: WHITE, border: `1px solid ${CREAM_DARK}`, color: INK }}>{s.plan_name} · {fmtLe(s.amount)} · <b>{s.status}</b></div>)}</div>}
    </div>
  );
}
function PlanBtn({ name, amount, onClick }) { return <button onClick={onClick} className="rounded-sm p-3 text-left" style={{ background: WHITE, border: `1px solid ${CREAM_DARK}` }}><p className="text-sm font-medium" style={{ color: INK }}>{name}</p><p className="text-xs" style={{ color: MUTED }}>{fmtLe(amount)}/mo · request</p></button>; }

function Promote({ v }) {
  const [msg, setMsg] = useState("");
  const req = async (type) => { try { await vendorRequestPromotion(v.id, type); setMsg("Promotion requested. PC Wears will review it."); } catch (e) { setMsg(e.message); } };
  const opts = [["featured_vendor", "Featured vendor"], ["featured_fabric", "Featured fabric"], ["top_search", "Top search placement"], ["homepage_feature", "Homepage feature"]];
  return (
    <div className="max-w-xl">
      <p className="text-sm mb-3" style={{ color: INK }}>Request a promotion to get more visibility. PC Wears will confirm pricing and activate it.</p>
      <div className="grid sm:grid-cols-2 gap-2">{opts.map(([k, l]) => <button key={k} onClick={() => req(k)} className="rounded-sm p-3 text-sm text-left" style={{ background: WHITE, border: `1px solid ${CREAM_DARK}`, color: INK }}>{l}</button>)}</div>
      {msg && <p className="text-sm mt-3" style={{ color: "#2E7D32" }}>{msg}</p>}
    </div>
  );
}

function Verify({ v }) {
  const [msg, setMsg] = useState("");
  const req = async () => { try { await vendorRequestVerification(v.id); setMsg("Verification requested. PC Wears will review your shop."); } catch (e) { setMsg(e.message); } };
  return (
    <div className="max-w-xl">
      {v.is_verified ? <p className="text-sm" style={{ color: "#2E7D32" }}>Your shop is verified ✔</p> : (<>
        <p className="text-sm mb-3" style={{ color: INK }}>A verified badge builds customer trust. Request verification and PC Wears will review your business.</p>
        <button onClick={req} className="px-5 py-2.5 rounded-sm text-sm font-medium" style={{ background: GOLD, color: BLACK }}>Request verification</button>
        {msg && <p className="text-sm mt-3" style={{ color: "#2E7D32" }}>{msg}</p>}
      </>)}
    </div>
  );
}

function Grow({ v }) {
  const wa = "https://wa.me/23279468780?text=" + encodeURIComponent(`Hello PC Wears, this is ${v.business_name}. I'd like help with: `);
  const items = ["Product photography", "Product videography", "Social media content", "Printing services", "Featured promotion", "Brand identity package"];
  return (
    <div className="max-w-xl">
      <p className="text-sm mb-3" style={{ color: INK }}>Grow your brand with PC Wears services. Tap to request on WhatsApp (full booking coming soon).</p>
      <div className="grid sm:grid-cols-2 gap-2">{items.map((x) => <a key={x} href={wa + encodeURIComponent(x)} target="_blank" rel="noreferrer" className="rounded-sm p-3 text-sm" style={{ background: WHITE, border: `1px solid ${CREAM_DARK}`, color: INK }}>{x}</a>)}</div>
    </div>
  );
}

function Settings() {
  const [pass, setPass] = useState(""); const [msg, setMsg] = useState("");
  const change = async () => {
    if (pass.length < 6) { setMsg("Password must be at least 6 characters."); return; }
    try { const { error } = await supabase.auth.updateUser({ password: pass }); if (error) throw error; setMsg("Password updated."); setPass(""); }
    catch (e) { setMsg(e.message); }
  };
  return (
    <div className="max-w-sm grid gap-3">
      <Field label="New password"><input type="password" value={pass} onChange={(e) => setPass(e.target.value)} style={input} className="w-full px-3 py-2.5 rounded-sm text-sm" /></Field>
      {msg && <p className="text-sm" style={{ color: msg.includes("updated") ? "#2E7D32" : "#C0392B" }}>{msg}</p>}
      <div><button onClick={change} className="px-5 py-2.5 rounded-sm text-sm font-medium" style={{ background: GOLD, color: BLACK }}>Update password</button></div>
    </div>
  );
}
