import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/authMiddleware.js';
import pool from '../db/db.js';

const router = express.Router();

/* ================================
   GET USER PROFILE
================================ */
router.get('/profile', authenticate, async (req, res) => {
  let client;
  try {
    console.log('🔍 Fetching profile for user ID:', req.user.id);
    
    client = await pool.connect();
    
    const result = await client.query(
      `SELECT id, full_name, email, phone_number, location, bio, role, created_at, verified
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    console.log('✅ Profile found:', result.rows[0].email);
    
    res.json({ 
      success: true, 
      data: result.rows[0] 
    });
    
  } catch (error) {
    console.error('❌ Get profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch profile',
      error: error.message 
    });
  } finally {
    if (client) client.release();
  }
});

/* ================================
   UPDATE USER PROFILE
================================ */
router.put(
  '/profile',
  authenticate,
  [
    body('full_name').optional().isLength({ min: 2 }).withMessage('Name too short'),
    body('phone_number').optional(),
    body('location').optional().isLength({ min: 2 }),
    body('bio').optional().isString()
  ],
  async (req, res) => {
    let client;
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          errors: errors.array() 
        });
      }

      const { full_name, phone_number, location, bio } = req.body;

      console.log('📝 Updating profile for user:', req.user.id);

      client = await pool.connect();
      
      const result = await client.query(
        `UPDATE users 
         SET full_name = COALESCE($1, full_name),
             phone_number = COALESCE($2, phone_number),
             location = COALESCE($3, location),
             bio = COALESCE($4, bio),
             updated_at = NOW()
         WHERE id = $5
         RETURNING id, full_name, email, phone_number, location, bio, role, verified`,
        [full_name, phone_number, location, bio, req.user.id]
      );

      console.log('✅ Profile updated successfully');
      
      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: result.rows[0]
      });
      
    } catch (error) {
      console.error('❌ Update profile error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to update profile',
        error: error.message 
      });
    } finally {
      if (client) client.release();
    }
  }
);

/* ================================
   GET USER ORDERS
================================ */
router.get('/orders', authenticate, async (req, res) => {
  let client;
  try {
    console.log('📦 Fetching orders for user:', req.user.id);
    
    client = await pool.connect();
    
    const result = await client.query(
      `SELECT 
        o.id,
        o.total,
        o.status,
        o.payment_status,
        o.shipping_address,
        o.tracking_number,
        o.created_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', oi.id,
              'product_id', oi.product_id,
              'product_name', p.name,
              'quantity', oi.quantity,
              'price', oi.price
            )
          ) FILTER (WHERE oi.id IS NOT NULL),
          '[]'::json
        ) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );

    console.log(`✅ Found ${result.rows.length} orders`);
    
    res.json({ 
      success: true, 
      data: result.rows 
    });
    
  } catch (error) {
    console.error('❌ Get user orders error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch orders',
      error: error.message 
    });
  } finally {
    if (client) client.release();
  }
});

/* ================================
   GET USER WISHLIST
================================ */
router.get('/wishlist', authenticate, async (req, res) => {
  let client;
  try {
    console.log('❤️ Fetching wishlist for user:', req.user.id);
    
    client = await pool.connect();
    
    const result = await client.query(
      `SELECT p.* 
       FROM wishlist w
       JOIN products p ON w.product_id = p.id
       WHERE w.user_id = $1
       ORDER BY w.created_at DESC`,
      [req.user.id]
    );

    console.log(`✅ Found ${result.rows.length} wishlist items`);
    
    res.json({ 
      success: true, 
      data: result.rows 
    });
    
  } catch (error) {
    console.error('❌ Get wishlist error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch wishlist',
      error: error.message 
    });
  } finally {
    if (client) client.release();
  }
});

/* ================================
   ADD TO WISHLIST
================================ */
router.post('/wishlist/:productId', authenticate, async (req, res) => {
  let client;
  const { productId } = req.params;
  
  try {
    console.log('➕ Adding to wishlist:', { userId: req.user.id, productId });
    
    client = await pool.connect();
    
    await client.query(
      `INSERT INTO wishlist (user_id, product_id) 
       VALUES ($1, $2) 
       ON CONFLICT (user_id, product_id) DO NOTHING`,
      [req.user.id, productId]
    );

    console.log('✅ Added to wishlist successfully');
    
    res.json({ 
      success: true, 
      message: 'Added to wishlist' 
    });
    
  } catch (error) {
    console.error('❌ Add to wishlist error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to add to wishlist',
      error: error.message 
    });
  } finally {
    if (client) client.release();
  }
});

/* ================================
   REMOVE FROM WISHLIST
================================ */
router.delete('/wishlist/:productId', authenticate, async (req, res) => {
  let client;
  const { productId } = req.params;
  
  try {
    console.log('➖ Removing from wishlist:', { userId: req.user.id, productId });
    
    client = await pool.connect();
    
    await client.query(
      `DELETE FROM wishlist 
       WHERE user_id = $1 AND product_id = $2`,
      [req.user.id, productId]
    );

    console.log('✅ Removed from wishlist successfully');
    
    res.json({ 
      success: true, 
      message: 'Removed from wishlist' 
    });
    
  } catch (error) {
    console.error('❌ Remove from wishlist error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to remove from wishlist',
      error: error.message 
    });
  } finally {
    if (client) client.release();
  }
});

export default router;