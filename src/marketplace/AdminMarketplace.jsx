import { useState, useEffect } from "react";
import { GOLD, BLACK, INK, CREAM, CREAM_DARK, MUTED, WHITE, fmtLe } from "../lib/theme.js";
import { isSupabase } from "../lib/supabase.js";
import {
  admListVendors, admSetVendor, admListProducts, admSetProduct, admDeleteProduct,
  admListSubscriptions, admSetSubscription, admListPromotions, admSetPromotion,
} from "../lib/marketplace.js";

/* Admin → Marketplace management (rendered inside the staff dashboard) */
export default function AdminMarketplace() {
  const [tab, setTab] = useState("vendors");
  if (!isSupabase) return <p className="text-sm py-8 text-center" style={{ color: MUTED }}>Connect Supabase to manage the marketplace.</p>;
  const tabs = [["vendors", "Vendors"], ["products", "Vendor Products"], ["subs", "Subscriptions"], ["promos", "Promotions"]];
  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4" style={{ borderBottom: `1px solid ${CREAM_DARK}` }}>
        {tabs.map(([k, l]) => <button key={k} onClick={() => setTab(k)} className="px-3 py-2 text-sm whitespace-nowrap" style={{ color: tab === k ? INK : MUTED, borderBottom: tab === k ? `2px solid ${GOLD}` : "2px solid transparent", fontWeight: tab === k ? 600 : 400 }}>{l}</button>)}
      </div>
      {tab === "vendors" && <Vendors />}
      {tab === "products" && <ProductsAdmin />}
      {tab === "subs" && <Subs />}
      {tab === "promos" && <Promos />}
    </div>
  );
}

function useList(fn) {
  const [data, setData] = useState(null);
  const reload = () => fn().then(setData).catch((e) => { console.error(e); setData([]); });
  useEffect(() => { reload(); }, []);
  return [data, reload];
}
const pill = (text, color) => <span style={{ fontSize: 11, color, fontWeight: 600 }}>{text}</span>;
const SCOLOR = { approved: "#2E7D32", pending: "#B8860B", suspended: "#C0392B", rejected: "#C0392B", active: "#2E7D32", unpaid: "#B8860B", expired: "#C0392B", requested: "#B8860B", hidden: "#C0392B" };

function Vendors() {
  const [list, reload] = useList(admListVendors);
  const act = async (id, patch) => { await admSetVendor(id, patch); reload(); };
  if (list === null) return <Loading />;
  if (!list.length) return <Empty>No vendor applications yet.</Empty>;
  return (
    <div className="grid gap-2">
      {list.map((v) => (
        <div key={v.id} className="p-3 rounded-sm" style={{ background: WHITE, border: `1px solid ${CREAM_DARK}` }}>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <div style={{ width: 44, height: 44, borderRadius: 8, background: CREAM, overflow: "hidden", flexShrink: 0 }}>{v.logo_url && <img src={v.logo_url} className="w-full h-full object-cover" alt="" />}</div>
              <div>
                <p className="text-sm font-medium" style={{ color: INK }}>{v.business_name} {v.is_verified && <span style={{ color: GOLD }}>✔</span>}</p>
                <p className="text-xs" style={{ color: MUTED }}>{(v.vendor_type || "").replace(/_/g, " ")} · {v.email || "no email"} · {v.phone || ""}</p>
                <p className="text-xs mt-0.5">{pill(v.status, SCOLOR[v.status] || INK)} · plan {v.subscription_plan} · limit {v.product_limit}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 justify-end">
              {v.status !== "approved" && <Btn onClick={() => act(v.id, { status: "approved" })} bg="#2E7D32">Approve</Btn>}
              {v.status !== "rejected" && <Btn onClick={() => act(v.id, { status: "rejected" })} bg="#C0392B">Reject</Btn>}
              {v.status !== "suspended" ? <Btn onClick={() => act(v.id, { status: "suspended" })} bg="#8C6A1A">Suspend</Btn> : <Btn onClick={() => act(v.id, { status: "approved" })} bg="#2E7D32">Activate</Btn>}
              <Btn onClick={() => act(v.id, { is_verified: !v.is_verified })} bg={INK}>{v.is_verified ? "Unverify" : "Verify"}</Btn>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-2 items-center">
            <label className="text-xs" style={{ color: MUTED }}>Plan:
              <select value={v.subscription_plan} onChange={(e) => { const plan = e.target.value; const limit = { trial: 5, starter: 10, business: 30, premium: 999 }[plan]; act(v.id, { subscription_plan: plan, product_limit: limit }); }} className="ml-1 px-2 py-1 rounded-sm text-xs" style={{ background: WHITE, border: `1px solid ${CREAM_DARK}` }}>
                {["trial", "starter", "business", "premium"].map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </label>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProductsAdmin() {
  const [list, reload] = useList(admListProducts);
  const act = async (id, patch) => { await admSetProduct(id, patch); reload(); };
  const del = async (id) => { if (!window.confirm("Delete this product?")) return; await admDeleteProduct(id); reload(); };
  if (list === null) return <Loading />;
  if (!list.length) return <Empty>No vendor products yet.</Empty>;
  return (
    <div className="grid gap-2">
      {list.map((p) => (
        <div key={p.id} className="flex items-center gap-3 p-2 rounded-sm" style={{ background: WHITE, border: `1px solid ${CREAM_DARK}` }}>
          <div style={{ width: 44, height: 44, background: CREAM, borderRadius: 6, overflow: "hidden", flexShrink: 0 }}>{p.images?.[0] && <img src={p.images[0]} className="w-full h-full object-cover" alt="" />}</div>
          <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate" style={{ color: INK }}>{p.name} {p.is_featured && <span style={{ color: GOLD }}>★</span>}</p><p className="text-xs" style={{ color: MUTED }}>{p.vendor?.business_name} · {fmtLe(p.price)} · {pill(p.status, SCOLOR[p.status] || INK)}</p></div>
          <Btn onClick={() => act(p.id, { is_featured: !p.is_featured })} bg={INK}>{p.is_featured ? "Unfeature" : "Feature"}</Btn>
          {p.status === "active" ? <Btn onClick={() => act(p.id, { status: "hidden" })} bg="#8C6A1A">Hide</Btn> : <Btn onClick={() => act(p.id, { status: "active" })} bg="#2E7D32">Show</Btn>}
          <Btn onClick={() => del(p.id)} bg="#C0392B">Delete</Btn>
        </div>
      ))}
    </div>
  );
}

function Subs() {
  const [list, reload] = useList(admListSubscriptions);
  const act = async (id, patch) => { await admSetSubscription(id, patch); reload(); };
  if (list === null) return <Loading />;
  if (!list.length) return <Empty>No subscription requests.</Empty>;
  return <div className="grid gap-2">{list.map((s) => (
    <div key={s.id} className="flex items-center justify-between gap-2 p-3 rounded-sm" style={{ background: WHITE, border: `1px solid ${CREAM_DARK}` }}>
      <div><p className="text-sm" style={{ color: INK }}>{s.vendor?.business_name} — {s.plan_name} · {fmtLe(s.amount)}</p><p className="text-xs">{pill(s.status, SCOLOR[s.status] || INK)} · {(s.created_at || "").slice(0, 10)}</p></div>
      <div className="flex gap-1">{s.status !== "active" && <Btn onClick={() => act(s.id, { status: "active" })} bg="#2E7D32">Mark paid</Btn>}<Btn onClick={() => act(s.id, { status: "expired" })} bg="#C0392B">Expire</Btn></div>
    </div>
  ))}</div>;
}

function Promos() {
  const [list, reload] = useList(admListPromotions);
  const act = async (id, patch) => { await admSetPromotion(id, patch); reload(); };
  if (list === null) return <Loading />;
  if (!list.length) return <Empty>No promotion requests.</Empty>;
  return <div className="grid gap-2">{list.map((p) => (
    <div key={p.id} className="flex items-center justify-between gap-2 p-3 rounded-sm" style={{ background: WHITE, border: `1px solid ${CREAM_DARK}` }}>
      <div><p className="text-sm" style={{ color: INK }}>{p.vendor?.business_name} — {(p.promotion_type || "").replace(/_/g, " ")}</p><p className="text-xs">{pill(p.status, SCOLOR[p.status] || INK)} · {(p.created_at || "").slice(0, 10)}</p></div>
      <div className="flex gap-1">{p.status !== "active" && <Btn onClick={() => act(p.id, { status: "active" })} bg="#2E7D32">Activate</Btn>}<Btn onClick={() => act(p.id, { status: "rejected" })} bg="#C0392B">Reject</Btn></div>
    </div>
  ))}</div>;
}

function Btn({ children, onClick, bg }) { return <button onClick={onClick} className="px-2.5 py-1.5 rounded-sm text-xs font-medium" style={{ background: bg, color: "#fff" }}>{children}</button>; }
function Loading() { return <p className="text-sm py-8 text-center" style={{ color: MUTED }}>Loading…</p>; }
function Empty({ children }) { return <p className="text-sm py-8 text-center" style={{ color: MUTED }}>{children}</p>; }
