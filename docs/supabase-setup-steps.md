# Supabase connection — step by step

## Step 1: Set your local environment variables

1. Open the file **`.env`** in the project root (create it by copying `.env.example` if it doesn’t exist).
2. Make sure these two lines are in `.env` with **your** values (no quotes issues):

   ```
   NEXT_PUBLIC_SUPABASE_URL="https://kroqzfttdxxtczftlfxw.supabase.co"
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="sb_publishable_..."   # paste your key from Supabase Dashboard → Settings → API
   ```

3. If you use the **database** (Prisma), also set:

   ```
   DATABASE_URL="postgresql://postgres.kroqzfttdxxtczftlfxw:YOUR_DB_PASSWORD@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?schema=public"
   ```

   Get `YOUR_DB_PASSWORD` from Supabase: **Project Settings → Database** (or the password you set when creating the project). If the password contains `@`, write it as `%40`.

4. Save the file. **Do not commit `.env`** — it’s in `.gitignore`.

---

## Step 2: Restart the dev server

If the app is running, restart it so it picks up the new env vars:

```bash
# Stop the server (Ctrl+C), then:
npm run dev
```

---

## Step 3: Verify the connection (optional)

You can confirm the Supabase client loads without errors:

1. Open any page that uses the client, e.g. open the app and trigger a feature that calls `createClient()` from `@/lib/supabase/client` or `@/lib/supabase/server`.
2. Or add a temporary test: in a Server Component or API route, add:

   ```ts
   import { createClient } from "@/lib/supabase/server";
   const supabase = await createClient();
   const { data, error } = await supabase.from("any_table").select("id").limit(1);
   ```

   If the env vars are wrong, you’ll see an error; if they’re correct, you’ll get a response (or an empty list if the table is empty).

---

## Step 4: Add the same vars on Vercel (for production)

1. Go to [Vercel](https://vercel.com) → your project → **Settings** → **Environment Variables**.
2. Add:
   - **Name:** `NEXT_PUBLIC_SUPABASE_URL`  
     **Value:** `https://kroqzfttdxxtczftlfxw.supabase.co`  
     **Environment:** Production (and Preview if you want).
3. Add:
   - **Name:** `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`  
     **Value:** (paste your publishable key from Supabase Dashboard → Settings → API)  
     **Environment:** Production (and Preview if you want).
4. Redeploy the project so the new variables are used.

---

## Step 5: Use Supabase in the app

- **In the browser (Client Components):**
  ```ts
  import { createClient } from "@/lib/supabase/client";
  const supabase = createClient();
  // e.g. supabase.auth.signInWithPassword(...) or supabase.from("table").select()
  ```

- **On the server (Server Components, API routes, Server Actions):**
  ```ts
  import { createClient } from "@/lib/supabase/server";
  const supabase = await createClient();
  ```

Next you can add [Auth](https://supabase.com/docs/guides/auth), [Realtime](https://supabase.com/docs/guides/realtime), or [Storage](https://supabase.com/docs/guides/storage) using these clients.
