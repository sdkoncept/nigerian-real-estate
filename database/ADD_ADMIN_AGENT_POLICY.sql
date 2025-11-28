-- Add RLS policy to allow admins to update agent records
-- This fixes the 406 error when admins try to update agent verification status

-- Run this in Supabase SQL Editor

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

-- Verify the policy was created
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
WHERE tablename = 'agents'
ORDER BY policyname;

