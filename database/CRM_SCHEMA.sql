-- CRM Schema for Nigerian Real Estate Platform
-- Run this in Supabase SQL Editor

-- ============================================
-- LEADS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  -- Lead Information
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  source TEXT CHECK (source IN ('property_inquiry', 'agent_search', 'referral', 'website', 'social_media', 'other')) DEFAULT 'property_inquiry',
  
  -- Lead Status
  status TEXT CHECK (status IN ('new', 'contacted', 'viewing_scheduled', 'viewing_completed', 'offer_made', 'negotiating', 'closed_won', 'closed_lost', 'nurturing')) DEFAULT 'new',
  
  -- Lead Details
  interest_type TEXT CHECK (interest_type IN ('buy', 'rent', 'lease', 'sell', 'invest')) DEFAULT 'buy',
  budget_min NUMERIC(12, 2),
  budget_max NUMERIC(12, 2),
  preferred_location TEXT,
  notes TEXT,
  
  -- Priority and Scoring
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  lead_score INTEGER DEFAULT 0 CHECK (lead_score >= 0 AND lead_score <= 100),
  
  -- Timestamps
  first_contact_at TIMESTAMP WITH TIME ZONE,
  last_contact_at TIMESTAMP WITH TIME ZONE,
  closed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- LEAD ACTIVITIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.lead_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
  
  -- Activity Information
  activity_type TEXT CHECK (activity_type IN ('call', 'email', 'meeting', 'viewing', 'message', 'note', 'offer', 'contract', 'other')) NOT NULL,
  subject TEXT,
  description TEXT,
  
  -- Activity Details
  scheduled_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  
  -- Related Entities
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  
  -- Status
  status TEXT CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')) DEFAULT 'scheduled',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- LEAD NOTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.lead_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
  
  note TEXT NOT NULL,
  is_important BOOLEAN DEFAULT false,
  is_private BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_leads_agent ON public.leads(agent_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_property ON public.leads(property_id);
CREATE INDEX IF NOT EXISTS idx_leads_user ON public.leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_created ON public.leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);

CREATE INDEX IF NOT EXISTS idx_lead_activities_lead ON public.lead_activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_activities_agent ON public.lead_activities(agent_id);
CREATE INDEX IF NOT EXISTS idx_lead_activities_scheduled ON public.lead_activities(scheduled_at);

CREATE INDEX IF NOT EXISTS idx_lead_notes_lead ON public.lead_notes(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_notes_agent ON public.lead_notes(agent_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update lead's last_contact_at
CREATE OR REPLACE FUNCTION update_lead_last_contact()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.leads
  SET last_contact_at = NOW(), updated_at = NOW()
  WHERE id = NEW.lead_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update last_contact_at when activity is created
CREATE TRIGGER trigger_update_lead_last_contact
  AFTER INSERT ON public.lead_activities
  FOR EACH ROW
  WHEN (NEW.completed_at IS NOT NULL)
  EXECUTE FUNCTION update_lead_last_contact();

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lead_activities_updated_at
  BEFORE UPDATE ON public.lead_activities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lead_notes_updated_at
  BEFORE UPDATE ON public.lead_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_notes ENABLE ROW LEVEL SECURITY;

-- Leads Policies
CREATE POLICY "Agents can view their own leads"
  ON public.leads FOR SELECT
  USING (
    agent_id IN (
      SELECT id FROM public.agents WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Agents can insert their own leads"
  ON public.leads FOR INSERT
  WITH CHECK (
    agent_id IN (
      SELECT id FROM public.agents WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Agents can update their own leads"
  ON public.leads FOR UPDATE
  USING (
    agent_id IN (
      SELECT id FROM public.agents WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all leads"
  ON public.leads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Lead Activities Policies
CREATE POLICY "Agents can view activities for their leads"
  ON public.lead_activities FOR SELECT
  USING (
    agent_id IN (
      SELECT id FROM public.agents WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Agents can insert activities for their leads"
  ON public.lead_activities FOR INSERT
  WITH CHECK (
    agent_id IN (
      SELECT id FROM public.agents WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Agents can update activities for their leads"
  ON public.lead_activities FOR UPDATE
  USING (
    agent_id IN (
      SELECT id FROM public.agents WHERE user_id = auth.uid()
    )
  );

-- Lead Notes Policies
CREATE POLICY "Agents can view notes for their leads"
  ON public.lead_notes FOR SELECT
  USING (
    agent_id IN (
      SELECT id FROM public.agents WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Agents can insert notes for their leads"
  ON public.lead_notes FOR INSERT
  WITH CHECK (
    agent_id IN (
      SELECT id FROM public.agents WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Agents can update notes for their leads"
  ON public.lead_notes FOR UPDATE
  USING (
    agent_id IN (
      SELECT id FROM public.agents WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- VIEWS FOR ANALYTICS
-- ============================================

-- Lead Pipeline View
CREATE OR REPLACE VIEW public.lead_pipeline_stats AS
SELECT 
  agent_id,
  status,
  COUNT(*) as lead_count,
  SUM(CASE WHEN priority = 'urgent' THEN 1 ELSE 0 END) as urgent_count,
  SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as high_count,
  AVG(lead_score) as avg_lead_score
FROM public.leads
GROUP BY agent_id, status;

-- Lead Conversion Funnel
CREATE OR REPLACE VIEW public.lead_conversion_funnel AS
SELECT 
  agent_id,
  COUNT(*) FILTER (WHERE status = 'new') as new_leads,
  COUNT(*) FILTER (WHERE status = 'contacted') as contacted,
  COUNT(*) FILTER (WHERE status = 'viewing_scheduled') as viewing_scheduled,
  COUNT(*) FILTER (WHERE status = 'viewing_completed') as viewing_completed,
  COUNT(*) FILTER (WHERE status = 'offer_made') as offer_made,
  COUNT(*) FILTER (WHERE status = 'closed_won') as closed_won,
  COUNT(*) FILTER (WHERE status = 'closed_lost') as closed_lost
FROM public.leads
GROUP BY agent_id;

-- Recent Activities View
CREATE OR REPLACE VIEW public.recent_lead_activities AS
SELECT 
  la.*,
  l.name as lead_name,
  l.email as lead_email,
  p.title as property_title
FROM public.lead_activities la
LEFT JOIN public.leads l ON la.lead_id = l.id
LEFT JOIN public.properties p ON la.property_id = p.id
ORDER BY la.created_at DESC
LIMIT 100;

