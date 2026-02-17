# Deployment (Vercel)

## Vercel Setup

1. Import the project from GitHub: [vercel.com/new](https://vercel.com/new) → Import `kupranin/matcher-due`
2. Add environment variable (required for Prisma build):
   - **Name:** `DATABASE_URL`
   - **Value:** Your PostgreSQL connection string (e.g. Supabase/Neon), or use a placeholder for build-only: `postgresql://user:pass@localhost:5432/matcher`
3. Deploy

## Localhost

If you get "too many open files" or connection issues:

```bash
ulimit -n 10240
npm run dev:stable
```

Then open: **http://127.0.0.1:3000** or **http://127.0.0.1:3000/en**
