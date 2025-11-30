-- Update property_type constraint to include 'Shortlet' and 'Airbnb'
-- Run this BEFORE running POPULATE_PROPERTIES.sql if you get property_type constraint errors

-- Drop the old constraint
ALTER TABLE public.properties 
DROP CONSTRAINT IF EXISTS properties_property_type_check;

-- Add the new constraint with all allowed values
ALTER TABLE public.properties 
ADD CONSTRAINT properties_property_type_check 
CHECK (property_type IN ('House', 'Apartment', 'Condo', 'Townhouse', 'Land', 'Commercial', 'Shortlet', 'Airbnb'));

-- Verify the constraint
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.properties'::regclass
AND conname = 'properties_property_type_check';


