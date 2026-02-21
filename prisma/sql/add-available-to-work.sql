-- Add "Available to work" for candidates. Run in Supabase: SQL Editor → New query → paste → Run.
-- Use the same project as your app (same DATABASE_URL in .env).
-- If prisma db push fails (e.g. can't reach DB), run this manually instead.

-- Prisma default table name for model CandidateProfile is "CandidateProfile"
ALTER TABLE "CandidateProfile"
  ADD COLUMN IF NOT EXISTS "available_to_work" BOOLEAN NOT NULL DEFAULT true;
