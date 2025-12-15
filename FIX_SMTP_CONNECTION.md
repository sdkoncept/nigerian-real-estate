# 🔧 Fix SMTP Connection Issue

## Current Error

```
connect ECONNREFUSED 198.23.53.116:587
```

**Problem**: Cannot connect to mail.supremecluster.com on port 587

## 🔍 Diagnosis

The connection is being **refused**, which means:
- Port 587 might be blocked/firewalled
- Server might require a different port (465 for SSL)
- Server might not accept connections from your IP
- Network/firewall blocking outbound SMTP

## 🛠️ Solutions

### Solution 1: Try Port 465 with SSL (Most Common Fix)

Many SMTP servers use port 465 with SSL instead of port 587 with STARTTLS.

**Update `backend/.env`:**

```bash
SMTP_HOST=mail.supremecluster.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=akin.anenih@sdkoncept.com
SMTP_PASS=!1Josephine@1948
SMTP_FROM=akin.anenih@sdkoncept.com
```

**Then restart backend:**
```bash
cd backend
npm run dev
```

### Solution 2: Check Port Availability

Test if port 587 is accessible:

```bash
# Test connection
telnet mail.supremecluster.com 587
# Or
nc -zv mail.supremecluster.com 587
```

If connection fails, port 587 is blocked.

### Solution 3: Try Alternative Ports

Common SMTP ports:
- **587** - STARTTLS (current, not working)
- **465** - SSL/TLS (try this first)
- **25** - Plain SMTP (usually blocked)
- **2525** - Alternative STARTTLS port

### Solution 4: Check Firewall/Network

- Check if your firewall blocks outbound port 587
- Check if your ISP blocks SMTP ports
- Try from a different network

### Solution 5: Contact Email Provider

Contact supremecluster.com support to confirm:
- Which port should be used?
- Is port 587 open?
- Do they require IP whitelisting?
- What are the correct SMTP settings?

## 🧪 Quick Test

### Test Port 465:

1. **Update `.env`**:
   ```bash
   SMTP_PORT=465
   SMTP_SECURE=true
   ```

2. **Restart backend**

3. **Test again**:
   ```bash
   curl -X POST "http://localhost:5000/api/scheduled/verification-reminders?secret=a172ac1e0de4c5f6188bfb545fe79173d8c8023ac9e39d23bc413bf61218bbe4"
   ```

## 📋 Port Configuration Guide

### Port 587 (STARTTLS) - Current
```bash
SMTP_PORT=587
SMTP_SECURE=false
# Requires: requireTLS: true (already set in code)
```

### Port 465 (SSL/TLS) - Try This
```bash
SMTP_PORT=465
SMTP_SECURE=true
# Uses full SSL connection
```

## ✅ Expected Fix

After changing to port 465 with SSL, you should see:
- ✅ Connection successful
- ✅ Authentication successful  
- ✅ Email sent successfully

## 🔄 If Still Failing

If port 465 also fails, check:
1. **Email provider documentation** - What ports do they support?
2. **Network connectivity** - Can you reach the server?
3. **IP whitelisting** - Does server require your IP to be whitelisted?
4. **Alternative SMTP** - Consider using a different email service (SendGrid, Mailgun, etc.)

---

**Next Step**: Try port 465 with `SMTP_SECURE=true` first! 🚀
