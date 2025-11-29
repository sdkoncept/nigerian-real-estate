# 🚀 Quick Start Guide

## ✅ Configuration Complete!

Your environment variables have been configured. Here's what to do next:

---

## Step 1: Run Database SQL Scripts (REQUIRED) ⚠️

**This is the most important step!** Without this, payments and messaging won't work.

### How to Run:

1. **Open Supabase SQL Editor**
   - Go to: https://tmcxblknqjmvqmnbodsy.supabase.co
   - Click **"SQL Editor"** in left sidebar
   - Click **"New Query"**

2. **Run Scripts (One at a Time)**

   **Script 1:** Copy and paste contents of `database/ADD_ADMIN_AGENT_POLICY.sql`
   - Click **"Run"**
   - Should see: "Success. No rows returned"

   **Script 2:** Copy and paste contents of `database/MONETIZATION_SCHEMA.sql`
   - Click **"Run"**
   - Should see: "Success. No rows returned"

   **Script 3:** Copy and paste contents of `database/MESSAGING_SCHEMA.sql`
   - Click **"Run"**
   - Should see: "Success. No rows returned"

3. **Verify Tables Created**
   - Go to **"Table Editor"** in Supabase
   - You should see: `pricing_plans`, `subscriptions`, `payments`, `featured_listings`, `messages`

**See `DATABASE_SETUP_GUIDE.md` for detailed instructions.**

---

## Step 2: Set Up Gmail App Password (For Email)

If you want email notifications:

1. Go to: https://myaccount.google.com/security
2. Enable **2-Factor Authentication** (if not already enabled)
3. Go to **App Passwords**: https://myaccount.google.com/apppasswords
4. Generate password for "Mail"
5. Copy the 16-character password
6. Update `backend/.env`:
   ```
   SMTP_PASS=your-16-character-password-here
   ```

---

## Step 3: Configure Paystack Webhook

1. Go to: https://dashboard.paystack.com/#/settings/developer
2. Scroll to **"Webhooks"** section
3. Click **"Add Webhook URL"**
4. Enter: `http://localhost:5000/api/payments/paystack/webhook`
5. Select events: `charge.success`, `charge.failed`
6. Click **"Save"**

**Note:** For local development, you'll need ngrok:
```bash
# Install ngrok: https://ngrok.com/download
ngrok http 5000
# Use the ngrok URL in Paystack webhook
```

**See `PAYSTACK_WEBHOOK_SETUP.md` for detailed instructions.**

---

## Step 4: Start the Application

### Start Backend:
```bash
cd backend
npm install  # If not already done
npm run dev
```

You should see:
```
🚀 Server running on http://localhost:5000
✅ Database connected
```

### Start Frontend:
```bash
cd frontend
npm install  # If not already done
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## Step 5: Test Everything

1. **Open Browser:** http://localhost:5173
2. **Register/Login:** Create an account or log in
3. **Create Property:** Go to Seller Dashboard → Add Property
4. **Test Payment:** Go to Pricing page → Select a plan → Complete payment
5. **Check Database:** Verify records in Supabase tables

---

## ✅ Verification Checklist

- [ ] Database SQL scripts run successfully
- [ ] Backend starts on port 5000
- [ ] Frontend starts on port 5173
- [ ] Can log in/register
- [ ] Can create properties
- [ ] Paystack payment popup opens
- [ ] Gmail app password set (if using email)

---

## 🆘 Common Issues

### "Cannot connect to Supabase"
- Check `frontend/.env` has correct Supabase URL and key
- Restart frontend dev server

### "Payment initialization failed"
- Check `backend/.env` has correct Paystack keys
- Verify Paystack dashboard shows test mode

### "Database error: relation does not exist"
- **You haven't run the SQL scripts!** Go back to Step 1

### "Email not sending"
- Check Gmail app password is set in `backend/.env`
- Verify 2FA is enabled on Gmail account

---

## 📚 Additional Documentation

- **`COMPLETE_SETUP.md`** - Full setup guide
- **`DATABASE_SETUP_GUIDE.md`** - SQL script instructions
- **`PAYSTACK_WEBHOOK_SETUP.md`** - Webhook configuration
- **`IMPLEMENTATION_SUMMARY.md`** - Feature overview

---

## 🎯 You're All Set!

Everything is configured. Just:
1. ✅ Run SQL scripts (Step 1) - **DO THIS FIRST!**
2. ✅ Set up Gmail password (Step 2) - Optional
3. ✅ Configure webhook (Step 3) - Optional for now
4. ✅ Start and test (Steps 4-5)

**Happy coding!** 🚀

