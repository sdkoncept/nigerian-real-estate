# 🔧 Backend Setup Guide

Complete guide to setting up the Nigerian Real Estate Platform backend.

## Prerequisites

- Node.js 18+ installed
- Supabase project created
- Database schema applied

## Installation

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Create `.env` file:**
   ```bash
   cp .env.example .env
   ```

3. **Configure environment variables:**
   Edit `.env` and add your credentials (see Configuration section below)

## Configuration

### Required Environment Variables

#### Supabase
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (for admin operations)

#### Payment Gateways

**Paystack:**
- Get keys from: https://paystack.com/docs/api/
- `PAYSTACK_SECRET_KEY` - Your Paystack secret key
- `PAYSTACK_PUBLIC_KEY` - Your Paystack public key

#### Email Service (SMTP)
- `SMTP_HOST` - SMTP server (e.g., smtp.gmail.com)
- `SMTP_PORT` - SMTP port (usually 587)
- `SMTP_USER` - Your email address
- `SMTP_PASS` - Your email app password
- `SMTP_FROM` - From email address

**For Gmail:**
1. Enable 2-factor authentication
2. Generate an app password: https://myaccount.google.com/apppasswords
3. Use the app password as `SMTP_PASS`

#### SMS Service (Twilio)
- Get credentials from: https://www.twilio.com/console
- `TWILIO_ACCOUNT_SID` - Your Twilio Account SID
- `TWILIO_AUTH_TOKEN` - Your Twilio Auth Token
- `TWILIO_VERIFY_SERVICE_SID` - Create a Verify Service in Twilio Console

## Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

## API Endpoints

### Health Check
```
GET /api/health
```

### Admin Routes (Requires Admin Authentication)
```
GET    /api/admin/verifications/pending  - Get pending verifications
POST   /api/admin/verifications/approve  - Approve verification
POST   /api/admin/verifications/reject   - Reject verification
GET    /api/admin/reports                - Get all reports
GET    /api/admin/reports/:id            - Get report by ID
PATCH  /api/admin/reports/:id            - Update report status
```

### User Reports
```
POST   /api/reports                      - Create a new report
GET    /api/reports/my-reports           - Get user's reports
GET    /api/reports/:id                  - Get report by ID
```

### Payments
```
POST   /api/payments/paystack/initialize  - Initialize Paystack payment
POST   /api/payments/paystack/verify      - Verify Paystack payment
```

### Verification
```
POST   /api/verification/email/request   - Request email verification
POST   /api/verification/email/verify   - Verify email token
POST   /api/verification/phone/request  - Request phone verification code
POST   /api/verification/phone/verify   - Verify phone code
```

## Security Features

### Implemented
- ✅ Helmet.js for security headers
- ✅ CORS configuration
- ✅ Rate limiting (API, Auth, Payment)
- ✅ Input sanitization (XSS protection)
- ✅ JWT authentication
- ✅ Role-based access control (Admin, Agent)
- ✅ Request ID tracking
- ✅ Input validation (Zod schemas)

### Rate Limits
- **API**: 100 requests per 15 minutes per IP
- **Authentication**: 5 requests per 15 minutes per IP
- **Payments**: 10 requests per hour per IP

## Authentication

All protected routes require a Bearer token in the Authorization header:

```
Authorization: Bearer <supabase_jwt_token>
```

The token is validated against Supabase Auth, and user information is attached to the request.

## Testing

### Using cURL

**Health Check:**
```bash
curl http://localhost:5000/api/health
```

**Authenticated Request:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:5000/api/reports/my-reports
```

## Troubleshooting

### "Supabase not configured"
- Check that all Supabase environment variables are set
- Verify credentials in Supabase Dashboard

### "Email service not configured"
- Set SMTP credentials in `.env`
- For Gmail, use an app password, not your regular password

### "SMS service not configured"
- Set Twilio credentials in `.env`
- Create a Verify Service in Twilio Console
- Add the service SID to `TWILIO_VERIFY_SERVICE_SID`

### "Payment initialization failed"
- Verify Paystack keys are correct
- Check that you're using test keys in development
- Ensure callback URLs are configured

## Next Steps

1. Set up production environment variables
2. Configure payment gateway webhooks
3. Set up monitoring and logging
4. Configure SSL/HTTPS
5. Set up automated backups

---

**Backend is ready!** 🚀

