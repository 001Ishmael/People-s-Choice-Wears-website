import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

// When the env vars are present we use Supabase; otherwise the app falls back
// to local storage so it still runs in development without a backend.
export const isSupabase = Boolean(url && anon);

export const supabase = isSupabase ? createClient(url, anon) : null;
