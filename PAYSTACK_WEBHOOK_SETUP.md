# 💳 Paystack Webhook Setup Guide

## Why Webhooks?

Webhooks allow Paystack to automatically notify your backend when payments are completed, so you can:
- Activate subscriptions automatically
- Create featured listings automatically
- Update payment status in database
- Send confirmation emails

---

## Setup Instructions

### Step 1: Get Your Backend Webhook URL

**For Development:**
```
http://localhost:5000/api/payments/paystack/webhook
```

**For Production (after deploying to Vercel):**
```
https://your-backend-url.vercel.app/api/payments/paystack/webhook
```

**Note:** For local development, you'll need to use a tool like **ngrok** to expose your local server:
```bash
ngrok http 5000
# Then use: https://your-ngrok-url.ngrok.io/api/payments/paystack/webhook
```

---

### Step 2: Configure Webhook in Paystack

1. **Login to Paystack Dashboard**
   - Go to: https://dashboard.paystack.com

2. **Navigate to Settings**
   - Click **"Settings"** in the left sidebar
   - Click **"API Keys & Webhooks"**

3. **Add Webhook URL**
   - Scroll to **"Webhooks"** section
   - Click **"Add Webhook URL"**
   - Enter your webhook URL (from Step 1)
   - Click **"Save"**

4. **Select Events**
   - Check the following events:
     - ✅ `charge.success` - Payment completed successfully
     - ✅ `charge.failed` - Payment failed
     - ✅ `subscription.create` - Subscription created
     - ✅ `subscription.disable` - Subscription disabled

5. **Test Webhook**
   - Paystack will send a test event
   - Check your backend logs to confirm receipt

---

### Step 3: Verify Webhook in Backend

Your backend already has the webhook handler at:
```
backend/src/routes/payments.ts
```

The webhook endpoint:
- Verifies Paystack signature (security)
- Processes `charge.success` events
- Creates subscription/featured listing records
- Updates payment status

---

### Step 4: Test Webhook

1. **Make a test payment** in your app
2. **Check backend logs** for webhook receipt
3. **Verify database** - Check that records were created:
   ```sql
   SELECT * FROM payments ORDER BY created_at DESC LIMIT 5;
   SELECT * FROM subscriptions ORDER BY created_at DESC LIMIT 5;
   SELECT * FROM featured_listings ORDER BY created_at DESC LIMIT 5;
   ```

---

## Security: Webhook Signature Verification

**Important:** Your webhook handler should verify Paystack's signature to prevent fraud.

Add this to your webhook handler (if not already present):

```typescript
// Verify Paystack signature
const hash = crypto
  .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
  .update(JSON.stringify(req.body))
  .digest('hex');

if (hash !== req.headers['x-paystack-signature']) {
  return res.status(401).json({ error: 'Invalid signature' });
}
```

---

## Troubleshooting

### Webhook not receiving events
- Check webhook URL is correct
- Verify backend is running and accessible
- Check Paystack dashboard for webhook delivery status
- Check backend logs for errors

### "Invalid signature" error
- Verify `PAYSTACK_SECRET_KEY` is correct in `.env`
- Make sure you're using the same secret key as in Paystack dashboard

### Webhook received but nothing happens
- Check backend logs for errors
- Verify database tables exist (run SQL scripts)
- Check that RLS policies allow inserts

---

## Production Checklist

Before going live:

- [ ] Update webhook URL to production backend URL
- [ ] Switch to Paystack **live keys** (not test keys)
- [ ] Enable webhook signature verification
- [ ] Test with real payment (small amount)
- [ ] Monitor webhook delivery in Paystack dashboard
- [ ] Set up error alerts for failed webhooks

---

**Webhook setup complete!** 🎉

