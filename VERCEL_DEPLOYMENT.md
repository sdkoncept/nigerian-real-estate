# Deploy to Vercel - Complete Guide

## 🚀 Deployment Options

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push to GitHub First:**
   - Make sure your code is pushed to: https://github.com/sdkoncept/nigerian-real-estate.git

2. **Go to Vercel:**
   - Visit: https://vercel.com
   - Sign up/Login with GitHub

3. **Import Project:**
   - Click "Add New..." → "Project"
   - Import from GitHub: `sdkoncept/nigerian-real-estate`
   - Click "Import"

4. **Configure Project:**
   - **Root Directory:** `frontend` (for frontend deployment)
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

5. **Environment Variables:**
   Add these in Vercel Dashboard → Settings → Environment Variables:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   VITE_API_URL=https://your-backend.vercel.app
   ```

6. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live!

### Option 2: Deploy Frontend Only (Recommended for Start)

Since you have a separate backend, deploy frontend first:

1. **In Vercel Dashboard:**
   - Root Directory: `frontend`
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

2. **Environment Variables:**
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   VITE_API_URL=http://localhost:5000 (or your backend URL)
   ```

### Option 3: Deploy Backend Separately

For the backend, you can:

1. **Deploy as separate Vercel project:**
   - Root Directory: `backend`
   - Framework: Other
   - Build Command: `npm run build` (if you have one)
   - Output Directory: `.` (or leave empty)

2. **Or use Vercel CLI:**
   ```bash
   cd backend
   vercel
   ```

## 📋 Environment Variables Needed

### Frontend (.env in Vercel)
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=https://your-backend.vercel.app
```

### Backend (.env in Vercel)
```
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://your-frontend.vercel.app
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-jwt-secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourdomain.com
FRONTEND_URL=https://your-frontend.vercel.app
PAYSTACK_SECRET_KEY=your-paystack-secret
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-number
```

## 🔧 Vercel CLI Deployment

### Install Vercel CLI:
```bash
npm i -g vercel
```

### Deploy Frontend:
```bash
cd frontend
vercel
```

### Deploy Backend:
```bash
cd backend
vercel
```

## 📝 Project Structure for Vercel

```
nigerian-real-estate-platform/
├── frontend/          # Deploy this as main project
│   ├── vercel.json
│   ├── package.json
│   └── ...
├── backend/           # Deploy separately or as API routes
│   ├── src/
│   └── package.json
└── vercel.json        # Root config (if deploying monorepo)
```

## 🎯 Recommended Setup

### Step 1: Deploy Frontend
1. Go to Vercel Dashboard
2. Import `sdkoncept/nigerian-real-estate`
3. Set Root Directory: `frontend`
4. Add environment variables
5. Deploy

### Step 2: Deploy Backend (Optional)
- Deploy backend separately or use Vercel Serverless Functions
- Update `VITE_API_URL` in frontend to point to backend URL

## 🔗 After Deployment

- Frontend URL: `https://your-project.vercel.app`
- Backend URL: `https://your-backend.vercel.app` (if deployed separately)

## ⚠️ Important Notes

1. **Supabase CORS:** Make sure your Supabase project allows your Vercel domain
2. **Environment Variables:** Never commit `.env` files - use Vercel Dashboard
3. **Build Time:** First deployment may take 2-3 minutes
4. **Custom Domain:** You can add custom domain in Vercel Dashboard → Settings

## 🆘 Troubleshooting

**Build Fails:**
- Check build logs in Vercel Dashboard
- Ensure all dependencies are in `package.json`
- Check Node.js version compatibility

**API Calls Fail:**
- Verify `VITE_API_URL` is correct
- Check CORS settings in backend
- Verify environment variables are set

**Supabase Errors:**
- Check Supabase URL and keys
- Verify RLS policies allow public access where needed
- Check Supabase project is active

---

**Ready to deploy?** Go to https://vercel.com and import your GitHub repository!

