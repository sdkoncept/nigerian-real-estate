# Quick Vercel Deployment Guide

## 🚀 Fastest Way to Deploy

### Step 1: Push to GitHub (if not done)
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### Step 2: Deploy via Vercel Dashboard

1. **Go to:** https://vercel.com/new
2. **Sign in** with GitHub
3. **Import Repository:**
   - Select: `sdkoncept/nigerian-real-estate`
   - Click "Import"

4. **Configure Project:**
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend` ⚠️ **IMPORTANT**
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `dist` (auto-detected)
   - **Install Command:** `npm install` (auto-detected)

5. **Add Environment Variables:**
   Click "Environment Variables" and add:
   ```
   VITE_SUPABASE_URL = https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY = your-anon-key-here
   VITE_API_URL = https://your-backend.vercel.app (or leave for now)
   ```

6. **Deploy:**
   - Click "Deploy"
   - Wait 2-3 minutes
   - ✅ Your app is live!

## 📍 Your Deployed URLs

After deployment, you'll get:
- **Frontend:** `https://nigerian-real-estate.vercel.app` (or custom name)
- **Backend:** Deploy separately if needed

## 🔄 Update Supabase CORS

After deployment, update Supabase to allow your Vercel domain:

1. Go to Supabase Dashboard → Settings → API
2. Add your Vercel URL to allowed origins:
   ```
   https://your-project.vercel.app
   ```

## 📝 Next Steps

1. ✅ Frontend deployed
2. ⏳ Deploy backend (optional - can use Supabase directly)
3. ⏳ Update environment variables
4. ⏳ Test the deployed app

---

**That's it!** Your app should be live in minutes! 🎉

