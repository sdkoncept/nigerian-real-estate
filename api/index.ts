/**
 * Vercel Serverless Function Entry Point
 * This file handles ALL /api/* routes via Express
 * 
 * Vercel automatically routes /api/* requests to this file
 * Express receives the full path including /api prefix
 */

import app from '../backend/src/index.js';

// Export Express app - @vercel/node automatically handles Express apps
export default app;

