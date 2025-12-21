const PROPERTY_VIEW_LIMIT = 3; // Free views before requiring signup
const STORAGE_KEY = 'anonymous_property_views';

export function trackPropertyView(propertyId: string) {
  if (typeof window === 'undefined') return 0;
  
  const views = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '[]');
  if (!views.includes(propertyId)) {
    views.push(propertyId);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(views));
  }
  return views.length;
}

export function getPropertyViewCount(): number {
  if (typeof window === 'undefined') return 0;
  const views = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '[]');
  return views.length;
}

export function hasReachedLimit(): boolean {
  return getPropertyViewCount() >= PROPERTY_VIEW_LIMIT;
}

export function resetPropertyViews() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(STORAGE_KEY);
}

export function getRemainingViews(): number {
  return Math.max(0, PROPERTY_VIEW_LIMIT - getPropertyViewCount());
}

