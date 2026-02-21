# Run on localhost

Minimal app — no locale, no dev cache issues.

## Run (production)

```bash
cd ~/Desktop/matcher-clean
npm run run
```

When you see **Ready on http://127.0.0.1:3000**, open in your browser:

**http://127.0.0.1:3000**

---

## Restore full app (Matcher with locales)

Your original app is in `app_backup/`. To restore:

1. Remove the minimal app: `rm -rf app`
2. Restore backup: `mv app_backup app`
3. Restore middleware: `mv middleware.ts.bak middleware.ts`
4. Restore next.config (next-intl): copy from git or re-add the next-intl plugin and config
5. In package.json set: `"build": "prisma generate && next build"`

Then run `npm run run` again.
