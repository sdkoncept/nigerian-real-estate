# 🔧 SMTP Connection Troubleshooting

## Current Status

**Error**: `ECONNREFUSED` on ports 465 and 587

This suggests the SMTP server might be:
- Blocking these ports
- Requiring IP whitelisting
- Using a different port
- Having firewall/network issues

## 🧪 What We've Tried

1. ✅ Port 465 with SSL - Failed (SSL handshake issues)
2. ✅ Port 587 with STARTTLS - Failed (Connection refused)
3. 🔄 Port 2525 with STARTTLS - **Currently trying**

## 🔍 Next Steps

### Option 1: Try Port 2525 (Alternative STARTTLS)

Port 2525 is often used as an alternative STARTTLS port when 587 is blocked.

**Current Configuration:**
```
SMTP_PORT=2525
SMTP_SECURE=false
```

**Restart backend and test.**

### Option 2: Contact Email Provider

Contact **supremecluster.com** support and ask:

1. **What port should be used?**
   - Port 587 (STARTTLS)?
   - Port 465 (SSL)?
   - Port 2525 (Alternative STARTTLS)?
   - A different port?

2. **Is IP whitelisting required?**
   - Do they need your server's IP address whitelisted?
   - What's the process to whitelist an IP?

3. **What are the correct SMTP settings?**
   - Host: mail.supremecluster.com?
   - Port: ?
   - Security: STARTTLS or SSL?
   - Authentication: Username/password?

4. **Are there any restrictions?**
   - Firewall rules?
   - Rate limiting?
   - Authentication requirements?

### Option 3: Test Connection Manually

Test if you can connect to the server:

```bash
# Test port 587
telnet mail.supremecluster.com 587
# Or
nc -zv mail.supremecluster.com 587

# Test port 465
telnet mail.supremecluster.com 465
# Or
nc -zv mail.supremecluster.com 465

# Test port 2525
telnet mail.supremecluster.com 2525
# Or
nc -zv mail.supremecluster.com 2525
```

If all ports fail, the server might be blocking connections from your IP.

### Option 4: Check Email Provider Documentation

Look for:
- SMTP settings documentation
- Port configuration guide
- IP whitelisting instructions
- Troubleshooting guide

### Option 5: Use Alternative Email Service

If the SMTP server continues to have issues, consider:

**Free Options:**
- **SendGrid** (100 emails/day free)
- **Mailgun** (5,000 emails/month free)
- **Resend** (3,000 emails/month free)

**These are more reliable and easier to configure.**

## 📋 Current Configuration

```
SMTP_HOST=mail.supremecluster.com
SMTP_PORT=2525
SMTP_SECURE=false
SMTP_USER=akin.anenih@sdkoncept.com
SMTP_PASS=!1Josephine@1948
SMTP_FROM=akin.anenih@sdkoncept.com
```

## ✅ Recommended Action

1. **Try port 2525** (restart backend and test)
2. **If that fails**, contact supremecluster.com support for correct SMTP settings
3. **Consider** switching to a more reliable email service (SendGrid, Mailgun, etc.)

---

**Restart backend and test port 2525!** 🚀
