# 🔄 Try Port 587 with STARTTLS

## 🔍 Current Issue

Error: `wrong version number`

This means port 465 might not be using direct SSL as expected. Many custom SMTP servers use **STARTTLS** on port 587 instead.

## ✅ What I Changed

Updated configuration to use:
- **Port**: 587 (instead of 465)
- **Secure**: false (uses STARTTLS, not direct SSL)
- **requireTLS**: true (upgrades connection to TLS)

## 🚀 Next Steps

### 1. Restart Backend Server

**Stop the server** (Ctrl+C) and **restart**:

```bash
cd backend
npm run dev
```

### 2. Test Again

```bash
curl -X POST "http://localhost:5000/api/scheduled/verification-reminders?secret=a172ac1e0de4c5f6188bfb545fe79173d8c8023ac9e39d23bc413bf61218bbe4"
```

## 📋 How STARTTLS Works

**Port 587 with STARTTLS:**
1. Connects with plain text
2. Sends STARTTLS command
3. Upgrades to encrypted TLS connection
4. Then authenticates and sends email

This is more compatible with custom SMTP servers.

## ✅ Expected Result

After restarting, you should see:
```json
{
  "success": true,
  "stats": {
    "agentsContacted": 1,
    "agentsFailed": 0
  }
}
```

## 🔄 If Port 587 Also Fails

If both ports fail, the issue might be:
1. **Server requires IP whitelisting** - Contact supremecluster.com support
2. **Different SMTP settings** - Check their documentation
3. **Firewall blocking** - Check network/firewall settings

**Restart backend and test with port 587!** 🚀
