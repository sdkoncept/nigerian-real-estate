# 📧 Email Setup Guide for House Direct NG

This guide outlines all the email addresses you need to create and configure for your platform.

## Required Email Addresses

### 1. **Primary SMTP Email (Required)**
**Email:** `noreply@housedirectng.com` or `hello@housedirectng.com`  
**Purpose:** Main sending address for all automated emails  
**Used For:**
- Email verification (signup)
- Password reset
- Verification approvals/rejections
- Document submission confirmations
- All transactional emails

**Configuration:**
- Set as `SMTP_USER` in environment variables
- Set as `SMTP_FROM` (optional, defaults to `SMTP_USER`)
- This is the "from" address users will see

**Recommendation:** Use `noreply@housedirectng.com` for automated emails, or `hello@housedirectng.com` for a more personal touch.

---

### 2. **Support Email (Recommended)**
**Email:** `support@housedirectng.com`  
**Purpose:** Customer support inquiries  
**Used For:**
- Contact form submissions (if implemented)
- User support requests
- General inquiries
- Help desk communications

**Note:** This email should be monitored regularly. You can forward it to your main business email or use a help desk tool.

---

### 3. **Admin/Operations Email (Recommended)**
**Email:** `admin@housedirectng.com` or `operations@housedirectng.com`  
**Purpose:** Administrative notifications  
**Used For:**
- New user registrations (optional notification)
- Verification requests requiring admin review
- Payment notifications (if you want email alerts)
- System alerts
- Error notifications

**Note:** This can be the same as your support email or a separate one for internal use.

---

### 4. **Payments Email (Optional but Recommended)**
**Email:** `payments@housedirectng.com`  
**Purpose:** Payment-related communications  
**Used For:**
- Payment receipts
- Invoice generation
- Subscription renewal reminders
- Payment failure notifications
- Refund confirmations

**Note:** Currently not implemented, but recommended for future payment features.

---

## Email Types Currently Implemented

### ✅ Currently Active Email Types:

1. **Email Verification** (`sendVerificationEmail`)
   - Sent when users sign up
   - Contains verification link
   - Subject: "Verify Your Email - House Direct NG"

2. **Password Reset** (`sendPasswordResetEmail`)
   - Sent when users request password reset
   - Contains reset link (expires in 1 hour)
   - Subject: "Reset Your Password - House Direct NG"

3. **Verification Approved** (`sendVerificationApprovedEmail`)
   - Sent when admin approves agent/property verification
   - Contains approval confirmation
   - Subject: "Verification Approved - [Agent Account/Property Listing]"

4. **Verification Rejected** (`sendVerificationRejectedEmail`)
   - Sent when admin rejects verification request
   - Contains rejection reason and feedback
   - Subject: "Verification Rejected - [Agent Account/Property Listing]"

5. **Document Submitted** (`sendDocumentSubmittedEmail`)
   - Sent when users submit documents for verification
   - Confirmation that documents were received
   - Subject: "Document Submitted for Verification"

---

## Email Configuration

### Environment Variables Required:

```bash
# SMTP Configuration (Required)
SMTP_HOST=smtp.gmail.com          # Or your email provider's SMTP server
SMTP_PORT=587                     # Usually 587 for TLS, 465 for SSL
SMTP_SECURE=false                 # true for SSL (port 465), false for TLS (port 587)
SMTP_USER=noreply@housedirectng.com  # Your sending email address
SMTP_PASS=your_app_password       # App-specific password (not regular password)
SMTP_FROM=noreply@housedirectng.com  # Optional: Display name can be added like "House Direct NG <noreply@housedirectng.com>"

# Frontend URL (Required for email links)
FRONTEND_URL=https://housedirectng.com
```

---

## Email Provider Options

### Option 1: Gmail (Easiest for Testing)
**Pros:**
- Free
- Easy setup
- Good for low volume

**Cons:**
- Daily sending limits (500 emails/day for free accounts)
- Requires App Password (not regular password)
- May be marked as spam if sending too many

**Setup:**
1. Create Gmail account: `noreply.housedirectng@gmail.com`
2. Enable 2-Factor Authentication
3. Generate App Password: Google Account → Security → App Passwords
4. Use App Password in `SMTP_PASS`

**SMTP Settings:**
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply.housedirectng@gmail.com
SMTP_PASS=your_16_char_app_password
```

---

### Option 2: SendGrid (Recommended for Production)
**Pros:**
- 100 emails/day free forever
- Better deliverability
- Analytics dashboard
- Professional service

**Cons:**
- Requires domain verification
- Slightly more complex setup

**Setup:**
1. Sign up at https://sendgrid.com
2. Verify your domain (`housedirectng.com`)
3. Create API key
4. Use SMTP settings provided

**SMTP Settings:**
```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
SMTP_FROM=noreply@housedirectng.com
```

---

### Option 3: Mailgun (Good Alternative)
**Pros:**
- 5,000 emails/month free
- Excellent deliverability
- Good for transactional emails

**Cons:**
- Requires domain verification
- More setup required

**Setup:**
1. Sign up at https://mailgun.com
2. Verify domain
3. Get SMTP credentials

---

### Option 4: AWS SES (Best for Scale)
**Pros:**
- Very cheap ($0.10 per 1,000 emails)
- Highly scalable
- Excellent deliverability
- Production-ready

**Cons:**
- Requires AWS account
- More complex setup
- Domain verification required

**Setup:**
1. AWS Console → SES
2. Verify domain
3. Create SMTP credentials
4. Move out of sandbox mode

---

### Option 5: Your Domain Email (Professional)
**Pros:**
- Most professional
- Uses your domain
- Better branding

**Cons:**
- Requires email hosting (cPanel, Google Workspace, Microsoft 365)
- May have sending limits

**Setup:**
1. Set up email hosting for `housedirectng.com`
2. Create email accounts
3. Use your hosting provider's SMTP settings

**Example (cPanel):**
```
SMTP_HOST=mail.housedirectng.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@housedirectng.com
SMTP_PASS=your_email_password
```

---

## Recommended Email Setup for House Direct NG

### Minimum Setup (Start Here):
1. **Primary Email:** `noreply@housedirectng.com` (or use Gmail for testing)
   - Use SendGrid free tier or Gmail
   - Configure in Vercel environment variables

### Recommended Setup (Production):
1. **Primary Email:** `noreply@housedirectng.com`
   - Use SendGrid or AWS SES
   - Professional and reliable

2. **Support Email:** `support@housedirectng.com`
   - Forward to your main business email
   - Or use a help desk tool (Zendesk, Freshdesk, etc.)

3. **Admin Email:** `admin@housedirectng.com`
   - For internal notifications
   - Can be same as support email

---

## Setting Up in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key_here
SMTP_FROM=noreply@housedirectng.com
FRONTEND_URL=https://housedirectng.com
```

4. Redeploy your application

---

## Testing Email Setup

After configuring, test by:
1. Signing up a new user account
2. Requesting a password reset
3. Submitting verification documents (as an agent)

Check your email inbox to confirm emails are being sent.

---

## Email Templates

All email templates are HTML-formatted and include:
- Professional branding
- Clear call-to-action buttons
- Mobile-responsive design
- Links back to your platform

Templates are located in: `frontend/backend-src/services/email.ts`

---

## Future Email Features (Not Yet Implemented)

These email types are planned but not yet implemented:
- Payment receipts/invoices
- Subscription renewal reminders
- Subscription expiry warnings
- Welcome emails for new subscribers
- Property inquiry notifications
- Agent inquiry notifications
- Weekly/monthly digest emails
- Marketing emails (newsletters)

---

## Troubleshooting

### Emails Not Sending?
1. Check `SMTP_USER` and `SMTP_PASS` are correct
2. Verify SMTP host and port
3. Check Vercel logs for email errors
4. Ensure email provider allows SMTP access
5. Check spam folder

### Emails Going to Spam?
1. Set up SPF records for your domain
2. Set up DKIM records
3. Set up DMARC records
4. Use a professional email service (SendGrid, Mailgun)
5. Verify your domain with the email provider

### Gmail Specific Issues?
- Must use App Password, not regular password
- Enable "Less secure app access" if using regular password (not recommended)
- Check daily sending limits (500/day for free accounts)

---

## Summary

**Minimum Required:**
- 1 email address for SMTP sending (`noreply@housedirectng.com`)

**Recommended:**
- 1 SMTP email (`noreply@housedirectng.com`)
- 1 Support email (`support@housedirectng.com`)
- 1 Admin email (`admin@housedirectng.com`)

**Best Practice:**
- Use SendGrid or AWS SES for production
- Set up domain email accounts for professionalism
- Monitor support email regularly
- Set up email forwarding if needed
