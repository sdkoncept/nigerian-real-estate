/**
 * Security utilities for data protection and fraud prevention
 */

/**
 * Rate limiting helper (client-side check)
 * Note: Real rate limiting should be implemented on the backend
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(key: string, maxRequests: number = 5, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

/**
 * Check if property is verified (prevents fake listings)
 */
export function isPropertyVerified(property: { verification_status?: string }): boolean {
  return property.verification_status === 'verified';
}

/**
 * Check if agent is verified (prevents unverified agents)
 */
export function isAgentVerified(agent: { verification_status?: string }): boolean {
  return agent.verification_status === 'verified';
}

/**
 * Generate secure random token for CSRF protection
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken(token: string, storedToken: string): boolean {
  return token === storedToken && token.length === 64;
}

/**
 * Mask sensitive data for display
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email;
  const [local, domain] = email.split('@');
  const maskedLocal = local.slice(0, 2) + '***' + local.slice(-1);
  return `${maskedLocal}@${domain}`;
}

export function maskPhone(phone: string): string {
  if (!phone || phone.length < 4) return phone;
  return phone.slice(0, 2) + '****' + phone.slice(-2);
}

/**
 * Check for suspicious patterns in user input (fraud detection)
 */
export function detectSuspiciousPatterns(text: string): {
  suspicious: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];
  let suspicious = false;

  // Check for excessive capitalization (potential spam)
  const upperCaseRatio = (text.match(/[A-Z]/g) || []).length / text.length;
  if (upperCaseRatio > 0.5 && text.length > 20) {
    reasons.push('Excessive capitalization');
    suspicious = true;
  }

  // Check for suspicious URLs
  const urlPattern = /(https?:\/\/[^\s]+)/gi;
  const urls = text.match(urlPattern);
  if (urls && urls.length > 3) {
    reasons.push('Multiple suspicious URLs');
    suspicious = true;
  }

  // Check for common scam keywords
  const scamKeywords = [
    'urgent',
    'asap',
    'wire transfer',
    'western union',
    'money gram',
    'act now',
    'limited time',
  ];
  const lowerText = text.toLowerCase();
  const foundKeywords = scamKeywords.filter(keyword => lowerText.includes(keyword));
  if (foundKeywords.length >= 3) {
    reasons.push('Potential scam keywords detected');
    suspicious = true;
  }

  return { suspicious, reasons };
}

/**
 * Encrypt sensitive data before sending to backend
 * Note: This is client-side encryption. Real encryption should happen on the backend.
 */
export async function encryptData(data: string, key: string): Promise<string> {
  // In production, use proper encryption libraries like Web Crypto API
  // This is a simplified example
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const keyBuffer = encoder.encode(key);
  
  // Simple XOR encryption (NOT secure for production - use proper encryption)
  const encrypted = new Uint8Array(dataBuffer.length);
  for (let i = 0; i < dataBuffer.length; i++) {
    encrypted[i] = dataBuffer[i] ^ keyBuffer[i % keyBuffer.length];
  }
  
  return btoa(String.fromCharCode(...encrypted));
}

/**
 * Content Security Policy helper
 */
export const CSP_HEADERS = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Adjust for production
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co",
    "frame-ancestors 'none'",
  ].join('; '),
};

