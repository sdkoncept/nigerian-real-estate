-- Update ALL property constraints to support Shortlet and Airbnb
-- Run this ONCE before running POPULATE_PROPERTIES.sql
-- This updates both property_type and listing_type constraints

-- ============================================
-- Update property_type constraint
-- ============================================
ALTER TABLE public.properties 
DROP CONSTRAINT IF EXISTS properties_property_type_check;

ALTER TABLE public.properties 
ADD CONSTRAINT properties_property_type_check 
CHECK (property_type IN ('House', 'Apartment', 'Condo', 'Townhouse', 'Land', 'Commercial', 'Shortlet', 'Airbnb'));

-- ============================================
-- Update listing_type constraint
-- ============================================
ALTER TABLE public.properties 
DROP CONSTRAINT IF EXISTS properties_listing_type_check;

ALTER TABLE public.properties 
ADD CONSTRAINT properties_listing_type_check 
CHECK (listing_type IN ('sale', 'rent', 'lease', 'short_stay', 'airbnb'));

-- ============================================
-- Verify both constraints
-- ============================================
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.properties'::regclass
AND conname IN ('properties_property_type_check', 'properties_listing_type_check')
ORDER BY conname;


