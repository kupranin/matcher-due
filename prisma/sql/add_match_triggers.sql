-- Part 1: Add matched_at if missing
ALTER TABLE public.matches
ADD COLUMN IF NOT EXISTS matched_at timestamp;

-- Part 2: Ensure unique pair constraint ( Prisma already handles this via @@unique([vacancyId, candidateProfileId]), but adding for manual DB )
CREATE UNIQUE INDEX IF NOT EXISTS matches_unique_pair
ON public.matches(vacancy_id, candidate_profile_id);

-- Part 3: Trigger to automatically set matched_at when a row becomes a real match
CREATE OR REPLACE FUNCTION public.set_matched_at_on_real_match()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.employer_liked = true
     AND NEW.candidate_liked = true
     AND NEW.matched_at IS NULL THEN
    NEW.matched_at := now();
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_matched_at_on_real_match ON public.matches;

CREATE TRIGGER trg_set_matched_at_on_real_match
BEFORE INSERT OR UPDATE ON public.matches
FOR EACH ROW
EXECUTE FUNCTION public.set_matched_at_on_real_match();

-- Part 4: Trigger to automatically insert exactly ONE system message
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.create_chat_seed_on_match()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.matched_at IS NOT NULL
     AND (OLD.matched_at IS NULL OR OLD.matched_at IS DISTINCT FROM NEW.matched_at) THEN

    IF NOT EXISTS (
      SELECT 1
      FROM public.chat_messages cm
      WHERE cm.match_id = NEW.id
    ) THEN
      INSERT INTO public.chat_messages (
        id,
        match_id,
        sender,
        text,
        created_at
      )
      VALUES (
        gen_random_uuid()::text,
        NEW.id,
        'system',
        'You matched! Start the conversation 👋',
        now()
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_create_chat_seed_on_match ON public.matches;

CREATE TRIGGER trg_create_chat_seed_on_match
AFTER INSERT OR UPDATE ON public.matches
FOR EACH ROW
EXECUTE FUNCTION public.create_chat_seed_on_match();
