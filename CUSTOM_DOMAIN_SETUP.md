# Custom Domain Setup for Vercel

## Overview
After deploying to Vercel, you'll get a default URL like `nigerian-real-estate.vercel.app`. You can add a custom domain (e.g., `realestate.ng` or `nigerianrealestate.com`).

## Step-by-Step Guide

### Step 1: Deploy to Vercel First
1. Complete your initial deployment to Vercel
2. Your app will be live at: `https://nigerian-real-estate.vercel.app` (or similar)

### Step 2: Add Custom Domain in Vercel Dashboard

1. **Go to Your Project:**
   - Visit: https://vercel.com/dashboard
   - Click on your `nigerian-real-estate` project

2. **Navigate to Settings:**
   - Click **Settings** tab
   - Click **Domains** in the left sidebar

3. **Add Domain:**
   - Enter your custom domain (e.g., `realestate.ng` or `www.realestate.ng`)
   - Click **Add**
   - Vercel will show you DNS records to configure

### Step 3: Configure DNS Records

Vercel will provide you with DNS records. You need to add these to your domain registrar.

#### Option A: Using A Record (Root Domain)
```
Type: A
Name: @
Value: 76.76.21.21
```

#### Option B: Using CNAME (Subdomain)
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

#### Option C: Using ANAME/ALIAS (Root Domain - Recommended)
```
Type: ANAME or ALIAS
Name: @
Value: cname.vercel-dns.com
```

### Step 4: Update DNS at Your Domain Registrar

**Common Registrars:**

1. **Namecheap:**
   - Go to Domain List → Manage → Advanced DNS
   - Add the records provided by Vercel

2. **GoDaddy:**
   - Go to My Products → DNS → Manage DNS
   - Add the records

3. **Cloudflare:**
   - Go to DNS → Records
   - Add the records

4. **Google Domains:**
   - Go to DNS → Custom Records
   - Add the records

### Step 5: Wait for DNS Propagation

- DNS changes can take **5 minutes to 48 hours** to propagate
- Vercel will automatically detect when DNS is configured correctly
- You'll see a green checkmark in Vercel Dashboard when it's ready

### Step 6: SSL Certificate (Automatic)

- Vercel automatically provisions **free SSL certificates** via Let's Encrypt
- Your site will be available at `https://yourdomain.com` automatically
- SSL is renewed automatically

## Common Domain Configurations

### Root Domain Only
```
realestate.ng → Vercel deployment
```

### WWW Subdomain
```
www.realestate.ng → Vercel deployment
```

### Both Root and WWW (Recommended)
```
realestate.ng → Vercel deployment
www.realestate.ng → Vercel deployment (redirects to root)
```

## DNS Record Examples

### For Root Domain (realestate.ng)
```
Type: A
Name: @
Value: 76.76.21.21
TTL: Auto or 3600
```

### For WWW Subdomain
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: Auto or 3600
```

## Troubleshooting

### Domain Not Resolving
1. **Check DNS Propagation:**
   - Use: https://dnschecker.org
   - Enter your domain and check if records are propagated globally

2. **Verify Records:**
   - Double-check the DNS records match exactly what Vercel provided
   - Ensure no typos in values

3. **Wait Longer:**
   - Some DNS changes take up to 48 hours
   - Check again after a few hours

### SSL Certificate Issues
- Vercel automatically provisions SSL certificates
- If there's an issue, wait 24-48 hours for automatic retry
- Check Vercel Dashboard → Domains for certificate status

### Redirect Issues
- To redirect www to root (or vice versa), configure in Vercel Dashboard → Domains
- Vercel can automatically handle redirects

## Best Practices

1. **Use Both Root and WWW:**
   - Configure both `yourdomain.com` and `www.yourdomain.com`
   - Vercel can redirect one to the other

2. **Enable Automatic HTTPS:**
   - Vercel does this automatically
   - No additional configuration needed

3. **Use Cloudflare (Optional):**
   - Can speed up DNS propagation
   - Provides additional CDN benefits
   - Still works with Vercel

## Quick Checklist

- [ ] Deploy to Vercel successfully
- [ ] Add custom domain in Vercel Dashboard
- [ ] Copy DNS records from Vercel
- [ ] Add DNS records to domain registrar
- [ ] Wait for DNS propagation (5 min - 48 hours)
- [ ] Verify domain is active in Vercel Dashboard
- [ ] Test `https://yourdomain.com` in browser
- [ ] SSL certificate automatically provisioned

## Example: Nigerian Real Estate Platform

**Suggested Domains:**
- `nigerianrealestate.com`
- `realestate.ng`
- `nre.ng`
- `property.ng`

**After Setup:**
- Your app will be accessible at your custom domain
- All Vercel features still work (deployments, previews, etc.)
- SSL is automatic and free

---

**Need Help?**
- Vercel Docs: https://vercel.com/docs/concepts/projects/domains
- Vercel Support: https://vercel.com/support

