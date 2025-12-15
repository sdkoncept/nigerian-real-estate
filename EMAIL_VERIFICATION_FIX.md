# Email Verification Fix

## Problem
Users clicking verification links from emails were taken to a "dead end" - links were pointing to `localhost:3000` instead of the production domain, causing `ERR_CONNECTION_REFUSED` errors.

## Root Cause
Supabase email templates were configured to use localhost URLs instead of the production domain. This happens when:
1. Supabase's Site URL is set to localhost
2. Email templates have hardcoded localhost URLs
3. Environment variables aren't set correctly in production

## Solution Implemented

### 1. Updated VerifyEmailPage.tsx
The verification page has been improved to:
- ✅ Properly handle Supabase's automatic verification flow
- ✅ Check for tokens in URL hash (Supabase's standard format)
- ✅ Wait for Supabase to process redirects and establish sessions
- ✅ Provide helpful error messages if verification status is unclear
- ✅ Handle cases where verification succeeded but status can't be confirmed

### 2. Updated AuthContext.tsx
- ✅ Added logic to prevent localhost URLs in production
- ✅ Ensures `emailRedirectTo` always uses the correct production URL

### 3. CRITICAL: Supabase Configuration (MUST DO THIS!)

**You MUST configure Supabase Dashboard settings:**

#### Step 1: Set Site URL
1. Go to your Supabase project dashboard
2. Navigate to: **Authentication** → **URL Configuration**
3. Set **Site URL** to your production domain:
   ```
   https://your-domain.com
   ```
   (NOT localhost!)

#### Step 2: Add Redirect URLs
Under **Redirect URLs**, add:
   ```
   https://your-domain.com/verify-email
   https://your-domain.com
   http://localhost:5173/verify-email  (only for local development)
   http://localhost:5173  (only for local development)
   ```

#### Step 3: Update Email Templates
1. Go to: **Authentication** → **Email Templates**
2. Click on **Confirm signup** template
3. Check the confirmation link - it should use `{{ .ConfirmationURL }}` or `{{ .SiteURL }}`
4. Make sure it's NOT hardcoded to localhost
5. The link should look like:
   ```
   {{ .ConfirmationURL }}
   ```
   NOT:
   ```
   http://localhost:3000/verify-email?token=...
   ```
6. Click **Save**

#### Step 4: Set Environment Variables
In your production environment (Vercel/Netlify/etc.), set:
```
VITE_FRONTEND_URL=https://your-domain.com
```

**Important:** Replace `your-domain.com` with your actual production domain!

### 3. How It Works Now

1. User signs up → Supabase sends verification email
2. User clicks link → Goes to Supabase server (verifies email automatically)
3. Supabase redirects to `/verify-email` with tokens in URL hash
4. VerifyEmailPage detects tokens and confirms verification
5. User is redirected to login page

### 4. Testing

To test the fix:
1. Sign up with a new email
2. Check your email for verification link
3. Click the link
4. You should be redirected to `/verify-email` page
5. Page should show "Email Verified!" and redirect to login
6. Try logging in - it should work

### 5. Troubleshooting

If users still see issues:

1. **Check Supabase Redirect URLs**: Make sure `/verify-email` is in allowed redirect URLs
2. **Check Email Templates**: In Supabase → Authentication → Email Templates, verify the confirmation email template includes the redirect URL
3. **Check Browser Console**: Look for any JavaScript errors
4. **Check Network Tab**: Verify the redirect is happening correctly

### 6. Fallback Behavior

If verification status can't be confirmed automatically:
- Page shows helpful message
- User can try logging in (verification might have succeeded)
- User can request a new verification email if needed

## Files Changed

- `frontend/src/pages/VerifyEmailPage.tsx` - Complete rewrite to handle Supabase verification flow properly
