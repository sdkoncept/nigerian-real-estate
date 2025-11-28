# Making a User an Admin

## Quick Setup

To make `aanenih@live.com` an admin user:

### Option 1: Using SQL Editor (Recommended)

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Click **"New query"**
3. Copy and paste this SQL:

```sql
-- Make aanenih@live.com an admin user
UPDATE public.profiles
SET 
  user_type = 'admin',
  updated_at = NOW()
WHERE email = 'aanenih@live.com';

-- Verify the update
SELECT 
  id,
  email,
  full_name,
  user_type,
  is_verified,
  created_at
FROM public.profiles
WHERE email = 'aanenih@live.com';
```

4. Click **"Run"** (or press Ctrl+Enter)
5. ✅ You should see the user's profile with `user_type = 'admin'`

### Option 2: Using Table Editor

1. Go to **Supabase Dashboard** → **Table Editor**
2. Click on **`profiles`** table
3. Find the row with email `aanenih@live.com`
4. Click on the row to edit
5. Change `user_type` from current value to `admin`
6. Click **"Save"**

## Important Notes

### User Must Exist First
- The user must have signed up first (created an account)
- If the user doesn't exist, they need to:
  1. Sign up at your application
  2. Then run the SQL script above

### Admin Permissions

Once a user is set to `admin`, they can:
- ✅ View all verifications
- ✅ Approve/reject agent verifications
- ✅ Approve/reject property verifications
- ✅ View all reports
- ✅ Update report status
- ✅ Manage users (if admin routes are implemented)

### Verify Admin Status

After running the SQL, verify with:

```sql
SELECT 
  id,
  email,
  full_name,
  user_type,
  is_verified
FROM public.profiles
WHERE email = 'aanenih@live.com';
```

You should see `user_type = 'admin'`.

## Admin Features Available

Based on the database schema, admins have access to:

1. **Verification Management**
   - View all verification submissions
   - Approve/reject agent verifications
   - Approve/reject property verifications
   - Add review notes

2. **Report Management**
   - View all user reports
   - Update report status
   - Add admin notes

3. **User Management** (if implemented)
   - View all users
   - Update user types
   - Manage user accounts

## Troubleshooting

**"0 rows affected"**
- The user doesn't exist yet
- Check the email spelling
- User must sign up first

**"Permission denied"**
- Make sure you're using the SQL Editor with proper permissions
- Try using the Table Editor instead

**"user_type check constraint violation"**
- Make sure you're setting it to exactly `'admin'` (lowercase, with quotes)

---

**File**: `database/MAKE_ADMIN.sql` contains the SQL script ready to run.

