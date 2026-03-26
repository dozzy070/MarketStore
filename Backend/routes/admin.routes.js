// backend/routes/adminRoutes.js - Fixed vendors endpoint
import express from 'express';
import bcrypt from 'bcrypt';
import { authenticate, isAdmin } from '../middleware/authMiddleware.js';
import pool from '../db/db.js';
import { sendVendorApprovalEmail, sendVendorRejectionEmail } from '../services/emailService.js';


const router = express.Router();

// Apply admin middleware to all routes
router.use(authenticate, isAdmin);

/* ------------------------- USERS ------------------------- */

// Get all users
router.get('/users', async (req, res) => {
  const client = await pool.connect();
  try {
    console.log('📊 Fetching all users...');
    
    const result = await client.query(`
      SELECT 
        u.id, 
        u.full_name, 
        u.email, 
        u.phone_number, 
        u.location, 
        u.role,
        u.is_vendor, 
        u.is_admin, 
        u.verified, 
        u.created_at,
        va.status AS vendor_status, 
        va.business_name
      FROM users u
      LEFT JOIN vendor_applications va ON u.id = va.user_id
      ORDER BY u.created_at DESC
    `);
    
    console.log(`✅ Found ${result.rows.length} users`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  } finally {
    client.release();
  }
});

// Update user role
router.patch('/users/:id/role', async (req, res) => {
  const client = await pool.connect();
  const { id } = req.params;
  const { role } = req.body;

  if (!['user', 'vendor', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  try {
    const result = await client.query(`
      UPDATE users
      SET role = $1, is_vendor = $2, is_admin = $3, updated_at = NOW()
      WHERE id = $4
      RETURNING id, full_name, email, role
    `, [role, role === 'vendor', role === 'admin', id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      success: true, 
      message: `User role updated to ${role}`, 
      user: result.rows[0] 
    });
  } catch (error) {
    console.error('❌ Update role error:', error);
    res.status(500).json({ error: 'Failed to update role' });
  } finally {
    client.release();
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  const client = await pool.connect();
  const { id } = req.params;

  try {
    const result = await client.query(
      'DELETE FROM users WHERE id = $1 RETURNING id', 
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('❌ Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  } finally {
    client.release();
  }
});

/* ------------------------- VENDORS ------------------------- */

// Get all vendors (including pending) - FIXED VERSION
router.get('/vendors', async (req, res) => {
  const client = await pool.connect();
  try {
    console.log('📊 Fetching all vendors...');
    
    // First, check if orders table has vendor_id column
    const hasVendorId = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'vendor_id'
      );
    `);
    
    // Build query based on available columns
    let totalSalesQuery;
    if (hasVendorId.rows[0].exists) {
      totalSalesQuery = `(
        SELECT COALESCE(SUM(o.total), 0) 
        FROM orders o 
        WHERE o.vendor_id = u.id AND o.status = 'delivered'
      ) AS total_sales`;
    } else {
      // If no vendor_id in orders, use 0
      totalSalesQuery = `0 AS total_sales`;
    }
    
    const result = await client.query(`
      SELECT 
        u.id,
        u.full_name AS owner_name,
        u.email,
        u.phone_number AS phone,
        u.location AS address,
        u.verified,
        u.created_at AS joined_date,
        COALESCE(va.business_name, u.full_name) AS business_name,
        COALESCE(va.status, 
          CASE 
            WHEN u.verified = true THEN 'approved'
            ELSE 'pending'
          END
        ) AS status,
        COALESCE(va.documents, '[]') AS documents,
        COALESCE(va.description, u.bio, '') AS description,
        (
          SELECT COUNT(*) FROM products WHERE vendor_id = u.id
        ) AS products_count,
        ${totalSalesQuery}
      FROM users u
      LEFT JOIN vendor_applications va ON u.id = va.user_id
      WHERE u.role = 'vendor' OR u.is_vendor = true
      ORDER BY 
        CASE WHEN COALESCE(va.status, 
          CASE WHEN u.verified = true THEN 'approved' ELSE 'pending' END) = 'pending' THEN 0 ELSE 1 END,
        u.created_at DESC
    `);
    
    console.log(`✅ Found ${result.rows.length} vendors`);
    console.log('Pending vendors:', result.rows.filter(v => v.status === 'pending').length);
    
    res.json({
      success: true,
      data: result.rows
    });
    
  } catch (error) {
    console.error('❌ Error fetching vendors:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch vendors',
      error: error.message 
    });
  } finally {
    client.release();
  }
});

// Get pending vendors count
router.get('/vendors/pending/count', async (req, res) => {
  const client = await pool.connect();
  try {
    let count = 0;
    
    // Check if vendor_applications table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'vendor_applications'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      // Count from vendor_applications table
      const result = await client.query(`
        SELECT COUNT(*) as count 
        FROM vendor_applications 
        WHERE status = 'pending'
      `);
      count = parseInt(result.rows[0]?.count || 0);
      console.log(`Found ${count} pending vendors from applications table`);
    } else {
      // Fallback: count from users table
      const result = await client.query(`
        SELECT COUNT(*) as count 
        FROM users 
        WHERE (role = 'vendor' OR is_vendor = true) AND verified = false
      `);
      count = parseInt(result.rows[0]?.count || 0);
      console.log(`Found ${count} pending vendors from users table`);
    }
    
    res.json({ 
      success: true, 
      count 
    });
    
  } catch (error) {
    console.error('Error fetching pending vendors count:', error);
    res.json({ success: true, count: 0 });
  } finally {
    client.release();
  }
});

// Get single vendor details
router.get('/vendors/:id', async (req, res) => {
  const client = await pool.connect();
  const { id } = req.params;
  
  try {
    const hasVendorId = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'vendor_id'
      );
    `);
    
    let totalSalesQuery;
    if (hasVendorId.rows[0].exists) {
      totalSalesQuery = `(
        SELECT COALESCE(SUM(o.total), 0) 
        FROM orders o 
        WHERE o.vendor_id = u.id AND o.status = 'delivered'
      ) AS total_sales`;
    } else {
      totalSalesQuery = `0 AS total_sales`;
    }
    
    const result = await client.query(`
      SELECT 
        u.id,
        u.full_name AS owner_name,
        u.email,
        u.phone_number AS phone,
        u.location AS address,
        u.verified,
        u.bio,
        u.created_at AS joined_date,
        COALESCE(va.business_name, u.full_name) AS business_name,
        COALESCE(va.status, 
          CASE 
            WHEN u.verified = true THEN 'approved'
            ELSE 'pending'
          END
        ) AS status,
        va.documents,
        va.description,
        va.rejection_reason,
        (
          SELECT COUNT(*) FROM products WHERE vendor_id = u.id
        ) AS products_count,
        ${totalSalesQuery}
      FROM users u
      LEFT JOIN vendor_applications va ON u.id = va.user_id
      WHERE u.id = $1 AND (u.role = 'vendor' OR u.is_vendor = true)
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Vendor not found' 
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
    
  } catch (error) {
    console.error('❌ Error fetching vendor:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch vendor details' 
    });
  } finally {
    client.release();
  }
});

// Approve vendor
router.put('/vendors/:id/approve', async (req, res) => {
  const client = await pool.connect();
  const { id } = req.params;
  
  try {
    await client.query('BEGIN');
    
    console.log(`📝 Approving vendor ID: ${id}`);
    
    // Update user to verified vendor
    const userResult = await client.query(
      `UPDATE users 
       SET verified = true, 
           is_vendor = true, 
           role = 'vendor', 
           updated_at = NOW()
       WHERE id = $1
       RETURNING id, full_name, email`,
      [id]
    );
    
    if (userResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Update vendor application status
    const appResult = await client.query(
      `UPDATE vendor_applications 
       SET status = 'approved', 
           reviewed_at = NOW()
       WHERE user_id = $1
       RETURNING id`,
      [id]
    );
    
    await client.query('COMMIT');
    
    console.log(`✅ Vendor approved: ${userResult.rows[0].email}`);
    
    res.json({
      success: true,
      message: 'Vendor approved successfully',
      vendor: userResult.rows[0]
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error approving vendor:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to approve vendor',
      error: error.message 
    });
  } finally {
    client.release();
  }
});

// Reject vendor
router.put('/vendors/:id/reject', async (req, res) => {
  const client = await pool.connect();
  const { id } = req.params;
  const { reason } = req.body;
  
  try {
    await client.query('BEGIN');
    
    console.log(`📝 Rejecting vendor ID: ${id}`);
    
    // Update vendor application
    const appResult = await client.query(
      `UPDATE vendor_applications 
       SET status = 'rejected', 
           reviewed_at = NOW(), 
           rejection_reason = $1
       WHERE user_id = $2
       RETURNING id`,
      [reason || 'No reason provided', id]
    );
    
    // Update user to mark as not vendor
    await client.query(
      `UPDATE users 
       SET is_vendor = false, 
           verified = false,
           updated_at = NOW()
       WHERE id = $1`,
      [id]
    );
    
    await client.query('COMMIT');
    
    console.log(`✅ Vendor rejected: ID ${id}`);
    
    res.json({
      success: true,
      message: 'Vendor application rejected'
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error rejecting vendor:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to reject vendor',
      error: error.message 
    });
  } finally {
    client.release();
  }
});

/* ------------------------- PRODUCTS ------------------------- */

// Get all products (admin view)
router.get('/products', async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT p.*, u.full_name AS vendor_name, c.name AS category_name
      FROM products p
      LEFT JOIN users u ON p.vendor_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Get admin products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  } finally {
    client.release();
  }
});

// Get pending products count
router.get('/products/pending/count', async (req, res) => {
  const client = await pool.connect();
  try {
    let count = 0;
    
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'products'
      );
    `);
    
    if (tableExists.rows[0].exists) {
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
      } else {
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
        }
      }
    }
    
    res.json({ success: true, count });
  } catch (error) {
    console.error('Error fetching pending products count:', error);
    res.json({ success: true, count: 0 });
  } finally {
    client.release();
  }
});

// Approve product
router.put('/products/:id/approve', async (req, res) => {
  const client = await pool.connect();
  const { id } = req.params;
  
  try {
    const result = await client.query(`
      UPDATE products 
      SET status = 'published', approved = true, updated_at = NOW()
      WHERE id = $1 
      RETURNING *
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    res.json({
      success: true,
      message: 'Product approved successfully',
      product: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Error approving product:', error);
    res.status(500).json({ success: false, message: 'Failed to approve product' });
  } finally {
    client.release();
  }
});

// Delete product
router.delete('/products/:id', async (req, res) => {
  const client = await pool.connect();
  const { id } = req.params;
  
  try {
    const result = await client.query(
      'DELETE FROM products WHERE id = $1 RETURNING id',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting product:', error);
    res.status(500).json({ success: false, message: 'Failed to delete product' });
  } finally {
    client.release();
  }
});

/* ------------------------- ORDERS ------------------------- */

// Get all orders
router.get('/orders', async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT o.*, u.full_name AS customer_name, u.email AS customer_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Get admin orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  } finally {
    client.release();
  }
});

// Update order status
router.put('/orders/:id/status', async (req, res) => {
  const client = await pool.connect();
  const { id } = req.params;
  const { status } = req.body;
  
  try {
    const result = await client.query(`
      UPDATE orders 
      SET status = $1, updated_at = NOW()
      WHERE id = $2 
      RETURNING *
    `, [status, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    res.json({
      success: true,
      message: 'Order status updated',
      order: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Error updating order:', error);
    res.status(500).json({ success: false, message: 'Failed to update order' });
  } finally {
    client.release();
  }
});

/* ------------------------- REVIEWS ------------------------- */

// Get all reviews
router.get('/reviews', async (req, res) => {
  const client = await pool.connect();
  try {
    console.log('Fetching all reviews...');
    
    const result = await client.query(`
      SELECT 
        r.*,
        u.full_name AS user_name,
        u.email AS user_email,
        p.name AS product_name,
        p.id AS product_id
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN products p ON r.product_id = p.id
      ORDER BY r.created_at DESC
    `);
    
    console.log(`Found ${result.rows.length} reviews`);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('❌ Error fetching reviews:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch reviews',
      error: error.message 
    });
  } finally {
    client.release();
  }
});

// Get pending reviews count
router.get('/reviews/pending/count', async (req, res) => {
  const client = await pool.connect();
  try {
    let count = 0;
    
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'reviews'
      );
    `);
    
    if (tableExists.rows[0].exists) {
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
      }
    }
    
    res.json({ success: true, count });
  } catch (error) {
    console.error('Error fetching pending reviews count:', error);
    res.json({ success: true, count: 0 });
  } finally {
    client.release();
  }
});

// Approve review
router.put('/reviews/:id/approve', async (req, res) => {
  const client = await pool.connect();
  const { id } = req.params;
  
  try {
    const result = await client.query(`
      UPDATE reviews 
      SET status = 'approved', updated_at = NOW() 
      WHERE id = $1 
      RETURNING *
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    
    res.json({
      success: true,
      message: 'Review approved successfully',
      review: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Error approving review:', error);
    res.status(500).json({ success: false, message: 'Failed to approve review' });
  } finally {
    client.release();
  }
});

// Reject review
router.put('/reviews/:id/reject', async (req, res) => {
  const client = await pool.connect();
  const { id } = req.params;
  
  try {
    const result = await client.query(`
      UPDATE reviews 
      SET status = 'rejected', updated_at = NOW() 
      WHERE id = $1 
      RETURNING *
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    
    res.json({
      success: true,
      message: 'Review rejected successfully',
      review: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Error rejecting review:', error);
    res.status(500).json({ success: false, message: 'Failed to reject review' });
  } finally {
    client.release();
  }
});

// Delete review
router.delete('/reviews/:id', async (req, res) => {
  const client = await pool.connect();
  const { id } = req.params;
  
  try {
    const result = await client.query(
      'DELETE FROM reviews WHERE id = $1 RETURNING id',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    
    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting review:', error);
    res.status(500).json({ success: false, message: 'Failed to delete review' });
  } finally {
    client.release();
  }
});

/* ------------------------- ANALYTICS & DASHBOARD ------------------------- */

// Dashboard stats
router.get('/dashboard/stats', async (req, res) => {
  const client = await pool.connect();
  try {
    const [products, orders, users, revenue] = await Promise.all([
      client.query('SELECT COUNT(*) FROM products'),
      client.query('SELECT COUNT(*) FROM orders'),
      client.query("SELECT COUNT(*) FROM users WHERE role = 'user'"),
      client.query("SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE status = 'delivered'")
    ]);

    res.json({
      totalProducts: parseInt(products.rows[0].count),
      totalOrders: parseInt(orders.rows[0].count),
      totalUsers: parseInt(users.rows[0].count),
      totalRevenue: parseFloat(revenue.rows[0].total)
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  } finally {
    client.release();
  }
});

// Analytics
router.get('/analytics', async (req, res) => {
  const client = await pool.connect();
  try {
    console.log('📊 Fetching analytics data...');
    
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Get counts
    const totalUsers = await client.query("SELECT COUNT(*) FROM users WHERE role = 'user'");
    const newUsers = await client.query(
      "SELECT COUNT(*) FROM users WHERE role = 'user' AND created_at >= $1", 
      [thirtyDaysAgo]
    );
    const totalVendors = await client.query("SELECT COUNT(*) FROM users WHERE role = 'vendor'");
    const totalProducts = await client.query("SELECT COUNT(*) FROM products");
    const totalOrders = await client.query("SELECT COUNT(*) FROM orders");
    const totalRevenue = await client.query(
      "SELECT COALESCE(SUM(total), 0) FROM orders WHERE status = 'delivered' AND created_at >= $1",
      [thirtyDaysAgo]
    );
    
    // Monthly revenue
    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const result = await client.query(
        "SELECT COALESCE(SUM(total), 0) as revenue FROM orders WHERE status = 'delivered' AND created_at >= $1 AND created_at < $2",
        [month, nextMonth]
      );
      monthlyRevenue.push({
        month: month.toLocaleString('default', { month: 'short' }),
        revenue: parseFloat(result.rows[0]?.revenue || 0)
      });
    }
    
    res.json({
      success: true,
      data: {
        summary: {
          users: { 
            total: parseInt(totalUsers.rows[0].count), 
            new: parseInt(newUsers.rows[0].count)
          },
          vendors: { total: parseInt(totalVendors.rows[0].count) },
          products: { total: parseInt(totalProducts.rows[0].count) },
          orders: { total: parseInt(totalOrders.rows[0].count) },
          revenue: { total: parseFloat(totalRevenue.rows[0].total) }
        },
        monthlyRevenue
      }
    });
  } catch (error) {
    console.error('❌ Analytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
  } finally {
    client.release();
  }
});


// Approve vendor with email notification
router.put('/vendors/:id/approve', async (req, res) => {
  const client = await pool.connect();
  const { id } = req.params;
  
  try {
    await client.query('BEGIN');
    
    // Update user
    const userResult = await client.query(
      `UPDATE users 
       SET verified = true, is_vendor = true, role = 'vendor', updated_at = NOW()
       WHERE id = $1
       RETURNING id, full_name, email`,
      [id]
    );
    
    if (userResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Get vendor application details
    const appResult = await client.query(
      `SELECT business_name FROM vendor_applications WHERE user_id = $1`,
      [id]
    );
    
    const user = userResult.rows[0];
    const businessName = appResult.rows[0]?.business_name || user.full_name;
    
    // Update vendor application
    await client.query(
      `UPDATE vendor_applications 
       SET status = 'approved', reviewed_at = NOW()
       WHERE user_id = $1`,
      [id]
    );
    
    await client.query('COMMIT');
    
    // Send approval email (don't await to not block response)
    sendVendorApprovalEmail(user, businessName).catch(err => 
      console.error('Approval email error:', err)
    );
    
    console.log(`✅ Vendor approved: ${user.email}`);
    
    res.json({
      success: true,
      message: 'Vendor approved successfully',
      vendor: user
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error approving vendor:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to approve vendor'
    });
  } finally {
    client.release();
  }
});

// Reject vendor with email notification
router.put('/vendors/:id/reject', async (req, res) => {
  const client = await pool.connect();
  const { id } = req.params;
  const { reason } = req.body;
  
  try {
    await client.query('BEGIN');
    
    // Get user and vendor details
    const userResult = await client.query(
      `SELECT id, full_name, email FROM users WHERE id = $1`,
      [id]
    );
    
    const appResult = await client.query(
      `SELECT business_name FROM vendor_applications WHERE user_id = $1`,
      [id]
    );
    
    if (userResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const user = userResult.rows[0];
    const businessName = appResult.rows[0]?.business_name || user.full_name;
    
    // Update vendor application
    await client.query(
      `UPDATE vendor_applications 
       SET status = 'rejected', reviewed_at = NOW(), rejection_reason = $1
       WHERE user_id = $2`,
      [reason || 'No reason provided', id]
    );
    
    // Update user
    await client.query(
      `UPDATE users 
       SET is_vendor = false, verified = false, updated_at = NOW()
       WHERE id = $1`,
      [id]
    );
    
    await client.query('COMMIT');
    
    // Send rejection email
    sendVendorRejectionEmail(user, businessName, reason).catch(err => 
      console.error('Rejection email error:', err)
    );
    
    console.log(`✅ Vendor rejected: ID ${id}`);
    
    res.json({
      success: true,
      message: 'Vendor application rejected'
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error rejecting vendor:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to reject vendor'
    });
  } finally {
    client.release();
  }
});

export default router;