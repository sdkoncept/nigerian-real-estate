/**
 * Security Service
 * Handles 2FA, security events, and audit management
 */

const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    return envUrl;
  }
  if (window.location.protocol === 'https:') {
    return ''; // Use relative URLs in production
  }
  return 'http://localhost:5000';
};

const API_URL = getApiUrl();

export interface TwoFactorSetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export interface SecurityEvent {
  id: string;
  event_type: string;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  details?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  created_at: string;
}

export interface SecurityAudit {
  id: string;
  audit_type: string;
  scheduled_date: string;
  completed_date?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  findings?: Record<string, any>;
  recommendations?: string;
  severity_summary?: Record<string, any>;
  notes?: string;
  next_audit_date?: string;
}

export class SecurityService {
  private static async getAuthHeaders(): Promise<HeadersInit> {
    // Get token from Supabase session
    const { supabase } = await import('../lib/supabase');
    const { data: { session } } = await supabase.auth.getSession();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    return headers;
  }

  /**
   * Check if 2FA is enabled for current user
   */
  static async check2FAStatus(): Promise<{ enabled: boolean }> {
    const url = API_URL
      ? `${API_URL}/api/security/2fa/status`
      : '/api/security/2fa/status';

    const response = await fetch(url, {
      method: 'GET',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to check 2FA status' }));
      throw new Error(error.error || 'Failed to check 2FA status');
    }

    return response.json();
  }

  /**
   * Set up 2FA (generate secret and QR code)
   */
  static async setup2FA(): Promise<TwoFactorSetup> {
    const url = API_URL
      ? `${API_URL}/api/security/2fa/setup`
      : '/api/security/2fa/setup';

    const response = await fetch(url, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to set up 2FA' }));
      throw new Error(error.error || 'Failed to set up 2FA');
    }

    return response.json();
  }

  /**
   * Verify 2FA token and enable 2FA
   */
  static async verify2FA(token: string): Promise<{ success: boolean; message: string }> {
    const url = API_URL
      ? `${API_URL}/api/security/2fa/verify`
      : '/api/security/2fa/verify';

    const response = await fetch(url, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to verify 2FA' }));
      throw new Error(error.error || 'Failed to verify 2FA');
    }

    return response.json();
  }

  /**
   * Disable 2FA
   */
  static async disable2FA(): Promise<{ success: boolean; message: string }> {
    const url = API_URL
      ? `${API_URL}/api/security/2fa/disable`
      : '/api/security/2fa/disable';

    const response = await fetch(url, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to disable 2FA' }));
      throw new Error(error.error || 'Failed to disable 2FA');
    }

    return response.json();
  }

  /**
   * Get security events
   */
  static async getSecurityEvents(params?: {
    limit?: number;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    eventType?: string;
  }): Promise<{ events: SecurityEvent[] }> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.severity) queryParams.append('severity', params.severity);
    if (params?.eventType) queryParams.append('eventType', params.eventType);

    const url = API_URL
      ? `${API_URL}/api/security/events?${queryParams.toString()}`
      : `/api/security/events?${queryParams.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to get security events' }));
      throw new Error(error.error || 'Failed to get security events');
    }

    return response.json();
  }

  /**
   * Get unresolved security events
   */
  static async getUnresolvedEvents(): Promise<{ events: SecurityEvent[] }> {
    const url = API_URL
      ? `${API_URL}/api/security/events/unresolved`
      : '/api/security/events/unresolved';

    const response = await fetch(url, {
      method: 'GET',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to get unresolved events' }));
      throw new Error(error.error || 'Failed to get unresolved events');
    }

    return response.json();
  }

  /**
   * Resolve a security event
   */
  static async resolveEvent(eventId: string): Promise<{ success: boolean; message: string }> {
    const url = API_URL
      ? `${API_URL}/api/security/events/${eventId}/resolve`
      : `/api/security/events/${eventId}/resolve`;

    const response = await fetch(url, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to resolve event' }));
      throw new Error(error.error || 'Failed to resolve event');
    }

    return response.json();
  }

  /**
   * Get security statistics
   */
  static async getSecurityStatistics(): Promise<{
    totalEvents: number;
    criticalEvents: number;
    highEvents: number;
    unresolvedEvents: number;
    recentFailures: number;
  }> {
    const url = API_URL
      ? `${API_URL}/api/security/statistics`
      : '/api/security/statistics';

    const response = await fetch(url, {
      method: 'GET',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to get statistics' }));
      throw new Error(error.error || 'Failed to get statistics');
    }

    return response.json();
  }

  /**
   * Get security audits
   */
  static async getSecurityAudits(): Promise<{ audits: SecurityAudit[] }> {
    const url = API_URL
      ? `${API_URL}/api/security/audits`
      : '/api/security/audits';

    const response = await fetch(url, {
      method: 'GET',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to get audits' }));
      throw new Error(error.error || 'Failed to get audits');
    }

    return response.json();
  }

  /**
   * Create a security audit
   */
  static async createSecurityAudit(data: {
    audit_type: string;
    scheduled_date: string;
    notes?: string;
  }): Promise<{ audit: SecurityAudit }> {
    const url = API_URL
      ? `${API_URL}/api/security/audits`
      : '/api/security/audits';

    const response = await fetch(url, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to create audit' }));
      throw new Error(error.error || 'Failed to create audit');
    }

    return response.json();
  }

  /**
   * Update a security audit
   */
  static async updateSecurityAudit(
    auditId: string,
    data: Partial<SecurityAudit>
  ): Promise<{ audit: SecurityAudit }> {
    const url = API_URL
      ? `${API_URL}/api/security/audits/${auditId}`
      : `/api/security/audits/${auditId}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to update audit' }));
      throw new Error(error.error || 'Failed to update audit');
    }

    return response.json();
  }
}

