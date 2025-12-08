/**
 * Vercel Serverless Function Entry Point
 * This file is used by Vercel to handle /api/* routes
 * 
 * Vercel routes /api/* requests to this file, and the path includes /api
 * So /api/payments/paystack/initialize becomes /api/payments/paystack/initialize in Express
 */

import app from '../backend/src/index.js';

// Export the Express app - @vercel/node will handle it
// The app already has routes for both /api/* and /* patterns
export default app;

