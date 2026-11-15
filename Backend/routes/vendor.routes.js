// backend/routes/vendorRoutes.js
import express from 'express';
import multer from 'multer';
import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { fileURLToPath } from 'url';
import { authenticate, isVendor } from '../middleware/authMiddleware.js';
import pool from '../db/db.js';
import { ensureStoreSchema, getVendorStore } from '../models/store.model.js';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const storeUploadDirectory = path.join(__dirname, '..', 'uploads', 'stores');
const imageExtensions = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp'
};
const storeImageStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    fs.mkdir(storeUploadDirectory, { recursive: true })
      .then(() => callback(null, storeUploadDirectory), callback);
  },
  filename: (req, file, callback) => {
    callback(null, `${req.user.id}-${randomUUID()}${imageExtensions[file.mimetype]}`);
  }
});

const createStoreImageUpload = (fieldName, maxFileSize) => {
  const upload = multer({
    storage: storeImageStorage,
    limits: { fileSize: maxFileSize },
    fileFilter: (req, file, callback) => {
      if (!imageExtensions[file.mimetype]) {
        return callback(new Error('Only JPEG, PNG, and WebP images are allowed.'));
      }
      callback(null, true);
    }
  }).single(fieldName);

  return (req, res, next) => {
    upload(req, res, (error) => {
      if (error) {
        return res.status(400).json({ success: false, message: error.message });
      }
      next();
    });
  };
};

// Apply authentication to all vendor routes
router.use(authenticate, isVendor);

router.get('/store', async (req, res) => {
  let client;
  try {
    if (req.user.role !== 'vendor') {
      return res.status(403).json({ success: false, message: 'Vendor access is required' });
    }

    await ensureStoreSchema();
    client = await pool.connect();
    const store = await getVendorStore(client, req.user.id);
    if (!store) {
      return res.status(404).json({ success: false, message: 'Vendor store not found' });
    }

    res.json({ success: true, data: store });
  } catch (error) {
    console.error('Failed to fetch vendor store:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch store' });
  } finally {
    client?.release();
  }
});

router.put('/store', async (req, res) => {
  let client;
  try {
    if (req.user.role !== 'vendor') {
      return res.status(403).json({ success: false, message: 'Vendor access is required' });
    }

    const { store_name: storeName } = req.body;
    if (typeof storeName !== 'string' || !storeName.trim()) {
      return res.status(400).json({ success: false, message: 'Store name is required' });
    }

    await ensureStoreSchema();
    client = await pool.connect();
    await client.query(`
      INSERT INTO vendor_stores (
        vendor_id, store_name, tagline, store_description, store_logo, store_banner,
        store_email, store_phone, store_address, store_website, social_media,
        shipping_policy, payment_methods, established, business_hours, status, slug, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb, $12, $13::jsonb, $14, $15::jsonb,
        'draft',
        COALESCE(
          NULLIF(TRIM(BOTH '-' FROM REGEXP_REPLACE(LOWER($2), '[^a-z0-9]+', '-', 'g')), ''),
          'store'
        ) || '-' || $1::text,
        NOW()
      )
      ON CONFLICT (vendor_id) DO UPDATE SET
        store_name = EXCLUDED.store_name,
        tagline = EXCLUDED.tagline,
        store_description = EXCLUDED.store_description,
        store_logo = EXCLUDED.store_logo,
        store_banner = EXCLUDED.store_banner,
        store_email = EXCLUDED.store_email,
        store_phone = EXCLUDED.store_phone,
        store_address = EXCLUDED.store_address,
        store_website = EXCLUDED.store_website,
        social_media = EXCLUDED.social_media,
        shipping_policy = EXCLUDED.shipping_policy,
        payment_methods = EXCLUDED.payment_methods,
        established = EXCLUDED.established,
        business_hours = EXCLUDED.business_hours,
        slug = COALESCE(NULLIF(BTRIM(vendor_stores.slug), ''), EXCLUDED.slug),
        updated_at = NOW()
    `, [
      req.user.id,
      storeName.trim(),
      req.body.tagline || null,
      req.body.store_description || null,
      req.body.store_logo || null,
      req.body.store_banner || null,
      req.body.store_email || null,
      req.body.store_phone || null,
      req.body.store_address || null,
      req.body.store_website || null,
      JSON.stringify(req.body.social_media || {}),
      req.body.shipping_policy || null,
      JSON.stringify(Array.isArray(req.body.payment_methods) ? req.body.payment_methods : []),
      req.body.established || null,
      JSON.stringify(req.body.business_hours || {})
    ]);

    const store = await getVendorStore(client, req.user.id);
    res.json({ success: true, message: 'Store updated successfully', data: store });
  } catch (error) {
    console.error('Failed to update vendor store:', error);
    res.status(500).json({ success: false, message: 'Failed to update store' });
  } finally {
    client?.release();
  }
});

const handleStoreImageUpload = (fieldName, columnName) => async (req, res) => {
  if (req.user.role !== 'vendor') {
    if (req.file) await fs.unlink(req.file.path).catch((error) =>
      console.error('Failed to remove unauthorized store image:', error)
    );
    return res.status(403).json({ success: false, message: 'Vendor access is required' });
  }
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'An image file is required' });
  }

  let client;
  try {
    await ensureStoreSchema();
    client = await pool.connect();
    const backendUrl = process.env.BACKEND_URL || process.env.API_URL || `${req.protocol}://${req.get('host')}`;
    const imageUrl = new URL(`/uploads/stores/${req.file.filename}`, backendUrl).toString();
    const result = await client.query(
      `UPDATE vendor_stores
       SET ${columnName} = $2, updated_at = NOW()
       WHERE vendor_id = $1
       RETURNING vendor_id`,
      [req.user.id, imageUrl]
    );
    if (!result.rows.length) {
      await fs.unlink(req.file.path);
      return res.status(404).json({ success: false, message: 'Store not found. Save your store details first.' });
    }

    const store = await getVendorStore(client, req.user.id);
    res.json({ success: true, message: 'Store image updated successfully', data: store });
  } catch (error) {
    if (req.file) {
      await fs.unlink(req.file.path).catch((cleanupError) =>
        console.error('Failed to remove unsuccessful store image upload:', cleanupError)
      );
    }
    console.error('Failed to update store image:', error);
    res.status(500).json({ success: false, message: 'Failed to update store image' });
  } finally {
    client?.release();
  }
};

router.put('/store/logo', createStoreImageUpload('logo', 2 * 1024 * 1024), handleStoreImageUpload('logo', 'store_logo'));
router.put('/store/banner', createStoreImageUpload('banner', 5 * 1024 * 1024), handleStoreImageUpload('banner', 'store_banner'));

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