// Google Analytics 4 - Manual implementation (works with React 19)
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

// Initialize Google Analytics
export const initGA = (measurementId: string) => {
  if (typeof window !== 'undefined' && measurementId && !window.gtag) {
    // Load gtag script
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script1);

    // Initialize dataLayer and gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(...args: any[]) {
      window.dataLayer!.push(args);
    };
    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      page_path: window.location.pathname,
    });
  }
};

// Get GA measurement ID from environment or use default
export const getGAMeasurementId = (): string => {
  if (typeof window !== 'undefined') {
    return import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-VCSPFDYNK5';
  }
  return 'G-VCSPFDYNK5';
};

// Track page views
export const trackPageView = (path: string, title?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    const measurementId = getGAMeasurementId();
    if (measurementId) {
      window.gtag('config', measurementId, {
        page_path: path,
        page_title: title,
      });
    }
  }
};

// Track events
export const trackEvent = (
  category: string,
  action: string,
  label?: string,
  value?: number
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Track property views
export const trackPropertyView = (propertyId: string, propertyTitle: string) => {
  trackEvent('Property', 'View', propertyTitle);
  trackEvent('Property', 'View ID', propertyId);
};

// Track contact form submissions
export const trackContactForm = (propertyId?: string) => {
  trackEvent('Contact', 'Form Submit', propertyId || 'General');
};

// Track social shares
export const trackSocialShare = (platform: string, propertyId?: string) => {
  trackEvent('Social', 'Share', platform, propertyId ? 1 : undefined);
};

// Track search
export const trackSearch = (searchTerm: string, resultsCount: number) => {
  trackEvent('Search', 'Query', searchTerm, resultsCount);
};

// Track signup
export const trackSignup = (method: string) => {
  trackEvent('User', 'Signup', method);
};

// Track login
export const trackLogin = (method: string) => {
  trackEvent('User', 'Login', method);
};

// Track property creation
export const trackPropertyCreate = () => {
  trackEvent('Property', 'Create');
};

// Track favorite
export const trackFavorite = (action: 'add' | 'remove', propertyId: string) => {
  trackEvent('Property', action === 'add' ? 'Favorite Add' : 'Favorite Remove', propertyId);
};

