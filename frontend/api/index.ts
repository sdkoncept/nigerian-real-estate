/**
 * Vercel Serverless Function Entry Point
 * Handles ALL /api/* routes via Express
 * 
 * CRITICAL: Export the Express app directly
 * @vercel/node automatically wraps Express apps and handles all HTTP methods
 */

import app from '../backend-src/index.js';

// Export Express app directly - this is the recommended way for Vercel
// @vercel/node will automatically create a handler that supports all HTTP methods
export default app;

