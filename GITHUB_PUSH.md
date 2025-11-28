# Push to GitHub - Instructions

## Option 1: If you already have a GitHub repository

1. **Add the remote:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   ```

2. **Rename branch to main (if needed):**
   ```bash
   git branch -M main
   ```

3. **Push to GitHub:**
   ```bash
   git push -u origin main
   ```

## Option 2: Create a new GitHub repository

1. **Go to GitHub:**
   - Visit: https://github.com/new
   - Sign in to your account

2. **Create new repository:**
   - Repository name: `nigerian-real-estate-platform`
   - Description: "Nigerian Real Estate Platform - Buy, sell, and rent properties"
   - Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
   - Click "Create repository"

3. **Connect and push:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/nigerian-real-estate-platform.git
   git branch -M main
   git push -u origin main
   ```

## Quick Commands (Copy & Paste)

Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub username and repository name:

```bash
# Add remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Rename branch to main
git branch -M main

# Push to GitHub
git push -u origin main
```

## If you get authentication errors

### Option A: Use Personal Access Token
1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with `repo` scope
3. Use token as password when pushing

### Option B: Use SSH
```bash
# Add SSH remote instead
git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPO_NAME.git

# Push
git push -u origin main
```

---

**Current Status:**
- ✅ Git repository initialized
- ✅ All files committed
- ⏳ Waiting for GitHub repository URL to push

