# 🚨 URGENT: Fix Supabase Email Verification URLs

## The Problem
Verification emails are sending links to `localhost:3000` instead of your production domain, causing users to see "This site can't be reached" errors.

## Quick Fix Checklist

### ✅ Step 1: Check Supabase Site URL (5 minutes)

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Go to: **Settings** → **Authentication** → **URL Configuration**
4. Check **Site URL** field:
   - ❌ **WRONG:** `http://localhost:3000` or `http://localhost:5173`
   - ✅ **CORRECT:** `https://your-actual-domain.com` (your production URL)

5. If it's wrong, change it to your production domain and **Save**

### ✅ Step 2: Check Redirect URLs (2 minutes)

In the same page, under **Redirect URLs**, make sure you have:
- ✅ `https://your-actual-domain.com/verify-email`
- ✅ `https://your-actual-domain.com`
- ✅ `http://localhost:5173/verify-email` (for local dev only)

**Important:** Remove any `localhost:3000` entries if you're not using that port!

### ✅ Step 3: Check Email Templates (5 minutes)

1. Still in Supabase Dashboard: **Authentication** → **Email Templates**
2. Click on **Confirm signup** template
3. Look at the email body - find the verification link
4. It should say something like:
   ```
   {{ .ConfirmationURL }}
   ```
   OR
   ```
   {{ .SiteURL }}/verify-email?token=...
   ```

5. **If you see `localhost:3000` or `localhost:5173` hardcoded anywhere, that's the problem!**

6. Replace any hardcoded localhost URLs with:
   ```
   {{ .ConfirmationURL }}
   ```

7. Click **Save**

### ✅ Step 4: Set Environment Variable (2 minutes)

In your Vercel/Netlify dashboard (or wherever you deploy):

1. Go to **Settings** → **Environment Variables**
2. Add/Update:
   ```
   VITE_FRONTEND_URL=https://your-actual-domain.com
   ```
3. **Redeploy** your frontend after adding this

### ✅ Step 5: Test (2 minutes)

1. Sign up with a test email
2. Check the verification email
3. The link should point to: `https://your-actual-domain.com/verify-email?...`
4. NOT: `localhost:3000` or `localhost:5173`

## Common Issues

### Issue: "I don't know my production domain"
- Check your Vercel/Netlify dashboard
- Look at your deployment URL
- It should be something like: `https://your-app.vercel.app` or `https://your-custom-domain.com`

### Issue: "I changed it but emails still use localhost"
- Supabase might cache email templates
- Try signing up with a NEW email address (not one you've used before)
- Or wait a few minutes and try again

### Issue: "The email template doesn't have {{ .ConfirmationURL }}"
- You can manually set the URL in the template
- Use: `{{ .SiteURL }}/verify-email?token={{ .Token }}`
- Or just use: `{{ .ConfirmationURL }}` (recommended)

## After Fixing

Once you've made these changes:
1. ✅ Test with a new signup
2. ✅ Verify the email link goes to your production domain
3. ✅ Click the link and confirm it works
4. ✅ Users should no longer see "dead end" errors

## Need Help?

If you're still having issues:
1. Check browser console for errors
2. Check Supabase logs: **Logs** → **Auth Logs**
3. Verify your production domain is accessible
4. Make sure your frontend is deployed and working
