# Database (Supabase)

Matcher uses [Supabase](https://supabase.com/) for:

- **PostgreSQL** — Prisma connects via `DATABASE_URL` (connection pooler).
- **JS client** — Optional: Auth, Realtime, Storage, Data API via `@supabase/supabase-js` and `@supabase/ssr`.

## Supabase project

- **Dashboard:** [Supabase → Project](https://supabase.com/dashboard/project/kroqzfttdxxtczftlfxw)
- **API keys / Connection:** [Settings → API](https://supabase.com/dashboard/project/kroqzfttdxxtczftlfxw/settings/api) and **Database** (connection string)

## Environment variables

| Variable | Where to get it | Used by |
|----------|------------------|---------|
| `DATABASE_URL` | Supabase Dashboard → **Project Settings → Database** → Connection string (URI). Use the **Connection pooling** (Transaction) URI, port **6543**. Encode `@` in password as `%40`. | Prisma (server, API routes, build) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → **Settings → API** → Project URL | Supabase JS client (browser + server) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Settings → API** → anon (public) key | Supabase JS client. Safe for client; use for Auth/Realtime/Storage. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | **Settings → API** → Publishable key (new key type) | Alternative to anon key; supported by `lib/supabase` |

**Do not** put `service_role` or any secret key in `NEXT_PUBLIC_*`; use server-only env for backend-only keys.

## Supabase JS client

The app includes Supabase client helpers for Next.js App Router:

- **Client Components:** `import { createClient } from "@/lib/supabase/client"` → `createClient()`
- **Server Components / Actions / Route Handlers:** `import { createClient } from "@/lib/supabase/server"` → `await createClient()`

Both require `NEXT_PUBLIC_SUPABASE_URL` and either `NEXT_PUBLIC_SUPABASE_ANON_KEY` or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Use these for [Supabase Auth](https://supabase.com/docs/guides/auth), [Realtime](https://supabase.com/docs/guides/realtime), [Storage](https://supabase.com/docs/guides/storage), or the auto-generated Data API.

## Vercel

1. **Vercel project** → Settings → Environment Variables.
2. Add `DATABASE_URL` for Production (and Preview if you want DB in preview deploys). Use the same pooler URI from Supabase.
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` if you use the Supabase JS client (Auth, Realtime, etc.).
4. **Do not** put the Supabase **service_role** or **secret** key in client-exposed env; use server-only env for any secret keys.

## Local

1. Copy `.env.example` to `.env`.
2. Set `DATABASE_URL` with your Supabase DB password (pooler URI, port 6543). Add `&sslmode=require` if you use SSL.
3. If you get **P1011 TLS / bad certificate** when running `db:push`, try the **direct** connection from Supabase (Dashboard → Settings → Database): use the URI with port **5432** (not 6543) in `DATABASE_URL`, run `db:push`, then switch back to the pooler (6543) for the app.
4. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (from Dashboard → Settings → API) to use the Supabase JS client.
5. Run `npm run db:push` (or `npx prisma db push`) to sync schema; run `npm run db:seed` to seed data.
6. If you can’t run `db:push` (e.g. TLS errors), apply SQL by hand: run scripts in `prisma/sql/` in the Supabase SQL Editor (e.g. `add-auth-user-id.sql`).

## Schema and migrations

- **Schema:** `prisma/schema.prisma`
- **Push schema to DB:** `pnpm db:push` or `npx prisma db push`

### Tables: Users and employers

| Table | Purpose |
|-------|--------|
| **User** | All logged-in users. `role`: `CANDIDATE` or `EMPLOYER`. `auth_user_id` optionally links to Supabase Auth (`auth.users.id`). |
| **Company** | Employer company. One per employer user (`user_id` → User). Holds name, company ID (tax number), contact email/phone. |

Relations: **User** (1) ↔ (0..1) **Company** (employer only). Candidates use **User** + **CandidateProfile** (see schema).
- **Seed (optional):** `npm run db:seed` — creates sample users, profiles, vacancies, job templates.
- **Seed job positions + skills (300 entry-level roles):** `npm run db:seed:jobs` — reads `prisma/data/entry_level_jobs_300.csv` and fills `job_role_templates` + `role_skill_templates` (EN and KA where Georgian title exists). Run after `db:push`.
- **Manual SQL:** `prisma/supabase-setup.sql` can be run in Supabase SQL Editor if needed.

## GitHub

The Supabase project can be linked to GitHub (Dashboard → Project Settings → Integrations) for backup or CI. The app itself is deployed on Vercel; ensure Vercel has `DATABASE_URL` so builds and serverless functions can reach Supabase.
