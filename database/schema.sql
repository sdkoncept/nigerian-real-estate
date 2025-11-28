-- Nigerian Real Estate Platform Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable PostGIS for location features (optional, for advanced mapping)
-- CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================
-- USERS TABLE (extends Supabase auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  user_type TEXT NOT NULL CHECK (user_type IN ('buyer', 'seller', 'agent', 'admin')) DEFAULT 'buyer',
  avatar_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- AGENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  license_number TEXT,
  company_name TEXT,
  bio TEXT,
  specialties TEXT[] DEFAULT '{}',
  years_experience INTEGER DEFAULT 0,
  properties_sold INTEGER DEFAULT 0,
  rating NUMERIC(3, 2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,
  verification_status TEXT CHECK (verification_status IN ('pending', 'verified', 'rejected')) DEFAULT 'pending',
  verification_documents JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PROPERTIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(15, 2) NOT NULL,
  currency TEXT DEFAULT 'NGN',
  property_type TEXT NOT NULL CHECK (property_type IN ('House', 'Apartment', 'Condo', 'Townhouse', 'Land', 'Commercial', 'Shortlet', 'Airbnb')),
  listing_type TEXT NOT NULL CHECK (listing_type IN ('sale', 'rent', 'lease', 'short_stay', 'airbnb')),
  location TEXT NOT NULL,
  state TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT,
  coordinates JSONB, -- {lat: number, lng: number}
  bedrooms INTEGER,
  bathrooms NUMERIC(3, 1),
  sqft INTEGER,
  sqm NUMERIC(10, 2),
  year_built INTEGER,
  parking INTEGER DEFAULT 0,
  images TEXT[] DEFAULT '{}',
  features TEXT[] DEFAULT '{}',
  amenities TEXT[] DEFAULT '{}',
  agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  verification_status TEXT CHECK (verification_status IN ('pending', 'verified', 'rejected')) DEFAULT 'pending',
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- FAVORITES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

-- ============================================
-- REVIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Ensure review is for either property or agent, but not both
  CHECK (
    (property_id IS NOT NULL AND agent_id IS NULL) OR
    (property_id IS NULL AND agent_id IS NOT NULL)
  )
);

-- ============================================
-- CONTACTS/MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  status TEXT CHECK (status IN ('new', 'read', 'replied', 'archived')) DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- REPORTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('property', 'agent', 'user')),
  entity_id UUID NOT NULL,
  reason TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT CHECK (status IN ('new', 'investigating', 'resolved', 'dismissed')) DEFAULT 'new',
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  admin_notes TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- VERIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('agent', 'property')),
  entity_id UUID NOT NULL,
  document_type TEXT NOT NULL,
  document_url TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  review_notes TEXT,
  expiry_date DATE, -- For tracking document expiration (e.g., license expiry)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_properties_location ON public.properties(location);
CREATE INDEX IF NOT EXISTS idx_properties_city ON public.properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_state ON public.properties(state);
CREATE INDEX IF NOT EXISTS idx_properties_type ON public.properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_listing_type ON public.properties(listing_type);
CREATE INDEX IF NOT EXISTS idx_properties_price ON public.properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_agent ON public.properties(agent_id);
CREATE INDEX IF NOT EXISTS idx_properties_created_by ON public.properties(created_by);
CREATE INDEX IF NOT EXISTS idx_properties_verification ON public.properties(verification_status);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_property ON public.favorites(property_id);
CREATE INDEX IF NOT EXISTS idx_reviews_property ON public.reviews(property_id);
CREATE INDEX IF NOT EXISTS idx_reviews_agent ON public.reviews(agent_id);
CREATE INDEX IF NOT EXISTS idx_agents_user ON public.agents(user_id);
CREATE INDEX IF NOT EXISTS idx_agents_verification ON public.agents(verification_status);
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON public.reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_entity ON public.reports(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Note: SECURITY DEFINER functions bypass RLS automatically
-- The trigger function handle_new_user() runs with elevated privileges

-- Agents policies
DROP POLICY IF EXISTS "Agents are publicly readable" ON public.agents;
CREATE POLICY "Agents are publicly readable"
  ON public.agents FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can create their own agent record" ON public.agents;
CREATE POLICY "Users can create their own agent record"
  ON public.agents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Agents can update their own record" ON public.agents;
CREATE POLICY "Agents can update their own record"
  ON public.agents FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can update any agent record" ON public.agents;
CREATE POLICY "Admins can update any agent record"
  ON public.agents FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

-- Properties policies
DROP POLICY IF EXISTS "Properties are publicly readable" ON public.properties;
CREATE POLICY "Properties are publicly readable"
  ON public.properties FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Users can create properties" ON public.properties;
CREATE POLICY "Users can create properties"
  ON public.properties FOR INSERT
  WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can update their own properties" ON public.properties;
CREATE POLICY "Users can update their own properties"
  ON public.properties FOR UPDATE
  USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can delete their own properties" ON public.properties;
CREATE POLICY "Users can delete their own properties"
  ON public.properties FOR DELETE
  USING (auth.uid() = created_by);

-- Favorites policies
DROP POLICY IF EXISTS "Users can view their own favorites" ON public.favorites;
CREATE POLICY "Users can view their own favorites"
  ON public.favorites FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own favorites" ON public.favorites;
CREATE POLICY "Users can create their own favorites"
  ON public.favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own favorites" ON public.favorites;
CREATE POLICY "Users can delete their own favorites"
  ON public.favorites FOR DELETE
  USING (auth.uid() = user_id);

-- Reviews policies
DROP POLICY IF EXISTS "Reviews are publicly readable" ON public.reviews;
CREATE POLICY "Reviews are publicly readable"
  ON public.reviews FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can create reviews" ON public.reviews;
CREATE POLICY "Users can create reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own reviews" ON public.reviews;
CREATE POLICY "Users can update their own reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own reviews" ON public.reviews;
CREATE POLICY "Users can delete their own reviews"
  ON public.reviews FOR DELETE
  USING (auth.uid() = user_id);

-- Contacts policies
DROP POLICY IF EXISTS "Anyone can create contacts" ON public.contacts;
CREATE POLICY "Anyone can create contacts"
  ON public.contacts FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view their own contacts" ON public.contacts;
CREATE POLICY "Users can view their own contacts"
  ON public.contacts FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Agents can view contacts for their properties" ON public.contacts;
CREATE POLICY "Agents can view contacts for their properties"
  ON public.contacts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = contacts.property_id
      AND properties.agent_id IN (
        SELECT id FROM public.agents WHERE user_id = auth.uid()
      )
    )
  );

-- Verifications policies
DROP POLICY IF EXISTS "Users can view verifications for their entities" ON public.verifications;
CREATE POLICY "Users can view verifications for their entities"
  ON public.verifications FOR SELECT
  USING (
    (entity_type = 'agent' AND EXISTS (
      SELECT 1 FROM public.agents WHERE agents.id = verifications.entity_id AND agents.user_id = auth.uid()
    ))
    OR
    (entity_type = 'property' AND EXISTS (
      SELECT 1 FROM public.properties WHERE properties.id = verifications.entity_id AND properties.created_by = auth.uid()
    ))
    OR
    auth.uid() IN (SELECT id FROM public.profiles WHERE user_type = 'admin')
  );

DROP POLICY IF EXISTS "Users can create verifications for their entities" ON public.verifications;
CREATE POLICY "Users can create verifications for their entities"
  ON public.verifications FOR INSERT
  WITH CHECK (
    (entity_type = 'agent' AND EXISTS (
      SELECT 1 FROM public.agents WHERE agents.id = verifications.entity_id AND agents.user_id = auth.uid()
    ))
    OR
    (entity_type = 'property' AND EXISTS (
      SELECT 1 FROM public.properties WHERE properties.id = verifications.entity_id AND properties.created_by = auth.uid()
    ))
  );

DROP POLICY IF EXISTS "Admins can update verifications" ON public.verifications;
CREATE POLICY "Admins can update verifications"
  ON public.verifications FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE user_type = 'admin'));

-- Reports policies
DROP POLICY IF EXISTS "Users can create reports" ON public.reports;
CREATE POLICY "Users can create reports"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Users can view their own reports" ON public.reports;
CREATE POLICY "Users can view their own reports"
  ON public.reports FOR SELECT
  USING (auth.uid() = reporter_id OR auth.uid() IN (SELECT id FROM public.profiles WHERE user_type = 'admin'));

DROP POLICY IF EXISTS "Admins can update reports" ON public.reports;
CREATE POLICY "Admins can update reports"
  ON public.reports FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE user_type = 'admin'));

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_agents_updated_at ON public.agents;
CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON public.agents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_properties_updated_at ON public.properties;
CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reviews_updated_at ON public.reviews;
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_verifications_updated_at ON public.verifications;
CREATE TRIGGER update_verifications_updated_at
  BEFORE UPDATE ON public.verifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reports_updated_at ON public.reports;
CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_user_type TEXT;
  v_full_name TEXT;
BEGIN
  -- Extract user_type from metadata, default to 'buyer' if not provided
  v_user_type := COALESCE(NEW.raw_user_meta_data->>'user_type', 'buyer');
  
  -- Validate user_type
  IF v_user_type NOT IN ('buyer', 'seller', 'agent', 'admin') THEN
    v_user_type := 'buyer';
  END IF;
  
  -- Extract full_name from metadata
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'name', '');
  
  -- Ensure email is not empty (required field)
  IF NEW.email IS NULL OR NEW.email = '' THEN
    RAISE EXCEPTION 'Email is required';
  END IF;
  
  -- Insert profile, handle conflict gracefully
  INSERT INTO public.profiles (id, email, full_name, user_type)
  VALUES (
    NEW.id,
    NEW.email,
    v_full_name,
    v_user_type
  )
  ON CONFLICT (id) DO UPDATE
    SET 
      email = COALESCE(EXCLUDED.email, profiles.email),
      full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), profiles.full_name),
      user_type = COALESCE(NULLIF(EXCLUDED.user_type, ''), profiles.user_type);
  
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists, try to update it
    UPDATE public.profiles
    SET 
      email = COALESCE(NEW.email, profiles.email),
      full_name = COALESCE(NULLIF(v_full_name, ''), profiles.full_name),
      user_type = COALESCE(NULLIF(v_user_type, 'buyer'), profiles.user_type)
    WHERE id = NEW.id;
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log error but don't fail the user creation
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================
-- You can add sample data here for development

