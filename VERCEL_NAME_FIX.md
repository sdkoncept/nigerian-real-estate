# Vercel Project Name Rules

## Valid Project Name Rules
Vercel project names must:
- Be **lowercase** only
- Be up to **100 characters** long
- Can include: letters, digits, `.`, `_`, `-`
- **Cannot contain** the sequence `---` (three consecutive hyphens)
- Cannot start with a digit

Your repository name `nigerian-real-estate` is **valid** ✅

## Solution

### Use Your Repository Name (Recommended)

When deploying in Vercel Dashboard:

1. **Import your repository** as usual
2. **Project Name:** `nigerian-real-estate` ✅ (This is valid!)
3. **Root Directory:** `frontend` ⚠️ **IMPORTANT**
4. **Continue with deployment**

### Valid Project Names Examples

✅ **Valid:**
- `nigerian-real-estate` ✅
- `nigerian_real_estate` ✅
- `nigerian.real.estate` ✅
- `nigerianrealestate` ✅
- `nigerian-real-estate-platform` ✅

❌ **Invalid:**
- `Nigerian-Real-Estate` (contains uppercase)
- `123project` (starts with digit)
- `project---name` (contains three consecutive hyphens)
- `project name` (contains space)

## Quick Fix

**In Vercel Dashboard:**
1. When importing, set **Project Name** to: `nigerian-real-estate` (lowercase, with hyphens - this is valid!)
2. Set **Root Directory** to: `frontend` ⚠️ **CRITICAL**
3. Add environment variables
4. Deploy!

---

**Your repository name `nigerian-real-estate` is perfectly valid for Vercel! Just make sure it's lowercase.**

