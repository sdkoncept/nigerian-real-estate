# Email Configuration Guide

## Problem: "Error sending confirmation email"

This error occurs when Supabase tries to send the email verification email but email is not configured.

## Solution Options

### Option 1: Use Supabase Built-in Email (Recommended for Development)

Supabase has a built-in email service that works out of the box, but you need to configure it:

1. **Go to Supabase Dashboard**
   - Navigate to your project
   - Go to **Authentication** → **Email Templates**

2. **Configure Email Provider**
   - Go to **Settings** → **Auth** → **Email Auth**
   - Enable "Enable email confirmations"
   - Choose email provider:
     - **Built-in SMTP** (free, limited)
     - **Custom SMTP** (your own SMTP server)
     - **SendGrid** (recommended for production)
     - **Mailgun** (alternative)

3. **For Development (Built-in SMTP)**
   - Supabase provides a free SMTP service
   - No configuration needed
   - Emails may go to spam
   - Limited to 3 emails/hour (free tier)

### Option 2: Configure Custom SMTP (Recommended for Production)

1. **Get SMTP Credentials**
   - **Gmail**: Use App Password (not regular password)
   - **SendGrid**: Create API key
   - **Mailgun**: Get SMTP credentials
   - **AWS SES**: Configure SMTP

2. **Configure in Supabase**
   - Go to **Settings** → **Auth** → **SMTP Settings**
   - Enter your SMTP credentials:
     - Host: `smtp.gmail.com` (for Gmail)
     - Port: `587`
     - Username: Your email
     - Password: App password (for Gmail)
     - Sender email: Your email
     - Sender name: "Nigerian Real Estate Platform"

3. **For Gmail Specifically**
   - Enable 2-factor authentication
   - Generate App Password:
     - Go to Google Account → Security
     - 2-Step Verification → App passwords
     - Generate password for "Mail"
   - Use this app password (not your regular password)

### Option 3: Disable Email Confirmation (Development Only)

**⚠️ WARNING: Only for development/testing. Never use in production!**

1. **In Supabase Dashboard**
   - Go to **Authentication** → **Settings**
   - Under "Email Auth"
   - **Disable** "Enable email confirmations"
   - Save changes

2. **Users can sign in immediately without email verification**

## Quick Fix for Development

If you just want to test without email:

```sql
-- Run this in Supabase SQL Editor to auto-verify users
-- ⚠️ DEVELOPMENT ONLY - REMOVE IN PRODUCTION

-- Create function to auto-verify emails
CREATE OR REPLACE FUNCTION auto_verify_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-confirm email for new users
  UPDATE auth.users
  SET email_confirmed_at = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger (only if you want auto-verification)
-- DROP TRIGGER IF EXISTS auto_verify_on_signup ON auth.users;
-- CREATE TRIGGER auto_verify_on_signup
--   AFTER INSERT ON auth.users
--   FOR EACH ROW
--   EXECUTE FUNCTION auto_verify_email();
```

## Testing Email Configuration

1. **Test Signup**
   - Try signing up with a real email
   - Check inbox (and spam folder)
   - Click verification link

2. **Check Supabase Logs**
   - Go to **Logs** → **Auth Logs**
   - Look for email sending errors
   - Check for SMTP connection errors

3. **Test SMTP Connection**
   - Use Supabase's "Test Email" feature
   - Go to **Settings** → **Auth** → **SMTP Settings**
   - Click "Send test email"

## Common Issues

### Issue 1: "Invalid login credentials"
- **Cause**: Wrong SMTP password
- **Fix**: Use App Password for Gmail, not regular password

### Issue 2: "Connection timeout"
- **Cause**: Wrong SMTP host/port
- **Fix**: Verify SMTP settings:
  - Gmail: `smtp.gmail.com:587`
  - SendGrid: `smtp.sendgrid.net:587`
  - Mailgun: `smtp.mailgun.org:587`

### Issue 3: "Email not sending"
- **Cause**: Email provider blocking
- **Fix**: 
  - Check spam folder
  - Verify sender email is correct
  - Check email provider limits

### Issue 4: "Rate limit exceeded"
- **Cause**: Too many emails sent
- **Fix**: 
  - Wait for rate limit to reset
  - Upgrade email provider plan
  - Use custom SMTP with higher limits

## Recommended Setup

### For Development:
- Use Supabase built-in SMTP (free)
- Or disable email confirmation temporarily

### For Production:
- Use SendGrid or Mailgun
- Configure custom SMTP in Supabase
- Set up proper email templates
- Monitor email delivery rates

## Email Templates

Supabase allows you to customize email templates:
1. Go to **Authentication** → **Email Templates**
2. Customize:
   - Confirmation email
   - Password reset email
   - Magic link email
3. Use HTML/CSS for styling
4. Include variables: `{{ .ConfirmationURL }}`, `{{ .Email }}`, etc.

## Next Steps

1. **Configure SMTP in Supabase Dashboard** (recommended)
2. **Or disable email confirmation** (development only)
3. **Test signup** to verify emails are sending
4. **Check spam folder** if emails don't arrive

---

**Note**: The backend email service (`backend/src/services/email.ts`) is for custom emails (verification approvals, etc.). Supabase handles signup confirmation emails automatically.

