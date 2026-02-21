# Vercel deployment — database

If the deployed app shows **"Database unavailable. Ensure the app is connected to the database"**, the server cannot reach your Postgres database. Do the following.

## 1. Set environment variables on Vercel

In [Vercel](https://vercel.com) → your project → **Settings** → **Environment Variables**, add:

| Name           | Value | Environment |
|----------------|--------|-------------|
| `DATABASE_URL` | Your Postgres connection string (see below) | Production (and Preview if needed) |
| `DIRECT_URL`   | Same or direct connection string (required by Prisma schema) | Production (and Preview if needed) |

- **Supabase:** In dashboard click **Connect** → copy the **Session pooler** URI (port **5432**). Use it for both `DATABASE_URL` and `DIRECT_URL`. If you use the **Transaction** pooler (port 6543) instead, add `?pgbouncer=true` at the end so Prisma works (e.g. `.../postgres?pgbouncer=true`).
- Replace `[YOUR-PASSWORD]` with the database password. If the password contains `@` or `#`, encode as `%40` or `%23`.
- Ensure the string includes `?sslmode=require` (or your provider’s SSL option) so connections from Vercel work.

Do **not** use `localhost` — Vercel runs in the cloud and cannot reach your machine.

## 2. Apply the schema to the production database

The database must have the tables. From your **local** machine, using the **production** URL once:

```bash
# Optional: point to production for one command (then change back)
export DATABASE_URL="postgresql://...your-production-url..."
export DIRECT_URL="postgresql://...your-production-direct-url..."
npx prisma db push
```

Or use Supabase SQL Editor: run the contents of `prisma/sql/*.sql` and any migrations you use, so the schema matches `prisma/schema.prisma`.

## 3. Redeploy

After saving the env vars, trigger a new deployment (e.g. **Deployments** → **⋯** on latest → **Redeploy**). New builds will use the variables; no code change is required.

## See the real error (if it still fails)

Deploy the app, then open in your browser: **`https://your-app.vercel.app/api/debug-db`**

That page shows the actual error (e.g. "Can't reach database server", "password authentication failed"). Use it to fix the connection. You can delete `app/api/debug-db/route.ts` after.

## Quick checklist

- [ ] `DATABASE_URL` and `DIRECT_URL` set in Vercel (Production)
- [ ] Values are real Postgres URIs (not placeholders, not localhost)
- [ ] If using Supabase Transaction pooler (port 6543), URL ends with `?pgbouncer=true`
- [ ] Schema applied to that database (`npx prisma db push` or equivalent)
- [ ] Redeploy after changing env vars
