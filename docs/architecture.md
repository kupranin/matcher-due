# Matcher.ge — Full architecture

## 1. Tech stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 16 (App Router) |
| **UI** | React 19, Tailwind CSS v4, Framer Motion |
| **i18n** | next-intl (EN / KA), locale in path (`/en`, `/ka`) |
| **Database** | PostgreSQL via Supabase; ORM: Prisma |
| **Runtime** | Node (Vercel serverless); client for SPA-like pages |

**Key dependencies:** `next-intl`, `framer-motion`, `prisma` / `@prisma/client`, `leaflet` / `react-leaflet` (maps in userFlow).

---

## 2. Routing & locales

- **Middleware:** `middleware.ts` — next-intl; all non-API, non-static paths go through locale handling.
- **Locales:** `en` (default), `ka`. Prefix: **always** (e.g. `/en/cabinet`, `/ka/contact`).
- **Root:** `app/page.tsx` — default Next.js placeholder; real app lives under `app/[locale]/`.
- **Navigation:** `Link`, `redirect`, `useRouter`, `usePathname` from `@/i18n/navigation` (locale-aware).

**Route tree (under `[locale]`):**

```
/                     → Home (hero, swipe demo, social proof, testimonials, how it works, CTA)
/about                → About (swipeable sections)
/team                 → Team (swipeable team cards)
/contact              → Contact (form + email/phone)
/legal/terms          → Terms of Use
/legal/privacy        → Privacy Policy

/login                → Login (candidate vs employer; mock)

/userFlow/1            → Candidate onboarding (multi-step: job type → experience → schedule → skills → location → salary → profile)

/cabinet              → Candidate swipe deck (vacancies), pitch modal, match modal
/cabinet/profile      → Candidate profile edit
/cabinet/chats        → Candidate matches list + chat window

/profile              → Redirect to cabinet/profile or employer profile

/employer             → Employer landing (register vs post vacancy)
/employer/register    → Company registration (mock)
/employer/post        → Post vacancy (with or without account)
/employer/profile     → Employer profile (standalone)
/employer/cabinet     → Employer swipe deck (candidates), match modal
/employer/cabinet/profile → Company profile edit
/employer/cabinet/chats   → Employer matches list + chat window
```

**API routes (no locale):**

- `GET /api/job-templates?locale=en|ka` — job role templates from DB (Prisma); fallback empty.
- `POST /api/contact` — contact form submit (validates; no email send yet).

---

## 3. Layouts

- **Root:** `app/layout.tsx` — `<html>`, `<body>`, metadata; reads locale from `x-next-intl-locale` header.
- **Locale:** `app/[locale]/layout.tsx` — next-intl provider, fonts (Geist, Noto Georgian, Manrope), global language switcher (fixed bottom-right).
- **Cabinet:** `app/[locale]/cabinet/` — no extra layout.
- **Employer cabinet:** `app/[locale]/employer/cabinet/layout.tsx` — sidebar (vacancy picker) + outlet for candidates/chats/profile.

---

## 4. Data layer

### 4.1 Database (Supabase Postgres + Prisma)

- **Schema:** `prisma/schema.prisma`.
- **Client:** `lib/db.ts` — singleton `PrismaClient` (dev: reuse; prod: no global leak).
- **Used by:** `app/api/job-templates/route.ts` (read `JobRoleTemplate` + `RoleSkillTemplate`); `prisma/seed.ts` (users, companies, vacancies, job templates, etc.).

**Main models:** `User`, `UserRole` (CANDIDATE | EMPLOYER), `Company`, `CandidateProfile`, `CandidateSkill`, `Vacancy`, `VacancySkill`, `Subscription`, `Match`, `Job` / `JobSkill`, `JobRoleTemplate` / `RoleSkillTemplate`.

### 4.2 Client-side MVP (localStorage)

Most of the app still uses **in-memory / localStorage**; DB is used for job templates and seed data.

| Concern | Storage | Notes |
|--------|---------|--------|
| **Candidate profile** | `lib/candidateProfileStorage.ts` | `matcher_candidate_profile` — profile + fullName, email, phone, etc. |
| **Employer profile** | `lib/employerProfileStorage.ts` | Company info for employer cabinet. |
| **Likes & matches** | `lib/matchStorage.ts` | `matcher_candidate_likes`, `matcher_employer_likes`, `matcher_mutual_matches`, `matcher_candidate_pitches`. Mutual match = candidate like + employer like; pitch stored per vacancy. |
| **Chat messages** | `lib/chatStorage.ts` | Per-match messages (keyed by match id). |
| **Job templates (fallback)** | `lib/jobTemplates.ts` | Hardcoded EN/KA when API returns empty. |

### 4.3 Mock / hardcoded data

- **Vacancies for candidate swipe:** `lib/hardcodedVacancies.ts` (e.g. 200 cards) + `lib/matchMockData.ts` — `getVacanciesWithMatch(profile)` filters and scores by `lib/matchCalculation.ts`.
- **Candidates for employer swipe:** `lib/matchMockData.ts` — `MOCK_CANDIDATES_FULL`, `getCandidatesWithMatch(vacancyProfile)`.
- **Employer vacancy ↔ candidate vacancy mapping:** `lib/matchStorage.ts` — `CANDIDATE_VACANCY_TO_EMPLOYER`, `EMPLOYER_VACANCY_TO_CANDIDATE` for mutual match detection (MVP).
- **Current user:** `CURRENT_CANDIDATE_ID = "1"` (mock “Nino K.”).

---

## 5. Auth (current state)

- **Login:** `app/[locale]/login/page.tsx` — UI only; no real auth. Redirects to candidate cabinet or employer cabinet.
- **Session:** No server session. “Logged in” state is implicit (user can open `/cabinet` or `/employer/cabinet`; profile/likes/matches come from localStorage and mock IDs).
- **Logout:** `lib/logoutUtils.ts` — clears localStorage keys used by the app.

---

## 6. Key user flows

1. **Candidate:** Home → “Get matched” → `userFlow/1` (steps) → profile created in localStorage → Login (mock) → Cabinet (swipe vacancies, pitch on like, mutual match → chat).
2. **Employer:** Home → “I’m hiring” → Employer landing → Register or Post vacancy → Employer cabinet (swipe candidates) → mutual match → chat.
3. **Job templates:** UserFlow and post-vacancy flows request `/api/job-templates?locale=...`; if DB has data, use it; else use `lib/jobTemplates.ts`.

---

## 7. Components (shared)

- **Layout / global:** `Logo`, `Footer`, `LanguageSwitcher`.
- **Match flow:** `MatchProgressRing` (circular match % on cards), `PitchModal` (140-char pitch after swipe right), `MatchCongratulationsModal` (celebration + open chat), `MatchChatWindow` (chat + optional Google Calendar scheduler).

---

## 8. Styling & design tokens

- **Tailwind v4** — `app/globals.css` with `@import "tailwindcss"` and `@theme inline` (colors: `matcher`, `matcher-dark`, `matcher-bright`, `charcoal`, etc.).
- **Fonts:** Geist Sans/Mono, Noto Sans Georgian, Manrope (headings) — loaded in `[locale]/layout.tsx`; `.font-heading` in CSS.
- **Rules:** `.cursor/rules/ui-design-tokens.mdc` — use only design tokens for spacing, radius, colors (no magic numbers).

---

## 9. Build & deploy

- **Build:** `prisma generate && next build`.
- **DB:** `prisma db push` (no migrations repo yet); seed: `tsx prisma/seed.ts`.
- **Env:** `DATABASE_URL` (Supabase Postgres pooler), optional `NEXT_PUBLIC_SUPABASE_URL`. See `docs/database.md`.
- **Hosting:** Vercel; Supabase linked to GitHub. Set `DATABASE_URL` (and optionally `NEXT_PUBLIC_SUPABASE_URL`) in Vercel.

---

## 10. High-level diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Browser (EN / KA)                              │
├─────────────────────────────────────────────────────────────────────────┤
│  next-intl  │  React  │  Tailwind  │  Framer Motion  │  localStorage   │
│  (Link, useRouter, useTranslations)  │  (profile, likes, matches, chat)  │
└─────────────────────────────────────────────────────────────────────────┘
         │                    │
         │                    │  fetch /api/job-templates, POST /api/contact
         ▼                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     Next.js App Router (Vercel)                         │
│  app/[locale]/*  │  app/api/*  │  middleware (locale)                  │
└─────────────────────────────────────────────────────────────────────────┘
         │
         │  Prisma (only in API + seed)
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              Supabase (PostgreSQL)                                      │
│  User, Company, CandidateProfile, Vacancy, Match, JobRoleTemplate, …      │
└─────────────────────────────────────────────────────────────────────────┘
```

**Summary:** The site is a **Next.js 16 App Router** app with **two locales (EN/KA)**. Most **state is client-side** (localStorage + mock data); **Prisma + Supabase** back the **job-templates API** and **seed data**. **Auth is mock**; candidate and employer flows use **localStorage** for profiles, likes, matches, pitches, and chat. Replacing those with **Supabase (or your own API)** and real auth is the natural next step.
