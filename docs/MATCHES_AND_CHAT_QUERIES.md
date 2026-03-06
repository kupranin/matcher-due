# Matcher.city — Match list & chat queries (reference)

Persistence is in the database; the app must not depend on chat_messages for a match to appear.

## 1. Employer match list

**Source:** `matches` table only. Matches are returned even if no chat messages exist.

Equivalent SQL:

```sql
SELECT
  m.id,
  m.vacancy_id,
  m.candidate_profile_id,
  m.match_score,
  m.matched_at,
  m.created_at,
  cp.full_name,
  cp.job_title,
  cp.photo
FROM public.matches m
JOIN public."CandidateProfile" cp ON cp.id = m.candidate_profile_id
JOIN public."Vacancy" v ON v.id = m.vacancy_id
WHERE v.company_id = :companyId
  AND m.employer_liked = true
  AND m.candidate_liked = true
ORDER BY m.matched_at DESC NULLS LAST, m.created_at DESC;
```

API returns `photoUrl` / `candidatePhotoUrl` from `cp.photo`. Schema uses `fullName` and `photo` (no separate first_name/last_name or photo_path).

## 2. Chat messages

**Access:** Employer must belong to the company that owns the vacancy for the match. Candidate must pass `candidateProfileId` matching the match row.

Equivalent SQL for access check:

```sql
SELECT v.company_id
FROM public.matches m
JOIN public."Vacancy" v ON v.id = m.vacancy_id
WHERE m.id = :matchId;
```

Then, if allowed:

```sql
SELECT id, sender, text, created_at
FROM public.chat_messages
WHERE match_id = :matchId
ORDER BY created_at ASC;
```

## 3. Candidate photo

**Schema:** `CandidateProfile.photo` (URL string). No `photo_url` / `photo_path` columns; the app uses `photo` and exposes it as `photoUrl` in API responses.

All candidate-related responses include `photoUrl` (and where relevant `candidatePhotoUrl`). UI uses `getAvatarSrc(photoUrl)` and falls back to `/images/avatar-placeholder.svg` when missing or on image error.

## 4. Validation checklist

- [ ] Employer dashboard: matches appear after refresh (Bearer token sent).
- [ ] Clicking a match opens chat.
- [ ] Chat loads system message and candidate messages.
- [ ] Employer can reply; message persists.
- [ ] Candidate cards: photo visible when present; placeholder when none or on error.
