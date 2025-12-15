/**
 * Verification Routes
 * Handles email and phone verification
 */

import { Router, Request, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { authLimiter } from '../middleware/security.js';
import { validate, schemas } from '../middleware/validation.js';
import { z } from 'zod';
import { emailService } from '../services/email.js';
import { phoneService } from '../services/phone.js';
import { whatsappService } from '../services/whatsapp.js';
import { supabaseAdmin } from '../config/supabase.js';

const router = Router();

/**
 * Request email verification (authenticated - for logged-in users)
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
 * Request email verification (unauthenticated - for users who haven't verified)
 * Allows users to request a new verification email by providing their email address
 */
const requestVerificationEmailSchema = z.object({
  email: z.string().email('Invalid email address'),
});

router.post('/email/resend', authLimiter, validate(requestVerificationEmailSchema), async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Supabase not configured' });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Try to find user by email using admin API
    let userExists = false;
    let isVerified = false;

    try {
      const { data: users, error: userError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (!userError && users?.users) {
        const user = users.users.find(u => u.email?.toLowerCase() === normalizedEmail);
        if (user) {
          userExists = true;
          isVerified = !!user.email_confirmed_at;
        }
      }
    } catch (listError) {
      console.error('Error checking user:', listError);
      // Continue anyway - we'll try to resend
    }

    // If user exists and is already verified, let them know
    if (userExists && isVerified) {
      return res.json({
        success: true,
        message: 'This email is already verified. You can log in.',
        alreadyVerified: true,
      });
    }

    // Resend verification email
    // Supabase will handle checking if user exists
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const redirectTo = `${frontendUrl}/verify-email`;

    const result = await supabaseAdmin.auth.resend({
      type: 'signup',
      email: normalizedEmail,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    if (result.error) {
      console.error('Resend verification error:', result.error);
      
      // Check for specific errors
      if (result.error.message?.includes('not found') || result.error.message?.includes('does not exist')) {
        // User doesn't exist - but don't reveal this (security best practice)
        return res.json({
          success: true,
          message: 'If an account exists with this email, a verification email has been sent.',
        });
      }

      // Other errors - still return success to prevent email enumeration
      return res.json({
        success: true,
        message: 'If an account exists with this email, a verification email has been sent.',
      });
    }

    // Success
    res.json({
      success: true,
      message: 'Verification email sent. Please check your inbox.',
    });
  } catch (error: any) {
    console.error('Email verification resend error:', error);
    // Return success to prevent email enumeration attacks
    res.json({
      success: true,
      message: 'If an account exists with this email, a verification email has been sent.',
    });
  }
});

/**
 * Check email verification status by token
 * This endpoint checks if a verification token has been used to verify an email
 */
const checkVerificationSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

router.post('/email/check', authLimiter, validate(checkVerificationSchema), async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Supabase not configured' });
    }

    // Try to verify the token to get user info
    // Note: The token from Supabase URL might be a hash or raw token
    try {
      // First try with token_hash (most common case)
      let verifyResult = await supabaseAdmin.auth.verifyOtp({
        token_hash: token,
        type: 'signup',
      });

      // If that fails, the token might already be used (which means verification succeeded)
      if (verifyResult.error) {
        // Token was already used or expired - this usually means verification succeeded
        // on Supabase's server. We can't verify it again, but we should tell user to try login
        console.log('Token verification error (likely already used):', verifyResult.error.message);
        return res.json({
          success: true,
          verified: 'unknown', // Can't determine, but likely verified
          message: 'This verification link has already been used. Your email should be verified. Please try logging in.',
          suggestLogin: true,
        });
      }

      if (verifyResult.data?.user?.email_confirmed_at) {
        // User is verified
        return res.json({
          success: true,
          verified: true,
          userId: verifyResult.data.user.id,
          message: 'Email is verified',
        });
      }

      // Token is valid but email not confirmed yet (shouldn't happen, but handle it)
      return res.json({
        success: true,
        verified: false,
        message: 'Email not yet verified',
      });
    } catch (verifyError: any) {
      console.error('Token verification error:', verifyError);
      // If verification fails, it likely means token was already used (verification succeeded)
      return res.json({
        success: true,
        verified: 'unknown',
        message: 'Unable to verify token status. If you clicked the verification link, your email should be verified. Please try logging in.',
        suggestLogin: true,
      });
    }
  } catch (error: any) {
    console.error('Check verification error:', error);
    res.status(500).json({ error: 'Failed to check verification status' });
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

/**
 * Request WhatsApp verification code
 */
router.post('/whatsapp/request', authLimiter, authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const result = await whatsappService.sendVerificationCode(phone);

    if (result.success) {
      res.json({
        success: true,
        message: result.message || 'Verification code sent via WhatsApp',
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error || 'Failed to send verification code',
      });
    }
  } catch (error: any) {
    console.error('WhatsApp verification request error:', error);
    res.status(500).json({ error: 'Failed to send verification code' });
  }
});

/**
 * Verify WhatsApp code
 */
router.post('/whatsapp/verify', authLimiter, authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { phone, code } = req.body;

    if (!phone || !code) {
      return res.status(400).json({ error: 'Phone number and code are required' });
    }

    const result = await whatsappService.verifyCode(phone, code);

    if (result.success) {
      // Update user profile
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
    console.error('WhatsApp verification error:', error);
    res.status(500).json({ error: 'Phone verification failed' });
  }
});

export default router;

