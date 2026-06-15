import { useState, useEffect } from "react";
import { GOLD, BLACK, INK, NAVY, CREAM, CREAM_DARK, MUTED, WHITE, fmtLe, waLink } from "../lib/theme.js";
import { isSupabase } from "../lib/supabase.js";
import { listActiveClasses, registerForClass } from "../lib/classes.js";

const LEVELS = { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced", all_levels: "All levels" };

export default function FashionClasses({ go }) {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    if (!isSupabase) { setLoading(false); return; }
    listActiveClasses().then((d) => setClasses(d)).catch((e) => setErr(e.message || "Could not load classes.")).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section style={{ background: `radial-gradient(ellipse at 70% 10%, ${NAVY} 0%, transparent 55%), ${BLACK}` }}>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <p className="text-xs uppercase tracking-[0.35em]" style={{ color: GOLD }}>Learn with PC Wears</p>
          <h1 className="mt-3" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: "clamp(2rem,5.5vw,3.2rem)", color: CREAM }}>Fashion Classes & Training</h1>
          <p className="mt-3 mx-auto max-w-lg text-sm" style={{ color: "#C2BAA9" }}>
            Learn tailoring, design and the fashion business from the PC Wears team — for beginners and upcoming designers. Reserve your seat below.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-10">
        {!isSupabase && <Empty>The class schedule isn’t connected yet.</Empty>}
        {err && <p className="text-sm mb-4" style={{ color: "#C0392B" }}>{err}</p>}
        {loading && <p className="py-12 text-center text-sm" style={{ color: MUTED }}>Loading classes…</p>}
        {!loading && isSupabase && !classes.length && !err && (
          <Empty>
            No classes are open for registration right now. Message us on WhatsApp to hear when the next one starts.
            <div className="mt-4"><a href={waLink("Hello PC Wears, I'd like to know when your next fashion class starts.")} className="inline-block px-5 py-2.5 rounded-sm text-sm font-medium" style={{ background: GOLD, color: BLACK }}>Ask on WhatsApp</a></div>
          </Empty>
        )}

        <div className="grid sm:grid-cols-2 gap-5">
          {classes.map((c) => (
            <ClassCard key={c.id} c={c} open={openId === c.id} onToggle={() => setOpenId(openId === c.id ? null : c.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ClassCard({ c, open, onToggle }) {
  const meta = [LEVELS[c.level] || c.level, c.duration, c.is_online ? "Online" : c.location].filter(Boolean).join(" · ");
  return (
    <div className="rounded-sm overflow-hidden flex flex-col" style={{ background: WHITE, border: `1px solid ${CREAM_DARK}` }}>
      {c.image_url
        ? <img src={c.image_url} alt={c.title} className="w-full h-44 object-cover" />
        : <div className="w-full h-44 flex items-center justify-center text-3xl" style={{ background: NAVY, color: GOLD }}>✂</div>}
      <div className="p-5 flex flex-col flex-1">
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 22, color: INK }}>{c.title}</h3>
        <p className="text-xs mt-1" style={{ color: MUTED }}>{meta}</p>
        {c.description && <p className="text-sm mt-2" style={{ color: "#5C564B" }}>{c.description}</p>}
        <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: `1px solid ${CREAM}` }}>
          <span style={{ color: GOLD, fontWeight: 600 }}>{Number(c.price) > 0 ? fmtLe(c.price) : "Ask for price"}</span>
          {c.start_date && <span className="text-xs" style={{ color: MUTED }}>Starts {c.start_date}</span>}
        </div>
        {c.instructor_name && <p className="text-[11px] mt-2" style={{ color: MUTED }}>Instructor: {c.instructor_name}</p>}
        <button onClick={onToggle} className="mt-4 px-4 py-2.5 rounded-sm text-sm font-medium" style={{ background: open ? WHITE : GOLD, color: open ? INK : BLACK, border: `1px solid ${open ? CREAM_DARK : GOLD}` }}>
          {open ? "Close" : "Register"}
        </button>
        {open && <RegisterForm c={c} />}
      </div>
    </div>
  );
}

function RegisterForm({ c }) {
  const [f, setF] = useState({ student_name: "", phone: "", whatsapp: "", email: "", experience_level: "beginner", message: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const input = { background: WHITE, border: `1px solid ${CREAM_DARK}`, color: INK };

  const submit = async () => {
    setErr("");
    if (!f.student_name.trim() || !f.phone.trim()) { setErr("Your name and phone are required."); return; }
    setBusy(true);
    try {
      await registerForClass({ class_id: c.id, class_title: c.title, ...f });
      const msg = `Hello PC Wears, I'd like to register for the "${c.title}" fashion class.\nName: ${f.student_name}\nPhone: ${f.phone}\nLevel: ${f.experience_level}${f.message ? `\nNote: ${f.message}` : ""}`;
      setDone(true);
      window.open(waLink(msg), "_blank");
    } catch (e) { setErr(e.message || "Could not submit. Please try again."); }
    finally { setBusy(false); }
  };

  if (done) return (
    <div className="mt-3 p-3 rounded-sm text-sm" style={{ background: "#E9F6EC", color: "#2E7D32" }}>
      You’re registered! We’ve opened WhatsApp so you can confirm your seat and arrange payment. If it didn’t open,{" "}
      <a className="underline" href={waLink(`Hello PC Wears, I just registered for the "${c.title}" class.`)}>tap here</a>.
    </div>
  );

  return (
    <div className="mt-3 grid gap-2">
      <input value={f.student_name} onChange={set("student_name")} placeholder="Full name *" className="px-3 py-2 rounded-sm text-sm" style={input} />
      <div className="grid grid-cols-2 gap-2">
        <input value={f.phone} onChange={set("phone")} placeholder="Phone *" className="px-3 py-2 rounded-sm text-sm" style={input} />
        <input value={f.whatsapp} onChange={set("whatsapp")} placeholder="WhatsApp" className="px-3 py-2 rounded-sm text-sm" style={input} />
      </div>
      <input value={f.email} onChange={set("email")} placeholder="Email (optional)" className="px-3 py-2 rounded-sm text-sm" style={input} />
      <select value={f.experience_level} onChange={set("experience_level")} className="px-3 py-2 rounded-sm text-sm" style={input}>
        <option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option>
      </select>
      <textarea value={f.message} onChange={set("message")} rows={2} placeholder="Anything you'd like us to know (optional)" className="px-3 py-2 rounded-sm text-sm" style={input} />
      {err && <p className="text-xs" style={{ color: "#C0392B" }}>{err}</p>}
      <button onClick={submit} disabled={busy} className="px-4 py-2.5 rounded-sm text-sm font-medium" style={{ background: GOLD, color: BLACK, opacity: busy ? 0.6 : 1 }}>
        {busy ? "Submitting…" : "Submit & confirm on WhatsApp"}
      </button>
    </div>
  );
}

function Empty({ children }) {
  return <div className="py-12 text-center text-sm max-w-md mx-auto" style={{ color: MUTED }}>{children}</div>;
}
