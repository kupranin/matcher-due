-- Add matched_at to matches so we can detect first-time mutual match and insert system message once.
-- Run this if you apply schema changes manually (e.g. in Supabase SQL editor).
-- Prisma: npx prisma db push will apply this from schema.

-- Ensure unique on (vacancy_id, candidate_profile_id) - may already exist
-- CREATE UNIQUE INDEX IF NOT EXISTS matches_vacancy_id_candidate_profile_id_key ON public.matches(vacancy_id, candidate_profile_id);

ALTER TABLE public.matches
ADD COLUMN IF NOT EXISTS matched_at TIMESTAMPTZ NULL;

COMMENT ON COLUMN public.matches.matched_at IS 'Set when both employer_liked and candidate_liked become true; used to insert system chat message once.';
