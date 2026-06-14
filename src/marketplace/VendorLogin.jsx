import { useState } from "react";
import { GOLD, BLACK, INK, NAVY, CREAM, CREAM_DARK, MUTED, WHITE } from "../lib/theme.js";
import { isSupabase } from "../lib/supabase.js";
import { vendorSignIn, vendorCreateLogin } from "../lib/marketplace.js";

/* /vendor-login — sign in, or create a login for an approved application */
export default function VendorLogin({ go, setVendor }) {
  const [mode, setMode] = useState("login");      // login | create
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const input = { background: WHITE, border: `1px solid ${CREAM_DARK}`, color: INK };

  const go2dash = (v) => { setVendor(v); go("vendorDashboard"); };

  const submit = async () => {
    setErr(""); setMsg("");
    if (!isSupabase) { setErr("The marketplace database isn’t connected yet."); return; }
    if (!email.trim() || !pass) { setErr("Email and password are required."); return; }
    setBusy(true);
    try {
      if (mode === "login") {
        const v = await vendorSignIn(email, pass);
        if (!v) { setErr("Signed in, but no vendor shop is linked to this email. If you applied, use “Create my login” with the same email."); return; }
        go2dash(v);
      } else {
        if (pass.length < 6) { setErr("Password must be at least 6 characters."); return; }
        const res = await vendorCreateLogin(email, pass);
        if (res.status === "confirm_email") { setMsg("Account created. If email confirmation is on, confirm via email then log in."); setMode("login"); return; }
        if (!res.vendor) { setErr("Login created, but we couldn’t find an application for this email. Please apply first."); return; }
        go2dash(res.vendor);
      }
    } catch (e) { setErr(e.message || "Something went wrong."); }
    finally { setBusy(false); }
  };

  return (
    <div className="min-h-[70vh]">
      <section style={{ background: `radial-gradient(ellipse at 70% 10%, ${NAVY} 0%, transparent 55%), ${BLACK}` }}>
        <div className="max-w-3xl mx-auto px-4 py-12 text-center">
          <p className="text-xs uppercase tracking-[0.35em]" style={{ color: GOLD }}>Vendor Portal</p>
          <h1 className="mt-3" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: "clamp(1.8rem,5vw,2.6rem)", color: CREAM }}>{mode === "login" ? "Vendor login" : "Create your login"}</h1>
        </div>
      </section>
      <div className="max-w-sm mx-auto px-4 py-10">
        <div className="grid gap-3">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email used when you applied" autoComplete="username" className="px-3 py-2.5 rounded-sm text-sm" style={input} />
          <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="Password" autoComplete={mode === "login" ? "current-password" : "new-password"} className="px-3 py-2.5 rounded-sm text-sm" style={input} />
          {err && <p className="text-sm" style={{ color: "#C0392B" }}>{err}</p>}
          {msg && <p className="text-sm" style={{ color: "#2E7D32" }}>{msg}</p>}
          <button onClick={submit} disabled={busy} className="px-6 py-3 rounded-sm text-sm font-medium" style={{ background: GOLD, color: BLACK, opacity: busy ? 0.7 : 1 }}>{busy ? "Please wait…" : (mode === "login" ? "Log in" : "Create login")}</button>
          <button onClick={() => { setMode(mode === "login" ? "create" : "login"); setErr(""); setMsg(""); }} className="text-xs uppercase tracking-widest" style={{ color: GOLD }}>
            {mode === "login" ? "First time? Create your login" : "Already have a login? Sign in"}
          </button>
          <button onClick={() => go("vendorRegister")} className="text-xs" style={{ color: MUTED }}>Don’t have a shop yet? Apply to sell →</button>
        </div>
      </div>
    </div>
  );
}
