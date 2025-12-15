# Forgot Password Fix

## Issue
Forgot password functionality not working - no errors in console, but password reset emails not being sent.

## Changes Made

### 1. Created ForgotPasswordPage.tsx
- New page at `/forgot-password` route
- Form to request password reset
- Comprehensive logging for debugging
- Direct Supabase API calls for better error visibility

### 2. Created ResetPasswordPage.tsx  
- New page at `/reset-password` route
- Form to set new password after clicking reset link
- Handles Supabase tokens from email

### 3. Added Routes
- `/forgot-password` - Request password reset
- `/reset-password` - Set new password

### 4. Enhanced Logging
- Added console logs at every step
- Logs Supabase configuration status
- Logs redirect URL being used
- Logs full error details if any

## Debugging Steps

When you click "Send Reset Link", check the browser console (F12) for:

1. **Supabase Configuration:**
   ```
   ForgotPasswordPage - Supabase URL: Configured (or NOT CONFIGURED)
   ```

2. **Redirect URL:**
   ```
   ForgotPasswordPage - Redirect URL: https://your-domain.com/reset-password
   ```

3. **Supabase Call Result:**
   ```
   ForgotPasswordPage - Supabase direct call result: { hasData: ..., error: ... }
   ```

## Common Issues & Solutions

### Issue 1: Supabase Redirect URL Not Configured
**Symptom:** No error, but emails not sent

**Solution:**
1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Under **Redirect URLs**, add:
   ```
   https://your-domain.com/reset-password
   ```
3. Click **Save**

### Issue 2: Supabase Email Templates Not Configured
**Symptom:** Emails sent but links don't work

**Solution:**
1. Go to Supabase Dashboard → Authentication → Email Templates
2. Click on **Reset Password** template
3. Make sure it uses `{{ .ConfirmationURL }}` or includes your domain
4. NOT localhost URLs

### Issue 3: Supabase Not Configured
**Symptom:** Console shows "NOT CONFIGURED"

**Solution:**
1. Check environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
2. Make sure they're set in production (Vercel/Netlify)

### Issue 4: Rate Limiting
**Symptom:** Error about rate limits

**Solution:**
- Wait a few minutes before trying again
- Supabase has rate limits on password reset requests

## Testing

1. Go to `/forgot-password`
2. Enter an email address
3. Click "Send Reset Link"
4. Check browser console for logs
5. Check email inbox for reset link
6. Click link → Should go to `/reset-password`
7. Enter new password → Should redirect to login

## What to Check in Console

Look for these logs when submitting:
- ✅ `ForgotPasswordPage - Submitting email: ...`
- ✅ `ForgotPasswordPage - Redirect URL: ...`
- ✅ `ForgotPasswordPage - Supabase URL: Configured`
- ✅ `ForgotPasswordPage - Supabase direct call result: ...`

If you see errors, they will show:
- Error message
- Error status code
- Error name

## Next Steps

If still not working after checking Supabase configuration:
1. Share the console logs
2. Check Supabase Dashboard → Authentication → Logs
3. Verify email is being sent from Supabase side
4. Check spam folder for reset emails
