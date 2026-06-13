/* ============================================================
   PC Wears — storage router
   - Keys listed in TABLES are read/written to Supabase (when configured).
   - Everything else (cart, wishlist, blog, team, expenses, investors,
     customer accounts, notices, admin password, session) stays in
     localStorage, which is the right place for per-device/session data
     and for collections that have no Supabase table yet.
   ============================================================ */
import { isSupabase } from "./supabase.js";
import { TABLES } from "./db.js";

export async function sGet(key, fallback) {
  if (isSupabase && TABLES[key]) {
    try { return await TABLES[key].list(); }
    catch (e) { console.error(`Supabase load failed for ${key}:`, e.message || e); return fallback; }
  }
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
  catch { return fallback; }
}

export async function sSet(key, val) {
  if (isSupabase && TABLES[key]) {
    try { await TABLES[key].sync(val); }
    catch (e) { console.error(`Supabase save failed for ${key}:`, e.message || e); }
    return;
  }
  try { localStorage.setItem(key, JSON.stringify(val)); }
  catch (e) { console.error("storage error", e); }
}
