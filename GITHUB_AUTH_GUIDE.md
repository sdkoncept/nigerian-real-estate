# GitHub Authentication Guide

## Current Issue
You're getting "Permission denied (publickey)" because SSH keys aren't set up. Let's use HTTPS with a Personal Access Token instead.

## Solution: Use HTTPS with Personal Access Token

### Step 1: Create Personal Access Token

1. **Go to GitHub Settings:**
   - Visit: https://github.com/settings/tokens
   - Or: GitHub → Your Profile → Settings → Developer settings → Personal access tokens → Tokens (classic)

2. **Generate New Token:**
   - Click "Generate new token" → "Generate new token (classic)"
   - **Note:** `nigerian-real-estate-platform`
   - **Expiration:** Choose your preference (90 days, 1 year, or no expiration)
   - **Select scopes:** ✅ **repo** (check the "repo" checkbox - this gives full repository access)
   - Click "Generate token" at the bottom

3. **Copy the Token:**
   - ⚠️ **IMPORTANT:** Copy the token immediately - you won't be able to see it again!
   - It will look like: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Step 2: Push to GitHub

Run this command:
```bash
git push -u origin main
```

When prompted:
- **Username:** `sdkoncept`
- **Password:** Paste your Personal Access Token (NOT your GitHub password)

### Alternative: Store Credentials (Optional)

To avoid entering credentials every time:

**For Linux/Mac:**
```bash
git config --global credential.helper store
```

Then push once, and it will remember your credentials.

**For Windows:**
```bash
git config --global credential.helper wincred
```

## Alternative: Set Up SSH (If you prefer)

If you want to use SSH instead:

1. **Generate SSH Key:**
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```
   (Press Enter to accept default location, optionally set a passphrase)

2. **Copy Public Key:**
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```
   Copy the output

3. **Add to GitHub:**
   - Go to: https://github.com/settings/keys
   - Click "New SSH key"
   - Paste your public key
   - Click "Add SSH key"

4. **Test Connection:**
   ```bash
   ssh -T git@github.com
   ```

5. **Change Remote to SSH:**
   ```bash
   git remote set-url origin git@github.com:sdkoncept/nigerian-real-estate.git
   ```

6. **Push:**
   ```bash
   git push -u origin main
   ```

---

## Quick Command (HTTPS Method - Recommended)

After creating your Personal Access Token:

```bash
git push -u origin main
```

Enter:
- Username: `sdkoncept`
- Password: Your Personal Access Token

---

**Repository:** https://github.com/sdkoncept/nigerian-real-estate.git

