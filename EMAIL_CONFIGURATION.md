# 📧 Email Configuration for House Direct NG

## Your Current SMTP Settings

Based on your hosting provider (Supreme Cluster), here are the exact settings you need:

### Environment Variables for Vercel

Add these to your Vercel project under **Settings** → **Environment Variables**:

```bash
SMTP_HOST=mail.supremecluster.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=noreply@housedirectng.com
SMTP_PASS=your_email_password_here
SMTP_FROM=noreply@housedirectng.com
FRONTEND_URL=https://housedirectng.com
```

### Important Notes:

1. **Port 465** = SSL/TLS encryption (requires `SMTP_SECURE=true`)
2. **SMTP_USER** = Your full email address (e.g., `noreply@housedirectng.com`)
3. **SMTP_PASS** = The password for that email account
4. **SMTP_FROM** = The "from" address users will see (can include display name)

### Step-by-Step Setup:

1. **Create Email Account** (if not already created):
   - Log into your hosting control panel (cPanel or similar)
   - Create email account: `noreply@housedirectng.com`
   - Set a strong password
   - Note: You can also use `hello@housedirectng.com` or `support@housedirectng.com`

2. **Add Environment Variables in Vercel**:
   - Go to https://vercel.com/dashboard
   - Select your project
   - Go to **Settings** → **Environment Variables**
   - Add each variable above (click "Add" for each one)
   - Make sure to select **Production**, **Preview**, and **Development** environments

3. **Redeploy**:
   - After adding variables, trigger a new deployment
   - Or wait for the next automatic deployment

4. **Test Email**:
   - Sign up a new user account
   - Check if verification email is received
   - Check spam folder if not in inbox

### Email Account Recommendations:

**Minimum Setup:**
- `noreply@housedirectng.com` - For all automated emails

**Recommended Setup:**
- `noreply@housedirectng.com` - Automated emails
- `support@housedirectng.com` - Customer support (forward to your main email)
- `admin@housedirectng.com` - Admin notifications (optional)

### Troubleshooting:

**Emails Not Sending?**
1. Verify email account exists and password is correct
2. Check SMTP_PORT is 465 (not 587)
3. Check SMTP_SECURE is true (required for port 465)
4. Verify SMTP_HOST is exactly `mail.supremecluster.com`
5. Check Vercel logs for error messages

**Emails Going to Spam?**
1. Set up SPF record for your domain
2. Set up DKIM record (check with your hosting provider)
3. Set up DMARC record
4. Use a professional "from" name: `House Direct NG <noreply@housedirectng.com>`

**Connection Errors?**
- Port 465 requires SSL/TLS
- Make sure `SMTP_SECURE=true` is set
- Some hosting providers may require you to enable "SMTP Authentication" in email settings

### Display Name Format (Optional):

You can set a friendly display name in `SMTP_FROM`:

```bash
SMTP_FROM=House Direct NG <noreply@housedirectng.com>
```

This will show as "House Direct NG" in the recipient's inbox instead of just the email address.

### Security Best Practices:

1. Use a strong, unique password for the email account
2. Don't commit passwords to Git
3. Use environment variables (already configured)
4. Consider using an app-specific password if your hosting supports it
5. Regularly monitor email sending for suspicious activity

### Current Email Types Configured:

✅ Email Verification (signup)
✅ Password Reset
✅ Verification Approval
✅ Verification Rejection
✅ Document Submission Confirmation

All emails will be sent from the address specified in `SMTP_FROM`.

