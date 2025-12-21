import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../utils/analytics';
import { trackVisitor } from '../utils/visitorTracking';

export default function PageTracker() {
  const location = useLocation();

  useEffect(() => {
    // Track page view on route change (Google Analytics)
    trackPageView(location.pathname + location.search, document.title);
    
    // Track visitor in database
    trackVisitor(location.pathname + location.search, document.title);
  }, [location]);

  return null;
}

