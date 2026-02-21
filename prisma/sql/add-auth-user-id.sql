-- Add optional Supabase Auth link to User (run in Supabase SQL Editor if db:push fails with TLS)
-- Safe to run multiple times (IF NOT EXISTS).

ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "auth_user_id" TEXT UNIQUE;

COMMENT ON COLUMN "User"."auth_user_id" IS 'Supabase Auth auth.users.id when using Supabase Auth';
