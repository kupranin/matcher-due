# Diagnosing Vercel Preview vs Production Deployments

If your new deployments are being marked as **Preview** while an older deployment remains as **Production (Current)**, Vercel is likely considering your current branch as a non-production branch, or the project mapping is incorrect.

Follow these steps in the Vercel Dashboard to diagnose and fix this:

## 1. Check the Production Branch
By default, Vercel sets `main` or `master` as the Production branch. If you push to a different branch (e.g., `commit`, `prod`, or another name), Vercel creates a Preview deployment.

**How to fix:**
1. Go to your Vercel Dashboard → **[Your Project]** → **Settings** → **Git**.
2. Scroll down to **Production Branch**.
3. Verify which branch is set (it should match the branch you are pushing to, e.g., `main`).
4. If you are pushing to `main` but Vercel expects `master` (or vice versa), change the Production Branch here to match your repository.
5. Save the changes. Next time you push to this branch, it will be a Production deployment.

## 2. Check Which Branch You Are Pushing To
Currently, your local repository is on branch `main` and tracking `origin/main` (`https://github.com/kupranin/matcher-due.git`).

**How to verify:**
1. In Vercel, go to the **Deployments** tab.
2. Look at the recent "Preview" deployments. Note the branch name listed next to the commit message (e.g., `main`, `commit`, etc.).
3. If you accidentally pushed to a non-main branch (or if Vercel is set up to deploy a different branch as production), this explains the Preview status.

## 3. Manually Promote a Preview to Production
If you have a successful Preview deployment that you want to make the live Production site immediately without pushing a new commit:

**How to fix:**
1. Go to the **Deployments** tab in Vercel.
2. Find the desired "Preview" deployment.
3. Click the three dots (`...`) on the right side of that deployment.
4. Select **Promote to Production** (or "Assign Custom Domain").
5. Follow the prompts to make it the active production build.

## 4. Check for Multiple Vercel Projects
Sometimes, developers accidentally create a second Vercel project for the same repository.
- Project A might have your custom domain attached but isn't receiving new commits (or is tracking the wrong branch).
- Project B might be receiving the new commits but only as Preview deployments, or lacking the custom domain.

**How to verify:**
1. Go to your Vercel Workspace (the root dashboard).
2. Look at all listed projects. Do you see more than one project for `matcher-due` or `matcher-clean`?
3. If yes, figure out which one has your custom domain (`matcher.city`) connected (Settings → Domains).
4. Ensure you are pushing to the repository/branch that *that specific project* is tracking.

## 5. Check Domains and Assignments
If the deployment says "Production" but the URL `matcher.city` shows an old version:
1. Go to Vercel Dashboard → **[Your Project]** → **Settings** → **Domains**.
2. Make sure your domain (`matcher.city` / `www.matcher.city`) is assigned to the correct project and points to the Production environment.

## Summary Checklist
- [ ] Vercel **Production Branch** matches your active git branch (`main`).
- [ ] You are pushing to the `main` branch.
- [ ] You are looking at the correct Vercel project (the one linked to your domain).
- [ ] To fix right now: click `...` on the latest Preview deployment and select **Promote to Production**.