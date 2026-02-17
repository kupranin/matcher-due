# Matcher.ge — Full Flow Map

## Route Summary

| Route | Page Name | Purpose |
|-------|-----------|---------|
| `/` | Home | Landing page |
| `/login` | Login | Choose Candidate / Business, email + password |
| `/userFlow/1` | Get Matched (7 steps) | Candidate onboarding |
| `/profile` | (Redirect) | → `/cabinet/profile` |
| `/cabinet` | Matches (Swipe) | Candidate swipe deck |
| `/cabinet/chats` | Chats | Mutual matches + chat |
| `/cabinet/profile` | Profile | Candidate profile edit |
| `/employer` | Hire Landing | Employer landing |
| `/employer/register` | Register Company | Company registration |
| `/employer/post` | Post Vacancy | Vacancy form → package → payment → success |
| `/employer/profile` | (Redirect) | → `/employer/cabinet/profile` |
| `/employer/cabinet` | Candidates | Employer swipe deck |
| `/employer/cabinet/chats` | Chats | Mutual matches + chat |
| `/employer/cabinet/profile` | Company Profile | Employer profile edit |

**Locale:** Default `/` = English. Georgian = `/ka/...` (e.g. `/ka/cabinet`)

---

## Visual Flow Map

```
                                          ┌─────────────────┐
                                          │   / (Home)      │
                                          │   Home          │
                                          └────────┬────────┘
                         ┌─────────────────────────┼─────────────────────────┐
                         ▼                         ▼                         ▼
                  ┌──────────────┐         ┌───────────────┐         ┌───────────────┐
                  │ /login       │         │ /userFlow/1   │         │ /employer     │
                  │ Login        │         │ Get Matched   │         │ Hire Landing  │
                  └──────┬───────┘         │ (7 steps)     │         └───────┬───────┘
            ┌────────────┴────────────┐    └───────┬───────┘                 │
            ▼                         ▼            │              ┌──────────┴──────────┐
     ┌─────────────┐          ┌─────────────┐     │              ▼                     ▼
     │ /cabinet    │          │ /employer/  │     │     ┌──────────────┐      ┌──────────────┐
     │ (candidate) │          │ cabinet     │     │     │ /employer/   │      │ /employer/   │
     └──────┬──────┘          │ (employer)  │     │     │ register     │      │ post         │
            │                 └──────┬──────┘     │     │ Reg Company  │      │ Post Vacancy │
     ┌──────┴──────┐                │            │     └──────┬───────┘      └──────┬───────┘
     ▼             ▼                ▼            │            │                     │
┌──────────┐ ┌──────────┐    ┌──────────────┐   │            └──────────┬──────────┘
│/cabinet/ │ │/cabinet/ │    │/employer/    │   │                       ▼
│chats     │ │profile   │    │cabinet/chats │   │              ┌──────────────────┐
│Chats     │ │Profile   │    │Chats         │   │              │ /employer/       │
└──────────┘ └──────────┘    │              │   │              │ cabinet          │
                             │/employer/    │   │              │ (after reg/post) │
                             │cabinet/      │   │              └──────────────────┘
                             │profile       │   │
                             │Company Profile   │
                             └──────────────┘   │
                                                │
                                    ┌───────────┘
                                    ▼
                            ┌──────────────────┐
                            │ /cabinet         │
                            │ (after userFlow) │
                            └──────────────────┘
```

---

## 1. Candidate Flow

| Page | Route | Description |
|------|-------|-------------|
| **Home** | `/` | Landing. CTAs: Get matched, I'm hiring, Login |
| **Login** | `/login` | Candidate or Business. → `/cabinet` or `/employer/cabinet` |
| **Get Matched** | `/userFlow/1` | 7-step onboarding: Job, Experience, Work type, Skills, Location, Salary, Profile (name, email, phone, password). → `/cabinet` |
| **Matches (Swipe)** | `/cabinet` | Swipe right/left on vacancies. Sidebar: Matches, Chats, Profile, Log out |
| **Chats** | `/cabinet/chats` | Mutual matches list. Open chat to schedule interviews. |
| **Profile** | `/cabinet/profile` | Edit candidate profile |
| **Profile redirect** | `/profile` | Redirects to `/cabinet/profile` |

### Mutual match (candidate side)

When candidate likes a job and employer already liked this candidate for that job → congratulatory modal → "Open chat" → `/cabinet/chats`.

---

## 2. Employer Flow

| Page | Route | Description |
|------|-------|-------------|
| **Hire Landing** | `/employer` | CTAs: Register, Post vacancy, Log in |
| **Register Company** | `/employer/register` | Company name, ID, email, phone, password. OTP success → `/employer/cabinet` |
| **Post Vacancy** | `/employer/post` | Vacancy form → Package (1/5/10/unlimited) → Payment (invoice/card) → Success. Sets `employerHasSubscription` |
| **Candidates (Swipe)** | `/employer/cabinet` | Choose vacancy → swipe on candidates. Sidebar: Candidates, Chats, Post vacancy, Company profile, Log out |
| **Chats** | `/employer/cabinet/chats` | Mutual matches list. Open chat to schedule interviews. |
| **Company Profile** | `/employer/cabinet/profile` | Edit company profile |
| **Profile redirect** | `/employer/profile` | Redirects to `/employer/cabinet/profile` |

### Mutual match (employer side)

When employer likes a candidate and candidate already liked that vacancy → congratulatory modal → "Open chat" → `/employer/cabinet/chats`.

---

## 3. Session Storage (MVP)

| Key | Set when | Used for |
|-----|----------|----------|
| `employerLoggedIn` | Visit `/employer/cabinet` | Skip contact details on post vacancy |
| `employerHasSubscription` | Payment success in `/employer/post` | Show vacancies + candidate deck in cabinet |
| (cleared) | `employer/register` OTP success | Clean slate |

---

## 4. Match & Chat Storage (MVP)

| Key | Used for |
|-----|----------|
| `matcher_candidate_likes` | Vacancy IDs candidate liked |
| `matcher_employer_likes` | `{ vacancyId, candidateId }[]` |
| `matcher_mutual_matches` | Mutual matches list |
| `matcher_chat_{matchId}` | Chat messages per match |

---

## 5. Navigation Links (Quick Reference)

| From | Link | To |
|------|------|----|
| Home | Get matched | `/userFlow/1` |
| Home | I'm hiring | `/employer` |
| Home | Login | `/login` |
| Login | Candidate cabinet | `/cabinet` |
| Login | Employer cabinet | `/employer/cabinet` |
| Cabinet | Chats | `/cabinet/chats` |
| Cabinet | Profile | `/cabinet/profile` |
| Employer cabinet | Chats | `/employer/cabinet/chats` |
| Employer cabinet | Post vacancy | `/employer/post?from=cabinet` |
| Employer cabinet | Company profile | `/employer/cabinet/profile` |
| Employer | Register | `/employer/register` |
| Employer | Post vacancy | `/employer/post` |

---

## 6. Black Spots & Broken Flows

### Critical – Data Disconnect

| Issue | Where | What's wrong |
|-------|-------|--------------|
| **userFlow → Cabinet disconnect** | `userFlow/1` → `cabinet` | userFlow collects job, experience, work type, skills, location, salary, name, email, phone, password. None of this is persisted. Cabinet uses hardcoded `MOCK_CANDIDATE_PROFILE` for match calculation and swipe deck. User expects to see vacancies matching their choices (e.g. Barista, Part-time) but gets generic mock matches. |
| **Profile (candidate) – no persistence** | `cabinet/profile` | Profile uses local state only. "Save profile" triggers `alert("Profile saved (MVP)")` – nothing is stored. Data lost on refresh. Not pre-filled from userFlow. |
| **Profile (employer) – no persistence** | `employer/cabinet/profile` | Same as candidate: "Save profile" only shows alert. No storage. |

### Broken Flows

| Issue | Where | What's wrong |
|-------|-------|--------------|
| **"Create account" is misleading** | `userFlow/1` step 7 | User enters name, email, phone, password, verifies OTP. Flow redirects to cabinet. But no account is stored. Login cannot use this data – there is no link between userFlow and Login. |
| **Login is fake** | `login` | Any email + password (≥8 chars) redirects to cabinet. No validation. "Create one" → userFlow – but userFlow never creates an account usable on Login. Returning users have no real way to sign in. |
| **Log out does not clear session** | Cabinet / Employer cabinet | "Log out" links to `/login`. Does not clear `employerLoggedIn`, `employerHasSubscription`, `matcher_candidate_likes`, `matcher_employer_likes`, etc. User appears still "logged in" when revisiting cabinet. |

### Missing / Incomplete

| Issue | Where | What's missing |
|-------|-------|----------------|
| **Employer register – no `employerLoggedIn`** | `employer/register` | OTP success redirects to cabinet. `employerLoggedIn` is only set when the employer cabinet layout mounts – so it works by side effect. Documented but fragile. |
| **Direct cabinet access** | `login` | Links "Candidate cabinet" and "Employer cabinet" allow access without credentials. MVP choice, but effectively bypasses auth. |
| **i18n on profile pages** | `cabinet/profile`, `employer/cabinet/profile` | Both use hardcoded English strings. Other pages use `useTranslations`. |
| **Chat persistence** | `lib/chatStorage.ts` | Chats stored in `localStorage` only. Lost when clearing storage. No backend. |

### Summary of Fixes (priority)

1. **High** – Persist userFlow data (localStorage or API) and use it for cabinet match calculation.
2. **High** – Persist profile saves (candidate + employer) to localStorage or API.
3. **Medium** – Implement Log out: clear all session/localStorage keys before redirect to `/login`.
4. **Medium** – Wire Login to real auth or at least make "Create one" / Login consistent with userFlow.
5. **Low** – Add i18n to profile pages.
6. **Low** – Backend for chats (when DB is ready).
