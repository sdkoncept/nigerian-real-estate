-- WhatsApp Verification Codes Table
-- Run this in Supabase SQL Editor

-- ============================================
-- VERIFICATION CODES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.verification_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone TEXT NOT NULL,
  code TEXT NOT NULL,
  used BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_verification_codes_phone ON public.verification_codes(phone);
CREATE INDEX IF NOT EXISTS idx_verification_codes_code ON public.verification_codes(code);
CREATE INDEX IF NOT EXISTS idx_verification_codes_expires ON public.verification_codes(expires_at);

-- ============================================
-- RLS POLICIES
-- ============================================
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage verification codes
DROP POLICY IF EXISTS "Service role can manage verification codes" ON public.verification_codes;
CREATE POLICY "Service role can manage verification codes"
  ON public.verification_codes
  FOR ALL
  USING (auth.role() = 'service_role');

-- Clean up expired codes (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM public.verification_codes
  WHERE expires_at < NOW() OR used = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

