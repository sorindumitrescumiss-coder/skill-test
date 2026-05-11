import { createClient } from '@supabase/supabase-js';

/**
 * Server-only client with service role. Bypasses RLS — use only in API routes
 * to insert `skill_test_results` after server-side AI grading.
 */
export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Set SUPABASE_SERVICE_ROLE_KEY in .env (Project Settings → API, service_role secret).');
  }
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}
