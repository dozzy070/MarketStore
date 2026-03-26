import pool from '../db/db.js';

// Middleware to ensure database connection is alive
export const ensureDbConnection = async (req, res, next) => {
  try {
    const client = await pool.connect();
    client.release(); // Release immediately, just testing connection
    next();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    res.status(503).json({ 
      success: false, 
      message: 'Database temporarily unavailable. Please try again.',
      error: error.message 
    });
  }
};

// Middleware to track and limit concurrent requests
const activeRequests = new Map();

export const trackDbRequests = (req, res, next) => {
  const requestId = `${req.ip}-${Date.now()}`;
  activeRequests.set(requestId, { 
    route: req.path, 
    time: Date.now() 
  });

  // Clean up old requests (older than 30 seconds)
  const now = Date.now();
  for (const [id, data] of activeRequests) {
    if (now - data.time > 30000) {
      activeRequests.delete(id);
    }
  }

  // Warn if too many active requests
  if (activeRequests.size > 50) {
    console.warn(`⚠️ High number of active requests: ${activeRequests.size}`);
  }

  res.on('finish', () => {
    activeRequests.delete(requestId);
  });

  next();
};