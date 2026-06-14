import { useState, useEffect } from "react";
import { GOLD, BLACK, INK, NAVY, CREAM, CREAM_DARK, MUTED, WHITE, VENDOR_TYPES } from "../lib/theme.js";
import { isSupabase } from "../lib/supabase.js";
import { admListVendors, admSetVendor } from "../lib/marketplace.js";

/* /admin/vendors — owner/admin approval of vendor applications.
   Protected: only renders the tools when an admin is logged in.
   Uses the existing `vendors` table via admListVendors / admSetVendor
   (which are allowed by the is_staff() row-level-security policies). */

const STATUS_META = {
  pending:   { label: "Pending",   color: "#B8860B", bg: "#FFF6E0" },
  approved:  { label: "Approved",  color: "#2E7D32", bg: "#E9F6EC" },
  rejected:  { label: "Rejected",  color: "#C0392B", bg: "#FDECEC" },
  suspended: { label: "Suspended", color: "#C0392B", bg: "#FDECEC" },
};
const TYPE_LABEL = Object.fromEntries(VENDOR_TYPES);
const FILTERS = [["all", "All"], ["pending", "Pending"], ["approved", "Approved"], ["suspended", "Suspended"], ["rejected", "Rejected"]];

export default function AdminVendors({ isAdmin, go }) {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [filter, setFilter] = useState("all");
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    setErr(""); setLoading(true);
    try { setVendors(await admListVendors()); }
    catch (e) { setErr(e.message || "Could not load vendors."); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (isAdmin && isSupabase) load(); }, [isAdmin]);

  const update = async (id, patch) => {
    setBusyId(id); setErr("");
    try {
      await admSetVendor(id, patch);
      setVendors((vs) => vs.map((v) => (v.id === id ? { ...v, ...patch } : v)));
    } catch (e) { setErr(e.message || "Update failed."); }
    finally { setBusyId(null); }
  };

  /* ---- gates ---- */
  if (!isSupabase) return <Shell><Notice>The marketplace database isn’t connected yet.</Notice></Shell>;
  if (!isAdmin) return (
    <Shell>
      <Notice>
        <p className="mb-4">You must be signed in as an admin to manage vendors.</p>
        <button onClick={() => go("admin")} className="px-5 py-2.5 rounded-sm text-sm font-medium" style={{ background: GOLD, color: BLACK }}>Go to admin login</button>
      </Notice>
    </Shell>
  );

  const counts = vendors.reduce((a, v) => { a[v.status] = (a[v.status] || 0) + 1; return a; }, {});
  const list = vendors.filter((v) => filter === "all" || v.status === filter);

  return (
    <Shell>
      <div className="flex flex-wrap items-center gap-2 mb-5">
        {FILTERS.map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)}
            className="px-3 py-1.5 rounded-full text-xs"
            style={{ background: filter === k ? GOLD : WHITE, color: filter === k ? BLACK : INK, border: `1px solid ${filter === k ? GOLD : CREAM_DARK}` }}>
            {l}{k !== "all" && counts[k] ? ` (${counts[k]})` : ""}
          </button>
        ))}
        <span className="flex-1" />
        <button onClick={load} className="text-xs uppercase tracking-widest" style={{ color: GOLD }}>↻ Refresh</button>
      </div>

      {err && <p className="text-sm mb-4" style={{ color: "#C0392B" }}>{err}</p>}
      {loading && <p className="py-12 text-center text-sm" style={{ color: MUTED }}>Loading vendors…</p>}
      {!loading && !list.length && <p className="py-12 text-center text-sm" style={{ color: MUTED }}>No vendors in this view yet.</p>}

      <div className="grid gap-3">
        {list.map((v) => {
          const sm = STATUS_META[v.status] || STATUS_META.pending;
          const busy = busyId === v.id;
          return (
            <div key={v.id} className="p-4 rounded-sm" style={{ background: WHITE, border: `1px solid ${CREAM_DARK}`, borderLeft: `4px solid ${sm.color}` }}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold" style={{ color: INK }}>{v.business_name}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[11px]" style={{ background: sm.bg, color: sm.color }}>{sm.label}</span>
                    {v.is_verified && <span className="px-2 py-0.5 rounded-full text-[11px]" style={{ background: "#EAF2FB", color: "#1C6DD0" }}>✔ Verified</span>}
                  </div>
                  <p className="text-xs mt-1" style={{ color: MUTED }}>
                    {[TYPE_LABEL[v.vendor_type] || v.vendor_type, v.owner_name, v.location].filter(Boolean).join(" · ")}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: MUTED }}>
                    {[v.email, v.phone, v.whatsapp && `WhatsApp ${v.whatsapp}`].filter(Boolean).join(" · ")}
                  </p>
                  {v.description && <p className="text-xs mt-2" style={{ color: "#5C564B" }}>{v.description}</p>}
                  <p className="text-[11px] mt-1" style={{ color: MUTED }}>Applied {(v.created_at || "").slice(0, 10)} · slug: {v.slug}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-3 pt-3" style={{ borderTop: `1px solid ${CREAM}` }}>
                {v.status !== "approved" && <Action onClick={() => update(v.id, { status: "approved" })} busy={busy} color="#2E7D32">Approve</Action>}
                {v.status === "suspended" && <Action onClick={() => update(v.id, { status: "approved" })} busy={busy} color="#2E7D32">Activate</Action>}
                {v.status === "approved" && <Action onClick={() => update(v.id, { status: "suspended" })} busy={busy} color="#C0392B">Suspend</Action>}
                {v.status !== "rejected" && <Action onClick={() => update(v.id, { status: "rejected" })} busy={busy} color="#C0392B">Reject</Action>}
                {v.status === "rejected" && <Action onClick={() => update(v.id, { status: "pending" })} busy={busy} color="#B8860B">Move to pending</Action>}
                {!v.is_verified
                  ? <Action onClick={() => update(v.id, { is_verified: true })} busy={busy} color="#1C6DD0">Verify</Action>
                  : <Action onClick={() => update(v.id, { is_verified: false })} busy={busy} color="#5C564B">Unverify</Action>}
              </div>
            </div>
          );
        })}
      </div>
    </Shell>
  );
}

/* ---- small presentational helpers ---- */
function Shell({ children }) {
  return (
    <div>
      <section style={{ background: `radial-gradient(ellipse at 70% 10%, ${NAVY} 0%, transparent 55%), ${BLACK}` }}>
        <div className="max-w-5xl mx-auto px-4 py-10">
          <p className="text-xs uppercase tracking-[0.35em]" style={{ color: GOLD }}>Admin</p>
          <h1 className="mt-2" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: "clamp(1.8rem,4.5vw,2.6rem)", color: CREAM }}>Vendor Applications</h1>
          <p className="mt-1 text-sm" style={{ color: "#C2BAA9" }}>Approve, reject, suspend, activate and verify the businesses applying to sell on People’s Choice.</p>
        </div>
      </section>
      <div className="max-w-5xl mx-auto px-4 py-8">{children}</div>
    </div>
  );
}
function Notice({ children }) {
  return <div className="py-16 text-center text-sm" style={{ color: MUTED }}>{children}</div>;
}
function Action({ children, onClick, busy, color }) {
  return (
    <button onClick={onClick} disabled={busy}
      className="px-3 py-1.5 rounded-sm text-xs font-medium"
      style={{ background: WHITE, color, border: `1px solid ${color}`, opacity: busy ? 0.5 : 1 }}>
      {children}
    </button>
  );
}
