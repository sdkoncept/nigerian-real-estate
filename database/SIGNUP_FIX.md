# Fix for Signup 500 Error

## Problem
Getting 500 error when signing up as a seller (or any user type). The error occurs because the trigger function `handle_new_user()` is failing when trying to create the profile.

## Solution

The trigger function has been updated in `schema.sql` to:
1. Extract `user_type` from signup metadata
2. Handle errors gracefully
3. Support conflict resolution

## Quick Fix

If you're still getting errors, run this in Supabase SQL Editor:

```sql
-- Drop and recreate the trigger function with proper error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_user_type TEXT;
  v_full_name TEXT;
BEGIN
  -- Extract user_type from metadata, default to 'buyer' if not provided
  v_user_type := COALESCE(NEW.raw_user_meta_data->>'user_type', 'buyer');
  
  -- Validate user_type
  IF v_user_type NOT IN ('buyer', 'seller', 'agent', 'admin') THEN
    v_user_type := 'buyer';
  END IF;
  
  -- Extract full_name from metadata
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'name', '');
  
  -- Ensure email is not empty
  IF NEW.email IS NULL OR NEW.email = '' THEN
    RAISE EXCEPTION 'Email is required';
  END IF;
  
  -- Insert profile
  INSERT INTO public.profiles (id, email, full_name, user_type)
  VALUES (
    NEW.id,
    NEW.email,
    v_full_name,
    v_user_type
  )
  ON CONFLICT (id) DO UPDATE
    SET 
      email = COALESCE(EXCLUDED.email, profiles.email),
      full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), profiles.full_name),
      user_type = COALESCE(NULLIF(EXCLUDED.user_type, ''), profiles.user_type);
  
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists, update it
    UPDATE public.profiles
    SET 
      email = COALESCE(NEW.email, profiles.email),
      full_name = COALESCE(NULLIF(v_full_name, ''), profiles.full_name),
      user_type = COALESCE(NULLIF(v_user_type, 'buyer'), profiles.user_type)
    WHERE id = NEW.id;
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log error but don't fail user creation
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## What Changed

1. **Frontend**: Removed redundant profile update after signup (trigger handles it)
2. **Database**: Updated trigger function to extract `user_type` from metadata
3. **Error Handling**: Added comprehensive error handling with exception catching

## Testing

After applying the fix:
1. Try signing up as a buyer
2. Try signing up as a seller
3. Try signing up as an agent

All should work without 500 errors.

## If Still Failing

Check Supabase logs:
1. Go to Supabase Dashboard
2. Navigate to Logs → Postgres Logs
3. Look for errors related to `handle_new_user` function
4. Check for RLS policy violations

The function uses `SECURITY DEFINER` which should bypass RLS, but if issues persist, you may need to check:
- Function ownership
- Table permissions
- RLS policies on the profiles table

