# 🔐 Supabase Setup Guide

Follow these steps to set up Supabase for your Nigerian Real Estate Platform.

## Step 1: Create Supabase Project

1. Go to: **https://supabase.com**
2. Sign up or log in
3. Click **"New Project"**
4. Fill in:
   - **Name**: `nigerian-real-estate-platform`
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to you (e.g., "West US" or "Europe West")
5. Click **"Create new project"**
6. ⏳ Wait 2-3 minutes for setup

## Step 2: Get Your Supabase Credentials

1. Once project is ready, go to: **Settings** → **API** (left sidebar)
2. Copy these 3 values:

   ```
   📍 Project URL
   https://xxxxx.supabase.co
   
   🔑 anon public key
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   
   🔐 service_role key
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

   **💾 Save these - you'll need them!**

## Step 3: Create Database Schema

1. Go to: **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Open the file: `database/schema.sql`
4. **Copy ALL the contents** (Ctrl+A, Ctrl+C)
5. **Paste into Supabase SQL Editor**
6. Click **"Run"** (or press Ctrl+Enter)
7. ✅ You should see: "Success. No rows returned"

This creates:
- ✅ `profiles` table (extends auth.users)
- ✅ `agents` table
- ✅ `properties` table
- ✅ `favorites` table
- ✅ `reviews` table
- ✅ `contacts` table
- ✅ `verifications` table
- ✅ All indexes and RLS policies
- ✅ Triggers and functions

## Step 4: Configure Environment Variables

### Frontend (.env.local)

1. In `frontend/` folder, create `.env.local`:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

2. Replace with your actual values from Step 2

### Backend (.env)

1. In `backend/` folder, create `.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:5173
   
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   
   JWT_SECRET=your-secret-key-here
   ```

2. Replace with your actual values from Step 2

3. **Generate JWT_SECRET:**
   - Go to: https://www.random.org/strings/
   - Length: 32
   - Characters: Alphanumeric
   - Copy the result

## Step 5: Test the Setup

1. **Start your servers:**
   ```bash
   npm run dev
   ```

2. **Test authentication:**
   - Go to: http://localhost:5173
   - Click "Sign Up"
   - Create an account
   - Check Supabase Dashboard → Table Editor → `profiles`
   - You should see your new user!

3. **Verify email:**
   - Check your email for verification link
   - Click the link to verify
   - Or verify manually in Supabase Dashboard → Authentication → Users

## Step 6: Configure Email (Optional)

1. Go to: **Settings** → **Auth** → **Email Templates**
2. Customize email templates if needed
3. For production, configure SMTP settings

## ✅ What's Set Up

- ✅ Database schema created
- ✅ Row Level Security (RLS) enabled
- ✅ Authentication ready
- ✅ User profiles auto-created
- ✅ Protected routes working
- ✅ Environment variables configured

## 🧪 Test Checklist

- [ ] Can sign up new account
- [ ] Profile created in `profiles` table
- [ ] Can sign in
- [ ] Can sign out
- [ ] Protected routes require login
- [ ] Email verification works (if configured)

## 🆘 Troubleshooting

**"Supabase credentials not found"**
- Check `.env.local` (frontend) and `.env` (backend) exist
- Verify variable names are correct
- Restart dev servers after adding env vars

**"Profile not created"**
- Check trigger `on_auth_user_created` exists
- Check function `handle_new_user()` exists
- Verify RLS policies allow inserts

**"Can't sign in"**
- Check email is verified (if email verification is enabled)
- Check Supabase Dashboard → Authentication → Users
- Verify credentials are correct

---

**Your Supabase setup is complete!** 🎉

