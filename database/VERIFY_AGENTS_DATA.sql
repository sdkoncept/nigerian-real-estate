-- Verify Agents Data in Database
-- Run this to see what agents are actually in your database

-- ============================================
-- COUNT ALL AGENTS
-- ============================================
SELECT 
  COUNT(*) as total_agents,
  COUNT(CASE WHEN is_active = true THEN 1 END) as active_agents,
  COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_agents,
  COUNT(CASE WHEN is_active IS NULL THEN 1 END) as null_active_agents,
  COUNT(CASE WHEN verification_status = 'verified' THEN 1 END) as verified_agents,
  COUNT(CASE WHEN verification_status = 'pending' THEN 1 END) as pending_agents,
  COUNT(CASE WHEN verification_status = 'rejected' THEN 1 END) as rejected_agents
FROM public.agents;

-- ============================================
-- LIST ALL AGENTS WITH DETAILS
-- ============================================
SELECT 
  a.id,
  a.user_id,
  a.verification_status,
  a.is_active,
  a.company_name,
  a.rating,
  a.years_experience,
  a.properties_sold,
  p.full_name,
  p.email,
  p.user_type,
  p.is_verified as profile_is_verified
FROM public.agents a
LEFT JOIN public.profiles p ON p.id = a.user_id
ORDER BY a.verification_status DESC, a.rating DESC;

-- ============================================
-- VERIFIED AGENTS ONLY
-- ============================================
SELECT 
  a.id,
  a.user_id,
  a.verification_status,
  a.is_active,
  a.company_name,
  a.rating,
  p.full_name,
  p.email
FROM public.agents a
LEFT JOIN public.profiles p ON p.id = a.user_id
WHERE a.verification_status = 'verified'
  AND (a.is_active = true OR a.is_active IS NULL)
ORDER BY a.rating DESC;

-- ============================================
-- CHECK FOR DERRICK SADOH SPECIFICALLY
-- ============================================
SELECT 
  p.id as profile_id,
  p.full_name,
  p.email,
  p.user_type,
  p.is_verified as profile_is_verified,
  a.id as agent_id,
  a.verification_status as agent_verification_status,
  a.is_active as agent_is_active,
  a.company_name,
  a.rating
FROM public.profiles p
LEFT JOIN public.agents a ON a.user_id = p.id
WHERE p.full_name ILIKE '%derrick%' 
   OR p.full_name ILIKE '%sadoh%'
   OR p.email ILIKE '%derrick%'
   OR p.email ILIKE '%sadoh%';

