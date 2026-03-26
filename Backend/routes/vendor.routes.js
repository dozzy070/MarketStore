// backend/routes/vendorRoutes.js
import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import pool from '../db/db.js';

const router = express.Router();

// Apply authentication to all vendor routes
router.use(authenticate);

/**
 * GET /api/vendor/dashboard/stats
 */
router.get('/dashboard/stats', async (req, res) => {
  const client = await pool.connect();
  try {
    const vendorId = req.user.id;
    
    // Get product count
    const productsResult = await client.query(
      'SELECT COUNT(*) as count FROM products WHERE vendor_id = $1',
      [vendorId]
    );
    
    // Get all product IDs for this vendor
    const productIds = await client.query(
      'SELECT id FROM products WHERE vendor_id = $1',
      [vendorId]
    );
    
    let totalOrders = 0;
    let totalRevenue = 0;
    let pendingOrders = 0;
    
    if (productIds.rows.length > 0) {
      const productIdList = productIds.rows.map(p => p.id);
      const placeholders = productIdList.map((_, i) => `$${i + 1}`).join(',');
      
      const ordersResult = await client.query(`
        SELECT 
          o.id,
          o.status,
          oi.quantity,
          oi.price
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        WHERE oi.product_id IN (${placeholders})
      `, productIdList);
      
      const uniqueOrders = new Set();
      ordersResult.rows.forEach(row => {
        uniqueOrders.add(row.id);
        if (row.status === 'delivered' || row.status === 'completed') {
          totalRevenue += parseFloat(row.price) * row.quantity;
        }
        if (row.status === 'pending') {
          pendingOrders++;
        }
      });
      totalOrders = uniqueOrders.size;
    }
    
    // Get average rating
    const ratingResult = await client.query(`
      SELECT COALESCE(AVG(r.rating), 0) as avg_rating
      FROM reviews r
      JOIN products p ON r.product_id = p.id
      WHERE p.vendor_id = $1
    `, [vendorId]);
    
    // Get low stock products
    const lowStockResult = await client.query(
      'SELECT COUNT(*) as count FROM products WHERE vendor_id = $1 AND stock_quantity < 10 AND stock_quantity > 0',
      [vendorId]
    );
    
    res.json({
      totalProducts: parseInt(productsResult.rows[0]?.count || 0),
      totalOrders: totalOrders,
      totalRevenue: totalRevenue,
      averageRating: parseFloat(ratingResult.rows[0]?.avg_rating || 0),
      pendingOrders: pendingOrders,
      lowStockProducts: parseInt(lowStockResult.rows[0]?.count || 0)
    });
    
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.json({
      totalProducts: 0,
      totalOrders: 0,
      totalRevenue: 0,
      averageRating: 0,
      pendingOrders: 0,
      lowStockProducts: 0
    });
  } finally {
    client.release();
  }
});

/**
 * GET /api/vendor/analytics
 */
router.get('/analytics', async (req, res) => {
  const client = await pool.connect();
  try {
    const vendorId = req.user.id;
    const { period = '30days' } = req.query;
    
    let days = 30;
    if (period === '7days') days = 7;
    else if (period === '90days') days = 90;
    
    const productIds = await client.query(
      'SELECT id FROM products WHERE vendor_id = $1',
      [vendorId]
    );
    
    if (productIds.rows.length === 0) {
      const dates = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push({
          date: date.toISOString().split('T')[0],
          total: 0
        });
      }
      return res.json(dates);
    }
    
    const productIdList = productIds.rows.map(p => p.id);
    const placeholders = productIdList.map((_, i) => `$${i + 1}`).join(',');
    
    const result = await client.query(`
      SELECT 
        DATE(o.created_at) as date,
        COALESCE(SUM(oi.price * oi.quantity), 0) as total
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      WHERE oi.product_id IN (${placeholders})
        AND o.created_at >= NOW() - INTERVAL '${days} days'
        AND o.status = 'delivered'
      GROUP BY DATE(o.created_at)
      ORDER BY date ASC
    `, productIdList);
    
    res.json(result.rows);
    
  } catch (error) {
    console.error('Analytics error:', error);
    res.json([]);
  } finally {
    client.release();
  }
});

/**
 * GET /api/vendor/orders
 */
router.get('/orders', async (req, res) => {
  const client = await pool.connect();
  try {
    const vendorId = req.user.id;
    
    const productIds = await client.query(
      'SELECT id FROM products WHERE vendor_id = $1',
      [vendorId]
    );
    
    if (productIds.rows.length === 0) {
      return res.json([]);
    }
    
    const productIdList = productIds.rows.map(p => p.id);
    const placeholders = productIdList.map((_, i) => `$${i + 1}`).join(',');
    
    const result = await client.query(`
      SELECT 
        o.id,
        o.total,
        o.status,
        o.created_at,
        o.payment_status,
        u.full_name as customer_name,
        u.email as customer_email,
        json_agg(
          json_build_object(
            'product_id', p.id,
            'product_name', p.name,
            'quantity', oi.quantity,
            'price', oi.price,
            'image_url', p.image_url
          )
        ) as items
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE oi.product_id IN (${placeholders})
      GROUP BY o.id, u.full_name, u.email, o.total, o.status, o.created_at, o.payment_status
      ORDER BY o.created_at DESC
      LIMIT 50
    `, productIdList);
    
    res.json(result.rows);
    
  } catch (error) {
    console.error('Orders fetch error:', error);
    res.json([]);
  } finally {
    client.release();
  }
});

/**
 * PUT /api/vendor/orders/:id/status
 */
router.put('/orders/:id/status', async (req, res) => {
  const client = await pool.connect();
  try {
    const { status } = req.body;
    const orderId = req.params.id;
    const vendorId = req.user.id;
    
    const verifyResult = await client.query(`
      SELECT EXISTS (
        SELECT 1 
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = $1 AND p.vendor_id = $2
      )
    `, [orderId, vendorId]);
    
    if (!verifyResult.rows[0].exists) {
      return res.status(403).json({ error: 'You do not have permission to update this order' });
    }
    
    const result = await client.query(`
      UPDATE orders 
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `, [status, orderId]);
    
    res.json(result.rows[0]);
    
  } catch (error) {
    console.error('Order status update error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  } finally {
    client.release();
  }
});

/**
 * GET /api/vendor/products
 */
router.get('/products', async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT 
        p.id,
        p.name,
        p.price,
        p.description,
        p.stock_quantity,
        p.image_url,
        p.status,
        p.published,
        p.created_at,
        c.name as category_name,
        c.id as category_id
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.vendor_id = $1
      ORDER BY p.created_at DESC
    `, [req.user.id]);
    
    res.json(result.rows);
    
  } catch (error) {
    console.error('Products fetch error:', error);
    res.json([]);
  } finally {
    client.release();
  }
});

/**
 * GET /api/vendor/profile
 */
router.get('/profile', async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT 
        u.id,
        u.full_name,
        u.email,
        u.phone_number,
        u.location,
        u.bio,
        u.verified,
        u.created_at
      FROM users u
      WHERE u.id = $1
    `, [req.user.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const businessResult = await client.query(`
      SELECT business_name, description, status
      FROM vendor_applications
      WHERE user_id = $1
    `, [req.user.id]);
    
    const profile = result.rows[0];
    if (businessResult.rows.length > 0) {
      profile.business_name = businessResult.rows[0].business_name;
      profile.description = businessResult.rows[0].description;
      profile.vendor_status = businessResult.rows[0].status;
    }
    
    res.json(profile);
    
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  } finally {
    client.release();
  }
});

/**
 * PUT /api/vendor/profile
 */
router.put('/profile', async (req, res) => {
  const client = await pool.connect();
  try {
    const { full_name, phone_number, location, bio } = req.body;
    
    const result = await client.query(`
      UPDATE users 
      SET full_name = COALESCE($1, full_name),
          phone_number = COALESCE($2, phone_number),
          location = COALESCE($3, location),
          bio = COALESCE($4, bio),
          updated_at = NOW()
      WHERE id = $5
      RETURNING id, full_name, email, phone_number, location, bio
    `, [full_name, phone_number, location, bio, req.user.id]);
    
    res.json(result.rows[0]);
    
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  } finally {
    client.release();
  }
});

export default router;