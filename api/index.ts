/**
 * Vercel Serverless Function Entry Point
 * Handles ALL /api/* routes via Express
 * 
 * This is a catch-all handler for all API routes
 */

import app from '../backend/src/index.js';

// For Vercel, we need to export the app directly
// @vercel/node will handle Express apps automatically
export default app;

