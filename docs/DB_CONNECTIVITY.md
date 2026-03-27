# Database connectivity (production)

When production shows **"Database unavailable"**, fix the actual DB connection; do not patch the UI.

## 1. Diagnose the exact error

Open on your deployed site:

- **`/api/debug-db`** — full diagnostics (no secrets)

Response shape:

```json
{
  "hasDatabaseUrl": true,
  "hasDirectUrl": true,
  "prismaConnectOk": false,
  "errorCode": null,
  "errorMessage": "Connection refused",
  "nodeEnv": "production",
  "vercelEnv": "production",
  "databaseUrlMasked": "***@db.xxxx.supabase.co:5432/postgres",
  "directUrlMasked": "***@db.xxxx.supabase.co:5432/postgres",
  "hint": "Vercel cannot reach the DB. Use connection string from Supabase → Database. Set env for Production and redeploy."
}
```

- **`/api/health/db`** — lightweight health: `{ "ok": true, "db": "up" }` or `{ "ok": false, "db": "down" }`

Use these to confirm:

- `hasDatabaseUrl` / `hasDirectUrl` — env vars are present in the deployment
- `prismaConnectOk` — Prisma can run `SELECT 1`
- `errorMessage` / `errorCode` — exact Prisma error
- `databaseUrlMasked` — confirms correct host (no credentials)

## 2. Vercel environment variables

In **Vercel → Project → Settings → Environment Variables**, for **Production** (and Preview if needed):

| Variable        | Required | Notes |
|-----------------|----------|--------|
| `DATABASE_URL`  | Yes      | Postgres connection string. Prefer **Transaction pooler** (port 6543) with `?pgbouncer=true&connection_limit=1` for serverless. |
| `DIRECT_URL`    | Yes      | Direct (non-pooled) connection to the **same** project; required by Prisma for migrations/schema. |

**Supabase + Prisma (typical):**

- **DATABASE_URL:** `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1`  
  Or use Transaction pooler: `...@db.[PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true&connection_limit=1`
- **DIRECT_URL:** `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`  
  (No pgbouncer; direct connection.)

If SSL is required, add `&sslmode=require` to both.

**Common gotchas:**

- Wrong password → auth error in `errorMessage`
- Wrong project ref in hostname → connection/timeout
- Using pooled URL for `DIRECT_URL` → migration/Prisma issues
- Env set only for Preview → Production still has no vars
- Quotation/newline in value → broken URL; use single line, no extra quotes in UI

## 3. Prisma schema

`prisma/schema.prisma` must have:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

If `directUrl` was missing, add it and redeploy.

## 4. Deployment has the vars

Env vars are baked at **build/deploy** time. If you added or changed them after the last deploy:

1. Save the variables in Vercel (Production).
2. Trigger a **fresh production redeploy** (Deployments → ⋯ → Redeploy).

Boot log (in server logs): `[db] config check: { hasDatabaseUrl, hasDirectUrl, hostMasked }` — confirms the running instance sees the env.

## 5. Build and migrations

- **Build:** `package.json` already runs `prisma generate` in `postinstall` and in `build`. Production build includes the client.
- **Schema in DB:** Use `npx prisma migrate deploy` for production. Use `npx prisma db push` only when necessary (e.g. no migrations yet).

## 6. Validation after fix

1. **GET /api/debug-db** → `prismaConnectOk: true`
2. **GET /api/health/db** → `{ "ok": true, "db": "up" }`
3. Employer matches page loads
4. Candidate opportunities load
5. Chat loads
6. "Database unavailable" banner no longer appears
