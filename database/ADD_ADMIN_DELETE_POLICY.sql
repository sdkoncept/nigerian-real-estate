-- Add RLS policies to allow admins to delete properties and related records
-- This fixes the issue where admins can't delete properties

-- Run this in Supabase SQL Editor

-- Allow admins to delete any property
DROP POLICY IF EXISTS "Admins can delete any property" ON public.properties;
CREATE POLICY "Admins can delete any property"
  ON public.properties FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

-- Allow admins to delete favorites (for cleanup when deleting properties)
DROP POLICY IF EXISTS "Admins can delete any favorite" ON public.favorites;
CREATE POLICY "Admins can delete any favorite"
  ON public.favorites FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

-- Allow admins to delete reviews (for cleanup when deleting properties)
DROP POLICY IF EXISTS "Admins can delete any review" ON public.reviews;
CREATE POLICY "Admins can delete any review"
  ON public.reviews FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

-- Allow admins to delete contacts (for cleanup when deleting properties)
DROP POLICY IF EXISTS "Admins can delete any contact" ON public.contacts;
CREATE POLICY "Admins can delete any contact"
  ON public.contacts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

-- Allow admins to delete featured listings (for cleanup when deleting properties)
DROP POLICY IF EXISTS "Admins can delete any featured listing" ON public.featured_listings;
CREATE POLICY "Admins can delete any featured listing"
  ON public.featured_listings FOR DELETE
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
WHERE tablename IN ('properties', 'favorites', 'reviews', 'contacts', 'featured_listings')
  AND policyname LIKE '%Admin%'
  AND cmd = 'DELETE'
ORDER BY tablename, policyname;

