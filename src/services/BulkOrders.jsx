import { useState, useEffect } from "react";
import { GOLD, BLACK, INK, NAVY, CREAM, CREAM_DARK, MUTED, WHITE, fmtLe, waLink } from "../lib/theme.js";
import { isSupabase } from "../lib/supabase.js";
import { submitBulkOrder, uploadBulkReference, listActiveZones } from "../lib/business.js";

const ORDER_TYPES = ["School uniforms", "Church / Mosque wear", "Corporate / staff uniforms", "Hotel / restaurant uniforms", "Sports team kit", "Security uniforms", "Event / matching outfits", "Other"];

export default function BulkOrders({ go }) {
  const [f, setF] = useState({ organization_name: "", contact_person: "", phone: "", email: "", order_type: ORDER_TYPES[0], quantity: "", deadline: "", budget: "", notes: "" });
  const [refFile, setRefFile] = useState(null);
  const [zones, setZones] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const input = { background: WHITE, border: `1px solid ${CREAM_DARK}`, color: INK };

  useEffect(() => { if (isSupabase) listActiveZones().then(setZones).catch(() => {}); }, []);

  const submit = async () => {
    setErr("");
    if (!isSupabase) { setErr("This form isn’t connected yet."); return; }
    if (!f.organization_name.trim() || !f.phone.trim()) { setErr("Organization name and phone are required."); return; }
    setBusy(true);
    try {
      let reference_image_url = null;
      if (refFile) { try { reference_image_url = await uploadBulkReference(refFile); } catch (e) { console.error("ref upload skipped", e); } }
      await submitBulkOrder({ ...f, reference_image_url });
      const msg = `Hello PC Wears, I'd like a BULK / CORPORATE order quote.\nOrganization: ${f.organization_name}\nContact: ${f.contact_person || f.organization_name}\nPhone: ${f.phone}\nType: ${f.order_type}\nQuantity: ${f.quantity || "to discuss"}\nDeadline: ${f.deadline || "flexible"}\nBudget: ${f.budget ? fmtLe(f.budget) : "to discuss"}${f.notes ? `\nNotes: ${f.notes}` : ""}`;
      setDone(true);
      window.open(waLink(msg), "_blank");
    } catch (e) { setErr(e.message || "Could not submit. Please try again."); }
    finally { setBusy(false); }
  };

  return (
    <div>
      <section style={{ background: `radial-gradient(ellipse at 70% 10%, ${NAVY} 0%, transparent 55%), ${BLACK}` }}>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <p className="text-xs uppercase tracking-[0.35em]" style={{ color: GOLD }}>For organizations</p>
          <h1 className="mt-3" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: "clamp(2rem,5.5vw,3.2rem)", color: CREAM }}>Bulk & Corporate Orders</h1>
          <p className="mt-3 mx-auto max-w-lg text-sm" style={{ color: "#C2BAA9" }}>
            Uniforms and matching outfits for schools, churches, mosques, companies, hotels, NGOs, sports teams and events. Tell us what you need and we’ll send a quote.
          </p>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-4 py-10">
        {done ? (
          <div className="p-5 rounded-sm text-center" style={{ background: "#E9F6EC", border: "1px solid #BFE3C8" }}>
            <div className="mx-auto mb-3 flex items-center justify-center" style={{ width: 56, height: 56, borderRadius: 999, background: GOLD, color: BLACK, fontSize: 26 }}>✓</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 24, color: INK }}>Request received</h2>
            <p className="mt-2 text-sm" style={{ color: "#2E7D32" }}>We’ve saved your request and opened WhatsApp so we can send your quote quickly.</p>
            <button onClick={() => go("home")} className="mt-5 px-5 py-2.5 rounded-sm text-sm font-medium" style={{ background: GOLD, color: BLACK }}>Back to Home</button>
          </div>
        ) : (
          <>
            <h2 className="mb-4" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 24, color: INK }}>Request a quote</h2>
            <div className="grid gap-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <input value={f.organization_name} onChange={set("organization_name")} placeholder="Organization name *" className="px-3 py-2.5 rounded-sm text-sm" style={input} />
                <input value={f.contact_person} onChange={set("contact_person")} placeholder="Contact person" className="px-3 py-2.5 rounded-sm text-sm" style={input} />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <input value={f.phone} onChange={set("phone")} placeholder="Phone / WhatsApp *" className="px-3 py-2.5 rounded-sm text-sm" style={input} />
                <input type="email" value={f.email} onChange={set("email")} placeholder="Email (optional)" className="px-3 py-2.5 rounded-sm text-sm" style={input} />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <select value={f.order_type} onChange={set("order_type")} className="px-3 py-2.5 rounded-sm text-sm" style={input}>
                  {ORDER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <input type="number" min="1" value={f.quantity} onChange={set("quantity")} placeholder="Quantity (e.g. 50)" className="px-3 py-2.5 rounded-sm text-sm" style={input} />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <label className="text-xs" style={{ color: MUTED }}>Deadline<input type="date" value={f.deadline} onChange={set("deadline")} className="w-full px-3 py-2.5 rounded-sm text-sm mt-1" style={input} /></label>
                <label className="text-xs" style={{ color: MUTED }}>Budget (Le, optional)<input type="number" min="0" value={f.budget} onChange={set("budget")} className="w-full px-3 py-2.5 rounded-sm text-sm mt-1" style={input} /></label>
              </div>
              <textarea value={f.notes} onChange={set("notes")} rows={3} placeholder="Details: colours, sizes, logo/embroidery, design notes…" className="px-3 py-2.5 rounded-sm text-sm" style={input} />
              <label className="text-xs" style={{ color: MUTED }}>Reference image (optional)<input type="file" accept="image/*" onChange={(e) => setRefFile(e.target.files?.[0] || null)} className="w-full text-xs mt-1" /></label>
              {err && <p className="text-sm" style={{ color: "#C0392B" }}>{err}</p>}
              <button onClick={submit} disabled={busy} className="px-6 py-3 rounded-sm text-sm font-medium" style={{ background: GOLD, color: BLACK, opacity: busy ? 0.6 : 1 }}>
                {busy ? "Submitting…" : "Submit & continue on WhatsApp"}
              </button>
            </div>
          </>
        )}

        {/* Delivery fees */}
        {zones.length > 0 && (
          <div className="mt-10">
            <h3 className="mb-3" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 20, color: INK }}>Delivery fees</h3>
            <div className="rounded-sm overflow-hidden" style={{ border: `1px solid ${CREAM_DARK}` }}>
              {zones.map((z, i) => (
                <div key={z.id} className="flex items-center justify-between px-4 py-3" style={{ background: i % 2 ? CREAM : WHITE }}>
                  <div>
                    <p className="text-sm" style={{ color: INK }}>{z.zone_name}</p>
                    {z.estimated_time && <p className="text-[11px]" style={{ color: MUTED }}>{z.estimated_time}</p>}
                  </div>
                  <span className="text-sm font-medium" style={{ color: GOLD }}>{Number(z.delivery_fee) > 0 ? fmtLe(z.delivery_fee) : "Free"}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] mt-2" style={{ color: MUTED }}>Fees are estimates and may vary by order size and exact location.</p>
          </div>
        )}
      </div>
    </div>
  );
}
