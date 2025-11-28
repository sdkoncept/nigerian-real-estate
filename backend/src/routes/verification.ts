/**
 * Verification Routes
 * Handles email and phone verification
 */

import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { authLimiter } from '../middleware/security.js';
import { validate, schemas } from '../middleware/validation.js';
import { z } from 'zod';
import { emailService } from '../services/email.js';
import { phoneService } from '../services/phone.js';
import { supabaseAdmin } from '../config/supabase.js';

const router = Router();

/**
 * Request email verification
 */
router.post('/email/request', authLimiter, authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Generate verification token (Supabase handles this, but we can trigger email)
    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Supabase not configured' });
    }

    const result = await supabaseAdmin.auth.resend({
      type: 'signup',
      email: req.user.email,
    });

    if (result.error) {
      return res.status(500).json({ error: result.error.message });
    }

    res.json({
      success: true,
      message: 'Verification email sent. Please check your inbox.',
    });
  } catch (error: any) {
    console.error('Email verification request error:', error);
    res.status(500).json({ error: 'Failed to send verification email' });
  }
});

/**
 * Verify email token
 */
const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

router.post('/email/verify', authLimiter, validate(verifyEmailSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { token } = req.body;

    const result = await emailService.verifyEmailToken(token);

    if (result.success && result.userId) {
      // Update user profile
      if (supabaseAdmin) {
        await supabaseAdmin
          .from('profiles')
          .update({ is_verified: true })
          .eq('id', result.userId);
      }

      res.json({
        success: true,
        message: 'Email verified successfully',
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Invalid or expired verification token',
      });
    }
  } catch (error: any) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Email verification failed' });
  }
});

/**
 * Request phone verification code
 */
const requestPhoneSchema = z.object({
  phone: schemas.nigerianPhone,
});

router.post('/phone/request', authLimiter, authenticate, validate(requestPhoneSchema), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { phone } = req.body;

    const result = await phoneService.sendVerificationCode(phone);

    if (result.success) {
      res.json({
        success: true,
        message: result.message || 'Verification code sent successfully',
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error || 'Failed to send verification code',
      });
    }
  } catch (error: any) {
    console.error('Phone verification request error:', error);
    res.status(500).json({ error: 'Failed to send verification code' });
  }
});

/**
 * Verify phone code
 */
const verifyPhoneSchema = z.object({
  phone: schemas.nigerianPhone,
  code: z.string().length(6, 'Code must be 6 digits'),
});

router.post('/phone/verify', authLimiter, authenticate, validate(verifyPhoneSchema), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { phone, code } = req.body;

    const result = await phoneService.verifyCode(phone, code);

    if (result.success) {
      // Update user profile
      await phoneService.updatePhoneVerificationStatus(req.user.id, true);

      // Update phone number in profile
      if (supabaseAdmin) {
        await supabaseAdmin
          .from('profiles')
          .update({ phone, is_verified: true })
          .eq('id', req.user.id);
      }

      res.json({
        success: true,
        message: result.message || 'Phone number verified successfully',
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error || 'Invalid verification code',
      });
    }
  } catch (error: any) {
    console.error('Phone verification error:', error);
    res.status(500).json({ error: 'Phone verification failed' });
  }
});

export default router;

