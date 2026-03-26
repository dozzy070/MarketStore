import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// Aiven Cloud PostgreSQL configuration with optimized connection pooling
const pool = new Pool({
  user: process.env.DB_USER || 'avnadmin',
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 28771,
  database: process.env.DB_NAME || 'MarketStore',
  
  // SSL is required for Aiven
  ssl: {
    rejectUnauthorized: false, // Required for Aiven self-signed certs
    sslmode: 'require'
  },
  
  // Connection pool settings - Optimized for free tier
  max: 10, // Maximum connections from our app (free tier has 20 total)
  min: 2,  // Minimum connections kept alive
  
  // IDLE TIMEOUT: Increased to 5 minutes (300000 ms) as requested
  idleTimeoutMillis: 300000, // 5 minutes before closing idle connections
  
  connectionTimeoutMillis: 10000, // Fail fast if can't connect (10 seconds)
  
  // Keep-alive settings to prevent connection drops
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000, // Send keepalive after 10 seconds idle
  
  // Application-side timeouts
  statement_timeout: 30000, // 30 seconds max for any query
  query_timeout: 30000,     // 30 seconds max for queries
  idle_in_transaction_session_timeout: 60000, // 60 seconds max idle transaction
  
  // Additional PostgreSQL driver parameters
  application_name: 'vendor_dashboard_app',
});

// ============= POOL EVENT MONITORS =============

pool.on('connect', () => {
  console.log('✅ New database connection established');
  console.log(`📊 Pool stats - total: ${pool.totalCount}, idle: ${pool.idleCount}, waiting: ${pool.waitingCount}`);
});

pool.on('acquire', () => {
  console.log('✅ Connection acquired from pool');
});

pool.on('remove', () => {
  console.log('🔄 Connection removed from pool');
  console.log(`📊 Pool stats - total: ${pool.totalCount}, idle: ${pool.idleCount}`);
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database pool error:', err.message);
  
  if (err.message.includes('remaining connection slots')) {
    console.error('⚠️  Connection limit reached on Aiven free tier (20 max)');
    console.error('💡 Solutions:');
    console.error('   1. Reduce max connections in pool');
    console.error('   2. Run cleanup script to kill idle connections');
    console.error('   3. Upgrade Aiven plan for more connections');
  }
  
  if (err.message.includes('timeout')) {
    console.error('⚠️  Connection timeout detected');
    console.error('💡 Check:');
    console.error('   1. Network connectivity to Aiven');
    console.error('   2. IP whitelist in Aiven console');
    console.error('   3. Aiven service status');
  }
});

// ============= CONNECTION TEST WITH RETRY =============

/**
 * Tests database connection with automatic retry logic
 * @param {number} retries - Number of retry attempts
 * @param {number} delay - Delay between retries in milliseconds
 * @returns {Promise<boolean>} - True if connection successful
 */
const connectWithRetry = async (retries = 3, delay = 5000) => {
  console.log('🔄 Attempting to connect to Aiven PostgreSQL...');
  
  for (let i = 0; i < retries; i++) {
    try {
      const client = await pool.connect();
      console.log('✅ Successfully connected to Aiven PostgreSQL database');
      
      // Set session parameters to prevent timeouts
      await client.query(`
        SET idle_in_transaction_session_timeout = '60s';
        SET statement_timeout = '30s';
        SET lock_timeout = '10s';
      `);
      
      client.release();
      
      // Log connection pool configuration
      console.log(`📊 Connection pool: max=${pool.options.max}, min=${pool.options.min}`);
      console.log(`⏱️  Idle timeout: ${pool.options.idleTimeoutMillis/1000} seconds`);
      console.log(`⚠️  Free tier max connections: 20 total, ${pool.options.max} reserved for app`);
      console.log(`✅ Database connection pool initialized successfully`);
      
      return true;
    } catch (err) {
      console.error(`❌ Database connection attempt ${i + 1}/${retries} failed:`, err.message);
      
      // Provide specific troubleshooting advice based on error
      if (err.message.includes('remaining connection slots')) {
        console.error('⚠️  CONNECTION LIMIT REACHED:');
        console.error('   - Aiven free tier allows only 20 total connections');
        console.error('   - Current pool max is set to 10');
        console.error('   - Other applications or idle connections may be using the rest');
        console.error('   💡 Run: node cleanup-connections.js to kill idle connections');
      }
      
      if (err.message.includes('timeout')) {
        console.error('⚠️  CONNECTION TIMEOUT:');
        console.error('   - Check if your IP is whitelisted in Aiven console');
        console.error('   - Verify network connectivity to Aiven');
        console.error('   - Ensure Aiven service is running');
        console.error('   💡 Visit: https://console.aiven.io to check service status');
      }
      
      if (err.message.includes('ECONNREFUSED')) {
        console.error('⚠️  CONNECTION REFUSED:');
        console.error('   - Database server may be down');
        console.error('   - Check if host and port are correct');
        console.error('   - Verify firewall settings');
      }
      
      if (err.message.includes('SSL')) {
        console.error('⚠️  SSL ERROR:');
        console.error('   - SSL configuration may be incorrect');
        console.error('   - Aiven requires SSL connections');
      }
      
      if (i < retries - 1) {
        console.log(`⏳ Retrying in ${delay/1000} seconds... (${retries - i - 1} attempts remaining)`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error('❌ All connection attempts failed. Please check your database configuration.');
        console.error('📝 Environment variables being used:');
        console.error(`   - DB_HOST: ${process.env.DB_HOST || 'not set'}`);
        console.error(`   - DB_PORT: ${process.env.DB_PORT || 'not set'}`);
        console.error(`   - DB_NAME: ${process.env.DB_NAME || 'not set'}`);
        console.error(`   - DB_USER: ${process.env.DB_USER || 'not set'}`);
        console.error(`   - DB_PASSWORD: ${process.env.DB_PASSWORD ? '******' : 'not set'}`);
      }
    }
  }
  return false;
};

// ============= INITIAL CONNECTION TEST =============

// Run connection test on startup (don't block server start)
connectWithRetry().then(success => {
  if (!success) {
    console.warn('⚠️  Server starting but database connection failed. Health checks will fail until database is reachable.');
  }
});

// ============= GRACEFUL SHUTDOWN =============

/**
 * Gracefully close all database connections on app shutdown
 * This prevents connection leaks and ensures clean shutdown
 */
const gracefulShutdown = async (signal) => {
  console.log(`🛑 ${signal} received, closing database connections...`);
  
  try {
    // Force close any idle connections
    const timeout = setTimeout(() => {
      console.error('❌ Force closing database connections after timeout');
      process.exit(1);
    }, 10000);
    
    await pool.end();
    clearTimeout(timeout);
    
    console.log('✅ All database connections closed successfully');
    console.log('👋 Server shutting down gracefully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during graceful shutdown:', error.message);
    process.exit(1);
  }
};

// Handle various shutdown signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGQUIT', () => gracefulShutdown('SIGQUIT'));

// Prevent process from exiting on uncaught exceptions (but log them)
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  console.error(err.stack);
  // Don't exit immediately, allow graceful shutdown
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

export default pool;