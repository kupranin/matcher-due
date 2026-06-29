# Deployment (Vercel + Supabase)

## Diagnose first

After deploy, open:

**`https://YOUR-APP.vercel.app/api/debug-db`**

It reports missing env vars, DB connectivity, schema gaps, and Supabase Storage config — without exposing secrets.

## 1. Use the correct Vercel project

You may have more than one Vercel project for this repo:

| URL | Typical issue |
|-----|----------------|
| `matcher-due-ef4r.vercel.app` | Often missing **all** env vars |
| `www.matcher.ge` / `matcher.city` | Usually has DB configured |

In Vercel → **Settings → Domains**, confirm which project serves your live domain. Add env vars to **that** project (Production).

## 2. Environment variables (required)

Vercel → **Settings → Environment Variables** → scope **Production** (and Preview if needed):

| Name | Where to get it |
|------|-----------------|
| `DATABASE_URL` | Supabase → **Connect** → **Transaction pooler** (port **6543**). Append `?pgbouncer=true&sslmode=require` |
| `DIRECT_URL` | Supabase → **Connect** → **Session pooler** or **Direct** (port **5432**). Append `?sslmode=require` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → **Settings → API** → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Settings → API** → anon public key (or use `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Settings → API** → service_role (server-only; needed for photo uploads) |

Copy template from `.env.example`. Encode `@` in passwords as `%40`.

**After saving env vars → Redeploy** (Deployments → ⋯ → Redeploy). New vars are not applied to old deployments.

## 3. Apply database schema on Supabase

If `/api/debug-db` shows missing `title_en` or vacancies API returns 500:

**Option A — SQL Editor (recommended for production)**

Run in [Supabase SQL Editor](https://supabase.com/dashboard/project/kroqzfttdxxtczftlfxw/sql/new):

1. `prisma/sql/add-bilingual-content-columns.sql` (if bilingual columns missing)
2. `prisma/create-sessions-table.sql` (if login fails with session errors)

**Option B — from your machine (one-time)**

```bash
export DATABASE_URL="postgresql://...production pooler..."
export DIRECT_URL="postgresql://...production direct..."
npx prisma db push
```

## 4. Supabase Storage (photo uploads)

1. Supabase → **Storage** → create bucket `candidate-photos` (public if photos should be viewable by URL).
2. Ensure `SUPABASE_SERVICE_ROLE_KEY` is set on Vercel.

## 5. Local development

```bash
cp .env.example .env
# fill in values
npm run db:push
npm run dev
```

If you get "too many open files": `ulimit -n 10240 && npm run dev`

## Quick checklist

- [ ] Env vars set on the **correct** Vercel project (Production)
- [ ] `DATABASE_URL` uses pooler with `?pgbouncer=true` (port 6543)
- [ ] `DIRECT_URL` set (port 5432)
- [ ] Schema applied (`add-bilingual-content-columns.sql` + sessions table)
- [ ] Redeploy after env changes
- [ ] `/api/debug-db` returns `"ok": true`
