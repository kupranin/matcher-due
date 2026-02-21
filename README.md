This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Database (localhost)

If you see **"Database unavailable"** or **"MaxClientsInSessionMode: max clients reached"** on localhost:

1. **Use the Transaction pooler (port 6543)** – Session mode (port 5432) has a very low connection limit. Both the Prisma CLI (`prisma db push`, migrations) and the app read `DATABASE_URL` / `DIRECT_URL` from `.env`. If those use port 5432, you hit the limit. **Fix:** In `.env`, set both `DATABASE_URL` and `DIRECT_URL` to the **Transaction** pooler URI (port **6543**) and add `?pgbouncer=true&connection_limit=3` (or append `&pgbouncer=true&connection_limit=3` if the URL already has `?`). Get the URI from Supabase → Project Settings → Database → Connection string → **Transaction**.
2. **No `.env` file** – Copy `.env.example` to `.env` and replace `[YOUR-PASSWORD]` with your Supabase database password.
3. **Running from wrong directory** – Start the app from the project root so `.env` is found: `npm run dev`.

**Check the exact error:** open [http://localhost:3000/api/debug-db](http://localhost:3000/api/debug-db). It shows whether `DATABASE_URL` is set and the real connection error.

After any `.env` change, restart the dev server and re-run Prisma commands if needed (`npx prisma db push`).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

1. **Environment variables (required for DB)**  
   In the Vercel project → **Settings → Environment Variables**, add:
   - **`DATABASE_URL`** – Supabase PostgreSQL connection string (Transaction pooler port 6543 or Session pooler port 5432).
   - **`DIRECT_URL`** – Same connection string (or direct URL if you use a pooler; Prisma needs both at build time).  
   Apply to **Production** (and **Preview** if you use preview deployments). Then **redeploy**.

2. **If the site shows "Database unavailable"**  
   Open **`https://your-app.vercel.app/api/debug-db`** in the browser. It will show whether `DATABASE_URL` / `DIRECT_URL` are set and the exact connection error. Fix the env vars as suggested (e.g. correct password, use pooler host from Supabase → Project Settings → Database → Connection string), then redeploy.

The easiest way to deploy is the [Vercel Platform](https://vercel.com/new). See [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying) for more.
