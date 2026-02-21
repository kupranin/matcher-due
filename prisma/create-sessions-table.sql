-- Run this in Supabase: SQL Editor → New query → paste → Run.
-- Use the SAME project as your app (same DATABASE_URL in .env).

-- 1) Check if "sessions" already exists (run this first). If you see a row, the table exists.
-- SELECT table_schema, table_name FROM information_schema.tables WHERE table_name = 'sessions';

-- 2) See what your users table is called (if CREATE below fails with "User does not exist").
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name ILIKE '%user%';
-- Use that name in the REFERENCES line below (e.g. "User" or "users").

CREATE TABLE IF NOT EXISTS "sessions" (
  "id" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "sessions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "sessions_token_key" UNIQUE ("token"),
  CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "sessions_token_idx" ON "sessions"("token");
CREATE INDEX IF NOT EXISTS "sessions_user_id_idx" ON "sessions"("user_id");

-- Verify: you should see one row for "sessions".
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sessions';
