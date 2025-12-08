/**
 * Vercel Serverless Function - Catch-all route for all API endpoints
 * Handles ALL /api/* routes via Express
 * 
 * Vercel automatically routes /api/payments/paystack/initialize to this file
 * Express receives the full path: /api/payments/paystack/initialize
 */

import app from '../../backend/src/index.js';

// Export Express app directly - @vercel/node handles Express apps automatically
export default app;

