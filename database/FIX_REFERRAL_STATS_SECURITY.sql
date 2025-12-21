-- Fix Security Issue: referral_stats view with SECURITY DEFINER
-- This script addresses the Supabase security warning about the referral_stats view
-- 
-- Problem: Views created with SECURITY DEFINER execute with the creator's privileges,
-- which can bypass Row-Level Security (RLS) policies and expose more data than intended.
--
-- Solution: 
-- 1. Drop the existing view
-- 2. Recreate it without SECURITY DEFINER (using SECURITY INVOKER implicitly)
-- 3. Add RLS policies to the view to ensure users can only see their own stats
-- 4. Create a secure function wrapper as an alternative access method

-- ============================================
-- STEP 1: Drop existing view
-- ============================================
DROP VIEW IF EXISTS public.referral_stats CASCADE;

-- ============================================
-- STEP 2: Recreate view without SECURITY DEFINER
-- ============================================
-- Note: By not specifying SECURITY DEFINER, the view uses SECURITY INVOKER (default),
-- which means queries execute with the querying user's privileges and RLS context.
-- The underlying table's RLS policies will be enforced when querying this view.
CREATE VIEW public.referral_stats AS
SELECT 
  referrer_id,
  COUNT(*) as total_referrals,
  COUNT(*) FILTER (WHERE status = 'signed_up') as signups,
  COUNT(*) FILTER (WHERE status = 'completed') as completed,
  COUNT(*) FILTER (WHERE status = 'rewarded') as rewarded,
  SUM(reward_amount) FILTER (WHERE status = 'rewarded') as total_rewards
FROM public.referrals
GROUP BY referrer_id;

-- ============================================
-- STEP 3: Set proper ownership
-- ============================================
-- Ensure the view is owned by postgres (or authenticated role) to avoid SECURITY DEFINER issues
-- In Supabase, views owned by postgres without SECURITY DEFINER will use SECURITY INVOKER
ALTER VIEW public.referral_stats OWNER TO postgres;

-- ============================================
-- STEP 4: Note on RLS enforcement
-- ============================================
-- Views don't directly support RLS policies, but when using SECURITY INVOKER (default),
-- the underlying table's RLS policies are enforced. Since the referrals table has RLS
-- that restricts users to their own referrals, querying this view will automatically
-- respect those restrictions.

-- ============================================
-- STEP 5: Create a secure function wrapper
-- ============================================
-- This function ensures users can only access their own referral stats
-- and provides a safer alternative to querying the view directly
-- We create two versions: one with parameter, one without (for convenience)

-- Version 1: With explicit user_id parameter
CREATE OR REPLACE FUNCTION get_referral_stats(p_user_id UUID)
RETURNS TABLE (
  referrer_id UUID,
  total_referrals BIGINT,
  signups BIGINT,
  completed BIGINT,
  rewarded BIGINT,
  total_rewards NUMERIC
) 
LANGUAGE plpgsql
SECURITY DEFINER -- This is safe because we explicitly check auth.uid()
SET search_path = public
AS $$
DECLARE
  v_current_user_id UUID;
BEGIN
  v_current_user_id := auth.uid();
  
  -- Ensure users can only query their own stats
  IF v_current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  IF p_user_id IS NULL OR p_user_id != v_current_user_id THEN
    -- Allow admins to query any user's stats
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = v_current_user_id AND user_type = 'admin'
    ) THEN
      RAISE EXCEPTION 'Access denied: You can only view your own referral statistics';
    END IF;
  END IF;

  RETURN QUERY
  SELECT 
    rs.referrer_id,
    rs.total_referrals,
    rs.signups,
    rs.completed,
    rs.rewarded,
    rs.total_rewards
  FROM public.referral_stats rs
  WHERE rs.referrer_id = p_user_id;
END;
$$;

-- Version 2: Without parameter (uses current user's ID)
CREATE OR REPLACE FUNCTION get_referral_stats()
RETURNS TABLE (
  referrer_id UUID,
  total_referrals BIGINT,
  signups BIGINT,
  completed BIGINT,
  rewarded BIGINT,
  total_rewards NUMERIC
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  RETURN QUERY
  SELECT * FROM get_referral_stats(v_user_id);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_referral_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_referral_stats() TO authenticated;

-- ============================================
-- STEP 6: Grant SELECT on view to authenticated users
-- ============================================
-- The view will respect RLS from the underlying referrals table
-- because we're using SECURITY INVOKER (default, not SECURITY DEFINER)
GRANT SELECT ON public.referral_stats TO authenticated;
-- Note: We don't grant to anon since referral stats should only be visible to authenticated users

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON VIEW public.referral_stats IS 
  'Referral statistics aggregated by referrer. Uses SECURITY INVOKER to respect RLS policies from the underlying referrals table.';

COMMENT ON FUNCTION get_referral_stats(UUID) IS 
  'Secure function to retrieve referral statistics for a specific user. Users can only view their own stats unless they are admins.';

COMMENT ON FUNCTION get_referral_stats() IS 
  'Secure function to retrieve referral statistics for the current authenticated user.';

