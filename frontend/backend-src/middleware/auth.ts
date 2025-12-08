/**
 * Authentication Middleware
 * Validates JWT tokens and user authentication
 */

import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { logSecurityEvent } from '../services/securityMonitoring.js';
import { isTwoFactorEnabled, verifyTwoFactorToken } from '../services/twoFactor.js';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    user_type?: string;
  };
}

/**
 * Verify JWT token from Supabase
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No token provided',
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!supabaseAdmin) {
      console.error('[Auth] supabaseAdmin is null! Check environment variables:');
      console.error('[Auth] SUPABASE_URL:', process.env.SUPABASE_URL ? 'SET' : 'MISSING');
      console.error('[Auth] SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING');
      console.error('[Auth] SUPABASE_SERVICE_ROLE_KEY length:', process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0);
      
      return res.status(500).json({
        error: 'Server Error',
        message: 'Supabase not configured. Please check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.',
      });
    }

    // Verify the token with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired token',
      });
    }

    // Get user profile to check user_type
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single();

    // Log profile fetch errors but don't fail authentication
    if (profileError) {
      console.warn('[Auth] Profile fetch error (non-fatal):', profileError.message);
    }

    const userType = profile?.user_type || 'buyer';
    const isAdmin = userType === 'admin';

    // Check if 2FA is required for admin accounts
    if (isAdmin) {
      const twoFactorEnabled = await isTwoFactorEnabled(user.id);

      if (twoFactorEnabled) {
        // Check for 2FA token in header
        const twoFactorToken = req.headers['x-2fa-token'] as string;

        if (!twoFactorToken) {
          // Log 2FA requirement
          await logSecurityEvent({
            event_type: 'unauthorized_access_attempt',
            user_id: user.id,
            ip_address: req.ip,
            user_agent: req.headers['user-agent'],
            details: { reason: '2FA token missing' },
            severity: 'medium',
          });

          return res.status(401).json({
            error: 'Two-Factor Authentication Required',
            message: 'Please provide a 2FA token in the X-2FA-Token header',
            requires2FA: true,
          });
        }

        // Verify 2FA token
        const twoFactorResult = await verifyTwoFactorToken(user.id, twoFactorToken);

        if (!twoFactorResult.valid) {
          // Log failed 2FA attempt
          await logSecurityEvent({
            event_type: '2fa_verification_failed',
            user_id: user.id,
            ip_address: req.ip,
            user_agent: req.headers['user-agent'],
            details: { usedBackupCode: twoFactorResult.usedBackupCode },
            severity: 'high',
          });

          return res.status(401).json({
            error: 'Invalid 2FA Token',
            message: 'The provided 2FA token is invalid or expired',
          });
        }

        // Log successful 2FA verification
        if (twoFactorResult.usedBackupCode) {
          await logSecurityEvent({
            event_type: '2fa_verification_failed',
            user_id: user.id,
            ip_address: req.ip,
            details: { note: 'Backup code used - user should regenerate codes' },
            severity: 'medium',
          });
        }
      }
    }

    // Log successful authentication
    await logSecurityEvent({
      event_type: 'login_success',
      user_id: user.id,
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
      details: { user_type: userType },
      severity: 'low',
    });

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email || '',
      user_type: userType,
    };

    console.log('[Auth] User authenticated:', { id: req.user.id, email: req.user.email, user_type: req.user.user_type });
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      error: 'Server Error',
      message: 'Authentication failed',
    });
  }
};

/**
 * Require specific user type (admin, agent, etc.)
 */
export const requireUserType = (...allowedTypes: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    if (!allowedTypes.includes(req.user.user_type || '')) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `This endpoint requires one of: ${allowedTypes.join(', ')}`,
      });
    }

    next();
  };
};

/**
 * Require admin access
 */
export const requireAdmin = requireUserType('admin');

/**
 * Require agent or admin access
 */
export const requireAgent = requireUserType('agent', 'admin');

