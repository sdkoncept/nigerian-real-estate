/**
 * Vercel Serverless Function Entry Point
 * Handles ALL /api/* routes via Express
 * 
 * This explicitly wraps the Express app for Vercel serverless functions
 * to ensure all HTTP methods (GET, POST, PUT, DELETE, etc.) are handled correctly
 */

import app from '../backend/src/index.js';

// Export handler function that wraps Express app
// @vercel/node will provide req and res types at runtime
export default function handler(req: any, res: any) {
  // Pass the request directly to Express
  // Express will handle routing, CORS, authentication, etc.
  return app(req, res);
}

