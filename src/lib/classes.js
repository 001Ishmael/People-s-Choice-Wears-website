import { supabase } from "./supabase.js";
import { slugify } from "./theme.js";

/* ============================================================
   PC Wears — Fashion Classes data layer (Supabase)
   Public: list active classes, register for a class.
   Admin (staff via RLS): manage classes + view registrations.
   ============================================================ */
function ok() { if (!supabase) throw new Error("Database is not connected."); }

/* ---------- Public ---------- */
export async function listActiveClasses() {
  ok();
  const { data, error } = await supabase
    .from("fashion_classes").select("*").eq("status", "active")
    .order("start_date", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function registerForClass(payload) {
  ok();
  const { error } = await supabase.from("fashion_class_registrations").insert({
    class_id: payload.class_id || null,
    class_title: payload.class_title || null,
    student_name: payload.student_name,
    phone: payload.phone,
    whatsapp: payload.whatsapp || null,
    email: payload.email || null,
    experience_level: payload.experience_level || null,
    message: payload.message || null,
    payment_status: "unpaid",
  });
  if (error) throw error;
}

/* ---------- Admin (staff) ---------- */
export async function admListClasses() {
  ok();
  const { data, error } = await supabase.from("fashion_classes").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}
export async function admSaveClass(c) {
  ok();
  const row = {
    title: c.title, slug: c.slug || (slugify(c.title) + "-" + Math.random().toString(36).slice(2, 5)),
    description: c.description || null, level: c.level || "beginner", duration: c.duration || null,
    price: Number(c.price) || 0, currency: c.currency || "SLE",
    start_date: c.start_date || null, end_date: c.end_date || null,
    location: c.location || null, is_online: !!c.is_online,
    instructor_name: c.instructor_name || null, image_url: c.image_url || null,
    capacity: c.capacity ? Number(c.capacity) : null, status: c.status || "active",
  };
  if (c.id) { const { error } = await supabase.from("fashion_classes").update(row).eq("id", c.id); if (error) throw error; return; }
  const { error } = await supabase.from("fashion_classes").insert(row); if (error) throw error;
}
export async function admDeleteClass(id) { ok(); const { error } = await supabase.from("fashion_classes").delete().eq("id", id); if (error) throw error; }

export async function admListRegistrations() {
  ok();
  const { data, error } = await supabase
    .from("fashion_class_registrations").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}
export async function admSetRegistration(id, patch) {
  ok();
  const { error } = await supabase.from("fashion_class_registrations").update(patch).eq("id", id);
  if (error) throw error;
}

export async function uploadClassImage(file) {
  ok();
  if (!file) return null;
  const ext = (file.name && file.name.split(".").pop()) || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("class-images").upload(path, file, { contentType: file.type || "image/jpeg", upsert: true });
  if (error) throw error;
  return supabase.storage.from("class-images").getPublicUrl(path).data.publicUrl;
}
