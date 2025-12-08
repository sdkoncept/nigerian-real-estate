-- Security Logging and Monitoring Schema
-- Run this SQL script in Supabase SQL Editor

-- Security Events Table
CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL CHECK (event_type IN (
    'login_attempt',
    'login_success',
    'login_failed',
    '2fa_setup',
    '2fa_enabled',
    '2fa_disabled',
    '2fa_verification_failed',
    'password_reset_request',
    'password_reset_success',
    'suspicious_activity',
    'rate_limit_exceeded',
    'unauthorized_access_attempt',
    'admin_action',
    'data_export',
    'account_locked',
    'account_unlocked'
  )),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  details JSONB DEFAULT '{}',
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'low',
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON public.security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON public.security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON public.security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON public.security_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_resolved ON public.security_events(resolved) WHERE resolved = false;
CREATE INDEX IF NOT EXISTS idx_security_events_ip_address ON public.security_events(ip_address);

-- RLS Policies
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Admins can view all security events
DROP POLICY IF EXISTS "Admins can view all security events" ON public.security_events;
CREATE POLICY "Admins can view all security events"
ON public.security_events
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.user_type = 'admin'
  )
);

-- Users can view their own security events
DROP POLICY IF EXISTS "Users can view their own security events" ON public.security_events;
CREATE POLICY "Users can view their own security events"
ON public.security_events
FOR SELECT
USING (user_id = auth.uid());

-- System can insert security events (via service role)
-- Note: Service role bypasses RLS, so no policy needed for INSERT

-- Security Audit Schedule Table
CREATE TABLE IF NOT EXISTS public.security_audits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  audit_type TEXT NOT NULL CHECK (audit_type IN (
    'automated_scan',
    'manual_review',
    'penetration_test',
    'dependency_check',
    'configuration_review',
    'access_review',
    'compliance_check'
  )),
  scheduled_date DATE NOT NULL,
  completed_date DATE,
  status TEXT CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')) DEFAULT 'scheduled',
  findings JSONB DEFAULT '{}',
  recommendations TEXT,
  severity_summary JSONB DEFAULT '{}',
  performed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes TEXT,
  next_audit_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_security_audits_scheduled_date ON public.security_audits(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_security_audits_status ON public.security_audits(status);
CREATE INDEX IF NOT EXISTS idx_security_audits_next_audit_date ON public.security_audits(next_audit_date);

-- RLS Policies
ALTER TABLE public.security_audits ENABLE ROW LEVEL SECURITY;

-- Only admins can view security audits
DROP POLICY IF EXISTS "Admins can view security audits" ON public.security_audits;
CREATE POLICY "Admins can view security audits"
ON public.security_audits
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.user_type = 'admin'
  )
);

-- Only admins can manage security audits
DROP POLICY IF EXISTS "Admins can manage security audits" ON public.security_audits;
CREATE POLICY "Admins can manage security audits"
ON public.security_audits
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.user_type = 'admin'
  )
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_security_audits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS trigger_update_security_audits_updated_at ON public.security_audits;
CREATE TRIGGER trigger_update_security_audits_updated_at
BEFORE UPDATE ON public.security_audits
FOR EACH ROW
EXECUTE FUNCTION update_security_audits_updated_at();

