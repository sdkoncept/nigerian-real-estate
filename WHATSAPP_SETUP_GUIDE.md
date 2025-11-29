# 📱 WhatsApp Integration Setup Guide

## Why WhatsApp?

WhatsApp is **extremely popular in Nigeria** and offers several advantages:
- ✅ **Free tier available** (1000 messages/month with Meta)
- ✅ **High engagement** - People check WhatsApp more than SMS
- ✅ **Rich media support** - Can send images, documents
- ✅ **Two-way communication** - Users can reply
- ✅ **No cost for users** - Unlike SMS

---

## Option 1: WhatsApp Business API (Meta) - RECOMMENDED ⭐

### Free Tier:
- **1,000 conversations/month** - FREE
- After that: ~$0.005 per conversation

### Setup Steps:

1. **Create Meta Business Account**
   - Go to: https://business.facebook.com
   - Create a business account

2. **Set Up WhatsApp Business Account**
   - Go to: https://business.facebook.com/settings/whatsapp-business-accounts
   - Create a WhatsApp Business Account
   - Add a phone number (can use your personal number for testing)

3. **Get Access Token**
   - Go to: https://developers.facebook.com/apps
   - Create a new app or use existing
   - Add "WhatsApp" product
   - Get your:
     - **Access Token** (temporary, then generate permanent)
     - **Phone Number ID**
     - **Business Account ID**

4. **Add to Backend `.env`:**
   ```env
   WHATSAPP_PROVIDER=meta
   WHATSAPP_ACCESS_TOKEN=your-access-token
   WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
   ```

5. **Test**
   - Send a test message
   - Verify it arrives on WhatsApp

**Documentation:** https://developers.facebook.com/docs/whatsapp

---

## Option 2: Green API (Free Tier) - EASIEST ⭐

### Free Tier:
- **100 messages/day** - FREE
- No credit card required
- Easy setup

### Setup Steps:

1. **Sign Up**
   - Go to: https://green-api.com
   - Create free account
   - No credit card needed

2. **Get Credentials**
   - After signup, you'll get:
     - **Instance ID**
     - **API Token**

3. **Link WhatsApp**
   - Scan QR code with your WhatsApp
   - Your phone becomes the sender

4. **Add to Backend `.env`:**
   ```env
   WHATSAPP_PROVIDER=green-api
   GREEN_API_ID_INSTANCE=your-instance-id
   GREEN_API_TOKEN=your-api-token
   ```

5. **Test**
   - Send test message
   - Verify delivery

**Documentation:** https://green-api.com/docs/

---

## Option 3: Chat API (Free Tier)

### Free Tier:
- **100 messages/day** - FREE
- Similar to Green API

### Setup Steps:

1. **Sign Up**
   - Go to: https://chat-api.com
   - Create account

2. **Get Credentials**
   - **Instance ID**
   - **API Token**

3. **Add to Backend `.env`:**
   ```env
   WHATSAPP_PROVIDER=chat-api
   CHAT_API_INSTANCE_ID=your-instance-id
   CHAT_API_TOKEN=your-token
   ```

---

## Option 4: WhatsApp via Twilio

If you already have Twilio:
- Twilio supports WhatsApp
- Uses your Twilio account
- Costs apply (not free)

### Setup:

1. **Enable WhatsApp in Twilio**
   - Go to: https://www.twilio.com/console/sms/whatsapp/learn
   - Get WhatsApp number

2. **Add to Backend `.env`:**
   ```env
   WHATSAPP_PROVIDER=twilio
   WHATSAPP_TWILIO_NUMBER=whatsapp:+14155238886
   # Use existing TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN
   ```

---

## Comparison Table

| Provider | Free Tier | Setup Difficulty | Best For |
|----------|-----------|------------------|----------|
| **Meta Business API** | 1,000/month | Medium | Production apps |
| **Green API** | 100/day | Easy | Quick setup |
| **Chat API** | 100/day | Easy | Quick setup |
| **Twilio** | None | Easy | Existing Twilio users |

---

## Recommended: Green API (For Quick Start)

**Why Green API?**
- ✅ Easiest setup (5 minutes)
- ✅ Free tier (100/day = 3,000/month)
- ✅ No credit card required
- ✅ Works immediately

**Steps:**
1. Sign up: https://green-api.com
2. Get credentials
3. Add to `.env`
4. Done!

---

## Update Backend Configuration

After choosing a provider, update `backend/.env`:

```env
# Choose one:
WHATSAPP_PROVIDER=green-api  # or 'meta', 'chat-api', 'twilio'

# For Green API:
GREEN_API_ID_INSTANCE=your-instance-id
GREEN_API_TOKEN=your-token

# For Meta:
WHATSAPP_ACCESS_TOKEN=your-token
WHATSAPP_PHONE_NUMBER_ID=your-id

# For Chat API:
CHAT_API_INSTANCE_ID=your-id
CHAT_API_TOKEN=your-token
```

---

## Update Phone Service

The new `WhatsAppService` can be used instead of or alongside `PhoneService`:

```typescript
// In your routes
import { whatsappService } from '../services/whatsapp.js';

// Send verification code via WhatsApp
const result = await whatsappService.sendVerificationCode(phoneNumber);
```

---

## Run Database Script

Don't forget to run:
```sql
-- Run: database/WHATSAPP_VERIFICATION_SCHEMA.sql
```

This creates the `verification_codes` table for storing codes.

---

## Testing

1. **Start backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Test endpoint:**
   ```bash
   curl -X POST http://localhost:5000/api/verification/whatsapp/send \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"phone": "08012345678"}'
   ```

3. **Check WhatsApp** - You should receive the code!

---

## Cost Comparison

### SMS (Twilio):
- ~$0.01-0.05 per SMS
- 1,000 messages = $10-50

### WhatsApp (Green API Free):
- 100 messages/day = FREE
- 1,000 messages = FREE (within limit)

### WhatsApp (Meta Free):
- 1,000 conversations/month = FREE
- After that: ~$0.005 per conversation

**WhatsApp is MUCH cheaper!** 💰

---

## Next Steps

1. ✅ Choose a provider (recommend Green API)
2. ✅ Sign up and get credentials
3. ✅ Update `backend/.env`
4. ✅ Run `database/WHATSAPP_VERIFICATION_SCHEMA.sql`
5. ✅ Test sending a message
6. ✅ Update routes to use WhatsApp service

---

**WhatsApp integration is ready!** 📱✨

