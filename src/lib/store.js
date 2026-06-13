/* ============================================================
   PC Wears — data store
   ------------------------------------------------------------
   The whole app reads and writes data through just two functions:
   sGet(key, fallback) and sSet(key, value).

   DEFAULT (works out of the box): browser localStorage.
   Products/orders are saved on the device that made them.

   TO SYNC ACROSS ALL DEVICES (recommended once you launch):
   connect Supabase — see the bottom of this file. You only edit
   THIS file; nothing else in the app needs to change.
   ============================================================ */

/* -------- localStorage adapter (active by default) -------- */
export async function sGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export async function sSet(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error("storage error", e);
  }
}

/* ============================================================
   SUPABASE ADAPTER (optional — for shared, multi-device data)
   ------------------------------------------------------------
   1. Create a free project at https://supabase.com
   2. Make a table called "kv":
        create table kv ( key text primary key, value jsonb );
        alter table kv enable row level security;
        create policy "public read"  on kv for select using (true);
        create policy "public write" on kv for all    using (true) with check (true);
   3. npm install @supabase/supabase-js
   4. Add a .env file at the project root:
        VITE_SUPABASE_URL=your-project-url
        VITE_SUPABASE_ANON_KEY=your-anon-key
   5. Replace the two functions above with the versions below,
      then redeploy.

   import { createClient } from "@supabase/supabase-js";
   const supabase = createClient(
     import.meta.env.VITE_SUPABASE_URL,
     import.meta.env.VITE_SUPABASE_ANON_KEY
   );

   export async function sGet(key, fallback) {
     const { data } = await supabase.from("kv").select("value").eq("key", key).maybeSingle();
     return data ? data.value : fallback;
   }
   export async function sSet(key, val) {
     await supabase.from("kv").upsert({ key, value: val });
   }

   Tip: keep product images small. For many/large images, store them
   in Supabase Storage or Cloudinary and save only the image URL.
   ============================================================ */
