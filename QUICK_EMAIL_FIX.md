# Quick Fix: "Error sending confirmation email"

## The Issue

Supabase is trying to send a confirmation email but email is not configured in your Supabase project.

## Quick Solutions

### Solution 1: Configure Supabase Email (Recommended)

1. **Go to Supabase Dashboard**
   - https://supabase.com/dashboard
   - Select your project

2. **Configure Email Provider**
   - Navigate to: **Settings** → **Auth** → **SMTP Settings**
   - Choose one:
     - **Use Supabase's built-in email** (free, limited)
     - **Configure custom SMTP** (Gmail, SendGrid, etc.)

3. **For Gmail (Quick Setup)**
   - Enable 2-Factor Authentication on your Gmail account
   - Generate App Password:
     - Google Account → Security → 2-Step Verification → App passwords
     - Select "Mail" and generate password
   - In Supabase:
     - SMTP Host: `smtp.gmail.com`
     - SMTP Port: `587`
     - SMTP User: `your-email@gmail.com`
     - SMTP Password: `your-app-password` (16 characters)
     - Sender Email: `your-email@gmail.com`
     - Sender Name: `Nigerian Real Estate Platform`

4. **Save and Test**
   - Click "Send test email"
   - Check your inbox

### Solution 2: Disable Email Confirmation (Development Only)

**⚠️ Only for testing! Don't use in production!**

1. **In Supabase Dashboard**
   - Go to: **Authentication** → **Settings**
   - Scroll to "Email Auth"
   - **Uncheck** "Enable email confirmations"
   - Save

2. **Users can now sign in immediately without email verification**

### Solution 3: Use Supabase Built-in Email (Free Tier)

1. **In Supabase Dashboard**
   - Go to: **Settings** → **Auth** → **Email Auth**
   - The built-in email is already enabled
   - **Note**: Limited to 3 emails/hour on free tier
   - Emails may go to spam

2. **Check Spam Folder**
   - Confirmation emails might be in spam
   - Mark as "Not Spam" if found

## Verify Configuration

After configuring, test:
1. Try signing up with a test email
2. Check inbox (and spam folder)
3. Click verification link

## Still Not Working?

1. **Check Supabase Logs**
   - Go to: **Logs** → **Auth Logs**
   - Look for email-related errors

2. **Verify SMTP Settings**
   - Double-check host, port, username, password
   - Test connection using "Send test email"

3. **Check Email Provider Limits**
   - Gmail: 500 emails/day (free)
   - SendGrid: 100 emails/day (free)
   - Supabase built-in: 3 emails/hour (free)

## Common Errors

- **"Invalid login"**: Wrong password (use App Password for Gmail)
- **"Connection timeout"**: Wrong host/port
- **"Rate limit"**: Too many emails sent, wait or upgrade

---

**The error is coming from Supabase's email system, not our backend code.** Configure email in Supabase Dashboard to fix it.

