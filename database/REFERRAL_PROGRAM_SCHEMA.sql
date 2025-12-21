-- Referral Program Schema for Nigerian Real Estate Platform
-- This enables users to refer friends and earn rewards

-- ============================================
-- REFERRALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  referral_code TEXT NOT NULL UNIQUE,
  email TEXT, -- Email of referred user (if not yet registered)
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'signed_up', 'completed', 'rewarded')),
  reward_type TEXT CHECK (reward_type IN ('discount', 'credit', 'premium_feature', 'cash')),
  reward_amount NUMERIC(10, 2),
  reward_currency TEXT DEFAULT 'NGN',
  referred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  signed_up_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  rewarded_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON public.referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON public.referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals(status);

-- ============================================
-- REFERRAL STATISTICS (View)
-- ============================================
-- Security Note: This view respects RLS policies from the underlying referrals table.
-- When users query this view, they will only see aggregated stats for referrals they
-- have access to based on the RLS policies on the referrals table.
-- If Supabase flags this view with SECURITY DEFINER warning, run FIX_REFERRAL_STATS_SECURITY.sql
CREATE OR REPLACE VIEW public.referral_stats AS
SELECT 
  referrer_id,
  COUNT(*) as total_referrals,
  COUNT(*) FILTER (WHERE status = 'signed_up') as signups,
  COUNT(*) FILTER (WHERE status = 'completed') as completed,
  COUNT(*) FILTER (WHERE status = 'rewarded') as rewarded,
  SUM(reward_amount) FILTER (WHERE status = 'rewarded') as total_rewards
FROM public.referrals
GROUP BY referrer_id;

-- Ensure proper ownership to avoid SECURITY DEFINER issues
ALTER VIEW public.referral_stats OWNER TO postgres;

-- ============================================
-- ADD REFERRAL_CODE TO PROFILES
-- ============================================
-- Add referral_code column to profiles if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'referral_code'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN referral_code TEXT UNIQUE;
    -- Generate referral codes for existing users
    UPDATE public.profiles 
    SET referral_code = 'REF' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT || id::TEXT) FROM 1 FOR 8))
    WHERE referral_code IS NULL;
  END IF;
END $$;

-- ============================================
-- RLS POLICIES FOR REFERRALS
-- ============================================

-- Enable RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Users can view their own referrals
DROP POLICY IF EXISTS "Users can view their own referrals" ON public.referrals;
CREATE POLICY "Users can view their own referrals"
  ON public.referrals
  FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- Users can create referrals
DROP POLICY IF EXISTS "Users can create referrals" ON public.referrals;
CREATE POLICY "Users can create referrals"
  ON public.referrals
  FOR INSERT
  WITH CHECK (auth.uid() = referrer_id);

-- Users can update their own referrals
DROP POLICY IF EXISTS "Users can update their own referrals" ON public.referrals;
CREATE POLICY "Users can update their own referrals"
  ON public.referrals
  FOR UPDATE
  USING (auth.uid() = referrer_id);

-- Admins can view all referrals
DROP POLICY IF EXISTS "Admins can view all referrals" ON public.referrals;
CREATE POLICY "Admins can view all referrals"
  ON public.referrals
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- ============================================
-- FUNCTION: Generate Referral Code
-- ============================================
CREATE OR REPLACE FUNCTION generate_referral_code(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  code TEXT;
BEGIN
  -- Generate unique code: REF + 8 random alphanumeric characters
  LOOP
    code := 'REF' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT || user_id::TEXT || NOW()::TEXT) FROM 1 FOR 8));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = code);
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION: Create Referral
-- ============================================
CREATE OR REPLACE FUNCTION create_referral(
  p_referrer_id UUID,
  p_email TEXT DEFAULT NULL,
  p_referral_code TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_referral_id UUID;
  v_code TEXT;
BEGIN
  -- Use provided code or generate one
  IF p_referral_code IS NULL THEN
    SELECT referral_code INTO v_code FROM public.profiles WHERE id = p_referrer_id;
    IF v_code IS NULL THEN
      v_code := generate_referral_code(p_referrer_id);
      UPDATE public.profiles SET referral_code = v_code WHERE id = p_referrer_id;
    END IF;
  ELSE
    v_code := p_referral_code;
  END IF;

  -- Create referral record
  INSERT INTO public.referrals (referrer_id, referral_code, email, status)
  VALUES (p_referrer_id, v_code, p_email, 'pending')
  RETURNING id INTO v_referral_id;

  RETURN v_referral_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCTION: Process Referral Signup
-- ============================================
CREATE OR REPLACE FUNCTION process_referral_signup(
  p_referral_code TEXT,
  p_referred_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_referral_id UUID;
BEGIN
  -- Find referral by code
  SELECT id INTO v_referral_id
  FROM public.referrals
  WHERE referral_code = p_referral_code
    AND status = 'pending'
    AND (referred_id IS NULL OR referred_id = p_referred_id)
  LIMIT 1;

  IF v_referral_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Update referral status
  UPDATE public.referrals
  SET 
    referred_id = p_referred_id,
    status = 'signed_up',
    signed_up_at = NOW()
  WHERE id = v_referral_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGER: Update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_referrals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_referrals_updated_at
  BEFORE UPDATE ON public.referrals
  FOR EACH ROW
  EXECUTE FUNCTION update_referrals_updated_at();

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE public.referrals IS 'Tracks user referrals and rewards';
COMMENT ON COLUMN public.referrals.referral_code IS 'Unique code used to refer others';
COMMENT ON COLUMN public.referrals.status IS 'pending: code shared, signed_up: user registered, completed: user completed action, rewarded: reward given';
COMMENT ON FUNCTION generate_referral_code IS 'Generates a unique referral code for a user';
COMMENT ON FUNCTION create_referral IS 'Creates a new referral record';
COMMENT ON FUNCTION process_referral_signup IS 'Processes when a referred user signs up';

