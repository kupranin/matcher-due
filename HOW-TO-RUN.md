# How to run the site (reliable way)

## Option A: Production (no dev issues) — recommended

### One-time: stop anything on port 3000

In Terminal, run (then enter your Mac password if asked):

```bash
lsof -ti :3000 | xargs kill -9
```

## Run the site

```bash
cd ~/Desktop/matcher-clean
npm run run
```

- First time: wait 1–2 minutes for the build to finish.
- When you see **“Ready on http://127.0.0.1:3000”**, open in your browser:

  **http://127.0.0.1:3000/en**

- To stop the server: press **Ctrl+C** in that terminal.

---

**If port 3000 is still in use:** run `npm run start` instead (uses an existing build). If you changed code, run `npm run run` again to rebuild.

---

## Option B: Dev server (with hot reload)

If you use `npm run dev` and get **500 on /en or /en/login** (ENOENT routes-manifest.json):

1. Start dev: `npm run dev` (or `npm run dev &`).
2. Wait until you see **"✓ Ready"**.
3. In **another terminal**:  
   `cd ~/Desktop/matcher-clean` then  
   `npm run fix:dev-manifests`
4. Refresh the browser (e.g. http://127.0.0.1:3000/en or /en/login).

You only need to run `fix:dev-manifests` once per dev session (or again if you restart the dev server).
