// backend/server.js
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import orderRoutes from './routes/order.routes.js';
import vendorRoutes from './routes/vendor.routes.js';
import userRoutes from './routes/customer/user.routes.js';
import categoryRoutes from './routes/category.routes.js';
import adminRoutes from './routes/admin.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import activityRoutes from './routes/activity.routes.js';
import auditLogRoutes from './routes/admin/auditLog.routes.js';
import pendingRoutes from './routes/admin/pending.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import vendorPayoutRoutes from './routes/vendor/payout.routes.js';
import adminPayoutRoutes from './routes/admin/payout.routes.js';
import reviewsRoutes from './routes/reviews.routes.js';
import passport from './db/passport.js';

import pool from './db/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// ==================== Environment Check ====================
const requiredEnv = [
  'DB_USER', 'DB_PASSWORD', 'DB_HOST', 'DB_PORT', 'DB_NAME', 'JWT_SECRET',
  'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_CALLBACK_URL'
];
console.log('🔍 Checking environment variables...');
requiredEnv.forEach(key => {
  if (!process.env[key]) {
    console.warn(`⚠️ Missing environment variable: ${key}`);
  } else {
    console.log(`✅ ${key} is set`);
  }
});

// ==================== Security Headers ====================
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://js.paystack.co", "https://paystack.com"],
      styleSrc: ["'self'", "https://paystack.com", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.paystack.co"],
      frameSrc: ["'self'", "https://paystack.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// ==================== Middleware ====================
// Allowed origins (including your Vercel frontend)
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://market-store-flax.vercel.app',   // your Vercel URL
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ==================== Routes ====================
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/admin/audit-logs', auditLogRoutes);
app.use('/api/admin', pendingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/vendor/payouts', vendorPayoutRoutes);
app.use('/api/admin', adminPayoutRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use(passport.initialize());

app.get('/test-email', async (req, res) => {
  try {
    const { sendEmail } = await import('./services/emailService.js');
    const result = await sendEmail('dozzydivinec@gmail.com', 'Test Subject', '<h1>Test email</h1>');
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/health', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as time');
    client.release();
    res.json({ 
      status: 'healthy', 
      database: 'connected',
      time: result.rows[0].time
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'unhealthy', 
      database: 'disconnected',
      error: error.message 
    });
  }
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'MarketStore API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      orders: '/api/orders',
      vendor: '/api/vendor',
      users: '/api/users',
      categories: '/api/categories',
      admin: '/api/admin',
      notifications: '/api/notifications',
      health: '/health',
      test: '/test'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: `Route ${req.method} ${req.path} not found` 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ==================== Start Server ====================
app.listen(PORT, '0.0.0.0', () => {
  console.log('=================================');
  console.log(`🚀 Server running on port ${PORT} (bound to 0.0.0.0)`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`🔍 Health check: http://localhost:${PORT}/health`);
  console.log('=================================');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, closing connections...');
  await pool.end();
  console.log('✅ Database connections closed');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, closing connections...');
  await pool.end();
  console.log('✅ Database connections closed');
  process.exit(0);
});

