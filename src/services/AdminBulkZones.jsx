import { useState, useEffect } from "react";
import { GOLD, BLACK, INK, CREAM, CREAM_DARK, MUTED, WHITE, fmtLe, waLink } from "../lib/theme.js";
import { isSupabase } from "../lib/supabase.js";
import { admListBulkOrders, admSetBulkOrder, admListZones, admSaveZone, admDeleteZone } from "../lib/business.js";

const input = { background: WHITE, border: `1px solid ${CREAM_DARK}`, color: INK };
const BULK_STATUS = [["new", "New"], ["in_review", "In review"], ["quoted", "Quoted"], ["approved", "Approved"], ["completed", "Completed"], ["cancelled", "Cancelled"]];
const BULK_COLOR = { new: "#B8860B", in_review: "#2980B9", quoted: "#2980B9", approved: "#2E7D32", completed: "#2E7D32", cancelled: "#C0392B" };

export default function AdminBulkZones() {
  const [view, setView] = useState("bulk"); // bulk | zones
  const [orders, setOrders] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr(""); setLoading(true);
    try { setOrders(await admListBulkOrders()); setZones(await admListZones()); }
    catch (e) { setErr(e.message || "Could not load."); }
    finally { setLoading(false); }
  };
  useEffect(() => { if (isSupabase) load(); }, []);

  if (!isSupabase) return <p className="text-sm py-8 text-center" style={{ color: MUTED }}>Connect Supabase to manage bulk orders and delivery zones.</p>;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button onClick={() => setView("bulk")} className="px-3 py-1.5 rounded-sm text-xs" style={{ background: view === "bulk" ? GOLD : WHITE, color: view === "bulk" ? BLACK : INK, border: `1px solid ${CREAM_DARK}` }}>Bulk Requests ({orders.length})</button>
        <button onClick={() => setView("zones")} className="px-3 py-1.5 rounded-sm text-xs" style={{ background: view === "zones" ? GOLD : WHITE, color: view === "zones" ? BLACK : INK, border: `1px solid ${CREAM_DARK}` }}>Delivery Zones ({zones.length})</button>
        <span className="flex-1" />
        {view === "bulk" && orders.length > 0 && <button onClick={() => exportBulk(orders)} className="text-xs uppercase tracking-widest" style={{ color: GOLD }}>Export CSV</button>}
        <button onClick={load} className="text-xs uppercase tracking-widest" style={{ color: GOLD }}>↻</button>
      </div>
      {err && <p className="text-sm mb-3" style={{ color: "#C0392B" }}>{err}</p>}
      {loading && <p className="py-8 text-center text-sm" style={{ color: MUTED }}>Loading…</p>}

      {!loading && view === "bulk" && (
        <div className="grid gap-2">
          {!orders.length && <p className="py-8 text-center text-sm" style={{ color: MUTED }}>No bulk requests yet.</p>}
          {orders.map((o) => (
            <div key={o.id} className="p-3 rounded-sm" style={{ background: WHITE, border: `1px solid ${CREAM_DARK}`, borderLeft: `4px solid ${BULK_COLOR[o.status] || GOLD}` }}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-sm" style={{ color: INK }}>{o.organization_name} <span className="text-[11px]" style={{ color: MUTED }}>· {o.order_type || "—"}</span></p>
                  <p className="text-xs" style={{ color: MUTED }}>{[o.contact_person, o.phone, o.email].filter(Boolean).join(" · ")}</p>
                  <p className="text-xs mt-0.5" style={{ color: MUTED }}>{[o.quantity && `Qty ${o.quantity}`, o.deadline && `by ${o.deadline}`, o.budget && `budget ${fmtLe(o.budget)}`].filter(Boolean).join(" · ")}</p>
                  {o.notes && <p className="text-xs mt-1 italic" style={{ color: "#5C564B" }}>{o.notes}</p>}
                  {o.reference_image_url && <a href={o.reference_image_url} target="_blank" rel="noreferrer" className="text-xs underline" style={{ color: GOLD }}>View reference image</a>}
                  <p className="text-[11px] mt-1" style={{ color: MUTED }}>{(o.created_at || "").slice(0, 10)}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <select value={o.status} onChange={async (e) => { await admSetBulkOrder(o.id, { status: e.target.value }); setOrders((xs) => xs.map((x) => x.id === o.id ? { ...x, status: e.target.value } : x)); }} className="px-2 py-1 rounded-sm text-xs" style={{ ...input, borderColor: BULK_COLOR[o.status] }}>
                    {BULK_STATUS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                  {o.phone && <a href={waLink(`Hello ${o.contact_person || o.organization_name}, regarding your bulk order request with PC Wears…`)} className="text-xs underline" style={{ color: GOLD }}>WhatsApp</a>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && view === "zones" && <ZonesEditor zones={zones} reload={load} setZones={setZones} />}
    </div>
  );
}

function ZonesEditor({ zones, reload, setZones }) {
  const [f, setF] = useState({ zone_name: "", delivery_fee: "", estimated_time: "", note: "", sort_order: "", status: "active" });
  const [editId, setEditId] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const startEdit = (z) => { setEditId(z.id); setF({ zone_name: z.zone_name, delivery_fee: z.delivery_fee, estimated_time: z.estimated_time || "", note: z.note || "", sort_order: z.sort_order || 0, status: z.status }); };
  const reset = () => { setEditId(null); setF({ zone_name: "", delivery_fee: "", estimated_time: "", note: "", sort_order: "", status: "active" }); };
  const save = async () => {
    if (!f.zone_name.trim()) return;
    await admSaveZone(editId ? { ...f, id: editId } : f);
    reset(); reload();
  };

  return (
    <div className="grid gap-3">
      <div className="p-3 rounded-sm" style={{ background: "#FBF8F1", border: `1px solid ${CREAM_DARK}` }}>
        <p className="text-xs uppercase tracking-widest mb-2" style={{ color: MUTED }}>{editId ? "Edit zone" : "Add a delivery zone"}</p>
        <div className="grid sm:grid-cols-2 gap-2">
          <input value={f.zone_name} onChange={set("zone_name")} placeholder="Zone name (e.g. Central Freetown)" className="px-3 py-2 rounded-sm text-sm" style={input} />
          <input type="number" min="0" value={f.delivery_fee} onChange={set("delivery_fee")} placeholder="Delivery fee (Le)" className="px-3 py-2 rounded-sm text-sm" style={input} />
          <input value={f.estimated_time} onChange={set("estimated_time")} placeholder="Estimated time (e.g. Same day)" className="px-3 py-2 rounded-sm text-sm" style={input} />
          <input type="number" value={f.sort_order} onChange={set("sort_order")} placeholder="Sort order (0,1,2…)" className="px-3 py-2 rounded-sm text-sm" style={input} />
          <input value={f.note} onChange={set("note")} placeholder="Note (optional)" className="px-3 py-2 rounded-sm text-sm" style={input} />
          <select value={f.status} onChange={set("status")} className="px-3 py-2 rounded-sm text-sm" style={input}><option value="active">Active (shown to customers)</option><option value="hidden">Hidden</option></select>
        </div>
        <div className="flex gap-2 mt-2">
          <button onClick={save} className="px-4 py-2 rounded-sm text-xs font-medium" style={{ background: GOLD, color: BLACK }}>{editId ? "Update zone" : "Add zone"}</button>
          {editId && <button onClick={reset} className="px-4 py-2 rounded-sm text-xs" style={input}>Cancel</button>}
        </div>
      </div>

      {!zones.length && <p className="py-6 text-center text-sm" style={{ color: MUTED }}>No zones yet. Add your first above.</p>}
      {zones.map((z) => (
        <div key={z.id} className="p-3 rounded-sm flex flex-wrap items-center justify-between gap-2" style={{ background: WHITE, border: `1px solid ${CREAM_DARK}` }}>
          <div>
            <p className="font-medium text-sm" style={{ color: INK }}>{z.zone_name} <span className="text-[11px]" style={{ color: z.status === "active" ? "#2E7D32" : MUTED }}>· {z.status}</span></p>
            <p className="text-xs" style={{ color: MUTED }}>{[Number(z.delivery_fee) > 0 ? fmtLe(z.delivery_fee) : "Free", z.estimated_time, z.note].filter(Boolean).join(" · ")}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => startEdit(z)} className="px-3 py-1.5 rounded-sm text-xs" style={input}>Edit</button>
            <button onClick={async () => { if (confirm("Delete this zone?")) { await admDeleteZone(z.id); reload(); } }} className="px-3 py-1.5 rounded-sm text-xs" style={{ background: WHITE, color: "#C0392B", border: "1px solid #C0392B" }}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function exportBulk(orders) {
  const head = ["Organization", "Contact", "Phone", "Email", "Type", "Quantity", "Deadline", "Budget", "Status", "Date", "Notes"];
  const rows = orders.map((o) => [o.organization_name, o.contact_person || "", o.phone, o.email || "", o.order_type || "", o.quantity || "", o.deadline || "", o.budget || "", o.status, (o.created_at || "").slice(0, 10), (o.notes || "").replace(/\n/g, " ")]);
  const csv = [head, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a"); a.href = url; a.download = "bulk-orders.csv"; a.click(); URL.revokeObjectURL(url);
}
