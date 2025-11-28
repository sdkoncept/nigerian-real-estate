# Fix: Invalid Characters in Vercel Project Name

## Problem
Vercel project names can only contain:
- Letters (a-z, A-Z)
- Digits (0-9)
- Underscores (_)
- **Cannot start with a digit**

Your repository name `nigerian-real-estate` contains hyphens (-) which are not allowed.

## Solution

### Option 1: Use Valid Name in Vercel Dashboard (Recommended)

When deploying in Vercel Dashboard:

1. **Import your repository** as usual
2. **In the "Project Name" field**, change it to:
   ```
   nigerian_real_estate
   ```
   (Replace hyphens with underscores)

3. **Root Directory:** `frontend`
4. **Continue with deployment**

### Option 2: Let Vercel Auto-Generate Name

1. **Import repository**
2. **Leave project name empty** - Vercel will auto-generate a valid name
3. **You can rename it later** in Settings → General → Project Name

### Option 3: Use Different Name

Use a name like:
- `nigerianrealestate`
- `nigerian_real_estate_platform`
- `nre_platform`
- `realestate_ng`

## Valid Project Names Examples

✅ **Valid:**
- `nigerian_real_estate`
- `nigerianRealEstate`
- `nigerian_real_estate_platform`
- `real_estate_ng`

❌ **Invalid:**
- `nigerian-real-estate` (contains hyphens)
- `123project` (starts with digit)
- `project-name` (contains hyphen)
- `project name` (contains space)

## Quick Fix

**In Vercel Dashboard:**
1. When importing, set **Project Name** to: `nigerian_real_estate`
2. Set **Root Directory** to: `frontend`
3. Deploy!

---

**The repository name can stay as `nigerian-real-estate` on GitHub. Only the Vercel project name needs to be valid.**

