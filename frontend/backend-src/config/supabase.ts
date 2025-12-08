import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

console.log('[Supabase Config] Environment check:', {
  hasUrl: !!supabaseUrl,
  urlLength: supabaseUrl.length,
  hasAnonKey: !!supabaseAnonKey,
  anonKeyLength: supabaseAnonKey.length,
  hasServiceKey: !!supabaseServiceKey,
  serviceKeyLength: supabaseServiceKey.length,
  serviceKeyPrefix: supabaseServiceKey.substring(0, 10) || 'none',
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials not found. Please set SUPABASE_URL and SUPABASE_ANON_KEY in .env');
}

if (!supabaseServiceKey) {
  console.error('⚠️ SUPABASE_SERVICE_ROLE_KEY is missing! Authentication will fail.');
}

// Client for public operations (frontend can use this)
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Admin client for server-side operations (backend only)
export const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

if (!supabaseAdmin) {
  console.error('[Supabase Config] supabaseAdmin is null! Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
}

export const isSupabaseEnabled = !!supabase && !!supabaseAdmin;

