-- Make aanenih@live.com an admin user
-- Run this in Supabase SQL Editor

-- Update the user's profile to set user_type to 'admin'
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

-- If the user doesn't exist yet, you'll need to create an account first
-- The user must sign up first, then run this script to make them admin

