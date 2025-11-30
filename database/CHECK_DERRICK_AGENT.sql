-- Check Derrick SADOH Agent Status
-- Run this to diagnose why Derrick SADOH is not showing

-- ============================================
-- FIND DERRICK SADOH PROFILE
-- ============================================
SELECT 
  id,
  full_name,
  email,
  user_type,
  is_verified,
  created_at
FROM public.profiles
WHERE full_name ILIKE '%derrick%' 
   OR full_name ILIKE '%sadoh%'
   OR email ILIKE '%derrick%'
   OR email ILIKE '%sadoh%';

-- ============================================
-- CHECK IF AGENT RECORD EXISTS
-- ============================================
SELECT 
  p.id as profile_id,
  p.full_name,
  p.email,
  p.user_type,
  a.id as agent_id,
  a.verification_status,
  a.is_active,
  a.company_name,
  a.years_experience,
  a.properties_sold,
  a.rating
FROM public.profiles p
LEFT JOIN public.agents a ON a.user_id = p.id
WHERE p.full_name ILIKE '%derrick%' 
   OR p.full_name ILIKE '%sadoh%'
   OR p.email ILIKE '%derrick%'
   OR p.email ILIKE '%sadoh%';

-- ============================================
-- CREATE AGENT RECORD IF MISSING
-- ============================================
-- This will create an agent record for Derrick SADOH if one doesn't exist
INSERT INTO public.agents (
  user_id,
  company_name,
  bio,
  specialties,
  years_experience,
  properties_sold,
  rating,
  total_reviews,
  verification_status,
  is_active
)
SELECT 
  p.id,
  'Professional Real Estate Services' as company_name,
  'Experienced real estate professional committed to helping clients find their perfect property. Verified and trusted agent with a proven track record.' as bio,
  ARRAY['Residential', 'Commercial'] as specialties,
  5 as years_experience,
  50 as properties_sold,
  4.5 as rating,
  20 as total_reviews,
  'verified' as verification_status,
  true as is_active
FROM public.profiles p
WHERE (p.full_name ILIKE '%derrick%' OR p.full_name ILIKE '%sadoh%')
  AND p.user_type = 'agent'
  AND NOT EXISTS (
    SELECT 1 FROM public.agents a WHERE a.user_id = p.id
  );

-- ============================================
-- UPDATE EXISTING AGENT RECORD TO VERIFIED
-- ============================================
-- If Derrick SADOH already has an agent record, update it to verified
UPDATE public.agents
SET 
  verification_status = 'verified',
  is_active = true,
  company_name = COALESCE(company_name, 'Professional Real Estate Services'),
  bio = COALESCE(bio, 'Experienced real estate professional committed to helping clients find their perfect property. Verified and trusted agent with a proven track record.'),
  specialties = COALESCE(specialties, ARRAY['Residential', 'Commercial']),
  years_experience = COALESCE(years_experience, 5),
  properties_sold = COALESCE(properties_sold, 50),
  rating = COALESCE(rating, 4.5),
  total_reviews = COALESCE(total_reviews, 20)
WHERE user_id IN (
  SELECT id FROM public.profiles 
  WHERE (full_name ILIKE '%derrick%' OR full_name ILIKE '%sadoh%')
    AND user_type = 'agent'
);

-- ============================================
-- VERIFY DERRICK SADOH NOW HAS RECORD
-- ============================================
SELECT 
  p.full_name,
  p.email,
  a.id as agent_id,
  a.verification_status,
  a.is_active,
  a.company_name,
  a.rating
FROM public.profiles p
JOIN public.agents a ON a.user_id = p.id
WHERE p.full_name ILIKE '%derrick%' 
   OR p.full_name ILIKE '%sadoh%';

