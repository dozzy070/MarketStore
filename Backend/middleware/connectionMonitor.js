import pool from '../db/db.js';

// Track active queries to prevent connection leaks
const activeQueries = new Map();

export const monitorConnections = (req, res, next) => {
  const startTime = Date.now();
  const queryId = `${req.ip}-${startTime}-${Math.random()}`;
  
  activeQueries.set(queryId, {
    route: req.path,
    method: req.method,
    startTime,
    ip: req.ip
  });

  // Log current pool stats periodically
  if (Math.random() < 0.01) { // 1% of requests
    console.log('📊 Connection pool stats:', {
      total: pool.totalCount,
      idle: pool.idleCount,
      waiting: pool.waitingCount,
      activeQueries: activeQueries.size
    });
  }

  // Clean up old queries (older than 5 minutes)
  const now = Date.now();
  for (const [id, data] of activeQueries) {
    if (now - data.startTime > 300000) { // 5 minutes
      console.warn('⚠️  Long-running query detected:', data);
      activeQueries.delete(id);
    }
  }

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    activeQueries.delete(queryId);
    
    // Log slow queries
    if (duration > 5000) {
      console.warn(`⚠️  Slow query (${duration}ms):`, req.method, req.path);
    }
  });

  next();
};

// Function to force cleanup of idle connections
export const cleanupIdleConnections = async () => {
  console.log('🧹 Running manual connection cleanup...');
  
  let client;
  try {
    client = await pool.connect();
    
    // Terminate idle connections older than 1 hour
    const result = await client.query(`
      SELECT pg_terminate_backend(pid)
      FROM pg_stat_activity
      WHERE state = 'idle'
        AND state_change < NOW() - INTERVAL '1 hour'
        AND pid != pg_backend_pid()
        AND usename != 'postgres'
        AND usename != 'avnadmin'
        AND datname = current_database();
    `);
    
    console.log(`✅ Terminated ${result.rowCount} idle connections`);
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
  } finally {
    if (client) client.release();
  }
};

// Run cleanup every 30 minutes
setInterval(cleanupIdleConnections, 30 * 60 * 1000);