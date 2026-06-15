import { supabase } from "./supabase.js";

/* ============================================================
   PC Wears — Bulk Orders + Delivery Zones data layer (Supabase)
   ============================================================ */
function ok() { if (!supabase) throw new Error("Database is not connected."); }

/* ---------- Bulk orders ---------- */
export async function submitBulkOrder(payload) {
  ok();
  const { error } = await supabase.from("bulk_order_requests").insert({
    organization_name: payload.organization_name,
    contact_person: payload.contact_person || null,
    phone: payload.phone,
    email: payload.email || null,
    order_type: payload.order_type || null,
    quantity: payload.quantity ? Number(payload.quantity) : null,
    deadline: payload.deadline || null,
    budget: payload.budget ? Number(payload.budget) : null,
    notes: payload.notes || null,
    reference_image_url: payload.reference_image_url || null,
    status: "new",
  });
  if (error) throw error;
}
export async function uploadBulkReference(file) {
  ok();
  if (!file) return null;
  const ext = (file.name && file.name.split(".").pop()) || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("bulk-order-references").upload(path, file, { contentType: file.type || "image/jpeg", upsert: true });
  if (error) throw error;
  return supabase.storage.from("bulk-order-references").getPublicUrl(path).data.publicUrl;
}
export async function admListBulkOrders() {
  ok();
  const { data, error } = await supabase.from("bulk_order_requests").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}
export async function admSetBulkOrder(id, patch) {
  ok();
  const { error } = await supabase.from("bulk_order_requests").update(patch).eq("id", id);
  if (error) throw error;
}

/* ---------- Delivery zones ---------- */
export async function listActiveZones() {
  ok();
  const { data, error } = await supabase.from("delivery_zones").select("*").eq("status", "active").order("sort_order", { ascending: true });
  if (error) throw error;
  return data || [];
}
export async function admListZones() {
  ok();
  const { data, error } = await supabase.from("delivery_zones").select("*").order("sort_order", { ascending: true });
  if (error) throw error;
  return data || [];
}
export async function admSaveZone(z) {
  ok();
  const row = {
    zone_name: z.zone_name, delivery_fee: Number(z.delivery_fee) || 0,
    estimated_time: z.estimated_time || null, note: z.note || null,
    sort_order: z.sort_order != null ? Number(z.sort_order) : 0, status: z.status || "active",
  };
  if (z.id) { const { error } = await supabase.from("delivery_zones").update(row).eq("id", z.id); if (error) throw error; return; }
  const { error } = await supabase.from("delivery_zones").insert(row); if (error) throw error;
}
export async function admDeleteZone(id) { ok(); const { error } = await supabase.from("delivery_zones").delete().eq("id", id); if (error) throw error; }
