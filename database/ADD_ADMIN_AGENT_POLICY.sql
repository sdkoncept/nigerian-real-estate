-- Add RLS policies to allow admins to update records
-- This fixes the 406 error when admins try to update verification status

-- Run this in Supabase SQL Editor

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

-- Verify the policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('agents', 'properties', 'profiles')
  AND policyname LIKE '%Admin%'
ORDER BY tablename, policyname;

