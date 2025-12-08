/**
 * Vercel Serverless Function Entry Point
 * This file is used by Vercel to handle /api/* routes
 * 
 * @vercel/node automatically handles Express apps when exported as default
 */

import app from '../backend/src/index.js';

export default app;

