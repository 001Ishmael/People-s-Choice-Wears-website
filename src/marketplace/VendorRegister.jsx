import { useState } from "react";
import { GOLD, BLACK, INK, NAVY, CREAM, CREAM_DARK, MUTED, WHITE, VENDOR_TYPES } from "../lib/theme.js";
import { isSupabase, supabase } from "../lib/supabase.js";

/* People's Choice Fashion Marketplace — Vendor registration / application.
   Phase 1: submits via the public.submit_vendor_application RPC (SECURITY
   DEFINER), so no direct table insert and no Supabase Auth/email are needed.
   Image upload to vendor-logos / vendor-covers is best-effort. */
export default function VendorRegister({ go }) {
  const [f, setF] = useState({
    businessName: "", ownerName: "", email: "", phone: "", whatsapp: "",
    location: "", businessCategory: "", vendorType: "clothing_brand", description: "",
  });
  const [logoFile, setLogoFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const input = { background: WHITE, border: `1px solid ${CREAM_DARK}`, color: INK };

  // Best-effort image upload to a public bucket; returns a URL or null.
  const tryUpload = async (bucket, file) => {
    if (!file || !supabase) return null;
    try {
      const ext = (file.name && file.name.split(".").pop()) || "jpg";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from(bucket).upload(path, file, {
        contentType: file.type || "image/jpeg", upsert: true,
      });
      if (error) throw error;
      return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
    } catch (e) {
      console.error(`${bucket} upload skipped:`, e.message || e);
      return null; // allow the application to continue without images
    }
  };

  const submit = async () => {
    setErr("");
    if (!isSupabase || !supabase) { setErr("The marketplace database is not connected yet."); return; }
    if (!f.businessName.trim() || !f.email.trim()) { setErr("Business name and email are required."); return; }
    if (!f.phone.trim()) { setErr("A phone number is required so customers can reach you."); return; }

    setBusy(true);
    try {
      const p_logo_url = await tryUpload("vendor-logos", logoFile);
      const p_cover_image_url = await tryUpload("vendor-covers", coverFile);

      const { error } = await supabase.rpc("submit_vendor_application", {
        p_business_name: f.businessName.trim(),
        p_owner_name: f.ownerName.trim() || null,
        p_email: f.email.trim(),
        p_phone: f.phone.trim(),
        p_whatsapp: f.whatsapp.trim() || null,
        p_location: f.location.trim() || null,
        p_business_category: f.businessCategory.trim() || null,
        p_vendor_type: f.vendorType || "other",
        p_description: f.description.trim() || null,
        p_logo_url,
        p_cover_image_url,
      });
      if (error) throw error;
      setDone(true);
    } catch (e) {
      setErr(e.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="mx-auto mb-5 flex items-center justify-center" style={{ width: 64, height: 64, borderRadius: 999, background: GOLD, color: BLACK, fontSize: 30 }}>✓</div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 30, color: INK }}>Application submitted</h1>
        <p className="mt-3 text-sm" style={{ color: MUTED }}>
          Application submitted successfully. Your shop will go live after PC Wears approves it.
        </p>
        <button onClick={() => go("home")} className="mt-7 px-6 py-3 rounded-sm text-sm font-medium" style={{ background: GOLD, color: BLACK }}>
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div>
      <section style={{ background: `radial-gradient(ellipse at 70% 10%, ${NAVY} 0%, transparent 55%), ${BLACK}` }}>
        <div className="max-w-3xl mx-auto px-4 py-14 text-center">
          <p className="text-xs uppercase tracking-[0.35em]" style={{ color: GOLD }}>Sell on People's Choice</p>
          <h1 className="mt-3" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: "clamp(2rem,5vw,3rem)", color: CREAM }}>
            Open your shop
          </h1>
          <p className="mt-3 mx-auto max-w-lg text-sm" style={{ color: "#C2BAA9" }}>
            Join the People's Choice Fashion Marketplace. Reach more customers across Freetown and beyond. Apply below — it's free to start.
          </p>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-4 py-10">
        <h2 className="mb-1" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 24, color: INK }}>Vendor application</h2>
        <p className="text-sm mb-6" style={{ color: MUTED }}>Tell us about your business. Fields marked * are required.</p>

        <div className="grid gap-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Business name *"><input value={f.businessName} onChange={set("businessName")} style={input} className="w-full px-3 py-2.5 rounded-sm text-sm" /></Field>
            <Field label="Owner / contact name"><input value={f.ownerName} onChange={set("ownerName")} style={input} className="w-full px-3 py-2.5 rounded-sm text-sm" /></Field>
          </div>

          <Field label="Business email *"><input type="email" value={f.email} onChange={set("email")} style={input} className="w-full px-3 py-2.5 rounded-sm text-sm" /></Field>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Phone *"><input value={f.phone} onChange={set("phone")} placeholder="+232 …" style={input} className="w-full px-3 py-2.5 rounded-sm text-sm" /></Field>
            <Field label="WhatsApp"><input value={f.whatsapp} onChange={set("whatsapp")} placeholder="+232 …" style={input} className="w-full px-3 py-2.5 rounded-sm text-sm" /></Field>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Vendor type *">
              <select value={f.vendorType} onChange={set("vendorType")} style={input} className="w-full px-3 py-2.5 rounded-sm text-sm">
                {VENDOR_TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </Field>
            <Field label="Business category"><input value={f.businessCategory} onChange={set("businessCategory")} placeholder="e.g. Africana, menswear, perfumes" style={input} className="w-full px-3 py-2.5 rounded-sm text-sm" /></Field>
          </div>

          <Field label="Business location"><input value={f.location} onChange={set("location")} placeholder="e.g. 25 Sanders Street, Freetown" style={input} className="w-full px-3 py-2.5 rounded-sm text-sm" /></Field>

          <Field label="Business description"><textarea value={f.description} onChange={set("description")} rows={3} placeholder="What you sell, your style, what makes you stand out…" style={input} className="w-full px-3 py-2.5 rounded-sm text-sm" /></Field>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Logo (optional)"><input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} className="w-full text-xs" /></Field>
            <Field label="Cover image (optional)"><input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} className="w-full text-xs" /></Field>
          </div>

          {err && <p className="text-sm" style={{ color: "#C0392B" }}>{err}</p>}

          <button onClick={submit} disabled={busy} className="px-6 py-3 rounded-sm text-sm font-medium" style={{ background: GOLD, color: BLACK, opacity: busy ? 0.7 : 1 }}>
            {busy ? "Submitting…" : "Submit application"}
          </button>
          <p className="text-[11px] text-center" style={{ color: MUTED }}>
            Your shop goes live after our team approves it. By applying you agree to keep your listings accurate and lawful.
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block mb-1" style={{ color: "#8C8576", fontSize: 11, letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</span>
      {children}
    </label>
  );
}
