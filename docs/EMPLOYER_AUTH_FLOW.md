# Employer auth & vacancy posting flow

## How employer identity is resolved (backend)

All employer APIs use **`getEmployerCompanyFromSession(request)`** in `lib/employerAuth.ts`:

1. **Token source (in order)**  
   - Read session token from **cookie** (`SESSION_COOKIE_NAME`).  
   - If no cookie and `request` is provided, read **`Authorization: Bearer <token>`** from the request.

2. **Validation**  
   - Look up `Session` by token → get `User`.  
   - Require: session exists, not expired, `user.role === "EMPLOYER"`.  
   - Look up `Company` by `userId` (1:1).  
   - Return `{ userId, companyId, company }` or `null`.

3. **Important**  
   - **Company and vacancy ownership are never taken from the client.**  
   - They are always derived from the session (cookie or Bearer).  
   - Every employer route that needs identity must call `getEmployerCompanyFromSession(request)` and pass the **request** so Bearer can be used when the cookie is not sent.

---

## Where the token comes from (client)

- **Login** (`/api/auth/login`): for `role === "EMPLOYER"`, the JSON response includes **`token`**. The client stores it in `sessionStorage` as `matcher_employer_token` and also gets the session cookie.
- **Session check** (`/api/auth/session`): if the user is an employer, the response now includes **`token`**. Any page that calls this (e.g. employer cabinet layout, post page) should store it in `sessionStorage` so later API calls can send `Authorization: Bearer <token>`.

So the client can always send auth either via **cookie** or **Bearer**. If the cookie is not sent (e.g. some redirects or cross-origin), Bearer still works.

---

## Posting a vacancy (POST /api/vacancies)

1. **Client** (e.g. `app/[locale]/employer/post/page.tsx`):
   - Sends `credentials: "include"` (cookie).
   - If `sessionStorage` has `matcher_employer_token`, adds header: `Authorization: Bearer <token>`.
   - Body: `title`, `locationCityId`, `salaryMax`, skills, etc. (no `companyId` for auth).

2. **Server** (`app/api/vacancies/route.ts`):
   - Calls `getEmployerCompanyFromSession(request)` → gets `ctx` (or `null`).
   - If `!ctx` → **401** "Sign in as employer to post a vacancy".
   - Uses `ctx.companyId` only (ignores any `companyId` in body).
   - Validates title, location, etc.; loads company; runs `deductSlotInTx` then creates vacancy and skills in a transaction.
   - Returns **402** if no slots (STRICT_PAYWALL_ERROR), **500** on other errors.

3. **Why it might have failed before**
   - Cookie not sent in some environments (e.g. after redirect, or strict same-site).
   - Token was only set on **login**; if the user never got the token (e.g. old login) or opened the post page without going through a page that stores the token, no Bearer was sent → backend saw no session → 401.
   - **Fix**: Session API now returns `token` for employers, and every employer page that calls `/api/auth/session` stores that token. So when the user opens the post page (or cabinet), the next session check populates `matcher_employer_token`, and the vacancy POST sends Bearer and succeeds.

---

## Employer API routes that must pass `request` into auth

All of these call `getEmployerCompanyFromSession(request)` with the incoming request:

- `app/api/companies/route.ts` — GET, POST, PATCH  
- `app/api/vacancies/route.ts` — GET, POST  
- `app/api/vacancies/[id]/route.ts` — DELETE  
- `app/api/matches/route.ts` — POST (employer like), GET  
- `app/api/matches/[id]/route.ts` — GET  
- `app/api/chat/route.ts` — GET, POST  
- `app/api/subscriptions/route.ts` — GET, POST  

---

## Client pages that send Bearer for employer APIs

- **Login / Register**: store `token` when present; register also sends Bearer when creating company.
- **Employer cabinet** (`cabinet/page.tsx`): vacancies, companies, matches (GET/POST), delete vacancy — all use `getEmployerAuthHeaders()` and send Bearer when token exists.
- **Employer cabinet layout**: companies, subscriptions; stores token from session response.
- **Employer post** (`post/page.tsx`): companies, POST vacancies, POST subscriptions; stores token from session response; sends Bearer on all employer fetches when token exists.
- **Employer cabinet profile**: companies GET/PATCH with Bearer.
- **Employer cabinet chats**: matches list and single match with Bearer.
- **MatchChatWindow** (when `userRole === "employer"`): chat GET and POST with Bearer.

This way, matches, chat, and **vacancy posting** work even when the cookie is not sent, as long as the client has the token (from login or from the session endpoint).
