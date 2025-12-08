/**
 * Vercel Serverless Function Entry Point
 * This file handles ALL /api/* routes via Express
 * 
 * IMPORTANT: Vercel strips the /api prefix when routing to serverless functions
 * So /api/payments/paystack/initialize becomes /payments/paystack/initialize
 * That's why we have routes for both /api/* and /* patterns
 */

import app from '../backend/src/index.js';

// Export Express app - @vercel/node will automatically handle it
// The app has routes for both /api/payments and /payments to handle both cases
export default app;

