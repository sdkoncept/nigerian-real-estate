// Visitor Tracking Utility
// Tracks page visits to the database for analytics

import { supabase } from '../lib/supabase';

// Generate or get session ID
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('visitor_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('visitor_session_id', sessionId);
  }
  return sessionId;
};

// Detect device type from user agent
const getDeviceType = (): 'desktop' | 'mobile' | 'tablet' => {
  const userAgent = navigator.userAgent;
  if (/Tablet|iPad/i.test(userAgent)) {
    return 'tablet';
  }
  if (/Mobile|Android|iPhone|iPod/i.test(userAgent)) {
    return 'mobile';
  }
  return 'desktop';
};

// Detect browser from user agent
const getBrowser = (): string => {
  const userAgent = navigator.userAgent;
  if (userAgent.indexOf('Firefox') > -1) return 'Firefox';
  if (userAgent.indexOf('Chrome') > -1) return 'Chrome';
  if (userAgent.indexOf('Safari') > -1) return 'Safari';
  if (userAgent.indexOf('Edge') > -1) return 'Edge';
  if (userAgent.indexOf('Opera') > -1) return 'Opera';
  return 'Unknown';
};

// Track page visit
// Only tracks anonymous visitors (not logged-in users)
export const trackVisitor = async (pagePath: string, pageTitle?: string) => {
  try {
    // Get current user if logged in
    const { data: { user } } = await supabase.auth.getUser();
    
    // Skip tracking if user is logged in (agents, buyers, sellers, admins)
    // Only track anonymous visitors
    if (user) {
      return;
    }
    
    const sessionId = getSessionId();
    
    // Get device and browser info
    const userAgent = navigator.userAgent;
    const deviceType = getDeviceType();
    const browser = getBrowser();
    
    // Check if this is a new visitor (first visit in this session)
    const isNewVisitor = !sessionStorage.getItem('visitor_tracked');
    if (isNewVisitor) {
      sessionStorage.setItem('visitor_tracked', 'true');
    }
    
    // Insert visitor tracking record (only for anonymous visitors)
    const { error } = await supabase.from('visitor_tracking').insert({
      session_id: sessionId,
      user_id: null, // Always null since we only track anonymous visitors
      page_path: pagePath,
      page_title: pageTitle || document.title,
      referrer: document.referrer || null,
      user_agent: userAgent,
      device_type: deviceType,
      browser: browser,
      is_new_visitor: isNewVisitor,
    });
    
    if (error) {
      console.error('Error tracking visitor:', error);
    }
  } catch (error) {
    // Silently fail - don't break the app if tracking fails
    console.error('Error tracking visitor:', error);
  }
};

// Get visitor statistics (for admin dashboard)
export const getVisitorStats = async () => {
  try {
    const { data, error } = await supabase
      .from('visitor_summary')
      .select('*')
      .single();
    
    if (error) throw error;
    
    return {
      totalUniqueVisitors: data?.total_unique_visitors || 0,
      totalPageViews: data?.total_page_views || 0,
      daysActive: data?.days_active || 0,
      loggedInVisitors: data?.logged_in_visitors || 0,
      visitorsLast24h: data?.visitors_last_24h || 0,
      visitorsLast7d: data?.visitors_last_7d || 0,
      visitorsLast30d: data?.visitors_last_30d || 0,
    };
  } catch (error) {
    console.error('Error fetching visitor stats:', error);
    return {
      totalUniqueVisitors: 0,
      totalPageViews: 0,
      daysActive: 0,
      loggedInVisitors: 0,
      visitorsLast24h: 0,
      visitorsLast7d: 0,
      visitorsLast30d: 0,
    };
  }
};

// Get daily visitor stats (for charts/graphs)
export const getDailyVisitorStats = async (days: number = 30) => {
  try {
    const { data, error } = await supabase
      .from('daily_visitor_stats')
      .select('*')
      .order('date', { ascending: false })
      .limit(days);
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching daily visitor stats:', error);
    return [];
  }
};

