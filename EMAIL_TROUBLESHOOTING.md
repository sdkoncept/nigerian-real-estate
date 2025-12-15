# 🔧 Email Troubleshooting Guide

## Current Issue

**Status**: ✅ Endpoint working, but email failed to send  
**Failed Email**: mrn.international2013@gmail.com  
**SMTP Server**: mail.supremecluster.com

## 🔍 Check Backend Console Logs

The backend console should show detailed error information. Look for:

```
❌ Email sending error: [error message]
Full error details: {
  message: "...",
  code: "...",
  response: "...",
  responseCode: ...
}
```

**Common SMTP Error Codes:**
- `EAUTH` - Authentication failed (wrong username/password)
- `ECONNECTION` - Cannot connect to SMTP server
- `ETIMEDOUT` - Connection timeout
- `EENVELOPE` - Invalid sender/recipient address
- `EMESSAGE` - Message rejected by server

## 🛠️ Common Fixes

### 1. Authentication Issues

**Problem**: Wrong username or password

**Check**:
- Username: `akin.anenih@sdkoncept.com` (should match exactly)
- Password: `!1Josephine@1948` (check for typos, special characters)

**Fix**: Verify credentials with your email provider

### 2. TLS/SSL Configuration

**Problem**: Server requires TLS but it's not enabled

**Current Config**:
```
SMTP_SECURE=false
SMTP_PORT=587
```

**Try**:
- Port 587 usually requires STARTTLS (not full SSL)
- The code now sets `requireTLS: true` for port 587
- If still failing, try port 465 with `SMTP_SECURE=true`

### 3. Server Connection Issues

**Problem**: Cannot connect to mail.supremecluster.com

**Check**:
- Firewall blocking port 587
- Server IP whitelisting
- Network connectivity

**Test Connection**:
```bash
telnet mail.supremecluster.com 587
# Or
nc -zv mail.supremecluster.com 587
```

### 4. Sender Address Issues

**Problem**: Server rejects sender address

**Current**: `SMTP_FROM=akin.anenih@sdkoncept.com`

**Check**:
- Sender address must match authenticated user
- Some servers require exact match
- Check if server allows sending from this address

### 5. Rate Limiting

**Problem**: Too many emails sent too quickly

**Current**: 500ms delay between emails

**Fix**: Increase delay if needed

## 🧪 Test Email Configuration

### Test 1: Simple Email Test

Create a test script `test-email.js`:

```javascript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'mail.supremecluster.com',
  port: 587,
  secure: false,
  auth: {
    user: 'akin.anenih@sdkoncept.com',
    pass: '!1Josephine@1948',
  },
  tls: {
    rejectUnauthorized: false,
  },
  requireTLS: true,
});

transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP Connection Error:', error);
  } else {
    console.log('✅ SMTP Server is ready');
  }
});

transporter.sendMail({
  from: 'akin.anenih@sdkoncept.com',
  to: 'mrn.international2013@gmail.com',
  subject: 'Test Email',
  text: 'This is a test email',
}, (error, info) => {
  if (error) {
    console.error('❌ Send Error:', error);
  } else {
    console.log('✅ Email sent:', info.messageId);
  }
});
```

Run: `node test-email.js`

### Test 2: Check SMTP Logs

Enable debug mode in email service:

```typescript
// In email.ts constructor, add:
debug: true,
logger: true,
```

This will show detailed SMTP conversation.

## 📋 Next Steps

1. **Check Backend Console**: Look for detailed error message
2. **Verify SMTP Credentials**: Confirm with your email provider
3. **Test Connection**: Use telnet/nc to test port 587
4. **Try Different Port**: Test port 465 with SSL
5. **Contact Email Provider**: Check if there are any restrictions

## 🔄 Updated Code

I've updated the email service to:
- ✅ Include detailed error messages in response
- ✅ Better SMTP configuration for custom servers
- ✅ TLS/SSL handling improvements
- ✅ More detailed logging

**Restart your backend server** to apply changes:

```bash
# Stop backend (Ctrl+C)
# Then restart
cd backend
npm run dev
```

Then test again:

```bash
curl -X POST "http://localhost:5000/api/scheduled/verification-reminders?secret=a172ac1e0de4c5f6188bfb545fe79173d8c8023ac9e39d23bc413bf61218bbe4"
```

The error message should now include more details about what went wrong.

## 📞 Need More Help?

Share the backend console error output, and I can help diagnose the specific issue!
