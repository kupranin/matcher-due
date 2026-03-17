import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase admin client for server-only usage (Route Handlers, cron jobs, etc).
 *
 * - Uses the service role key so we can write to private buckets.
 * - NEVER import this from client components – it would leak the secret key.
 *
 * Required env:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Missing Supabase admin env: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  return createSupabaseClient(url, serviceKey);
}

