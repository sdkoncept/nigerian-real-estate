/**
 * Vercel Serverless Function Entry Point
 * This file handles ALL /api/* routes via Express
 * 
 * When Vercel routes /api/payments/paystack/initialize here,
 * Express receives the full path: /api/payments/paystack/initialize
 */

import app from '../backend/src/index.js';

// Export Express app for @vercel/node
// This will handle all requests routed to /api/*
export default app;

