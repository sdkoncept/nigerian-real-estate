# Complete Forgot Password Fix

## Issues Fixed

### 1. Route Guard Blocking Access
**Problem:** The route had a guard that redirected users before the page could load
**Fix:** Removed the route guard from `App.tsx` and moved redirect logic inside the component

**Changed:**
```tsx
// Before (App.tsx)
<Route path="/forgot-password" element={user ? <Navigate to="/" replace /> : <ForgotPasswordPage />} />

// After (App.tsx)
<Route path="/forgot-password" element={<ForgotPasswordPage />} />
```

**Component-level redirect added:**
- If user is logged in, redirects after component mounts
- Allows page to load first, then redirects if needed

### 2. Link Navigation Enhancement
**Problem:** Link might not be triggering navigation properly
**Fix:** Added explicit click handler with logging

**Changed:**
```tsx
<Link 
  to="/forgot-password" 
  className="text-sm text-primary-600 hover:text-primary-700"
  onClick={(e) => {
    console.log('Forgot password link clicked');
    e.stopPropagation();
  }}
>
  Forgot password?
</Link>
```

### 3. Enhanced Debugging
**Added:**
- Component mount logging
- DOM element verification
- User state checking
- Page visibility verification

## Files Changed

1. **frontend/src/App.tsx**
   - Removed route guard from `/forgot-password` route

2. **frontend/src/pages/ForgotPasswordPage.tsx**
   - Added `useNavigate` import
   - Added component-level redirect for logged-in users
   - Enhanced mount logging
   - Added user state to dependency array

3. **frontend/src/pages/LoginPage.tsx**
   - Added click handler to forgot password link
   - Added console logging for debugging

## Testing Steps

1. **Test Navigation:**
   - Go to `/login`
   - Click "Forgot password?" link
   - Should navigate to `/forgot-password`
   - Check browser console for "Forgot password link clicked" log

2. **Test Page Rendering:**
   - Navigate directly to `/forgot-password`
   - Should see the forgot password form
   - Check console for "=== ForgotPasswordPage MOUNTED ===" log

3. **Test Form Submission:**
   - Enter an email address
   - Click "Send Reset Link"
   - Check console for detailed logs
   - Should see success message or error

## Supabase Configuration Required

### 1. Redirect URL
**Location:** Supabase Dashboard → Authentication → URL Configuration

**Required URL:**
```
https://housedirectng.com/reset-password
```

**Steps:**
1. Go to Supabase Dashboard
2. Navigate to Authentication → URL Configuration
3. Under "Redirect URLs", add: `https://housedirectng.com/reset-password`
4. Click "Save"

### 2. Email Template
**Location:** Supabase Dashboard → Authentication → Email Templates

**Template:** Reset Password

**Required:**
- Must include `{{ .ConfirmationURL }}` in the template
- Must NOT include `localhost` URLs
- Should use production domain

**Steps:**
1. Go to Supabase Dashboard
2. Navigate to Authentication → Email Templates
3. Click on "Reset Password" template
4. Verify it uses `{{ .ConfirmationURL }}`
5. Ensure no localhost URLs
6. Click "Save"

### 3. SMTP Configuration (Critical!)
**Location:** Supabase Dashboard → Settings → Auth → SMTP Settings

**This is the #1 reason emails don't send!**

**Steps:**
1. Go to Supabase Dashboard
2. Navigate to Settings → Auth → SMTP Settings
3. Enable "Enable Custom SMTP"
4. Configure SMTP settings:
   - **SMTP Host:** `smtp.gmail.com` (or your provider)
   - **SMTP Port:** `587`
   - **SMTP User:** Your email
   - **SMTP Password:** App password (for Gmail)
   - **Sender Email:** Your email
   - **Sender Name:** Nigerian Real Estate Platform
5. Click "Save"
6. Click "Send test email" to verify

**For Gmail:**
- Enable 2-Factor Authentication
- Generate App Password: Google Account → Security → 2-Step Verification → App passwords
- Use the 16-character app password (not your regular password)

## Vercel Environment Variables

**Required Variables:**
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_FRONTEND_URL=https://housedirectng.com
```

**Steps:**
1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Verify all three variables are set
5. Redeploy if you added new variables

## Deployment Checklist

- [x] Route guard removed from App.tsx
- [x] Component-level redirect added
- [x] Link navigation enhanced
- [x] Debugging logs added
- [ ] Supabase redirect URL configured
- [ ] Supabase email template verified
- [ ] Supabase SMTP configured
- [ ] Vercel environment variables verified
- [ ] Code committed and pushed
- [ ] Vercel deployment triggered

## Next Steps

1. **Commit and push changes:**
   ```bash
   git add .
   git commit -m "Fix forgot password navigation and routing"
   git push
   ```

2. **Configure Supabase:**
   - Add redirect URL
   - Verify email template
   - Configure SMTP settings

3. **Verify Vercel:**
   - Check environment variables
   - Trigger redeploy if needed

4. **Test:**
   - Navigate to `/forgot-password`
   - Submit form with test email
   - Check email inbox (and spam)
   - Verify reset link works

## Troubleshooting

If still not working:

1. **Check browser console:**
   - Look for "Forgot password link clicked" log
   - Look for "=== ForgotPasswordPage MOUNTED ===" log
   - Check for any errors

2. **Check network tab:**
   - Look for request to `/auth/v1/recover`
   - Check response status (should be 200)
   - Check response body for errors

3. **Check Supabase logs:**
   - Dashboard → Logs → Auth Logs
   - Look for password reset attempts
   - Check for errors

4. **Verify SMTP:**
   - Dashboard → Settings → Auth → SMTP Settings
   - Click "Send test email"
   - If test fails, SMTP is misconfigured
