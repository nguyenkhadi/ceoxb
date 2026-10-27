// SUPABASE INITIALIZATION
// Loaded on every page after the supabase-js CDN script.
const SUPABASE_URL = 'https://tbvscjpaqbyshqoieqvu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_-hkHAjdrka8bJy8GSqbR_g_hPVQuTy5';

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
