-- Populate Verified Agents for Nigerian Real Estate Platform
-- This script adds sample verified agents across major Nigerian locations
-- Run this in Supabase SQL Editor

-- IMPORTANT: 
-- 1. You need to have at least 1 agent account created first (sign up as agents on the platform)
-- 2. This script will use existing agent profiles from the profiles table
-- 3. If you have fewer than 8 agents, the script will only create agents for available profiles
-- 4. To create agent accounts: Sign up on your platform and select "Agent" as user type
-- 5. For a simpler version, use POPULATE_AGENTS_SIMPLE.sql instead

-- ============================================
-- CREATE VERIFIED AGENTS
-- ============================================

-- Get existing agent profiles and create agent records for them
-- This will create one agent record per agent profile found

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
  p.id as user_id,
  CASE 
    WHEN p.id = (SELECT id FROM public.profiles WHERE user_type = 'agent' ORDER BY created_at LIMIT 1 OFFSET 0) 
    THEN 'Prime Realty Solutions'
    WHEN p.id = (SELECT id FROM public.profiles WHERE user_type = 'agent' ORDER BY created_at LIMIT 1 OFFSET 1) 
    THEN 'Capital Properties Ltd'
    WHEN p.id = (SELECT id FROM public.profiles WHERE user_type = 'agent' ORDER BY created_at LIMIT 1 OFFSET 2) 
    THEN 'Port Harcourt Real Estate'
    WHEN p.id = (SELECT id FROM public.profiles WHERE user_type = 'agent' ORDER BY created_at LIMIT 1 OFFSET 3) 
    THEN 'Lekki Properties Group'
    WHEN p.id = (SELECT id FROM public.profiles WHERE user_type = 'agent' ORDER BY created_at LIMIT 1 OFFSET 4) 
    THEN 'Benin City Realty'
    WHEN p.id = (SELECT id FROM public.profiles WHERE user_type = 'agent' ORDER BY created_at LIMIT 1 OFFSET 5) 
    THEN 'Delta Properties Consultants'
    WHEN p.id = (SELECT id FROM public.profiles WHERE user_type = 'agent' ORDER BY created_at LIMIT 1 OFFSET 6) 
    THEN 'Kaduna Real Estate Services'
    WHEN p.id = (SELECT id FROM public.profiles WHERE user_type = 'agent' ORDER BY created_at LIMIT 1 OFFSET 7) 
    THEN 'Kano Real Estate Services'
    ELSE 'Real Estate Professionals'
  END as company_name,
  CASE 
    WHEN p.id = (SELECT id FROM public.profiles WHERE user_type = 'agent' ORDER BY created_at LIMIT 1 OFFSET 0) 
    THEN 'Experienced real estate professional with over 10 years in the Nigerian property market. Specializing in luxury properties in Lagos and Abuja. Trusted by hundreds of clients for honest and professional service.'
    WHEN p.id = (SELECT id FROM public.profiles WHERE user_type = 'agent' ORDER BY created_at LIMIT 1 OFFSET 1) 
    THEN 'Dedicated to helping clients find their dream homes in Abuja. Expert in residential and commercial real estate. Known for excellent customer service and attention to detail.'
    WHEN p.id = (SELECT id FROM public.profiles WHERE user_type = 'agent' ORDER BY created_at LIMIT 1 OFFSET 2) 
    THEN 'Local expert in Port Harcourt real estate market. Helping clients buy, sell, and rent properties in Rivers State. Over 6 years of experience with proven track record.'
    WHEN p.id = (SELECT id FROM public.profiles WHERE user_type = 'agent' ORDER BY created_at LIMIT 1 OFFSET 3) 
    THEN 'Specializing in high-end properties in Lekki, Victoria Island, and Ikoyi. Expert in luxury real estate transactions. Trusted by executives and high-net-worth individuals.'
    WHEN p.id = (SELECT id FROM public.profiles WHERE user_type = 'agent' ORDER BY created_at LIMIT 1 OFFSET 4) 
    THEN 'Your trusted partner for real estate in Benin City. Helping clients navigate the property market with expert advice. Specializing in residential and commercial properties.'
    WHEN p.id = (SELECT id FROM public.profiles WHERE user_type = 'agent' ORDER BY created_at LIMIT 1 OFFSET 5) 
    THEN 'Expert in Delta State real estate market. Serving Asaba, Warri, and surrounding areas. Known for integrity and successful property transactions.'
    WHEN p.id = (SELECT id FROM public.profiles WHERE user_type = 'agent' ORDER BY created_at LIMIT 1 OFFSET 6) 
    THEN 'Serving the Kaduna real estate market with professionalism and integrity. Expert in both residential and commercial properties. Helping clients make informed decisions.'
    WHEN p.id = (SELECT id FROM public.profiles WHERE user_type = 'agent' ORDER BY created_at LIMIT 1 OFFSET 7) 
    THEN 'Serving the Kano real estate market with integrity and professionalism. Expert in both residential and commercial properties. Trusted by local and international clients.'
    ELSE 'Professional real estate agent committed to helping clients find their perfect property. Experienced and verified for your peace of mind.'
  END as bio,
  CASE 
    WHEN p.id = (SELECT id FROM public.profiles WHERE user_type = 'agent' ORDER BY created_at LIMIT 1 OFFSET 0) 
    THEN ARRAY['Luxury Homes', 'Commercial Properties', 'Land Sales']
    WHEN p.id = (SELECT id FROM public.profiles WHERE user_type = 'agent' ORDER BY created_at LIMIT 1 OFFSET 1) 
    THEN ARRAY['Residential', 'Commercial', 'Property Management']
    WHEN p.id = (SELECT id FROM public.profiles WHERE user_type = 'agent' ORDER BY created_at LIMIT 1 OFFSET 2) 
    THEN ARRAY['Residential', 'Land Development', 'Property Investment']
    WHEN p.id = (SELECT id FROM public.profiles WHERE user_type = 'agent' ORDER BY created_at LIMIT 1 OFFSET 3) 
    THEN ARRAY['Luxury Homes', 'Beachfront Properties', 'Penthouses']
    WHEN p.id = (SELECT id FROM public.profiles WHERE user_type = 'agent' ORDER BY created_at LIMIT 1 OFFSET 4) 
    THEN ARRAY['Residential', 'Land Sales', 'Property Valuation']
    WHEN p.id = (SELECT id FROM public.profiles WHERE user_type = 'agent' ORDER BY created_at LIMIT 1 OFFSET 5) 
    THEN ARRAY['Residential', 'Commercial', 'Property Investment']
    WHEN p.id = (SELECT id FROM public.profiles WHERE user_type = 'agent' ORDER BY created_at LIMIT 1 OFFSET 6) 
    THEN ARRAY['Residential', 'Commercial', 'Property Management']
    WHEN p.id = (SELECT id FROM public.profiles WHERE user_type = 'agent' ORDER BY created_at LIMIT 1 OFFSET 7) 
    THEN ARRAY['Residential', 'Commercial', 'Industrial']
    ELSE ARRAY['Residential', 'Commercial']
  END as specialties,
  CASE 
    WHEN p.id = (SELECT id FROM public.profiles WHERE user_type = 'agent' ORDER BY created_at LIMIT 1 OFFSET 0) THEN 10
    WHEN p.id = (SELECT id FROM public.profiles WHERE user_type = 'agent' ORDER BY created_at LIMIT 1 OFFSET 1) THEN 8
    WHEN p.id = (SELECT id FROM public.profiles WHERE user_type = 'agent' ORDER BY created_at LIMIT 1 OFFSET 2) THEN 6
    WHEN p.id = (SELECT id FROM public.profiles WHERE user_type = 'agent' ORDER BY created_at LIMIT 1 OFFSET 3) THEN 5
    WHEN p.id = (SELECT id FROM public.profiles WHERE user_type = 'agent' ORDER BY created_at LIMIT 1 OFFSET 4) THEN 7
    WHEN p.id = (SELECT id FROM public.profiles WHERE user_type = 'agent' ORDER BY created_at LIMIT 1 OFFSET 5) THEN 9
    WHEN p.id = (SELECT id FROM public.profiles WHERE user_type = 'agent' ORDER BY created_at LIMIT 1 OFFSET 6) THEN 6
    WHEN p.id = (SELECT id FROM public.profiles WHERE user_type = 'agent' ORDER BY created_at LIMIT 1 OFFSET 7) THEN 7
    ELSE 5
  END as years_experience,
  CASE 
    WHEN p.id = (SELECT id FROM public.profiles WHERE user_type = 'agent' ORDER BY created_at LIMIT 1 OFFSET 0) THEN 245
    WHEN p.id = (SELECT id FROM public.profiles WHERE user_type = 'agent' ORDER BY created_at LIMIT 1 OFFSET 1) THEN 180
    WHEN p.id = (SELECT id FROM public.profiles WHERE user_type = 'agent' ORDER BY created_at LIMIT 1 OFFSET 2) THEN 120
    WHEN p.id = (SELECT id FROM public.profiles WHERE user_type = 'agent' ORDER BY created_at LIMIT 1 OFFSET 3) THEN 95
    WHEN p.id = (SELECT id FROM public.profiles WHERE user_type = 'agent' ORDER BY created_at LIMIT 1 OFFSET 4) THEN 150
    WHEN p.id = (SELECT id FROM public.profiles WHERE user_type = 'agent' ORDER BY created_at LIMIT 1 OFFSET 5) THEN 200
    WHEN p.id = (SELECT id FROM public.profiles WHERE user_type = 'agent' ORDER BY created_at LIMIT 1 OFFSET 6) THEN 110
    WHEN p.id = (SELECT id FROM public.profiles WHERE user_type = 'agent' ORDER BY created_at LIMIT 1 OFFSET 7) THEN 150
    ELSE 50
  END as properties_sold,
  CASE 
    WHEN p.id = (SELECT id FROM public.profiles WHERE user_type = 'agent' ORDER BY created_at LIMIT 1 OFFSET 0) THEN 4.8
    WHEN p.id = (SELECT id FROM public.profiles WHERE user_type = 'agent' ORDER BY created_at LIMIT 1 OFFSET 1) THEN 4.6
    WHEN p.id = (SELECT id FROM public.profiles WHERE user_type = 'agent' ORDER BY created_at LIMIT 1 OFFSET 2) THEN 4.7
    WHEN p.id = (SELECT id FROM public.profiles WHERE user_type = 'agent' ORDER BY created_at LIMIT 1 OFFSET 3) THEN 4.9
    WHEN p.id = (SELECT id FROM public.profiles WHERE user_type = 'agent' ORDER BY created_at LIMIT 1 OFFSET 4) THEN 4.5
    WHEN p.id = (SELECT id FROM public.profiles WHERE user_type = 'agent' ORDER BY created_at LIMIT 1 OFFSET 5) THEN 4.7
    WHEN p.id = (SELECT id FROM public.profiles WHERE user_type = 'agent' ORDER BY created_at LIMIT 1 OFFSET 6) THEN 4.6
    WHEN p.id = (SELECT id FROM public.profiles WHERE user_type = 'agent' ORDER BY created_at LIMIT 1 OFFSET 7) THEN 4.5
    ELSE 4.5
  END as rating,
  CASE 
    WHEN p.id = (SELECT id FROM public.profiles WHERE user_type = 'agent' ORDER BY created_at LIMIT 1 OFFSET 0) THEN 89
    WHEN p.id = (SELECT id FROM public.profiles WHERE user_type = 'agent' ORDER BY created_at LIMIT 1 OFFSET 1) THEN 67
    WHEN p.id = (SELECT id FROM public.profiles WHERE user_type = 'agent' ORDER BY created_at LIMIT 1 OFFSET 2) THEN 45
    WHEN p.id = (SELECT id FROM public.profiles WHERE user_type = 'agent' ORDER BY created_at LIMIT 1 OFFSET 3) THEN 52
    WHEN p.id = (SELECT id FROM public.profiles WHERE user_type = 'agent' ORDER BY created_at LIMIT 1 OFFSET 4) THEN 38
    WHEN p.id = (SELECT id FROM public.profiles WHERE user_type = 'agent' ORDER BY created_at LIMIT 1 OFFSET 5) THEN 72
    WHEN p.id = (SELECT id FROM public.profiles WHERE user_type = 'agent' ORDER BY created_at LIMIT 1 OFFSET 6) THEN 42
    WHEN p.id = (SELECT id FROM public.profiles WHERE user_type = 'agent' ORDER BY created_at LIMIT 1 OFFSET 7) THEN 38
    ELSE 20
  END as total_reviews,
  'verified' as verification_status,
  true as is_active
FROM public.profiles p
WHERE p.user_type = 'agent'
  AND NOT EXISTS (
    SELECT 1 FROM public.agents a WHERE a.user_id = p.id
  )
LIMIT 8;

-- Update agent profiles with location information (if city/state columns exist in profiles)
-- Note: This assumes you might want to add location to profiles, but it's optional

-- ============================================
-- VERIFY THE INSERTIONS
-- ============================================

SELECT 
  a.id,
  p.full_name,
  p.email,
  a.company_name,
  a.verification_status,
  a.years_experience,
  a.properties_sold,
  a.rating,
  a.total_reviews,
  a.specialties
FROM public.agents a
JOIN public.profiles p ON a.user_id = p.id
WHERE a.verification_status = 'verified'
ORDER BY a.rating DESC, a.properties_sold DESC;

-- Summary Statistics
SELECT 
  COUNT(*) as total_verified_agents,
  AVG(rating) as average_rating,
  SUM(properties_sold) as total_properties_sold,
  SUM(total_reviews) as total_reviews
FROM public.agents
WHERE verification_status = 'verified' AND is_active = true;

