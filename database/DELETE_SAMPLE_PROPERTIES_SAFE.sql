-- SAFE DELETE: Sample Properties Only
-- This script uses a more conservative approach to identify sample properties
-- Run STEP 1 first to preview, then STEP 2 to delete

-- ============================================
-- STEP 1: Preview Properties to Delete
-- ============================================
-- Review this output carefully before proceeding

WITH sample_properties AS (
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
    -- Check if ALL images are from Unsplash (more conservative)
    CASE 
      WHEN array_length(images, 1) > 0 AND 
           array_length(images, 1) = (
             SELECT COUNT(*) FROM unnest(images) AS img 
             WHERE img LIKE '%unsplash.com%'
           )
      THEN true
      ELSE false
    END AS is_sample
  FROM public.properties
)
SELECT 
  id,
  title,
  city || ', ' || state AS location,
  price,
  currency,
  created_at,
  is_sample,
  images
FROM sample_properties
WHERE is_sample = true
ORDER BY created_at DESC;

-- ============================================
-- STEP 2: Count Before Deletion
-- ============================================

SELECT 
  'Properties with Unsplash images (sample)' AS type,
  COUNT(*) AS count
FROM public.properties
WHERE array_length(images, 1) > 0 
  AND array_length(images, 1) = (
    SELECT COUNT(*) FROM unnest(images) AS img 
    WHERE img LIKE '%unsplash.com%'
  )

UNION ALL

SELECT 
  'Properties without Unsplash images (user-uploaded)' AS type,
  COUNT(*) AS count
FROM public.properties
WHERE NOT (
  array_length(images, 1) > 0 
  AND array_length(images, 1) = (
    SELECT COUNT(*) FROM unnest(images) AS img 
    WHERE img LIKE '%unsplash.com%'
  )
);

-- ============================================
-- STEP 3: DELETE Sample Properties
-- ============================================
-- ⚠️ ONLY RUN THIS AFTER REVIEWING STEP 1 AND STEP 2
-- This will permanently delete properties that have ONLY Unsplash images

BEGIN;

-- Delete related records first
DELETE FROM public.favorites
WHERE property_id IN (
  SELECT id FROM public.properties
  WHERE array_length(images, 1) > 0 
    AND array_length(images, 1) = (
      SELECT COUNT(*) FROM unnest(images) AS img 
      WHERE img LIKE '%unsplash.com%'
    )
);

DELETE FROM public.reviews
WHERE property_id IN (
  SELECT id FROM public.properties
  WHERE array_length(images, 1) > 0 
    AND array_length(images, 1) = (
      SELECT COUNT(*) FROM unnest(images) AS img 
      WHERE img LIKE '%unsplash.com%'
    )
);

DELETE FROM public.contacts
WHERE property_id IN (
  SELECT id FROM public.properties
  WHERE array_length(images, 1) > 0 
    AND array_length(images, 1) = (
      SELECT COUNT(*) FROM unnest(images) AS img 
      WHERE img LIKE '%unsplash.com%'
    )
);

DELETE FROM public.featured_listings
WHERE property_id IN (
  SELECT id FROM public.properties
  WHERE array_length(images, 1) > 0 
    AND array_length(images, 1) = (
      SELECT COUNT(*) FROM unnest(images) AS img 
      WHERE img LIKE '%unsplash.com%'
    )
);

-- Delete the sample properties
DELETE FROM public.properties
WHERE array_length(images, 1) > 0 
  AND array_length(images, 1) = (
    SELECT COUNT(*) FROM unnest(images) AS img 
    WHERE img LIKE '%unsplash.com%'
  );

-- Show what was deleted
SELECT 
  'Deleted sample properties' AS action,
  COUNT(*) AS count
FROM public.properties
WHERE array_length(images, 1) > 0 
  AND array_length(images, 1) = (
    SELECT COUNT(*) FROM unnest(images) AS img 
    WHERE img LIKE '%unsplash.com%'
  );

-- If count is 0, commit the transaction
-- If you see any issues, run: ROLLBACK;
COMMIT;

-- ============================================
-- STEP 4: Verify Results
-- ============================================

SELECT 
  'Remaining properties' AS status,
  COUNT(*) AS total,
  COUNT(CASE WHEN created_by IS NOT NULL THEN 1 END) AS with_creator,
  COUNT(CASE WHEN created_by IS NULL THEN 1 END) AS without_creator
FROM public.properties;

