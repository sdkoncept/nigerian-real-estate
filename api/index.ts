/**
 * Vercel Serverless Function Entry Point
 * Handles ALL /api/* routes via Express
 * 
 * IMPORTANT: When Vercel routes /api/payments/paystack/initialize here,
 * Express receives the FULL path: /api/payments/paystack/initialize
 * 
 * The Express app has routes registered for /api/payments which should match
 */

import app from '../backend/src/index.js';

// Export handler that explicitly handles the request
export default function handler(req: any, res: any) {
  // Log the incoming request for debugging
  console.log(`[Vercel Handler] ${req.method} ${req.url}`, {
    path: req.path,
    originalUrl: req.originalUrl,
  });
  
  // Pass to Express app
  return app(req, res);
}

