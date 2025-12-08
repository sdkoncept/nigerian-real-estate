import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import {
  securityHeaders,
  apiLimiter,
  corsOptions,
  requestId,
  sanitizeBody,
} from './middleware/security.js';

// Import routes
import adminRoutes from './routes/admin.js';
import reportsRoutes from './routes/reports.js';
import paymentsRoutes from './routes/payments.js';
import verificationRoutes from './routes/verification.js';
import agentRoutes from './routes/agent.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy - Required for Vercel and other reverse proxies
// Set to 1 to trust only the first proxy (Vercel's edge network)
// This allows Express to correctly identify client IPs while maintaining rate limiting security
app.set('trust proxy', 1);

// Security middleware (apply first)
app.use(securityHeaders);
app.use(requestId);
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(sanitizeBody);

// Rate limiting
app.use('/api/', apiLimiter);

// Health check (no rate limiting)
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'House Direct NG API is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Debug endpoint to check environment variables (without exposing secrets)
app.get('/api/debug/env', (req: Request, res: Response) => {
  res.json({
    hasPaystackSecret: !!process.env.PAYSTACK_SECRET_KEY,
    paystackSecretLength: process.env.PAYSTACK_SECRET_KEY?.length || 0,
    paystackSecretPrefix: process.env.PAYSTACK_SECRET_KEY?.substring(0, 3) || 'none',
    hasSupabaseUrl: !!process.env.SUPABASE_URL,
    hasSupabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    supabaseServiceKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
    frontendUrl: process.env.FRONTEND_URL,
    nodeEnv: process.env.NODE_ENV,
    vercel: process.env.VERCEL,
  });
});

// Root route
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to House Direct NG API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      admin: '/api/admin',
      reports: '/api/reports',
      payments: '/api/payments',
      verification: '/api/verification',
      agent: '/api/agent',
    },
  });
});

// Debug middleware for Vercel (place before routes to log all requests)
// This will help diagnose routing issues
app.use((req: Request, res: Response, next: any) => {
  if (process.env.VERCEL === '1' || process.env.NODE_ENV === 'production') {
    console.log(`[${process.env.VERCEL ? 'Vercel' : 'Production'}] ${req.method} ${req.path}`, {
      url: req.url,
      originalUrl: req.originalUrl,
      baseUrl: req.baseUrl,
      method: req.method,
      headers: {
        'content-type': req.headers['content-type'],
        'authorization': req.headers['authorization'] ? 'present' : 'missing',
      },
    });
  }
  next();
});

// API Routes
// Support both /api/* (Vercel routing) and /* (direct access)
// Note: Vercel may strip /api prefix when routing to serverless functions
app.use('/api/admin', adminRoutes);
app.use('/admin', adminRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/reports', reportsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/payments', paymentsRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/verification', verificationRoutes);
app.use('/api/agent', agentRoutes);
app.use('/agent', agentRoutes);

// 404 handler - log for debugging
app.use((req: Request, res: Response) => {
  console.log(`[404] ${req.method} ${req.path} - Route not found`, {
    url: req.url,
    originalUrl: req.originalUrl,
    baseUrl: req.baseUrl,
  });
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('[Global Error Handler] Error:', err);
  console.error('[Global Error Handler] Error name:', err?.name);
  console.error('[Global Error Handler] Error message:', err?.message);
  console.error('[Global Error Handler] Error stack:', err?.stack);
  console.error('[Global Error Handler] Request path:', req.path);
  console.error('[Global Error Handler] Request method:', req.method);
  
  // Return more detailed error in production for debugging
  const errorMessage = err.message || 'Internal Server Error';
  const statusCode = err.status || 500;
  
  // Always include error message in response for debugging
  res.status(statusCode).json({
    error: errorMessage,
    message: errorMessage, // Also include as 'message' for consistency
    ...(process.env.VERCEL === '1' && { 
      // Include error details in Vercel for debugging
      details: err.message,
      path: req.path,
      name: err?.name,
    }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Export handler for Vercel serverless functions
export default app;

// Start server only if not in serverless environment
if (process.env.VERCEL !== '1' && process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 API Health: http://localhost:${PORT}/api/health`);
    console.log(`🔒 Security: Enabled`);
    console.log(`📊 Rate Limiting: Enabled`);
  });
}

