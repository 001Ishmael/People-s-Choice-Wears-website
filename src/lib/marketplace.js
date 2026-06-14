import { supabase } from "./supabase.js";
import { slugify } from "./theme.js";

/* ============================================================
   People's Choice Fashion Marketplace — data layer
   Phase 1: vendor registration + vendor account helpers.
   All data is stored in Supabase. No keys are hardcoded; the
   client comes from src/lib/supabase.js (env vars).
   ============================================================ */

function ensureSupabase() {
  if (!supabase) throw new Error("Supabase is not configured. Check your environment variables.");
}

/* Upload a File (from an <input type="file">) to a public bucket; returns its URL. */
export async function uploadVendorImage(bucket, file) {
  if (!file) return null;
  ensureSupabase();
  const ext = (file.name && file.name.split(".").pop()) || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: file.type || "image/jpeg",
    upsert: true,
  });
  if (error) throw error;
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

/* The vendor row for the signed-in user, or null. */
export async function currentVendor() {
  ensureSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("vendors").select("*").eq("auth_user_id", user.id).maybeSingle();
  return data || null;
}

/*
  Register a new vendor.
  form = {
    businessName, ownerName, email, password, phone, whatsapp,
    location, businessCategory, vendorType, description,
    logoFile, coverFile        // optional File objects
  }
  Creates a Supabase Auth user, uploads images, and inserts a
  vendors row with status 'pending' (awaiting admin approval).
*/
export async function vendorRegister(form) {
  ensureSupabase();

  // 1) Create the Auth account (also stash business info in metadata so the
  //    profile can be recovered on first login if email confirmation is ON).
  const { data: signUp, error: authErr } = await supabase.auth.signUp({
    email: (form.email || "").trim(),
    password: form.password,
    options: {
      data: {
        role: "vendor",
        business_name: form.businessName,
        owner_name: form.ownerName,
        phone: form.phone,
        whatsapp: form.whatsapp,
        vendor_type: form.vendorType,
      },
    },
  });
  if (authErr) throw authErr;

  // If email confirmation is ON, there is no session yet and RLS won't let us
  // insert the vendor row. Tell the caller to confirm + log in.
  if (!signUp.session || !signUp.user) {
    return { status: "confirm_email" };
  }

  // 2) Upload images (best effort).
  let logo_url = null, cover_image_url = null;
  try { if (form.logoFile) logo_url = await uploadVendorImage("vendor-logos", form.logoFile); } catch (e) { console.error("logo upload", e); }
  try { if (form.coverFile) cover_image_url = await uploadVendorImage("vendor-covers", form.coverFile); } catch (e) { console.error("cover upload", e); }

  // 3) Insert the vendor row (status pending, trial plan).
  const base = slugify(form.businessName) || "vendor";
  const slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
  const { data: vendor, error: insErr } = await supabase
    .from("vendors")
    .insert({
      auth_user_id: signUp.user.id,
      business_name: form.businessName,
      slug,
      owner_name: form.ownerName || null,
      email: (form.email || "").trim() || null,
      phone: form.phone || null,
      whatsapp: form.whatsapp || null,
      location: form.location || null,
      business_category: form.businessCategory || null,
      vendor_type: form.vendorType || "other",
      description: form.description || null,
      logo_url,
      cover_image_url,
      status: "pending",
      subscription_plan: "trial",
      subscription_status: "trial",
      product_limit: 5,
    })
    .select()
    .maybeSingle();
  if (insErr) throw insErr;

  return { status: "registered", vendor };
}
