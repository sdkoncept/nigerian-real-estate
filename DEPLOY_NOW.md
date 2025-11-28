# 🚀 Deploy to Vercel - Quick Start

## Fastest Method (5 minutes)

### Step 1: Push to GitHub
```bash
git push origin main
```

### Step 2: Deploy via Vercel Dashboard

1. **Go to:** https://vercel.com/new
2. **Sign in** with GitHub
3. **Import:** `sdkoncept/nigerian-real-estate`
4. **Configure:**
   - **Project Name:** `nigerian-real-estate` (lowercase - valid!)
   - **Root Directory:** `frontend` ⚠️ **CRITICAL**
   - **Framework:** Vite (auto-detected)
   - **Build Command:** `npm run build` (auto)
   - **Output Directory:** `dist` (auto)

5. **Environment Variables:**
   Add these in the deployment settings:
   ```
   VITE_SUPABASE_URL=https://tmcxblknqjmvqmnbodsy.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   VITE_API_URL=https://your-backend.vercel.app (optional for now)
   ```

6. **Deploy!**
   - Click "Deploy"
   - Wait 2-3 minutes
   - ✅ Done!

## 📍 Your App Will Be Live At:
`https://nigerian-real-estate.vercel.app` (or custom name)

## 🔧 After Deployment

1. **Update Supabase CORS:**
   - Go to Supabase Dashboard → Settings → API
   - Add your Vercel URL to allowed origins

2. **Test the app:**
   - Visit your Vercel URL
   - Try logging in
   - Test features

## 📝 Environment Variables Checklist

Make sure these are set in Vercel:
- ✅ `VITE_SUPABASE_URL`
- ✅ `VITE_SUPABASE_ANON_KEY`
- ⏳ `VITE_API_URL` (if using backend)

---

**That's it!** Your app will be live in minutes! 🎉

