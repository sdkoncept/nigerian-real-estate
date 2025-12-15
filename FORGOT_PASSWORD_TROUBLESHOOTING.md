# Forgot Password Troubleshooting Guide

## Quick Diagnosis

If "Forgot Password" shows success but no email arrives, follow these steps:

### Step 1: Check Browser Console

1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Navigate to `/forgot-password`
4. Enter an email and click "Send Reset Link"
5. Look for these logs:

```
=== FORGOT PASSWORD FORM SUBMITTED ===
ForgotPasswordPage - Supabase direct call result: { hasData: ..., error: ... }
```

**What to check:**
- If `error` is present → Note the error message
- If `hasData` is `false` → Email service likely not configured
- If `hasData` is `true` but no email → Check Step 2

### Step 2: Verify Supabase Email Service Configuration

**This is the #1 cause of "not working" issues!**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to: **Settings** → **Auth** → **SMTP Settings**

**Check if SMTP is configured:**
- ❌ If "Enable Custom SMTP" is OFF → Emails won't be sent reliably
- ✅ If it's ON → Verify SMTP credentials are correct

**To configure SMTP (Gmail example):**
1. Enable 2-Factor Authentication on your Gmail account
2. Generate App Password:
   - Google Account → Security → 2-Step Verification → App passwords
   - Select "Mail" and generate password (16 characters)
3. In Supabase SMTP Settings:
   - **SMTP Host:** `smtp.gmail.com`
   - **SMTP Port:** `587`
   - **SMTP User:** `your-email@gmail.com`
   - **SMTP Password:** `your-16-char-app-password`
   - **Sender Email:** `your-email@gmail.com`
   - **Sender Name:** `Nigerian Real Estate Platform`
4. Click **Save**
5. Click **Send test email** to verify

### Step 3: Verify Redirect URL Configuration

1. In Supabase Dashboard → **Authentication** → **URL Configuration**
2. Under **Redirect URLs**, ensure this exists:
   ```
   https://housedirectng.com/reset-password
   ```
3. If missing, add it and click **Save**

### Step 4: Check Email Templates

1. In Supabase Dashboard → **Authentication** → **Email Templates**
2. Click on **Reset Password** template
3. Verify the template includes:
   ```
   {{ .ConfirmationURL }}
   ```
4. Ensure NO `localhost` URLs in the template
5. Click **Save**

### Step 5: Check Spam Folder

- Password reset emails often go to spam
- Check spam/junk folder
- Mark as "Not Spam" if found

### Step 6: Verify Environment Variables

Check that these are set in your deployment:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_FRONTEND_URL=https://housedirectng.com
```

### Step 7: Test with Network Tab

1. Open Developer Tools → **Network** tab
2. Navigate to `/forgot-password`
3. Enter email and submit
4. Look for a request to:
   ```
   https://your-project.supabase.co/auth/v1/recover
   ```
5. Check:
   - **Status:** Should be `200 OK`
   - **Response:** Should show success
   - If `400` or `500` → Check error details

## Common Error Messages

### "Too many requests"
- **Solution:** Wait 5-10 minutes and try again
- Supabase rate limits password reset requests

### "User not found"
- **Security feature:** Supabase doesn't reveal if email exists
- Still shows success message (by design)

### No error but no email
- **Most likely:** SMTP not configured (see Step 2)
- **Second most likely:** Email in spam folder

## Still Not Working?

If after all these steps it's still not working:

1. **Check Supabase Logs:**
   - Dashboard → **Logs** → **Auth Logs**
   - Look for password reset attempts
   - Check for any errors

2. **Verify Supabase Project Status:**
   - Dashboard → **Settings** → **General**
   - Ensure project is active (not paused)

3. **Test Email Service Directly:**
   - Dashboard → **Settings** → **Auth** → **SMTP Settings**
   - Click **Send test email**
   - If test fails → SMTP configuration is wrong

4. **Contact Support:**
   - Share console logs from Step 1
   - Share Supabase Auth Logs
   - Share SMTP configuration status (without passwords)

## Quick Test Checklist

- [ ] Console shows form submission log
- [ ] Console shows Supabase call result
- [ ] SMTP is configured in Supabase
- [ ] Redirect URL is in Supabase allowed URLs
- [ ] Email template uses `{{ .ConfirmationURL }}`
- [ ] Checked spam folder
- [ ] Environment variables are set
- [ ] Network tab shows successful API call
