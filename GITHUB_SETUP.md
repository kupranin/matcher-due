# Connect to GitHub

Your project is committed and ready to push. Follow these steps:

## 1. Create a new repository on GitHub

1. Go to **[github.com/new](https://github.com/new)**
2. Set **Repository name** to `matcher-clean` (or your preferred name)
3. Leave it **empty** — do NOT add README, .gitignore, or license
4. Click **Create repository**
5. Copy the repo URL (e.g. `https://github.com/yourusername/matcher-clean.git`)

## 2. Add remote and push

In your terminal, run (replace the URL with yours from step 1):

```bash
cd /Users/m3/Desktop/matcher-clean

git remote add origin https://github.com/YOUR_USERNAME/matcher-clean.git
git push -u origin 2026-02-17-xitk
```

To push to `main` instead of the current branch:

```bash
git branch -M main
git push -u origin main
```
