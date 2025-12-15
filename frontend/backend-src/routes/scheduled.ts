/**
 * Scheduled Tasks Routes
 * Handles automated tasks like sending reminder emails
 * Protected by secret key to prevent unauthorized access
 */

import { Router, Request, Response } from 'express';
import { sendVerificationReminders } from '../services/verificationReminder.js';

const router = Router();

/**
 * Verify the request is from an authorized source (cron job)
 */
function verifyCronSecret(req: Request): boolean {
  const providedSecret = req.headers['x-cron-secret'] || req.query.secret;
  const expectedSecret = process.env.CRON_SECRET || 'your-secret-key-change-this';
  
  if (!providedSecret || providedSecret !== expectedSecret) {
    console.warn('⚠️ Unauthorized cron request attempt');
    return false;
  }
  
  return true;
}

/**
 * Send verification reminder emails to unverified agents and sellers
 * This endpoint should be called twice a month by a cron job
 * 
 * Usage:
 * - Vercel Cron: Add to vercel.json
 * - External Cron: Call this endpoint with x-cron-secret header
 * - Manual: Call with ?secret=your-secret-key
 */
router.post('/verification-reminders', async (req: Request, res: Response) => {
  try {
    // Verify request is authorized
    if (!verifyCronSecret(req)) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or missing cron secret',
      });
    }

    console.log('📧 Starting verification reminder email job...');
    const stats = await sendVerificationReminders();

    res.json({
      success: true,
      message: 'Verification reminders sent successfully',
      stats: {
        agentsContacted: stats.agentsContacted,
        sellersContacted: stats.sellersContacted,
        agentsFailed: stats.agentsFailed,
        sellersFailed: stats.sellersFailed,
        totalContacted: stats.agentsContacted + stats.sellersContacted,
        totalFailed: stats.agentsFailed + stats.sellersFailed,
        errors: stats.errors.length > 0 ? stats.errors : undefined,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('❌ Error in verification reminder job:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send verification reminders',
      message: error.message,
    });
  }
});

/**
 * Health check for scheduled tasks
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Scheduled Tasks',
    endpoints: {
      verificationReminders: 'POST /api/scheduled/verification-reminders',
    },
  });
});

export default router;
