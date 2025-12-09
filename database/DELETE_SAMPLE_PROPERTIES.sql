-- Delete Sample Properties from Database
-- This script safely removes only sample/test properties while preserving user-uploaded properties
-- Run this in Supabase SQL Editor

-- IMPORTANT: 
-- 1. This script identifies sample properties by their Unsplash image URLs
-- 2. Sample properties use images from https://images.unsplash.com/
-- 3. User-uploaded properties typically use Supabase Storage URLs or other sources
-- 4. Review the properties to be deleted before executing the DELETE statement

-- ============================================
-- STEP 1: Preview Sample Properties to be Deleted
-- ============================================
-- Run this first to see what will be deleted (DO NOT DELETE YET)

SELECT 
  id,
  title,
  city,
  state,
  price,
  currency,
  created_by,
  created_at,
  images,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM unnest(images) AS img 
      WHERE img LIKE '%unsplash.com%'
    ) THEN 'Sample Property (Unsplash images)'
    ELSE 'User Property (Other images)'
  END AS property_type
FROM public.properties
WHERE EXISTS (
  SELECT 1 FROM unnest(images) AS img 
  WHERE img LIKE '%unsplash.com%'
)
ORDER BY created_at DESC;

-- ============================================
-- STEP 2: Count Sample vs User Properties
-- ============================================

-- Count sample properties (with Unsplash images)
SELECT 
  'Sample Properties (to be deleted)' AS category,
  COUNT(*) AS count
FROM public.properties
WHERE EXISTS (
  SELECT 1 FROM unnest(images) AS img 
  WHERE img LIKE '%unsplash.com%'
)

UNION ALL

-- Count user properties (without Unsplash images)
SELECT 
  'User Properties (to keep)' AS category,
  COUNT(*) AS count
FROM public.properties
WHERE NOT EXISTS (
  SELECT 1 FROM unnest(images) AS img 
  WHERE img LIKE '%unsplash.com%'
)
OR images IS NULL
OR array_length(images, 1) IS NULL;

-- ============================================
-- STEP 3: Delete Sample Properties
-- ============================================
-- ⚠️ WARNING: This will permanently delete sample properties
-- Make sure you've reviewed the preview above before running this

-- First, delete related records (favorites, reviews, etc.)
DELETE FROM public.favorites
WHERE property_id IN (
  SELECT id FROM public.properties
  WHERE EXISTS (
    SELECT 1 FROM unnest(images) AS img 
    WHERE img LIKE '%unsplash.com%'
  )
);

DELETE FROM public.reviews
WHERE property_id IN (
  SELECT id FROM public.properties
  WHERE EXISTS (
    SELECT 1 FROM unnest(images) AS img 
    WHERE img LIKE '%unsplash.com%'
  )
);

DELETE FROM public.contacts
WHERE property_id IN (
  SELECT id FROM public.properties
  WHERE EXISTS (
    SELECT 1 FROM unnest(images) AS img 
    WHERE img LIKE '%unsplash.com%'
  )
);

-- Delete featured listings for sample properties
DELETE FROM public.featured_listings
WHERE property_id IN (
  SELECT id FROM public.properties
  WHERE EXISTS (
    SELECT 1 FROM unnest(images) AS img 
    WHERE img LIKE '%unsplash.com%'
  )
);

-- Finally, delete the sample properties themselves
DELETE FROM public.properties
WHERE EXISTS (
  SELECT 1 FROM unnest(images) AS img 
  WHERE img LIKE '%unsplash.com%'
);

-- ============================================
-- STEP 4: Verify Deletion
-- ============================================

-- Show remaining properties (should only be user-uploaded)
SELECT 
  COUNT(*) AS remaining_properties,
  COUNT(CASE WHEN created_by IS NOT NULL THEN 1 END) AS with_creator,
  COUNT(CASE WHEN created_by IS NULL THEN 1 END) AS without_creator
FROM public.properties;

-- Show properties by city/state (remaining ones)
SELECT 
  city, 
  state, 
  COUNT(*) as property_count
FROM public.properties
GROUP BY city, state
ORDER BY state, city;

