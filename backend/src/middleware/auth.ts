/**
 * Authentication Middleware
 * Validates JWT tokens and user authentication
 */

import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase.js';

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
      return res.status(500).json({
        error: 'Server Error',
        message: 'Supabase not configured',
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
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single();

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email || '',
      user_type: profile?.user_type || 'buyer',
    };

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

