import { supabase } from "./supabase.js";

/* ============================================================
   PC Wears — Supabase data layer
   Maps the app's object shapes to the relational tables created
   by pcwears_supabase_setup.sql. Used by store.js for the keys
   that are backed by Supabase.
   ============================================================ */

const isData = (s) => typeof s === "string" && s.startsWith("data:");

/* ---- image upload / signed display URLs ---- */
async function uploadImage(bucket, value) {
  if (!isData(value)) return value || null; // already a URL or empty
  const res = await fetch(value);
  const blob = await res.blob();
  const ext = (blob.type.split("/")[1] || "jpg").split(";")[0];
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, blob, { contentType: blob.type, upsert: true });
  if (error) { console.error("upload error", error); return null; }
  if (bucket === "product-images" || bucket === "staff-photos") {
    return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  }
  // private bucket: store "bucket::path" so we can sign it on read
  return `${bucket}::${path}`;
}
async function displayUrl(value) {
  if (!value || typeof value !== "string") return value || null;
  if (!value.includes("::")) return value; // public url
  const [bucket, path] = value.split("::");
  const { data } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60 * 24 * 7);
  return data ? data.signedUrl : null;
}

/* ============================================================
   PRODUCTS
   ============================================================ */
async function listProducts() {
  const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data.map((r) => ({
    id: r.id, name: r.name, category: r.category, price: Number(r.price),
    description: r.description || "", sizes: r.sizes || [], colors: r.colors || [],
    stock: r.stock_status, stockQty: r.stock_qty,
    featured: r.featured, newArrival: r.new_arrival, bestSeller: r.best_seller,
    image: r.image_url || null,
  }));
}
async function syncProducts(arr) {
  const rows = [];
  for (const p of arr) {
    rows.push({
      id: p.id, name: p.name, category: p.category, price: Number(p.price) || 0,
      description: p.description || "", sizes: p.sizes || [], colors: p.colors || [],
      stock_status: p.stock || "available", stock_qty: p.stockQty || 0,
      featured: !!p.featured, new_arrival: !!p.newArrival, best_seller: !!p.bestSeller,
      image_url: await uploadImage("product-images", p.image),
    });
  }
  await upsertAndPrune("products", rows);
}

/* ============================================================
   CUSTOMERS (+ measurements child)
   ============================================================ */
const MEASURE_COLS = {
  "Shoulder": "shoulder", "Chest": "chest", "Bust": "bust", "Waist": "waist", "Hip": "hip",
  "Sleeve length": "sleeve_length", "Top length": "top_length", "Dress length": "dress_length",
  "Blouse length": "blouse_length", "Skirt length": "skirt_length", "Trouser waist": "trouser_waist",
  "Trouser length": "trouser_length", "Thigh": "thigh", "Neck": "neck", "Cap size": "cap_size",
};
const COL_TO_LABEL = Object.fromEntries(Object.entries(MEASURE_COLS).map(([k, v]) => [v, k]));

async function listCustomers() {
  const { data, error } = await supabase
    .from("customers").select("*, measurements(*)").order("created_at", { ascending: false });
  if (error) throw error;
  const out = [];
  for (const r of data) {
    const m = (r.measurements && r.measurements[0]) || null;
    const measurements = {};
    if (m) {
      for (const [col, label] of Object.entries(COL_TO_LABEL)) if (m[col] != null) measurements[label] = m[col];
      if (m.extra_note) measurements["Extra note"] = m.extra_note;
    }
    out.push({
      id: r.id, name: r.name, phone: r.phone, email: r.email || "", address: r.address || "",
      gender: r.gender || "", note: r.note || "", createdAt: (r.created_at || "").slice(0, 10),
      measurements, refImage: await displayUrl(m ? m.reference_image_url : null),
      _refRaw: m ? m.reference_image_url : null,
    });
  }
  return out;
}
async function syncCustomers(arr) {
  const rows = arr.map((c) => ({
    id: c.id, name: c.name, phone: c.phone, email: c.email || null, address: c.address || null,
    gender: c.gender || null, note: c.note || null,
  }));
  await upsertAndPrune("customers", rows);
  // measurements: one row per customer (replace)
  for (const c of arr) {
    const m = c.measurements || {};
    const hasAny = Object.keys(m).length > 0 || c.refImage;
    await supabase.from("measurements").delete().eq("customer_id", c.id);
    if (hasAny) {
      const row = { customer_id: c.id, gender: c.gender || null, extra_note: m["Extra note"] || null,
        reference_image_url: c._refRaw && !c.refImage?.startsWith("data:") ? c._refRaw : await uploadImage("customer-files", c.refImage) };
      for (const [label, col] of Object.entries(MEASURE_COLS)) {
        const v = m[label];
        row[col] = v === "" || v == null ? null : (col === "cap_size" ? String(v) : Number(v) || null);
      }
      await supabase.from("measurements").insert(row);
    }
  }
}

/* ============================================================
   STAFF  (records; logins are handled by Supabase Auth)
   ============================================================ */
async function listStaff() {
  const { data, error } = await supabase.from("staff").select("*").order("created_at", { ascending: true });
  if (error) throw error;
  return data.map((r) => ({ id: r.id, name: r.name, role: r.role, phone: r.phone || "", email: r.email || "", active: r.active, authUserId: r.auth_user_id }));
}
async function syncStaff(arr) {
  const rows = arr.map((s) => ({ id: s.id, name: s.name, role: s.role || "viewer", phone: s.phone || null, email: s.email || null, active: s.active !== false, auth_user_id: s.authUserId || null }));
  await upsertAndPrune("staff", rows);
}

/* ============================================================
   INVENTORY (+ movements)
   ============================================================ */
async function listInventory() {
  const { data, error } = await supabase.from("inventory").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data.map((r) => ({ id: r.id, name: r.name, color: r.color || "", unit: r.unit || "yards", qty: Number(r.quantity), reorder: Number(r.reorder_level) }));
}
async function syncInventory(arr) {
  const rows = arr.map((f) => ({ id: f.id, name: f.name, color: f.color || null, unit: f.unit || "yards", quantity: Number(f.qty) || 0, reorder_level: Number(f.reorder) || 0 }));
  await upsertAndPrune("inventory", rows);
}
async function listMovements() {
  const { data, error } = await supabase.from("inventory_movements").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data.map((r) => ({ id: r.id, itemId: r.inventory_id, itemName: r.item_name, type: r.movement_type, qty: Number(r.quantity), reason: r.reason, orderId: r.order_id, date: (r.created_at || "").slice(0, 10) }));
}
async function syncMovements(arr) {
  const rows = arr.map((m) => ({ id: m.id, inventory_id: m.itemId || null, item_name: m.itemName || null, movement_type: m.type, quantity: Number(m.qty) || 0, reason: m.reason || null, order_id: null }));
  await upsertAndPrune("inventory_movements", rows);
}

/* ============================================================
   ORDERS (+ payments + materials children)
   ============================================================ */
async function listOrders() {
  const { data, error } = await supabase
    .from("orders").select("*, payments(*), order_materials(*)").order("created_at", { ascending: false });
  if (error) throw error;
  const out = [];
  for (const r of data) {
    out.push({
      id: r.id, orderId: r.order_no, invoiceNo: r.order_no ? r.order_no.replace("PCW", "INV") : "",
      customerId: r.customer_id || "", customer: r.customer_name, phone: r.customer_phone || "",
      category: r.category || "", product: r.product, styleName: r.style_name || "",
      fabricType: r.fabric_type || "", fabricColor: r.fabric_color || "",
      qty: r.quantity, price: Number(r.unit_price), discount: Number(r.discount), total: Number(r.total),
      status: r.status, fulfil: r.fulfilment, deliveryDate: r.delivery_date || "",
      tailor: r.assigned_tailor || "", instructions: r.instructions || "", source: r.source || "",
      createdAt: (r.created_at || "").slice(0, 10),
      refImage: await displayUrl(r.reference_image_url),
      payments: (r.payments || []).map((p) => ({ id: p.id, amount: Number(p.amount), type: p.payment_type, method: p.method, staff: p.received_by_name || "", note: p.note || "", date: p.paid_at })),
      materials: (r.order_materials || []).map((m) => ({ id: m.id, fabricId: m.inventory_id, name: m.name, qty: Number(m.quantity), deducted: m.deducted })),
    });
  }
  return out;
}
async function syncOrders(arr) {
  // Upsert order rows (omit generated total + auto order_no so the DB manages them)
  const rows = [];
  for (const o of arr) {
    const row = {
      id: o.id, customer_id: o.customerId || null, customer_name: o.customer, customer_phone: o.phone || null,
      category: o.category || null, product: o.product, style_name: o.styleName || null,
      fabric_type: o.fabricType || null, fabric_color: o.fabricColor || null,
      quantity: Number(o.qty) || 1, unit_price: Number(o.price) || 0, discount: Number(o.discount) || 0,
      status: o.status || "pending", fulfilment: o.fulfil || "delivery",
      delivery_date: o.deliveryDate || null, assigned_tailor: o.tailor || null,
      instructions: o.instructions || null, source: o.source || null,
      reference_image_url: o.refImage && o.refImage.startsWith("data:") ? await uploadImage("order-files", o.refImage) : (o._refRaw || (o.refImage && o.refImage.includes("::") ? o.refImage : o._refRaw)) || null,
    };
    if (o.orderId && /^PCW-/.test(o.orderId)) row.order_no = o.orderId; // keep existing number on update
    rows.push(row);
  }
  await upsertAndPrune("orders", rows);
  // Replace children for each order
  for (const o of arr) {
    await supabase.from("payments").delete().eq("order_id", o.id);
    if ((o.payments || []).length) {
      await supabase.from("payments").insert(o.payments.map((p) => ({
        id: p.id, order_id: o.id, amount: Number(p.amount) || 0, payment_type: p.type || null,
        method: p.method || null, received_by_name: p.staff || null, note: p.note || null, paid_at: p.date || null,
      })));
    }
    await supabase.from("order_materials").delete().eq("order_id", o.id);
    if ((o.materials || []).length) {
      await supabase.from("order_materials").insert(o.materials.map((m) => ({
        order_id: o.id, inventory_id: m.fabricId || null, name: m.name || null, quantity: Number(m.qty) || 0, deducted: !!m.deducted,
      })));
    }
  }
}

/* ============================================================
   INVOICES & RECEIPTS  (persist a record when generated)
   ============================================================ */
async function listInvoices() {
  const { data, error } = await supabase.from("invoices").select("*").order("issued_at", { ascending: false });
  if (error) throw error;
  return data.map((r) => ({ id: r.id, invoiceNo: r.invoice_no, orderId: r.order_id, total: Number(r.total), notes: r.notes }));
}
async function listReceipts() {
  const { data, error } = await supabase.from("receipts").select("*").order("issued_at", { ascending: false });
  if (error) throw error;
  return data.map((r) => ({ id: r.id, receiptNo: r.receipt_no, orderId: r.order_id, amount: Number(r.amount), notes: r.notes }));
}
export async function saveInvoiceRecord(orderId, total, notes) {
  const { error } = await supabase.from("invoices").insert({ order_id: orderId, total: Number(total) || 0, notes: notes || null });
  if (error) console.error("invoice save", error);
}
export async function saveReceiptRecord(orderId, amount, notes) {
  const { error } = await supabase.from("receipts").insert({ order_id: orderId, amount: Number(amount) || 0, notes: notes || null });
  if (error) console.error("receipt save", error);
}

/* ============================================================
   generic upsert + prune (delete rows in DB not present in arr)
   ============================================================ */
async function upsertAndPrune(table, rows) {
  if (rows.length) {
    const { error } = await supabase.from(table).upsert(rows, { onConflict: "id" });
    if (error) throw error;
  }
  const ids = rows.map((r) => r.id).filter(Boolean);
  const { data: existing, error: e2 } = await supabase.from(table).select("id");
  if (e2) return;
  const toDelete = existing.map((r) => r.id).filter((id) => !ids.includes(id));
  if (toDelete.length) await supabase.from(table).delete().in("id", toDelete);
}

/* ============================================================
   DELIVERY RECORDS
   ============================================================ */
async function listDelivery() {
  const { data, error } = await supabase.from("delivery_records").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data.map((r) => ({
    id: r.id, orderId: r.order_id, method: r.method, address: r.address || "",
    status: r.status, scheduledDate: r.scheduled_date || "", deliveredAt: r.delivered_at || "",
    courier: r.courier || "", fee: Number(r.fee), note: r.note || "",
  }));
}
async function syncDelivery(arr) {
  const rows = arr.map((d) => ({
    id: d.id, order_id: d.orderId || null, method: d.method || "delivery", address: d.address || null,
    status: d.status || "scheduled", scheduled_date: d.scheduledDate || null,
    delivered_at: d.status === "delivered" && !d.deliveredAt ? new Date().toISOString() : (d.deliveredAt || null),
    courier: d.courier || null, fee: Number(d.fee) || 0, note: d.note || null,
  }));
  await upsertAndPrune("delivery_records", rows);
}

/* ============================================================
   key -> {list, sync} registry used by store.js
   ============================================================ */
export const TABLES = {
  "pcw2:products":  { list: listProducts,  sync: syncProducts },
  "pcw2:customers": { list: listCustomers, sync: syncCustomers },
  "pcw2:staff":     { list: listStaff,     sync: syncStaff },
  "pcw2:fabrics":   { list: listInventory, sync: syncInventory },
  "pcw2:movements": { list: listMovements, sync: syncMovements },
  "pcw2:orders":    { list: listOrders,    sync: syncOrders },
  "pcw2:invoices":  { list: listInvoices,  sync: async () => {} },
  "pcw2:receipts":  { list: listReceipts,  sync: async () => {} },
  "pcw2:delivery":  { list: listDelivery,  sync: syncDelivery },
};

/* ---- Supabase Auth helpers ---- */
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}
export async function signOut() { await supabase.auth.signOut(); }
export async function currentStaff() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("staff").select("*").eq("auth_user_id", user.id).maybeSingle();
  return data ? { name: data.name, role: data.role, active: data.active } : null;
}
