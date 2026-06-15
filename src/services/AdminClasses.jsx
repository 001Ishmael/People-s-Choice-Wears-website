import { useState, useEffect } from "react";
import { GOLD, BLACK, INK, CREAM, CREAM_DARK, MUTED, WHITE, fmtLe, waLink } from "../lib/theme.js";
import { isSupabase } from "../lib/supabase.js";
import { admListClasses, admSaveClass, admDeleteClass, admListRegistrations, admSetRegistration, uploadClassImage } from "../lib/classes.js";

const input = { background: WHITE, border: `1px solid ${CREAM_DARK}`, color: INK };
const PAY = [["unpaid", "Unpaid"], ["deposit", "Deposit"], ["paid", "Paid"]];
const PAY_COLOR = { unpaid: "#C0392B", deposit: "#B8860B", paid: "#2E7D32" };

export default function AdminClasses() {
  const [view, setView] = useState("classes"); // classes | registrations
  const [classes, setClasses] = useState([]);
  const [regs, setRegs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [editing, setEditing] = useState(null); // class object or "new"

  const load = async () => {
    setErr(""); setLoading(true);
    try { setClasses(await admListClasses()); setRegs(await admListRegistrations()); }
    catch (e) { setErr(e.message || "Could not load."); }
    finally { setLoading(false); }
  };
  useEffect(() => { if (isSupabase) load(); }, []);

  if (!isSupabase) return <p className="text-sm py-8 text-center" style={{ color: MUTED }}>Connect Supabase to manage classes.</p>;
  if (editing) return <ClassForm editing={editing === "new" ? null : editing} onDone={() => { setEditing(null); load(); }} />;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button onClick={() => setView("classes")} className="px-3 py-1.5 rounded-sm text-xs" style={{ background: view === "classes" ? GOLD : WHITE, color: view === "classes" ? BLACK : INK, border: `1px solid ${CREAM_DARK}` }}>Classes ({classes.length})</button>
        <button onClick={() => setView("registrations")} className="px-3 py-1.5 rounded-sm text-xs" style={{ background: view === "registrations" ? GOLD : WHITE, color: view === "registrations" ? BLACK : INK, border: `1px solid ${CREAM_DARK}` }}>Registrations ({regs.length})</button>
        <span className="flex-1" />
        {view === "classes" && <button onClick={() => setEditing("new")} className="px-3 py-1.5 rounded-sm text-xs font-medium" style={{ background: GOLD, color: BLACK }}>+ New Class</button>}
        {view === "registrations" && regs.length > 0 && <button onClick={() => exportRegs(regs)} className="text-xs uppercase tracking-widest" style={{ color: GOLD }}>Export CSV</button>}
        <button onClick={load} className="text-xs uppercase tracking-widest" style={{ color: GOLD }}>↻</button>
      </div>
      {err && <p className="text-sm mb-3" style={{ color: "#C0392B" }}>{err}</p>}
      {loading && <p className="py-8 text-center text-sm" style={{ color: MUTED }}>Loading…</p>}

      {!loading && view === "classes" && (
        <div className="grid gap-2">
          {!classes.length && <p className="py-8 text-center text-sm" style={{ color: MUTED }}>No classes yet. Add your first one.</p>}
          {classes.map((c) => (
            <div key={c.id} className="p-3 rounded-sm flex flex-wrap items-center justify-between gap-2" style={{ background: WHITE, border: `1px solid ${CREAM_DARK}` }}>
              <div>
                <p className="font-medium text-sm" style={{ color: INK }}>{c.title} <span className="text-[11px]" style={{ color: c.status === "active" ? "#2E7D32" : MUTED }}>· {c.status}</span></p>
                <p className="text-xs" style={{ color: MUTED }}>{[c.level, c.duration, c.start_date && `starts ${c.start_date}`, Number(c.price) > 0 ? fmtLe(c.price) : "price on request"].filter(Boolean).join(" · ")}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditing(c)} className="px-3 py-1.5 rounded-sm text-xs" style={{ ...input }}>Edit</button>
                <button onClick={async () => { if (confirm("Delete this class?")) { await admDeleteClass(c.id); load(); } }} className="px-3 py-1.5 rounded-sm text-xs" style={{ background: WHITE, color: "#C0392B", border: "1px solid #C0392B" }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && view === "registrations" && (
        <div className="grid gap-2">
          {!regs.length && <p className="py-8 text-center text-sm" style={{ color: MUTED }}>No registrations yet.</p>}
          {regs.map((r) => (
            <div key={r.id} className="p-3 rounded-sm" style={{ background: WHITE, border: `1px solid ${CREAM_DARK}`, borderLeft: `4px solid ${PAY_COLOR[r.payment_status]}` }}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-sm" style={{ color: INK }}>{r.student_name} <span className="text-[11px]" style={{ color: MUTED }}>· {r.class_title || "—"}</span></p>
                  <p className="text-xs" style={{ color: MUTED }}>{[r.phone, r.email, r.experience_level].filter(Boolean).join(" · ")}</p>
                  {r.message && <p className="text-xs mt-1 italic" style={{ color: MUTED }}>{r.message}</p>}
                  <p className="text-[11px] mt-1" style={{ color: MUTED }}>{(r.created_at || "").slice(0, 10)}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <select value={r.payment_status} onChange={async (e) => { await admSetRegistration(r.id, { payment_status: e.target.value }); setRegs((xs) => xs.map((x) => x.id === r.id ? { ...x, payment_status: e.target.value } : x)); }} className="px-2 py-1 rounded-sm text-xs" style={{ ...input, borderColor: PAY_COLOR[r.payment_status] }}>
                    {PAY.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                  {r.phone && <a href={waLink(`Hello ${r.student_name}, regarding your registration for "${r.class_title}"...`)} className="text-xs underline" style={{ color: GOLD }}>WhatsApp</a>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ClassForm({ editing, onDone }) {
  const [f, setF] = useState(editing || { title: "", description: "", level: "beginner", duration: "", price: "", start_date: "", end_date: "", location: "", is_online: false, instructor_name: "", capacity: "", status: "active", image_url: null });
  const [imgFile, setImgFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  const save = async () => {
    setErr("");
    if (!f.title.trim()) { setErr("Title is required."); return; }
    setBusy(true);
    try {
      let image_url = f.image_url || null;
      if (imgFile) { try { image_url = await uploadClassImage(imgFile); } catch (e) { console.error("image upload skipped", e); } }
      await admSaveClass({ ...f, image_url });
      onDone();
    } catch (e) { setErr(e.message || "Save failed."); setBusy(false); }
  };

  return (
    <div className="max-w-2xl">
      <button onClick={onDone} className="text-xs uppercase tracking-widest mb-4" style={{ color: GOLD }}>← Back to classes</button>
      <h3 className="mb-4" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 22 }}>{editing ? "Edit class" : "New class"}</h3>
      <div className="grid gap-3">
        <input value={f.title} onChange={set("title")} placeholder="Class title *" className="px-3 py-2.5 rounded-sm text-sm" style={input} />
        <textarea value={f.description} onChange={set("description")} rows={3} placeholder="Description" className="px-3 py-2.5 rounded-sm text-sm" style={input} />
        <div className="grid sm:grid-cols-2 gap-3">
          <select value={f.level} onChange={set("level")} className="px-3 py-2.5 rounded-sm text-sm" style={input}>
            <option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option><option value="all_levels">All levels</option>
          </select>
          <input value={f.duration} onChange={set("duration")} placeholder="Duration (e.g. 6 weeks)" className="px-3 py-2.5 rounded-sm text-sm" style={input} />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <input type="number" min="0" value={f.price} onChange={set("price")} placeholder="Price (Le)" className="px-3 py-2.5 rounded-sm text-sm" style={input} />
          <input type="number" min="0" value={f.capacity} onChange={set("capacity")} placeholder="Capacity (optional)" className="px-3 py-2.5 rounded-sm text-sm" style={input} />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="text-xs" style={{ color: MUTED }}>Start date<input type="date" value={f.start_date || ""} onChange={set("start_date")} className="w-full px-3 py-2.5 rounded-sm text-sm mt-1" style={input} /></label>
          <label className="text-xs" style={{ color: MUTED }}>End date<input type="date" value={f.end_date || ""} onChange={set("end_date")} className="w-full px-3 py-2.5 rounded-sm text-sm mt-1" style={input} /></label>
        </div>
        <input value={f.location} onChange={set("location")} placeholder="Location (e.g. 25 Sanders Street)" className="px-3 py-2.5 rounded-sm text-sm" style={input} />
        <label className="flex items-center gap-2 text-sm" style={{ color: INK }}><input type="checkbox" checked={!!f.is_online} onChange={set("is_online")} /> Online class</label>
        <input value={f.instructor_name} onChange={set("instructor_name")} placeholder="Instructor name" className="px-3 py-2.5 rounded-sm text-sm" style={input} />
        <label className="text-xs" style={{ color: MUTED }}>Flyer / image<input type="file" accept="image/*" onChange={(e) => setImgFile(e.target.files?.[0] || null)} className="w-full text-xs mt-1" /></label>
        <select value={f.status} onChange={set("status")} className="px-3 py-2.5 rounded-sm text-sm" style={input}>
          <option value="active">Active (visible)</option><option value="hidden">Hidden</option><option value="completed">Completed</option>
        </select>
        {err && <p className="text-sm" style={{ color: "#C0392B" }}>{err}</p>}
        <div className="flex gap-2">
          <button onClick={save} disabled={busy} className="px-5 py-2.5 rounded-sm text-sm font-medium" style={{ background: GOLD, color: BLACK, opacity: busy ? 0.6 : 1 }}>{busy ? "Saving…" : "Save class"}</button>
          <button onClick={onDone} className="px-5 py-2.5 rounded-sm text-sm" style={input}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function exportRegs(regs) {
  const head = ["Name", "Phone", "WhatsApp", "Email", "Class", "Level", "Payment", "Amount", "Date"];
  const rows = regs.map((r) => [r.student_name, r.phone, r.whatsapp || "", r.email || "", r.class_title || "", r.experience_level || "", r.payment_status, r.amount_paid || 0, (r.created_at || "").slice(0, 10)]);
  const csv = [head, ...rows].map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a"); a.href = url; a.download = "class-registrations.csv"; a.click(); URL.revokeObjectURL(url);
}
