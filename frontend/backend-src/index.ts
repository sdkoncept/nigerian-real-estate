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
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
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

