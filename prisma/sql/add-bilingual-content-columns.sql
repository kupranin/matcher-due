-- Run in Supabase SQL Editor if production APIs fail after deploying bilingual schema changes.
-- Safe to run multiple times (IF NOT EXISTS).

ALTER TABLE vacancies
  ADD COLUMN IF NOT EXISTS title_en TEXT,
  ADD COLUMN IF NOT EXISTS title_ka TEXT,
  ADD COLUMN IF NOT EXISTS job_role_slug TEXT,
  ADD COLUMN IF NOT EXISTS source_locale TEXT,
  ADD COLUMN IF NOT EXISTS description_en TEXT,
  ADD COLUMN IF NOT EXISTS description_ka TEXT;

ALTER TABLE vacancy_skills
  ADD COLUMN IF NOT EXISTS name_en TEXT,
  ADD COLUMN IF NOT EXISTS name_ka TEXT;

ALTER TABLE candidate_profiles
  ADD COLUMN IF NOT EXISTS job_title_en TEXT,
  ADD COLUMN IF NOT EXISTS job_title_ka TEXT,
  ADD COLUMN IF NOT EXISTS job_role_slug TEXT,
  ADD COLUMN IF NOT EXISTS source_locale TEXT;

ALTER TABLE candidate_skills
  ADD COLUMN IF NOT EXISTS name_en TEXT,
  ADD COLUMN IF NOT EXISTS name_ka TEXT;
