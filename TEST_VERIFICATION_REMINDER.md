# 🧪 Testing Verification Reminder System

## Quick Test Guide

### Step 1: Generate Your CRON_SECRET

If you haven't already, generate a secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output - you'll need it for testing.

### Step 2: Set Environment Variable

**Option A: Local Testing (.env file)**
```bash
# Add to backend/.env
CRON_SECRET=your-generated-secret-here
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@housedirectng.com
FRONTEND_URL=https://housedirectng.com
```

**Option B: Vercel (Production)**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add `CRON_SECRET` with your generated secret
3. Redeploy if needed

### Step 3: Test the Endpoint

#### Test 1: Health Check (No Auth Required)
```bash
curl https://housedirectng.com/api/scheduled/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "Scheduled Tasks",
  "endpoints": {
    "verificationReminders": "POST /api/scheduled/verification-reminders"
  }
}
```

#### Test 2: Manual Trigger (With Secret)

**Using Query Parameter:**
```bash
curl -X POST "https://housedirectng.com/api/scheduled/verification-reminders?secret=YOUR_SECRET_HERE"
```

**Using Header:**
```bash
curl -X POST https://housedirectng.com/api/scheduled/verification-reminders \
  -H "x-cron-secret: YOUR_SECRET_HERE" \
  -H "Content-Type: application/json"
```

**Expected Success Response:**
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

**Expected Error (Wrong Secret):**
```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing cron secret"
}
```

### Step 4: Check Logs

**Vercel Logs:**
1. Go to Vercel Dashboard → Deployments
2. Click on latest deployment
3. Click "Functions" tab
4. Find `/api/scheduled/verification-reminders`
5. Click "View Logs"

Look for:
- ✅ `📧 Starting verification reminder email job...`
- ✅ `✅ Verification reminder stats: {...}`
- ✅ `✅ Email sent successfully to: email@example.com`
- ❌ Any error messages

### Step 5: Verify Emails Sent

1. Check inbox of test users (agents/sellers)
2. Look for emails with subjects:
   - "🔐 Complete Your Agent Verification - Don't Miss Out!"
   - "🏠 Verify Your Properties - Get More Buyers Today!"
3. Verify email content is correct
4. Check that links work

## Troubleshooting

### Issue: "Unauthorized" Error
**Solution**: Make sure `CRON_SECRET` matches exactly (no spaces, correct case)

### Issue: "Email transporter not configured"
**Solution**: Check SMTP environment variables are set correctly

### Issue: No emails sent
**Possible causes**:
1. SMTP credentials incorrect
2. No unverified users found
3. Email service not configured
4. Rate limiting by SMTP provider

**Check**:
- Verify SMTP_USER and SMTP_PASS are correct
- For Gmail, use App Password (not regular password)
- Check if there are unverified agents/sellers in database

### Issue: "Failed to send email"
**Check**:
- SMTP server settings
- Email addresses are valid
- SMTP provider rate limits
- Firewall blocking SMTP port

## Test Checklist

- [ ] CRON_SECRET generated and set
- [ ] SMTP credentials configured
- [ ] Health check endpoint works
- [ ] Manual trigger works with correct secret
- [ ] Unauthorized error with wrong secret
- [ ] Logs show email job started
- [ ] Logs show emails sent successfully
- [ ] Test users received emails
- [ ] Email content is correct
- [ ] Links in emails work

## Next Steps After Testing

1. ✅ Verify emails are being sent
2. ✅ Check email content is correct
3. ✅ Test with real unverified users
4. ✅ Monitor first automated cron run
5. ✅ Adjust email content if needed
