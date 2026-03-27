-- Match persistence: matched_at + unique pair.
-- Run in Supabase SQL editor if not using prisma db push.
-- 1) One row per (vacancy_id, candidate_profile_id)
CREATE UNIQUE INDEX IF NOT EXISTS matches_vacancy_id_candidate_profile_id_key
  ON public.matches(vacancy_id, candidate_profile_id);
-- 2) When mutual like happens we set matched_at and insert one system chat message
ALTER TABLE public.matches
  ADD COLUMN IF NOT EXISTS matched_at TIMESTAMPTZ NULL;
COMMENT ON COLUMN public.matches.matched_at IS 'Set when both employer_liked and candidate_liked become true; used to insert system chat message once.';
