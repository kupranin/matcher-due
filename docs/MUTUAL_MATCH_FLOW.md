# Mutual match flow (Matcher.city)

## Source of truth

A **match** exists only when:

- `matches.employer_liked = true`
- `matches.candidate_liked = true`

When both become true:

- `matched_at` is set (once)
- One system chat message is inserted (once) so the thread exists for both sides

## Atomic like + match resolution

Both employer and candidate like actions go through the same core:

- **POST /api/matches** with either `employerLiked: true` (and employer session) or `candidateLiked: true` and `candidateProfileId`.
- Server calls **`resolveMatchForPair(vacancyId, candidateProfileId, actorType)`** in a single DB transaction:
  1. Upsert match row; set the relevant like flag.
  2. If both likes are now true and `matched_at` is null: set `matched_at`, and insert system chat message only if none exists for this match.
  3. Return `{ ok, matchId, employerLiked, candidateLiked, isMatch, matchedAt, conversationReady }`.

**Rule:** The UI must only show “It’s a match” when the API returns `isMatch === true`. No optimistic match.

## Employer match list

- **GET /api/matches** with employer session (Bearer token or cookie).
- Reads from **`matches`** only (no dependency on `chat_messages`).
- Filter: `vacancy.companyId = employer.companyId` and `employer_liked` and `candidate_liked`.
- Order: `matched_at DESC NULLS LAST`, then `created_at DESC`.

## Chat

- **GET /api/chat?matchId=** — employer: session + match must belong to company; candidate: `candidateProfileId` must match the match row.
- **POST /api/chat** — same access rules; body: `{ matchId, sender, text }` (and `candidateProfileId` for candidate).
- When a match is created, one system message is inserted so the thread exists immediately.

## UX (like → match)

1. On like (swipe right or click like): show **“Checking match…”** on the current card; do **not** remove the card or show success until the API responds.
2. Disable like/pass buttons while the request is in flight.
3. Minimum visible loading ~500–600 ms so the transition feels intentional.
4. If **`isMatch === true`**: show match modal; then user can open chat or close.
5. If not match: animate card away and show next.
6. On error: show error message; keep card and re-enable actions.

## Backfill (existing broken data)

If there are rows with both likes true but `matched_at` null or no system message:

```bash
npx tsx prisma/backfill-matched-at-and-system-messages.ts
```

This script:

- Finds matches where `employer_liked = true` and `candidate_liked = true` and `matched_at IS NULL`.
- Sets `matched_at = now()`.
- Inserts the system chat message if none exists for that match.

Requires `DATABASE_URL` (and optionally `DIRECT_URL`) in `.env` or environment.

## Debug endpoints

- **GET /api/debug-match?vacancyId= & candidateProfileId=**  
  Returns match row, `hasMatch`, `hasMatchedAt`, `chatMessageCount`, and access checks for employer/candidate.

- **GET /api/debug-employer-matches**  
  With employer session: returns `authUserId`, `companyId`, `totalMatches`, and a sample of matches. Use to confirm the employer match list query sees persisted matches.

## Unique constraint

One row per (vacancy, candidate) pair:

```sql
CREATE UNIQUE INDEX IF NOT EXISTS matches_vacancy_id_candidate_profile_id_key
  ON public.matches(vacancy_id, candidate_profile_id);
```

The Prisma schema already has `@@unique([vacancyId, candidateProfileId])`; the above is for manual SQL if needed.
