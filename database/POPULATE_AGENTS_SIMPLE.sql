-- Populate Verified Agents - Simplified Version
-- This script creates verified agents for existing agent profiles
-- Run this in Supabase SQL Editor

-- IMPORTANT: You must have agent accounts created first!
-- Sign up on your platform and select "Agent" as user type

-- ============================================
-- CREATE VERIFIED AGENTS FOR EXISTING PROFILES
-- ============================================

-- This creates agent records for agent profiles that don't already have agent records
-- Each agent gets realistic data based on their profile order

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
  CASE 
    WHEN row_number() OVER (ORDER BY p.created_at) = 1 THEN 'Prime Realty Solutions'
    WHEN row_number() OVER (ORDER BY p.created_at) = 2 THEN 'Capital Properties Ltd'
    WHEN row_number() OVER (ORDER BY p.created_at) = 3 THEN 'Port Harcourt Real Estate'
    WHEN row_number() OVER (ORDER BY p.created_at) = 4 THEN 'Lekki Properties Group'
    WHEN row_number() OVER (ORDER BY p.created_at) = 5 THEN 'Benin City Realty'
    WHEN row_number() OVER (ORDER BY p.created_at) = 6 THEN 'Delta Properties Consultants'
    WHEN row_number() OVER (ORDER BY p.created_at) = 7 THEN 'Kaduna Real Estate Services'
    WHEN row_number() OVER (ORDER BY p.created_at) = 8 THEN 'Kano Real Estate Services'
    ELSE 'Real Estate Professionals'
  END as company_name,
  CASE 
    WHEN row_number() OVER (ORDER BY p.created_at) = 1 THEN 'Experienced real estate professional with over 10 years in the Nigerian property market. Specializing in luxury properties in Lagos and Abuja. Trusted by hundreds of clients for honest and professional service.'
    WHEN row_number() OVER (ORDER BY p.created_at) = 2 THEN 'Dedicated to helping clients find their dream homes in Abuja. Expert in residential and commercial real estate. Known for excellent customer service and attention to detail.'
    WHEN row_number() OVER (ORDER BY p.created_at) = 3 THEN 'Local expert in Port Harcourt real estate market. Helping clients buy, sell, and rent properties in Rivers State. Over 6 years of experience with proven track record.'
    WHEN row_number() OVER (ORDER BY p.created_at) = 4 THEN 'Specializing in high-end properties in Lekki, Victoria Island, and Ikoyi. Expert in luxury real estate transactions. Trusted by executives and high-net-worth individuals.'
    WHEN row_number() OVER (ORDER BY p.created_at) = 5 THEN 'Your trusted partner for real estate in Benin City. Helping clients navigate the property market with expert advice. Specializing in residential and commercial properties.'
    WHEN row_number() OVER (ORDER BY p.created_at) = 6 THEN 'Expert in Delta State real estate market. Serving Asaba, Warri, and surrounding areas. Known for integrity and successful property transactions.'
    WHEN row_number() OVER (ORDER BY p.created_at) = 7 THEN 'Serving the Kaduna real estate market with professionalism and integrity. Expert in both residential and commercial properties. Helping clients make informed decisions.'
    WHEN row_number() OVER (ORDER BY p.created_at) = 8 THEN 'Serving the Kano real estate market with integrity and professionalism. Expert in both residential and commercial properties. Trusted by local and international clients.'
    ELSE 'Professional real estate agent committed to helping clients find their perfect property. Experienced and verified for your peace of mind.'
  END as bio,
  CASE 
    WHEN row_number() OVER (ORDER BY p.created_at) = 1 THEN ARRAY['Luxury Homes', 'Commercial Properties', 'Land Sales']
    WHEN row_number() OVER (ORDER BY p.created_at) = 2 THEN ARRAY['Residential', 'Commercial', 'Property Management']
    WHEN row_number() OVER (ORDER BY p.created_at) = 3 THEN ARRAY['Residential', 'Land Development', 'Property Investment']
    WHEN row_number() OVER (ORDER BY p.created_at) = 4 THEN ARRAY['Luxury Homes', 'Beachfront Properties', 'Penthouses']
    WHEN row_number() OVER (ORDER BY p.created_at) = 5 THEN ARRAY['Residential', 'Land Sales', 'Property Valuation']
    WHEN row_number() OVER (ORDER BY p.created_at) = 6 THEN ARRAY['Residential', 'Commercial', 'Property Investment']
    WHEN row_number() OVER (ORDER BY p.created_at) = 7 THEN ARRAY['Residential', 'Commercial', 'Property Management']
    WHEN row_number() OVER (ORDER BY p.created_at) = 8 THEN ARRAY['Residential', 'Commercial', 'Industrial']
    ELSE ARRAY['Residential', 'Commercial']
  END as specialties,
  CASE 
    WHEN row_number() OVER (ORDER BY p.created_at) = 1 THEN 10
    WHEN row_number() OVER (ORDER BY p.created_at) = 2 THEN 8
    WHEN row_number() OVER (ORDER BY p.created_at) = 3 THEN 6
    WHEN row_number() OVER (ORDER BY p.created_at) = 4 THEN 5
    WHEN row_number() OVER (ORDER BY p.created_at) = 5 THEN 7
    WHEN row_number() OVER (ORDER BY p.created_at) = 6 THEN 9
    WHEN row_number() OVER (ORDER BY p.created_at) = 7 THEN 6
    WHEN row_number() OVER (ORDER BY p.created_at) = 8 THEN 7
    ELSE 5
  END as years_experience,
  CASE 
    WHEN row_number() OVER (ORDER BY p.created_at) = 1 THEN 245
    WHEN row_number() OVER (ORDER BY p.created_at) = 2 THEN 180
    WHEN row_number() OVER (ORDER BY p.created_at) = 3 THEN 120
    WHEN row_number() OVER (ORDER BY p.created_at) = 4 THEN 95
    WHEN row_number() OVER (ORDER BY p.created_at) = 5 THEN 150
    WHEN row_number() OVER (ORDER BY p.created_at) = 6 THEN 200
    WHEN row_number() OVER (ORDER BY p.created_at) = 7 THEN 110
    WHEN row_number() OVER (ORDER BY p.created_at) = 8 THEN 150
    ELSE 50
  END as properties_sold,
  CASE 
    WHEN row_number() OVER (ORDER BY p.created_at) = 1 THEN 4.8
    WHEN row_number() OVER (ORDER BY p.created_at) = 2 THEN 4.6
    WHEN row_number() OVER (ORDER BY p.created_at) = 3 THEN 4.7
    WHEN row_number() OVER (ORDER BY p.created_at) = 4 THEN 4.9
    WHEN row_number() OVER (ORDER BY p.created_at) = 5 THEN 4.5
    WHEN row_number() OVER (ORDER BY p.created_at) = 6 THEN 4.7
    WHEN row_number() OVER (ORDER BY p.created_at) = 7 THEN 4.6
    WHEN row_number() OVER (ORDER BY p.created_at) = 8 THEN 4.5
    ELSE 4.5
  END as rating,
  CASE 
    WHEN row_number() OVER (ORDER BY p.created_at) = 1 THEN 89
    WHEN row_number() OVER (ORDER BY p.created_at) = 2 THEN 67
    WHEN row_number() OVER (ORDER BY p.created_at) = 3 THEN 45
    WHEN row_number() OVER (ORDER BY p.created_at) = 4 THEN 52
    WHEN row_number() OVER (ORDER BY p.created_at) = 5 THEN 38
    WHEN row_number() OVER (ORDER BY p.created_at) = 6 THEN 72
    WHEN row_number() OVER (ORDER BY p.created_at) = 7 THEN 42
    WHEN row_number() OVER (ORDER BY p.created_at) = 8 THEN 38
    ELSE 20
  END as total_reviews,
  'verified' as verification_status,
  true as is_active
FROM public.profiles p
WHERE p.user_type = 'agent'
  AND NOT EXISTS (
    SELECT 1 FROM public.agents a WHERE a.user_id = p.id
  )
ORDER BY p.created_at
LIMIT 8;

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
  ROUND(AVG(rating)::numeric, 2) as average_rating,
  SUM(properties_sold) as total_properties_sold,
  SUM(total_reviews) as total_reviews
FROM public.agents
WHERE verification_status = 'verified' AND is_active = true;

