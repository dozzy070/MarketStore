// backend/index.js or server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import orderRoutes from './routes/order.routes.js';
import vendorRoutes from './routes/vendor.routes.js';
import userRoutes from './routes/user.routes.js';
import categoryRoutes from './routes/category.routes.js';
import adminRoutes from './routes/admin.routes.js';
import notificationRoutes from './routes/notification.routes.js'; // Add this import
import activityRoutes from './routes/activity.routes.js';
import auditLogRoutes from './routes/admin/auditLog.routes.js';
import pendingRoutes from './routes/admin/pending.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import vendorPayoutRoutes from './routes/vendor/payout.routes.js';
import adminPayoutRoutes from './routes/admin/payout.routes.js';
import reviewsRoutes from './routes/reviews.routes.js';
import passport from './db/passport.js';


import pool from './db/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
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

// Register routes - MAKE SURE notificationRoutes is included
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes); // Add this line
app.use('/api/activity', activityRoutes);
app.use('/api/admin/audit-logs', auditLogRoutes);
app.use('/api/admin', pendingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/vendor/payouts', vendorPayoutRoutes);
app.use('/api/admin', adminPayoutRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use(passport.initialize());



// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Backend is running!', timestamp: new Date() });
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

app.listen(PORT, () => {
  console.log('=================================');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`🔍 Health check: http://localhost:${PORT}/health`);
  console.log(`📢 Notifications API: http://localhost:${PORT}/api/notifications`);
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