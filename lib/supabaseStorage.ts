/**
 * Server-side Supabase client for Storage only (no auth cookies).
 * Use for uploads in API routes. Requires NEXT_PUBLIC_SUPABASE_URL and
 * NEXT_PUBLIC_SUPABASE_ANON_KEY. For restricted buckets, use service role key instead.
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export function getSupabaseStorageClient() {
  if (!url || !key) {
    throw new Error(
      "Supabase storage: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY)"
    );
  }
  return createClient(url, key);
}

export const AVATARS_BUCKET = "avatars";
