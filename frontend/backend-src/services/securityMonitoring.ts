/**
 * Security Monitoring and Alerting Service
 * Logs security events and sends alerts for suspicious activity
 */

import { supabaseAdmin } from '../config/supabase.js';
import { emailService } from './email.js';

export type SecurityEventType =
  | 'login_attempt'
  | 'login_success'
  | 'login_failed'
  | '2fa_setup'
  | '2fa_enabled'
  | '2fa_disabled'
  | '2fa_verification_failed'
  | 'password_reset_request'
  | 'password_reset_success'
  | 'suspicious_activity'
  | 'rate_limit_exceeded'
  | 'unauthorized_access_attempt'
  | 'admin_action'
  | 'data_export'
  | 'account_locked'
  | 'account_unlocked';

export type SecuritySeverity = 'low' | 'medium' | 'high' | 'critical';

export interface SecurityEvent {
  event_type: SecurityEventType;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  details?: Record<string, any>;
  severity?: SecuritySeverity;
}

/**
 * Log a security event
 */
export async function logSecurityEvent(event: SecurityEvent): Promise<void> {
  try {
    const { error } = await supabaseAdmin
      .from('security_events')
      .insert({
        event_type: event.event_type,
        user_id: event.user_id || null,
        ip_address: event.ip_address || null,
        user_agent: event.user_agent || null,
        details: event.details || {},
        severity: event.severity || 'low',
        resolved: false,
      });

    if (error) {
      console.error('Failed to log security event:', error);
      // Don't throw - logging failures shouldn't break the app
    }

    // Send alerts for high-severity events
    if (event.severity === 'high' || event.severity === 'critical') {
      await sendSecurityAlert(event);
    }

    // Check for suspicious patterns
    await checkSuspiciousActivity(event);
  } catch (error) {
    console.error('Error in logSecurityEvent:', error);
  }
}

/**
 * Send security alert to admins
 */
async function sendSecurityAlert(event: SecurityEvent): Promise<void> {
  try {
    // Get all admin emails
    const { data: admins, error } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('user_type', 'admin')
      .eq('is_verified', true);

    if (error || !admins || admins.length === 0) {
      console.warn('No admins found to send security alert');
      return;
    }

    const adminEmails = admins.map((admin: any) => admin.email).filter(Boolean);

    // Send email to each admin
    for (const email of adminEmails) {
      await emailService.sendEmail({
        to: email,
        subject: `🚨 Security Alert: ${event.event_type} (${event.severity})`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">Security Alert</h2>
            <p><strong>Event Type:</strong> ${event.event_type}</p>
            <p><strong>Severity:</strong> <span style="color: ${event.severity === 'critical' ? '#dc2626' : '#f59e0b'}">${event.severity?.toUpperCase()}</span></p>
            ${event.user_id ? `<p><strong>User ID:</strong> ${event.user_id}</p>` : ''}
            ${event.ip_address ? `<p><strong>IP Address:</strong> ${event.ip_address}</p>` : ''}
            ${event.user_agent ? `<p><strong>User Agent:</strong> ${event.user_agent}</p>` : ''}
            ${event.details ? `<p><strong>Details:</strong><pre>${JSON.stringify(event.details, null, 2)}</pre></p>` : ''}
            <p style="margin-top: 20px;">
              <a href="${process.env.FRONTEND_URL || 'https://housedirectng.com'}/admin/security" 
                 style="background-color: #0284c7; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                View Security Dashboard
              </a>
            </p>
          </div>
        `,
        text: `Security Alert: ${event.event_type} (${event.severity})\n\nDetails: ${JSON.stringify(event.details, null, 2)}`,
      });
    }
  } catch (error) {
    console.error('Failed to send security alert:', error);
  }
}

/**
 * Check for suspicious activity patterns
 */
async function checkSuspiciousActivity(event: SecurityEvent): Promise<void> {
  try {
    // Check for multiple failed login attempts from same IP
    if (event.event_type === 'login_failed' && event.ip_address) {
      const { data: recentFailures, error } = await supabaseAdmin
        .from('security_events')
        .select('id')
        .eq('event_type', 'login_failed')
        .eq('ip_address', event.ip_address)
        .gte('created_at', new Date(Date.now() - 15 * 60 * 1000).toISOString()) // Last 15 minutes
        .limit(10);

      if (!error && recentFailures && recentFailures.length >= 5) {
        // 5+ failed attempts in 15 minutes - suspicious
        await logSecurityEvent({
          event_type: 'suspicious_activity',
          ip_address: event.ip_address,
          details: {
            pattern: 'multiple_failed_logins',
            count: recentFailures.length,
            time_window: '15_minutes',
          },
          severity: 'high',
        });
      }
    }

    // Check for multiple 2FA verification failures
    if (event.event_type === '2fa_verification_failed' && event.user_id) {
      const { data: recentFailures, error } = await supabaseAdmin
        .from('security_events')
        .select('id')
        .eq('event_type', '2fa_verification_failed')
        .eq('user_id', event.user_id)
        .gte('created_at', new Date(Date.now() - 30 * 60 * 1000).toISOString()) // Last 30 minutes
        .limit(10);

      if (!error && recentFailures && recentFailures.length >= 3) {
        // 3+ 2FA failures in 30 minutes - suspicious
        await logSecurityEvent({
          event_type: 'suspicious_activity',
          user_id: event.user_id,
          details: {
            pattern: 'multiple_2fa_failures',
            count: recentFailures.length,
            time_window: '30_minutes',
          },
          severity: 'high',
        });
      }
    }

    // Check for unauthorized access attempts
    if (event.event_type === 'unauthorized_access_attempt') {
      await logSecurityEvent({
        event_type: 'suspicious_activity',
        ip_address: event.ip_address,
        user_id: event.user_id,
        details: {
          pattern: 'unauthorized_access',
          ...event.details,
        },
        severity: 'high',
      });
    }
  } catch (error) {
    console.error('Error checking suspicious activity:', error);
  }
}

/**
 * Get recent security events
 */
export async function getRecentSecurityEvents(
  limit: number = 50,
  severity?: SecuritySeverity,
  eventType?: SecurityEventType
): Promise<any[]> {
  let query = supabaseAdmin
    .from('security_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (severity) {
    query = query.eq('severity', severity);
  }

  if (eventType) {
    query = query.eq('event_type', eventType);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Failed to get security events:', error);
    return [];
  }

  return data || [];
}

/**
 * Get unresolved security events
 */
export async function getUnresolvedSecurityEvents(): Promise<any[]> {
  const { data, error } = await supabaseAdmin
    .from('security_events')
    .select('*')
    .eq('resolved', false)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to get unresolved security events:', error);
    return [];
  }

  return data || [];
}

/**
 * Mark security event as resolved
 */
export async function resolveSecurityEvent(
  eventId: string,
  resolvedBy: string
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('security_events')
    .update({
      resolved: true,
      resolved_at: new Date().toISOString(),
      resolved_by: resolvedBy,
    })
    .eq('id', eventId);

  if (error) {
    throw new Error(`Failed to resolve security event: ${error.message}`);
  }
}

/**
 * Get security statistics
 */
export async function getSecurityStatistics(): Promise<{
  totalEvents: number;
  criticalEvents: number;
  highEvents: number;
  unresolvedEvents: number;
  recentFailures: number;
}> {
  const [
    totalResult,
    criticalResult,
    highResult,
    unresolvedResult,
    failuresResult,
  ] = await Promise.all([
    supabaseAdmin.from('security_events').select('id', { count: 'exact', head: true }),
    supabaseAdmin
      .from('security_events')
      .select('id', { count: 'exact', head: true })
      .eq('severity', 'critical'),
    supabaseAdmin
      .from('security_events')
      .select('id', { count: 'exact', head: true })
      .eq('severity', 'high'),
    supabaseAdmin
      .from('security_events')
      .select('id', { count: 'exact', head: true })
      .eq('resolved', false),
    supabaseAdmin
      .from('security_events')
      .select('id', { count: 'exact', head: true })
      .eq('event_type', 'login_failed')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
  ]);

  return {
    totalEvents: totalResult.count || 0,
    criticalEvents: criticalResult.count || 0,
    highEvents: highResult.count || 0,
    unresolvedEvents: unresolvedResult.count || 0,
    recentFailures: failuresResult.count || 0,
  };
}

