/**
 * Security Routes
 * Handles 2FA setup, security monitoring, and audit management
 */

import { Router, Response } from 'express';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { z } from 'zod';
import {
  generateTwoFactorSecret,
  verifyTwoFactorToken,
  enableTwoFactor,
  disableTwoFactor,
  isTwoFactorEnabled,
} from '../services/twoFactor.js';
import {
  logSecurityEvent,
  getRecentSecurityEvents,
  getUnresolvedSecurityEvents,
  resolveSecurityEvent,
  getSecurityStatistics,
} from '../services/securityMonitoring.js';
import { supabaseAdmin } from '../config/supabase.js';

const router = Router();

// All security routes require authentication
router.use(authenticate);

/**
 * GET /api/security/2fa/status
 * Check if 2FA is enabled for current user
 */
router.get('/2fa/status', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const enabled = await isTwoFactorEnabled(req.user.id);
    res.json({ enabled });
  } catch (error: any) {
    console.error('Error checking 2FA status:', error);
    res.status(500).json({ error: 'Failed to check 2FA status' });
  }
});

/**
 * POST /api/security/2fa/setup
 * Generate 2FA secret and QR code (admin only)
 */
router.post('/2fa/setup', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const setup = await generateTwoFactorSecret(req.user.id, req.user.email);

    // Log 2FA setup
    await logSecurityEvent({
      event_type: '2fa_setup',
      user_id: req.user.id,
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
      severity: 'low',
    });

    res.json({
      secret: setup.secret,
      qrCodeUrl: setup.qrCodeUrl,
      backupCodes: setup.backupCodes,
    });
  } catch (error: any) {
    console.error('Error setting up 2FA:', error);
    res.status(500).json({ error: 'Failed to set up 2FA' });
  }
});

/**
 * POST /api/security/2fa/verify
 * Verify 2FA token and enable 2FA (admin only)
 */
const verify2FASchema = z.object({
  token: z.string().length(6, 'Token must be 6 digits'),
});

router.post('/2fa/verify', requireAdmin, validate(verify2FASchema), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { token } = req.body;
    const result = await verifyTwoFactorToken(req.user.id, token);

    if (!result.valid) {
      await logSecurityEvent({
        event_type: '2fa_verification_failed',
        user_id: req.user.id,
        ip_address: req.ip,
        severity: 'medium',
      });

      return res.status(400).json({ error: 'Invalid token' });
    }

    // Enable 2FA
    await enableTwoFactor(req.user.id);

    await logSecurityEvent({
      event_type: '2fa_enabled',
      user_id: req.user.id,
      ip_address: req.ip,
      severity: 'low',
    });

    res.json({ success: true, message: '2FA enabled successfully' });
  } catch (error: any) {
    console.error('Error verifying 2FA:', error);
    res.status(500).json({ error: 'Failed to verify 2FA' });
  }
});

/**
 * POST /api/security/2fa/disable
 * Disable 2FA (admin only)
 */
router.post('/2fa/disable', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await disableTwoFactor(req.user.id);

    await logSecurityEvent({
      event_type: '2fa_disabled',
      user_id: req.user.id,
      ip_address: req.ip,
      severity: 'medium',
    });

    res.json({ success: true, message: '2FA disabled successfully' });
  } catch (error: any) {
    console.error('Error disabling 2FA:', error);
    res.status(500).json({ error: 'Failed to disable 2FA' });
  }
});

/**
 * GET /api/security/events
 * Get security events (admin only)
 */
router.get('/events', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const severity = req.query.severity as any;
    const eventType = req.query.eventType as any;

    const events = await getRecentSecurityEvents(limit, severity, eventType);
    res.json({ events });
  } catch (error: any) {
    console.error('Error getting security events:', error);
    res.status(500).json({ error: 'Failed to get security events' });
  }
});

/**
 * GET /api/security/events/unresolved
 * Get unresolved security events (admin only)
 */
router.get('/events/unresolved', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const events = await getUnresolvedSecurityEvents();
    res.json({ events });
  } catch (error: any) {
    console.error('Error getting unresolved events:', error);
    res.status(500).json({ error: 'Failed to get unresolved events' });
  }
});

/**
 * POST /api/security/events/:id/resolve
 * Mark security event as resolved (admin only)
 */
router.post('/events/:id/resolve', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    await resolveSecurityEvent(id, req.user.id);

    res.json({ success: true, message: 'Event resolved' });
  } catch (error: any) {
    console.error('Error resolving event:', error);
    res.status(500).json({ error: 'Failed to resolve event' });
  }
});

/**
 * GET /api/security/statistics
 * Get security statistics (admin only)
 */
router.get('/statistics', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const stats = await getSecurityStatistics();
    res.json(stats);
  } catch (error: any) {
    console.error('Error getting security statistics:', error);
    res.status(500).json({ error: 'Failed to get security statistics' });
  }
});

/**
 * GET /api/security/audits
 * Get security audit schedule (admin only)
 */
router.get('/audits', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('security_audits')
      .select('*')
      .order('scheduled_date', { ascending: true });

    if (error) throw error;

    res.json({ audits: data || [] });
  } catch (error: any) {
    console.error('Error getting security audits:', error);
    res.status(500).json({ error: 'Failed to get security audits' });
  }
});

/**
 * POST /api/security/audits
 * Create a new security audit (admin only)
 */
const auditSchema = z.object({
  audit_type: z.enum([
    'automated_scan',
    'manual_review',
    'penetration_test',
    'dependency_check',
    'configuration_review',
    'access_review',
    'compliance_check',
  ]),
  scheduled_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().optional(),
});

router.post('/audits', requireAdmin, validate(auditSchema), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { audit_type, scheduled_date, notes } = req.body;

    const { data, error } = await supabaseAdmin
      .from('security_audits')
      .insert({
        audit_type,
        scheduled_date,
        notes: notes || null,
        status: 'scheduled',
        performed_by: req.user.id,
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ audit: data });
  } catch (error: any) {
    console.error('Error creating security audit:', error);
    res.status(500).json({ error: 'Failed to create security audit' });
  }
});

/**
 * PUT /api/security/audits/:id
 * Update security audit (admin only)
 */
const updateAuditSchema = z.object({
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']).optional(),
  completed_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  findings: z.record(z.any()).optional(),
  recommendations: z.string().optional(),
  severity_summary: z.record(z.any()).optional(),
  notes: z.string().optional(),
  next_audit_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

router.put('/audits/:id', requireAdmin, validate(updateAuditSchema), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const updateData: any = {};

    if (req.body.status) updateData.status = req.body.status;
    if (req.body.completed_date) updateData.completed_date = req.body.completed_date;
    if (req.body.findings) updateData.findings = req.body.findings;
    if (req.body.recommendations) updateData.recommendations = req.body.recommendations;
    if (req.body.severity_summary) updateData.severity_summary = req.body.severity_summary;
    if (req.body.notes !== undefined) updateData.notes = req.body.notes;
    if (req.body.next_audit_date) updateData.next_audit_date = req.body.next_audit_date;

    const { data, error } = await supabaseAdmin
      .from('security_audits')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ audit: data });
  } catch (error: any) {
    console.error('Error updating security audit:', error);
    res.status(500).json({ error: 'Failed to update security audit' });
  }
});

export default router;

