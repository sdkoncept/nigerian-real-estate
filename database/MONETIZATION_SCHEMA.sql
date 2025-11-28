-- Monetization Schema for Nigerian Real Estate Platform
-- Run this in Supabase SQL Editor

-- ============================================
-- SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('basic', 'premium', 'enterprise')),
  status TEXT NOT NULL CHECK (status IN ('active', 'expired', 'cancelled')) DEFAULT 'active',
  payment_provider TEXT, -- 'paystack', 'stripe', etc.
  payment_reference TEXT,
  amount_paid NUMERIC(10, 2) NOT NULL,
  currency TEXT DEFAULT 'NGN',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  features JSONB DEFAULT '{}', -- Store plan features
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PAYMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('subscription', 'featured_listing', 'listing_fee', 'verification_fee')),
  entity_type TEXT, -- 'property', 'agent', 'subscription'
  entity_id UUID, -- ID of the property, agent, or subscription
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT DEFAULT 'NGN',
  payment_provider TEXT NOT NULL, -- 'paystack'
  payment_reference TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
  metadata JSONB DEFAULT '{}', -- Store additional payment info
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- FEATURED LISTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.featured_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  featured_until TIMESTAMP WITH TIME ZONE NOT NULL,
  priority INTEGER DEFAULT 0, -- Higher priority = shown first
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

-- Partial unique index: Only one active subscription per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_user_active 
  ON public.subscriptions(user_id) 
  WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_payments_user ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_reference ON public.payments(payment_reference);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_featured_listings_property ON public.featured_listings(property_id);
CREATE INDEX IF NOT EXISTS idx_featured_listings_until ON public.featured_listings(featured_until);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can view their own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can create their own subscriptions"
  ON public.subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.subscriptions;
CREATE POLICY "Admins can view all subscriptions"
  ON public.subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

-- Payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own payments" ON public.payments;
CREATE POLICY "Users can view their own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own payments" ON public.payments;
CREATE POLICY "Users can create their own payments"
  ON public.payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all payments" ON public.payments;
CREATE POLICY "Admins can view all payments"
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

-- Featured Listings (public read, owner write)
ALTER TABLE public.featured_listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Featured listings are publicly readable" ON public.featured_listings;
CREATE POLICY "Featured listings are publicly readable"
  ON public.featured_listings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Property owners can create featured listings" ON public.featured_listings;
CREATE POLICY "Property owners can create featured listings"
  ON public.featured_listings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = featured_listings.property_id
      AND properties.created_by = auth.uid()
    )
  );

-- ============================================
-- TRIGGERS
-- ============================================
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_featured_listings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscriptions_updated_at();

DROP TRIGGER IF EXISTS update_payments_updated_at ON public.payments;
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION update_payments_updated_at();

DROP TRIGGER IF EXISTS update_featured_listings_updated_at ON public.featured_listings;
CREATE TRIGGER update_featured_listings_updated_at
  BEFORE UPDATE ON public.featured_listings
  FOR EACH ROW
  EXECUTE FUNCTION update_featured_listings_updated_at();

-- ============================================
-- FUNCTION: Check if user has active subscription
-- ============================================
CREATE OR REPLACE FUNCTION has_active_subscription(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = p_user_id
    AND status = 'active'
    AND (expires_at IS NULL OR expires_at > NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCTION: Get user's subscription plan
-- ============================================
CREATE OR REPLACE FUNCTION get_user_subscription(p_user_id UUID)
RETURNS TABLE (
  plan_type TEXT,
  status TEXT,
  expires_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.plan_type,
    s.status,
    s.expires_at
  FROM public.subscriptions s
  WHERE s.user_id = p_user_id
  AND s.status = 'active'
  AND (s.expires_at IS NULL OR s.expires_at > NOW())
  ORDER BY s.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

