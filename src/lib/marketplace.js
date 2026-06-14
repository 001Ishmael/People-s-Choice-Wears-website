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
  Phase 1 (no Auth yet): save a vendor APPLICATION directly.
  Inserts a vendors row with status 'pending' and auth_user_id null.
  Image upload is best-effort — if it fails (e.g. storage not open to the
  public), the application still saves and the logo can be added later.
*/
export async function vendorApply(form) {
  ensureSupabase();

  let logo_url = null, cover_image_url = null;
  try { if (form.logoFile) logo_url = await uploadVendorImage("vendor-logos", form.logoFile); }
  catch (e) { console.error("logo upload skipped:", e.message || e); }
  try { if (form.coverFile) cover_image_url = await uploadVendorImage("vendor-covers", form.coverFile); }
  catch (e) { console.error("cover upload skipped:", e.message || e); }

  const base = slugify(form.businessName) || "vendor";
  const slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;

  const { data, error } = await supabase
    .from("vendors")
    .insert({
      auth_user_id: null,
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
  if (error) throw error;
  return { status: "registered", vendor: data };
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

/* ============================================================
   PHASE 1 (rest) — vendor auth linking, vendor CRUD,
   public marketplace queries, and admin management.
   ============================================================ */

/* ---------- vendor authentication / linking ---------- */
// After a vendor signs up or signs in, link their Auth user to their
// pending vendor row (matched by email) via the claim_vendor RPC.
export async function claimVendor(email) {
  ensureSupabase();
  const { data, error } = await supabase.rpc("claim_vendor", { p_email: (email || "").trim() });
  if (error) throw error;
  return data || null;
}
export async function vendorSignIn(email, password) {
  ensureSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email: (email || "").trim(), password });
  if (error) throw error;
  let v = await currentVendor();
  if (!v) { try { v = await claimVendor(email); } catch (e) { /* none to claim */ } }
  return v;
}
export async function vendorCreateLogin(email, password) {
  ensureSupabase();
  const { data, error } = await supabase.auth.signUp({
    email: (email || "").trim(), password,
    options: { data: { role: "vendor" } },
  });
  if (error) throw error;
  if (!data.session) return { status: "confirm_email" };
  const v = await claimVendor(email);
  return { status: "ok", vendor: v };
}
export async function vendorSignOut() { if (supabase) await supabase.auth.signOut(); }

/* ---------- vendor dashboard: profile ---------- */
export async function vendorUpdateProfile(vendorId, patch, files = {}) {
  ensureSupabase();
  const up = { ...patch };
  try { if (files.logoFile) up.logo_url = await uploadVendorImage("vendor-logos", files.logoFile); } catch (e) { console.error(e); }
  try { if (files.coverFile) up.cover_image_url = await uploadVendorImage("vendor-covers", files.coverFile); } catch (e) { console.error(e); }
  // never allow self-elevation
  delete up.status; delete up.is_verified; delete up.subscription_plan; delete up.subscription_status; delete up.product_limit; delete up.auth_user_id;
  const { data, error } = await supabase.from("vendors").update(up).eq("id", vendorId).select().maybeSingle();
  if (error) throw error;
  return data;
}

/* ---------- vendor products ---------- */
export async function vendorListProducts(vendorId) {
  ensureSupabase();
  const { data, error } = await supabase.from("vendor_products").select("*").eq("vendor_id", vendorId).order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}
const csv = (s) => (s || "").split(",").map((x) => x.trim()).filter(Boolean);
export async function vendorSaveProduct(vendorId, p, files = []) {
  ensureSupabase();
  let images = p.images || [];
  for (const file of (files || [])) { try { const u = await uploadVendorImage("vendor-products", file); if (u) images.push(u); } catch (e) { console.error(e); } }
  const row = {
    vendor_id: vendorId, name: p.name, slug: slugify(p.name) + "-" + Math.random().toString(36).slice(2, 5),
    description: p.description || null, category: p.category || null, subcategory: p.subcategory || null,
    price: Number(p.price) || 0, currency: p.currency || "SLE",
    stock_quantity: Number(p.stock_quantity) || 0, stock_status: p.stock_status || "available",
    images, sizes: Array.isArray(p.sizes) ? p.sizes : csv(p.sizes), colors: Array.isArray(p.colors) ? p.colors : csv(p.colors),
    material: p.material || null, location: p.location || null,
    is_featured: !!p.is_featured, status: p.status || "active",
  };
  if (p.id) { const { error } = await supabase.from("vendor_products").update(row).eq("id", p.id); if (error) throw error; }
  else { const { error } = await supabase.from("vendor_products").insert(row); if (error) throw error; }
}
export async function vendorDeleteProduct(id) { ensureSupabase(); const { error } = await supabase.from("vendor_products").delete().eq("id", id); if (error) throw error; }

/* ---------- fabric products ---------- */
export async function vendorListFabrics(vendorId) {
  ensureSupabase();
  const { data, error } = await supabase.from("fabric_products").select("*").eq("vendor_id", vendorId).order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}
export async function vendorSaveFabric(vendorId, p, files = []) {
  ensureSupabase();
  let images = p.images || [];
  for (const file of (files || [])) { try { const u = await uploadVendorImage("fabric-products", file); if (u) images.push(u); } catch (e) { console.error(e); } }
  const row = {
    vendor_id: vendorId, fabric_name: p.fabric_name, slug: slugify(p.fabric_name) + "-" + Math.random().toString(36).slice(2, 5),
    fabric_type: p.fabric_type || null, color: p.color || null, pattern: p.pattern || null, material: p.material || null,
    price_per_yard: p.price_per_yard ? Number(p.price_per_yard) : null,
    price_per_meter: p.price_per_meter ? Number(p.price_per_meter) : null,
    available_yards: Number(p.available_yards) || 0, available_meters: Number(p.available_meters) || 0,
    minimum_order_quantity: Number(p.minimum_order_quantity) || 1, fabric_width: p.fabric_width || null,
    bulk_price: p.bulk_price ? Number(p.bulk_price) : null, wholesale_price: p.wholesale_price ? Number(p.wholesale_price) : null,
    retail_price: p.retail_price ? Number(p.retail_price) : null, delivery_option: p.delivery_option || null,
    pickup_location: p.pickup_location || null, images, stock_status: p.stock_status || "available", status: p.status || "active",
  };
  if (p.id) { const { error } = await supabase.from("fabric_products").update(row).eq("id", p.id); if (error) throw error; }
  else { const { error } = await supabase.from("fabric_products").insert(row); if (error) throw error; }
}
export async function vendorDeleteFabric(id) { ensureSupabase(); const { error } = await supabase.from("fabric_products").delete().eq("id", id); if (error) throw error; }

/* ---------- inquiries / requests ---------- */
export async function vendorListInquiries(vendorId) {
  ensureSupabase();
  const { data, error } = await supabase.from("vendor_inquiries").select("*").eq("vendor_id", vendorId).order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}
export async function submitInquiry(row) {
  ensureSupabase();
  const { error } = await supabase.from("vendor_inquiries").insert(row);
  if (error) throw error;
}
export async function vendorRequestVerification(vendorId) {
  return submitInquiry({ vendor_id: vendorId, message: "Verification request from vendor", inquiry_type: "form" });
}
export async function vendorRequestPromotion(vendorId, promotion_type) {
  ensureSupabase();
  const { error } = await supabase.from("vendor_promotions").insert({ vendor_id: vendorId, promotion_type, status: "requested" });
  if (error) throw error;
}
export async function vendorRequestSubscription(vendorId, plan_name, amount) {
  ensureSupabase();
  const { error } = await supabase.from("vendor_subscriptions").insert({ vendor_id: vendorId, plan_name, amount: Number(amount) || 0, status: "unpaid" });
  if (error) throw error;
}
export async function vendorListSubscriptions(vendorId) {
  ensureSupabase();
  const { data, error } = await supabase.from("vendor_subscriptions").select("*").eq("vendor_id", vendorId).order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

/* ---------- public marketplace queries ---------- */
export async function listMarketplaceProducts({ search = "", category = "" } = {}) {
  ensureSupabase();
  let q = supabase.from("vendor_products")
    .select("*, vendor:vendors!inner(business_name,slug,is_verified,whatsapp,phone,status)")
    .eq("status", "active").eq("vendor.status", "approved")
    .order("is_featured", { ascending: false }).order("created_at", { ascending: false });
  if (search) q = q.ilike("name", `%${search}%`);
  if (category) q = q.eq("category", category);
  const { data, error } = await q;
  if (error) throw error;
  return data;
}
export async function listMarketplaceVendors() {
  ensureSupabase();
  const { data, error } = await supabase.from("vendors").select("*").eq("status", "approved").order("is_verified", { ascending: false }).order("business_name");
  if (error) throw error;
  return data;
}
export async function getVendorBySlug(slug) {
  ensureSupabase();
  const { data: vendor } = await supabase.from("vendors").select("*").eq("slug", slug).eq("status", "approved").maybeSingle();
  if (!vendor) return null;
  const { data: products } = await supabase.from("vendor_products").select("*").eq("vendor_id", vendor.id).eq("status", "active").order("created_at", { ascending: false });
  const { data: fabrics } = await supabase.from("fabric_products").select("*").eq("vendor_id", vendor.id).eq("status", "active").order("created_at", { ascending: false });
  return { vendor, products: products || [], fabrics: fabrics || [] };
}
export async function listFabrics({ search = "", fabricType = "" } = {}) {
  ensureSupabase();
  let q = supabase.from("fabric_products")
    .select("*, vendor:vendors!inner(business_name,slug,is_verified,whatsapp,phone,status,location)")
    .eq("status", "active").eq("vendor.status", "approved").order("created_at", { ascending: false });
  if (search) q = q.ilike("fabric_name", `%${search}%`);
  if (fabricType) q = q.eq("fabric_type", fabricType);
  const { data, error } = await q;
  if (error) throw error;
  return data;
}

/* ---------- admin (uses is_staff full access) ---------- */
export async function admListVendors() { ensureSupabase(); const { data, error } = await supabase.from("vendors").select("*").order("created_at", { ascending: false }); if (error) throw error; return data; }
export async function admSetVendor(id, patch) { ensureSupabase(); const { error } = await supabase.from("vendors").update(patch).eq("id", id); if (error) throw error; }
export async function admListProducts() { ensureSupabase(); const { data, error } = await supabase.from("vendor_products").select("*, vendor:vendors(business_name)").order("created_at", { ascending: false }); if (error) throw error; return data; }
export async function admSetProduct(id, patch) { ensureSupabase(); const { error } = await supabase.from("vendor_products").update(patch).eq("id", id); if (error) throw error; }
export async function admDeleteProduct(id) { ensureSupabase(); const { error } = await supabase.from("vendor_products").delete().eq("id", id); if (error) throw error; }
export async function admListSubscriptions() { ensureSupabase(); const { data, error } = await supabase.from("vendor_subscriptions").select("*, vendor:vendors(business_name)").order("created_at", { ascending: false }); if (error) throw error; return data; }
export async function admSetSubscription(id, patch) { ensureSupabase(); const { error } = await supabase.from("vendor_subscriptions").update(patch).eq("id", id); if (error) throw error; }
export async function admListPromotions() { ensureSupabase(); const { data, error } = await supabase.from("vendor_promotions").select("*, vendor:vendors(business_name)").order("created_at", { ascending: false }); if (error) throw error; return data; }
export async function admSetPromotion(id, patch) { ensureSupabase(); const { error } = await supabase.from("vendor_promotions").update(patch).eq("id", id); if (error) throw error; }
