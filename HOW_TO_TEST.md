# 🧪 Step-by-Step Testing Guide

## Quick Start Testing

### Option 1: Test Locally (Recommended First)

#### Step 1: Generate Your CRON_SECRET

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output - you'll need it!

#### Step 2: Set Up Environment Variables

Edit `backend/.env` and add:

```bash
CRON_SECRET=your-generated-secret-here
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
SMTP_FROM=noreply@housedirectng.com
FRONTEND_URL=http://localhost:5173
```

**Important**: For Gmail, you need an App Password:
1. Go to Google Account → Security
2. Enable 2-Step Verification
3. Go to App Passwords
4. Generate a password for "Mail"
5. Use that password (not your regular password)

#### Step 3: Start Backend Server

```bash
cd backend
npm run dev
```

You should see:
```
🚀 Server running on http://localhost:5000
📡 API Health: http://localhost:5000/api/health
```

#### Step 4: Test the Endpoint

**Using the test script:**
```bash
# From project root
node scripts/test-verification-reminder.js YOUR_SECRET_HERE http://localhost:5000
```

**Or using curl:**
```bash
# Test 1: Health check (no auth needed)
curl http://localhost:5000/api/scheduled/health

# Test 2: Trigger reminders (with secret)
curl -X POST "http://localhost:5000/api/scheduled/verification-reminders?secret=YOUR_SECRET_HERE"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Verification reminders sent successfully",
  "stats": {
    "agentsContacted": 2,
    "sellersContacted": 5,
    "agentsFailed": 0,
    "sellersFailed": 0,
    "totalContacted": 7,
    "totalFailed": 0
  },
  "timestamp": "2024-12-10T10:00:00.000Z"
}
```

#### Step 5: Check Results

1. **Check Console Output**: Look for:
   - `📧 Starting verification reminder email job...`
   - `✅ Email sent successfully to: email@example.com`
   - `✅ Verification reminder stats: {...}`

2. **Check Email Inboxes**: 
   - Look for emails sent to unverified agents and sellers
   - Subject: "🔐 Complete Your Agent Verification" or "🏠 Verify Your Properties"

---

### Option 2: Test on Production (Vercel)

#### Step 1: Set CRON_SECRET in Vercel

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Name: `CRON_SECRET`
6. Value: Your generated secret
7. Environment: **Production** (and Preview if you want)
8. Click **Save**

#### Step 2: Deploy (if needed)

```bash
git add .
git commit -m "Add verification reminder system"
git push
```

Or redeploy from Vercel dashboard.

#### Step 3: Test Production Endpoint

**Using curl:**
```bash
curl -X POST "https://housedirectng.com/api/scheduled/verification-reminders?secret=YOUR_SECRET_HERE"
```

**Using the test script:**
```bash
node scripts/test-verification-reminder.js YOUR_SECRET_HERE https://housedirectng.com
```

#### Step 4: Check Vercel Logs

1. Go to Vercel Dashboard → **Deployments**
2. Click on latest deployment
3. Click **Functions** tab
4. Find `/api/scheduled/verification-reminders`
5. Click **View Logs**

Look for:
- ✅ `📧 Starting verification reminder email job...`
- ✅ `✅ Email sent successfully to: ...`
- ✅ `✅ Verification reminder stats: {...}`

---

## Troubleshooting

### ❌ "Unauthorized" Error

**Problem**: Wrong or missing CRON_SECRET

**Solution**:
1. Check `.env` file has `CRON_SECRET` set
2. Make sure secret matches exactly (no spaces)
3. Restart backend server after changing `.env`
4. For Vercel: Check environment variable is set correctly

### ❌ "Email transporter not configured"

**Problem**: SMTP credentials missing or incorrect

**Solution**:
1. Check `SMTP_USER` and `SMTP_PASS` are set in `.env`
2. For Gmail: Use App Password (not regular password)
3. Verify Gmail 2-Step Verification is enabled
4. Check `SMTP_HOST` and `SMTP_PORT` are correct

### ❌ No emails sent (but no errors)

**Possible Causes**:
1. No unverified users in database
2. Users don't have email addresses
3. SMTP provider blocking emails

**Check**:
```sql
-- Check unverified agents
SELECT a.id, p.email, a.verification_status 
FROM agents a 
JOIN profiles p ON a.user_id = p.id 
WHERE a.verification_status != 'verified' AND a.is_active = true;

-- Check sellers with unverified properties
SELECT DISTINCT p.id, p.email
FROM profiles p
JOIN properties prop ON prop.created_by = p.id
WHERE p.user_type = 'seller' 
  AND prop.verification_status != 'verified'
  AND prop.is_active = true;
```

### ❌ "Cannot connect to database"

**Problem**: Supabase credentials incorrect

**Solution**:
1. Check `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env`
2. Verify Supabase project is active
3. Check network connection

### ❌ Backend server won't start

**Check**:
1. Port 5000 is not already in use
2. All dependencies installed: `cd backend && npm install`
3. TypeScript compiles: `cd backend && npm run build`

---

## Test Checklist

Before deploying to production:

- [ ] CRON_SECRET generated and set
- [ ] SMTP credentials configured
- [ ] Backend server starts successfully
- [ ] Health check endpoint works (`/api/scheduled/health`)
- [ ] Manual trigger works with correct secret
- [ ] Unauthorized error with wrong secret
- [ ] Console shows email job started
- [ ] Console shows emails sent successfully
- [ ] Test users received emails
- [ ] Email content is correct
- [ ] Links in emails work
- [ ] Vercel environment variables set (for production)
- [ ] Production endpoint works

---

## Quick Test Commands

### Local Testing
```bash
# 1. Start backend
cd backend && npm run dev

# 2. In another terminal, test health
curl http://localhost:5000/api/scheduled/health

# 3. Test reminders (replace YOUR_SECRET)
curl -X POST "http://localhost:5000/api/scheduled/verification-reminders?secret=YOUR_SECRET"
```

### Production Testing
```bash
# Test health
curl https://housedirectng.com/api/scheduled/health

# Test reminders (replace YOUR_SECRET)
curl -X POST "https://housedirectng.com/api/scheduled/verification-reminders?secret=YOUR_SECRET"
```

### Using Test Script
```bash
# Local
node scripts/test-verification-reminder.js YOUR_SECRET http://localhost:5000

# Production
node scripts/test-verification-reminder.js YOUR_SECRET https://housedirectng.com
```

---

## What to Look For

### ✅ Success Indicators:
- HTTP 200 status code
- `"success": true` in response
- `stats.agentsContacted > 0` or `stats.sellersContacted > 0`
- Console logs show emails sent
- Emails arrive in inboxes

### ⚠️ Warning Signs:
- `agentsFailed > 0` or `sellersFailed > 0` (check errors array)
- SMTP errors in console
- No users found (check database)
- Unauthorized errors (check secret)

---

## Need More Help?

1. Check `VERIFICATION_REMINDER_SETUP.md` for detailed setup
2. Check `TEST_VERIFICATION_REMINDER.md` for troubleshooting
3. Review Vercel logs for production issues
4. Check backend console for local testing

---

**Ready to test?** Start with Step 1 above! 🚀
