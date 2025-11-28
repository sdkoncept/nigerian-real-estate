# 🚨 URGENT: Fix 406 Errors - Step by Step

## The Problem
You're getting HTTP 406 errors because the database RLS (Row Level Security) policies haven't been applied yet. These policies control who can read/write data.

## ✅ Quick Fix (5 minutes)

### Step 1: Open Supabase SQL Editor
1. Go to: https://supabase.com/dashboard
2. Select your project: `tmcxblknqjmvqmnbodsy`
3. Click **SQL Editor** in the left sidebar
4. Click **New query**

### Step 2: Copy and Run This SQL

Copy the ENTIRE contents of `database/ADD_ADMIN_AGENT_POLICY.sql` and paste it into the SQL Editor, then click **Run**.

**OR** copy this directly:

```sql
-- Allow admins to update agent records
DROP POLICY IF EXISTS "Admins can update any agent record" ON public.agents;
CREATE POLICY "Admins can update any agent record"
  ON public.agents FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

-- Allow admins to update properties
DROP POLICY IF EXISTS "Admins can update any property" ON public.properties;
CREATE POLICY "Admins can update any property"
  ON public.properties FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

-- Allow admins to update profiles (for user verification)
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );
```

### Step 3: Verify It Worked
You should see: **"Success. No rows returned"** or similar success message.

### Step 4: Push Code Changes
```bash
git push origin main
```

This will deploy:
- ✅ Property listing page fix (fetches from database)
- ✅ Agent document upload fix (uses Supabase Storage)
- ✅ Signup page visibility fix

---

## What Each Policy Does

1. **"Admins can update any agent record"**
   - Fixes: 406 errors when accessing agent dashboard
   - Allows: Admins to verify agents

2. **"Admins can update any property"**
   - Fixes: 406 errors when updating property verification
   - Allows: Admins to verify properties

3. **"Admins can update any profile"**
   - Fixes: 406 errors when verifying users
   - Allows: Admins to check/uncheck "Verified" in Admin Users page

---

## After Running SQL

1. **Refresh your browser** - Clear cache if needed (Ctrl+Shift+R)
2. **Test:**
   - ✅ Agent dashboard should load without 406 errors
   - ✅ Admin Users page - verify users should work
   - ✅ Admin Verifications page - approve/reject should work
   - ✅ Properties page - should show seller-listed properties

---

## Still Getting Errors?

### Check Your Admin Status
Run this in Supabase SQL Editor to verify you're an admin:

```sql
SELECT id, email, user_type, is_verified 
FROM public.profiles 
WHERE email = 'aanenih@live.com';
```

If `user_type` is not `'admin'`, run `database/MAKE_ADMIN.sql` first.

### Check Policies Were Created
Run this to see all admin policies:

```sql
SELECT tablename, policyname 
FROM pg_policies 
WHERE policyname LIKE '%Admin%'
ORDER BY tablename, policyname;
```

You should see 3 policies:
- `Admins can update any agent record` (agents table)
- `Admins can update any property` (properties table)
- `Admins can update any profile` (profiles table)

---

## Favorites 406 Error

If you're still getting 406 on favorites, check if this policy exists:

```sql
-- Check if favorites policy exists
SELECT policyname 
FROM pg_policies 
WHERE tablename = 'favorites';
```

If it doesn't exist, the favorites table might not have been created. Run the full `database/schema.sql` if needed.

---

**That's it!** After running the SQL and pushing code, all 406 errors should be resolved. 🎉

