-- Visitor Tracking Schema for Nigerian Real Estate Platform
-- Run this in Supabase SQL Editor

-- ============================================
-- VISITOR TRACKING TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.visitor_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  page_path TEXT NOT NULL,
  page_title TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address INET,
  country TEXT,
  city TEXT,
  device_type TEXT CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
  browser TEXT,
  is_new_visitor BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_visitor_tracking_session ON public.visitor_tracking(session_id);
CREATE INDEX IF NOT EXISTS idx_visitor_tracking_user ON public.visitor_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_visitor_tracking_created ON public.visitor_tracking(created_at);
CREATE INDEX IF NOT EXISTS idx_visitor_tracking_path ON public.visitor_tracking(page_path);

-- ============================================
-- VIEW FOR DAILY VISITOR STATS
-- ============================================
CREATE OR REPLACE VIEW public.daily_visitor_stats AS
SELECT 
  DATE(created_at) as date,
  COUNT(DISTINCT session_id) as unique_visitors,
  COUNT(*) as total_page_views,
  COUNT(DISTINCT user_id) FILTER (WHERE user_id IS NOT NULL) as logged_in_visitors,
  COUNT(DISTINCT CASE WHEN is_new_visitor THEN session_id END) as new_visitors,
  COUNT(DISTINCT CASE WHEN device_type = 'mobile' THEN session_id END) as mobile_visitors,
  COUNT(DISTINCT CASE WHEN device_type = 'desktop' THEN session_id END) as desktop_visitors
FROM public.visitor_tracking
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- ============================================
-- VIEW FOR VISITOR SUMMARY
-- ============================================
CREATE OR REPLACE VIEW public.visitor_summary AS
SELECT 
  COUNT(DISTINCT session_id) as total_unique_visitors,
  COUNT(*) as total_page_views,
  COUNT(DISTINCT DATE(created_at)) as days_active,
  COUNT(DISTINCT user_id) FILTER (WHERE user_id IS NOT NULL) as logged_in_visitors,
  COUNT(DISTINCT CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN session_id END) as visitors_last_24h,
  COUNT(DISTINCT CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN session_id END) as visitors_last_7d,
  COUNT(DISTINCT CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN session_id END) as visitors_last_30d
FROM public.visitor_tracking;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE public.visitor_tracking ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert visitor tracking (for anonymous visitors)
DROP POLICY IF EXISTS "Allow anonymous visitor tracking" ON public.visitor_tracking;
CREATE POLICY "Allow anonymous visitor tracking"
  ON public.visitor_tracking
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow authenticated users to view their own tracking
DROP POLICY IF EXISTS "Users can view their own tracking" ON public.visitor_tracking;
CREATE POLICY "Users can view their own tracking"
  ON public.visitor_tracking
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow admins to view all tracking
DROP POLICY IF EXISTS "Admins can view all visitor tracking" ON public.visitor_tracking;
CREATE POLICY "Admins can view all visitor tracking"
  ON public.visitor_tracking
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Grant permissions
GRANT INSERT ON public.visitor_tracking TO anon, authenticated;
GRANT SELECT ON public.visitor_tracking TO authenticated;
GRANT SELECT ON public.daily_visitor_stats TO authenticated;
GRANT SELECT ON public.visitor_summary TO authenticated;

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE public.visitor_tracking IS 'Tracks all visitor page views and sessions';
COMMENT ON VIEW public.daily_visitor_stats IS 'Daily aggregated visitor statistics';
COMMENT ON VIEW public.visitor_summary IS 'Overall visitor statistics summary';

