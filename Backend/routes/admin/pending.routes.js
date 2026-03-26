// backend/routes/admin/pending.routes.js - Complete Robust Version
import express from 'express';
import { authenticate, isAdmin } from '../../middleware/authMiddleware.js';
import pool from '../../db/db.js';

const router = express.Router();

router.use(authenticate, isAdmin);

/**
 * Helper function to safely get count from any table
 */
async function safeCount(client, table, condition = '1=1') {
  try {
    // First check if table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = $1
      );
    `, [table]);
    
    if (!tableCheck.rows[0].exists) {
      console.log(`Table ${table} does not exist`);
      return 0;
    }
    
    // Build query based on condition
    let query = `SELECT COUNT(*) as count FROM ${table}`;
    const params = [];
    
    if (condition !== '1=1') {
      query += ` WHERE ${condition}`;
    }
    
    const result = await client.query(query, params);
    return parseInt(result.rows[0]?.count || 0);
  } catch (error) {
    console.error(`Error counting from ${table}:`, error.message);
    return 0;
  }
}

/**
 * GET /api/admin/vendors/pending/count
 */
router.get('/vendors/pending/count', async (req, res) => {
  const client = await pool.connect();
  try {
    let count = 0;
    
    // Try vendor_applications table first
    const hasVendorApps = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'vendor_applications'
      );
    `);
    
    if (hasVendorApps.rows[0].exists) {
      // Check if status column exists
      const hasStatus = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'vendor_applications' AND column_name = 'status'
        );
      `);
      
      if (hasStatus.rows[0].exists) {
        const result = await client.query(
          `SELECT COUNT(*) as count FROM vendor_applications WHERE status = 'pending'`
        );
        count = parseInt(result.rows[0]?.count || 0);
        console.log(`Found ${count} pending vendors from vendor_applications table`);
      } else {
        console.log('No status column in vendor_applications');
        count = 0;
      }
    } else {
      // Fallback: check users table
      const result = await client.query(`
        SELECT COUNT(*) as count 
        FROM users 
        WHERE (role = 'vendor' OR is_vendor = true) AND verified = false
      `);
      count = parseInt(result.rows[0]?.count || 0);
      console.log(`Found ${count} pending vendors from users table`);
    }
    
    res.json({ success: true, count });
  } catch (error) {
    console.error('Error fetching pending vendors count:', error);
    // Always return 0 on error to prevent frontend errors
    res.json({ success: true, count: 0 });
  } finally {
    client.release();
  }
});

/**
 * GET /api/admin/products/pending/count
 */
router.get('/products/pending/count', async (req, res) => {
  const client = await pool.connect();
  try {
    let count = 0;
    
    // Check if products table exists
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'products'
      );
    `);
    
    if (tableExists.rows[0].exists) {
      // Check for status column
      const hasStatus = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'products' AND column_name = 'status'
        );
      `);
      
      if (hasStatus.rows[0].exists) {
        const result = await client.query(
          `SELECT COUNT(*) as count FROM products WHERE status = 'pending'`
        );
        count = parseInt(result.rows[0]?.count || 0);
        console.log(`Found ${count} pending products from status column`);
      } else {
        // Check for approved column
        const hasApproved = await client.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'products' AND column_name = 'approved'
          );
        `);
        
        if (hasApproved.rows[0].exists) {
          const result = await client.query(
            `SELECT COUNT(*) as count FROM products WHERE approved = false`
          );
          count = parseInt(result.rows[0]?.count || 0);
          console.log(`Found ${count} pending products from approved column`);
        } else {
          // Check for published column
          const hasPublished = await client.query(`
            SELECT EXISTS (
              SELECT FROM information_schema.columns 
              WHERE table_name = 'products' AND column_name = 'published'
            );
          `);
          
          if (hasPublished.rows[0].exists) {
            const result = await client.query(
              `SELECT COUNT(*) as count FROM products WHERE published = false`
            );
            count = parseInt(result.rows[0]?.count || 0);
            console.log(`Found ${count} pending products from published column`);
          } else {
            console.log('No pending status column found in products table');
            count = 0;
          }
        }
      }
    } else {
      console.log('Products table does not exist');
    }
    
    res.json({ success: true, count });
  } catch (error) {
    console.error('Error fetching pending products count:', error);
    res.json({ success: true, count: 0 });
  } finally {
    client.release();
  }
});

/**
 * GET /api/admin/reviews/pending/count
 */
router.get('/reviews/pending/count', async (req, res) => {
  const client = await pool.connect();
  try {
    let count = 0;
    
    // Check if reviews table exists
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'reviews'
      );
    `);
    
    if (tableExists.rows[0].exists) {
      // Check for status column
      const hasStatus = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'reviews' AND column_name = 'status'
        );
      `);
      
      if (hasStatus.rows[0].exists) {
        const result = await client.query(
          `SELECT COUNT(*) as count FROM reviews WHERE status = 'pending'`
        );
        count = parseInt(result.rows[0]?.count || 0);
        console.log(`Found ${count} pending reviews from status column`);
      } else {
        // Check for approved column
        const hasApproved = await client.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'reviews' AND column_name = 'approved'
          );
        `);
        
        if (hasApproved.rows[0].exists) {
          const result = await client.query(
            `SELECT COUNT(*) as count FROM reviews WHERE approved = false`
          );
          count = parseInt(result.rows[0]?.count || 0);
          console.log(`Found ${count} pending reviews from approved column`);
        } else {
          console.log('No pending status column found in reviews table');
          count = 0;
        }
      }
    } else {
      console.log('Reviews table does not exist');
    }
    
    res.json({ success: true, count });
  } catch (error) {
    console.error('Error fetching pending reviews count:', error);
    res.json({ success: true, count: 0 });
  } finally {
    client.release();
  }
});

export default router;