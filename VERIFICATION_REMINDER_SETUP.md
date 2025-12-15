# 📧 Verification Reminder Email System - Setup Guide

## Overview

This system automatically sends reminder emails to unverified agents and sellers twice a month, encouraging them to complete their verification and explaining why it's important.

## Features

✅ **Automated Email Reminders**
- Sends emails to unverified agents (verification_status ≠ 'verified')
- Sends emails to sellers with unverified properties
- Runs twice a month (1st and 15th of each month)

✅ **Personalized Content**
- Explains why verification is important
- Lists specific benefits for agents and sellers
- Includes direct links to dashboard
- Professional HTML email templates

✅ **Secure**
- Protected by secret key to prevent unauthorized access
- Only sends to active users
- Tracks success/failure statistics

## How It Works

1. **Finds Unverified Users**
   - Agents: Checks `agents` table for `verification_status ≠ 'verified'`
   - Sellers: Checks `properties` table for sellers with unverified properties

2. **Sends Emails**
   - Uses configured SMTP service
   - Sends personalized reminder emails
   - Tracks success/failure for each email

3. **Scheduled Execution**
   - Runs automatically twice a month via cron job
   - Can also be triggered manually for testing

## Setup Instructions

### Step 1: Configure Environment Variables

Add to your `.env` file (or Vercel environment variables):

```bash
# Email Configuration (Required)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@housedirectng.com

# Frontend URL (Required)
FRONTEND_URL=https://housedirectng.com

# Cron Secret (Required - Change this!)
CRON_SECRET=your-super-secret-key-change-this-in-production
```

**Important**: 
- For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833) instead of your regular password
- Change `CRON_SECRET` to a strong random string in production
- Never commit secrets to git

### Step 2: Set Up Cron Job

#### Option A: Vercel Cron Jobs (Recommended)

1. **Add to `vercel.json`**:
   ```json
   {
     "crons": [
       {
         "path": "/api/scheduled/verification-reminders",
         "schedule": "0 9 1,15 * *"
       }
     ]
   }
   ```

2. **Deploy to Vercel**:
   ```bash
   vercel --prod
   ```

3. **Configure Cron Secret**:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add `CRON_SECRET` with your secret value
   - Redeploy if needed

**Schedule Explanation**: `0 9 1,15 * *` means:
- `0` - minute (0)
- `9` - hour (9 AM)
- `1,15` - day of month (1st and 15th)
- `*` - every month
- `*` - every day of week

#### Option B: External Cron Service

Use services like:
- **cron-job.org** (free)
- **EasyCron** (free tier available)
- **GitHub Actions** (if using GitHub)

**Configuration**:
- **URL**: `https://your-domain.com/api/scheduled/verification-reminders`
- **Method**: POST
- **Headers**: 
  ```
  x-cron-secret: your-secret-key
  Content-Type: application/json
  ```
- **Schedule**: Twice a month (1st and 15th at 9 AM)

#### Option C: Manual Testing

Test the endpoint manually:

```bash
curl -X POST https://your-domain.com/api/scheduled/verification-reminders \
  -H "x-cron-secret: your-secret-key" \
  -H "Content-Type: application/json"
```

Or with query parameter:

```bash
curl -X POST "https://your-domain.com/api/scheduled/verification-reminders?secret=your-secret-key"
```

### Step 3: Verify Email Configuration

Test email sending:

```bash
# Test endpoint (requires authentication or cron secret)
curl -X POST https://your-domain.com/api/scheduled/verification-reminders \
  -H "x-cron-secret: your-secret-key"
```

Check logs for:
- ✅ Email sent successfully messages
- ❌ Any SMTP configuration errors

## Email Templates

### Agent Reminder Email

**Subject**: 🔐 Complete Your Agent Verification - Don't Miss Out!

**Content**:
- Explains why verification is important for agents
- Lists 6 key benefits (trust, visibility, leads, credibility, premium features, faster approvals)
- Shows what documents are needed
- Step-by-step verification process
- Direct link to agent dashboard

### Seller Reminder Email

**Subject**: 🏠 Verify Your Properties - Get More Buyers Today!

**Content**:
- Explains why property verification matters
- Lists 6 key benefits (more inquiries, buyer confidence, faster sales, search ranking, badge, avoid suspicion)
- Shows what documents are needed
- Step-by-step verification process
- Direct link to seller dashboard

## API Endpoint

### POST `/api/scheduled/verification-reminders`

**Authentication**: 
- Header: `x-cron-secret: your-secret-key`
- OR Query param: `?secret=your-secret-key`

**Response**:
```json
{
  "success": true,
  "message": "Verification reminders sent successfully",
  "stats": {
    "agentsContacted": 5,
    "sellersContacted": 12,
    "agentsFailed": 0,
    "sellersFailed": 1,
    "totalContacted": 17,
    "totalFailed": 1,
    "errors": ["Failed to send email to seller: invalid@email.com"]
  },
  "timestamp": "2024-12-10T10:00:00.000Z"
}
```

## Monitoring

### Check Logs

Monitor the cron job execution:

1. **Vercel Dashboard**:
   - Go to Deployments → Functions → View Logs
   - Filter for `/api/scheduled/verification-reminders`

2. **Console Logs**:
   - Look for: `📧 Starting verification reminder email job...`
   - Success: `✅ Verification reminder stats: {...}`
   - Errors: `❌ Error sending verification reminders: ...`

### Track Email Delivery

- Check SMTP service logs (Gmail, SendGrid, etc.)
- Monitor bounce rates
- Track open rates (if using email service with analytics)

## Customization

### Change Email Schedule

Edit the cron schedule in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/scheduled/verification-reminders",
      "schedule": "0 9 1,15 * *"  // Change this
    }
  ]
}
```

**Common Schedules**:
- `0 9 1,15 * *` - 1st and 15th at 9 AM (current)
- `0 10 * * 1` - Every Monday at 10 AM
- `0 9 * * *` - Every day at 9 AM
- `0 9 1 * *` - 1st of every month at 9 AM

### Modify Email Content

Edit email templates in:
- `backend/src/services/email.ts`
  - `sendAgentVerificationReminder()` method
  - `sendSellerVerificationReminder()` method

### Add More Reminder Types

1. Add new email method to `emailService`
2. Add new function to `verificationReminder.ts`
3. Add new route to `scheduled.ts`
4. Add cron job to `vercel.json`

## Troubleshooting

### Emails Not Sending

1. **Check SMTP Configuration**:
   ```bash
   # Verify environment variables are set
   echo $SMTP_USER
   echo $SMTP_PASS
   ```

2. **Test Email Service**:
   - Check logs for SMTP errors
   - Verify SMTP credentials are correct
   - For Gmail, ensure App Password is used (not regular password)

3. **Check Cron Job**:
   - Verify cron job is configured in Vercel
   - Check cron job execution logs
   - Ensure `CRON_SECRET` matches

### Unauthorized Errors

- Verify `CRON_SECRET` matches in:
  - Environment variables
  - Cron job configuration
  - Request headers/query params

### No Users Found

- Check database:
  - Are there unverified agents?
  - Are there sellers with unverified properties?
  - Are users marked as `is_active = true`?

## Security Notes

1. **Never expose CRON_SECRET**:
   - Don't commit to git
   - Don't log in console
   - Use environment variables only

2. **Rate Limiting**:
   - This endpoint bypasses normal rate limiting
   - Protected by secret key instead
   - Monitor for abuse

3. **Email Privacy**:
   - Emails are sent individually (not BCC)
   - Respects user privacy
   - No email addresses exposed in logs

## Files Created

- `backend/src/services/verificationReminder.ts` - Core reminder logic
- `backend/src/routes/scheduled.ts` - API endpoint for cron jobs
- `backend/src/services/email.ts` - Added email template methods
- `vercel-cron.json` - Cron job configuration (reference)
- `VERIFICATION_REMINDER_SETUP.md` - This documentation

## Next Steps

1. ✅ Configure environment variables
2. ✅ Set up cron job (Vercel or external)
3. ✅ Test endpoint manually
4. ✅ Monitor first automated run
5. ✅ Adjust email content if needed
6. ✅ Track email open rates and conversions

---

**Status**: ✅ Ready to deploy
**Last Updated**: December 2024
