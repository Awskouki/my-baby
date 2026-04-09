# Deployment Instructions

## Deploy to GitHub Pages

Follow these steps to deploy your app:

### 1. Create a GitHub Repository

1. Go to https://github.com/new
2. Name it: `molka-study-break`
3. Make it **private** (so only you and Molka can see it)
4. Don't initialize with README (we already have files)
5. Click "Create repository"

### 2. Update package.json

Open `package.json` and replace `[YOUR-GITHUB-USERNAME]` with your actual GitHub username in the homepage field.

### 3. Initialize Git and Push

Run these commands in your terminal:

```bash
git init
git add .
git commit -m "Initial commit: Molka's study break app"
git branch -M main
git remote add origin https://github.com/[YOUR-GITHUB-USERNAME]/molka-study-break.git
git push -u origin main
```

### 4. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click "Settings" tab
3. Click "Pages" in the left sidebar
4. Under "Build and deployment":
   - Source: Select "GitHub Actions"
5. The workflow will automatically deploy your site

### 5. Wait for Deployment

- Go to the "Actions" tab in your repository
- Watch the deployment workflow run (takes 1-2 minutes)
- Once complete, your site will be live at:
  `https://[YOUR-GITHUB-USERNAME].github.io/molka-study-break/`

### 6. Share with Molka

Send her the URL! It will work on any device - phone, tablet, or PC.

## Making Updates

Whenever you want to update the site:

```bash
git add .
git commit -m "Description of changes"
git push
```

The site will automatically redeploy in 1-2 minutes!

## Notes

- The site is static (no backend needed)
- It's free forever on GitHub Pages
- Works on all devices
- No expiration like ngrok
