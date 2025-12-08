/**
 * Vercel Serverless Function Entry Point - Catch-all route
 * This file handles ALL /api/* routes via Express
 * 
 * When Vercel routes /api/payments/paystack/initialize here,
 * Express receives the full path: /api/payments/paystack/initialize
 */

import app from '../backend/src/index.js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Export handler function for Vercel
export default function handler(req: VercelRequest, res: VercelResponse) {
  // Pass request to Express app
  // @vercel/node will handle the Express app correctly
  return app(req as any, res as any);
}

