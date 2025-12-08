-- Add Two-Factor Authentication columns to profiles table
-- Run this SQL script in Supabase SQL Editor

-- Add 2FA columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS two_factor_secret TEXT,
ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS two_factor_backup_codes TEXT[] DEFAULT '{}';

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_two_factor_enabled 
ON public.profiles(two_factor_enabled) 
WHERE two_factor_enabled = true;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.two_factor_secret IS 'TOTP secret key (base32 encoded)';
COMMENT ON COLUMN public.profiles.two_factor_enabled IS 'Whether 2FA is enabled for this user';
COMMENT ON COLUMN public.profiles.two_factor_backup_codes IS 'Array of backup codes (base64 encoded)';

