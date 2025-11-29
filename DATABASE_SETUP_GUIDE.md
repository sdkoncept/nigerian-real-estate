# 📊 Database Setup Guide

## Step-by-Step Instructions

### 1. Open Supabase SQL Editor

1. Go to your Supabase project: https://tmcxblknqjmvqmnbodsy.supabase.co
2. Click on **"SQL Editor"** in the left sidebar
3. Click **"New Query"**

---

### 2. Run SQL Scripts (In Order)

Run each script **one at a time** in the SQL Editor. Copy the entire contents of each file and paste into the editor, then click **"Run"**.

#### Script 1: Admin & Agent Policies
**File:** `database/ADD_ADMIN_AGENT_POLICY.sql`

This script:
- Allows admins to update agent records
- Allows admins to update properties
- Allows admins to update profiles (for verification)

**Why needed:** Fixes 406 errors when admins try to verify users/agents.

---

#### Script 2: Monetization Schema
**File:** `database/MONETIZATION_SCHEMA.sql`

This script creates:
- `pricing_plans` table
- `subscriptions` table
- `payments` table
- `featured_listings` table
- All necessary RLS policies and indexes

**Why needed:** Enables subscription payments and featured listings.

---

#### Script 3: Messaging Schema
**File:** `database/MESSAGING_SCHEMA.sql`

This script creates:
- `messages` table
- RLS policies for messaging
- Indexes for performance

**Why needed:** Enables in-app messaging between users.

---

### 3. Verify Setup

After running all scripts, verify by checking:

1. **Tables Created:**
   - Go to **Table Editor** in Supabase
   - You should see: `pricing_plans`, `subscriptions`, `payments`, `featured_listings`, `messages`

2. **Policies Created:**
   - Go to **Authentication** → **Policies**
   - Check that policies exist for the new tables

---

### 4. Test Database Connection

Run this test query in SQL Editor:

```sql
-- Test query
SELECT 
  (SELECT COUNT(*) FROM pricing_plans) as pricing_plans_count,
  (SELECT COUNT(*) FROM subscriptions) as subscriptions_count,
  (SELECT COUNT(*) FROM payments) as payments_count,
  (SELECT COUNT(*) FROM featured_listings) as featured_listings_count,
  (SELECT COUNT(*) FROM messages) as messages_count;
```

All counts should return `0` (no data yet, but tables exist).

---

## Troubleshooting

### Error: "relation already exists"
- This means the table already exists. You can either:
  1. Drop the table and recreate it, OR
  2. Skip that script (if you've already run it)

### Error: "permission denied"
- Make sure you're using the SQL Editor (not the API)
- Check that you're logged in as the project owner

### Error: "syntax error"
- Make sure you copied the entire script
- Check for any missing semicolons
- Run scripts one at a time

---

## Next Steps

After running all SQL scripts:

1. ✅ **Test the application** - Start frontend and backend
2. ✅ **Configure Paystack Webhook** (see PAYSTACK_WEBHOOK_SETUP.md)
3. ✅ **Set up email** (if using Gmail, generate App Password)
4. ✅ **Test payment flow** with Paystack test keys

---

**All scripts are ready to run!** 🚀

