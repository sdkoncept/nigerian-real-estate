/**
 * Vercel Serverless Function Entry Point
 * This file handles ALL /api/* routes via Express
 * 
 * IMPORTANT: When Vercel routes /api/payments/paystack/initialize here,
 * the request path in Express will be /api/payments/paystack/initialize
 * (Vercel keeps the full path when using routes configuration)
 */

import app from '../backend/src/index.js';

// Export Express app directly - @vercel/node handles Express apps automatically
// Make sure the app has routes registered for /api/* paths
export default app;

