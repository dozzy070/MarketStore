// backend/routes/reviews.routes.js
import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import pool from '../db/db.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

/**
 * GET /api/reviews
 * Get reviews for a user or product
 */
router.get('/', async (req, res) => {
  const client = await pool.connect();
  try {
    const { user_id, product_id } = req.query;
    
    let query = `
      SELECT 
        r.id,
        r.user_id,
        r.product_id,
        r.rating,
        r.comment,
        r.images,
        r.status,
        r.created_at,
        r.updated_at,
        p.name as product_name,
        p.image_url as product_image,
        u.full_name as user_name
      FROM reviews r
      LEFT JOIN products p ON r.product_id = p.id
      LEFT JOIN users u ON r.user_id = u.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (user_id) {
      query += ` AND r.user_id = $${paramIndex}`;
      params.push(user_id);
      paramIndex++;
    }
    
    if (product_id) {
      query += ` AND r.product_id = $${paramIndex}`;
      params.push(product_id);
      paramIndex++;
    }
    
    query += ` ORDER BY r.created_at DESC`;
    
    const result = await client.query(query, params);
    
    res.json({
      success: true,
      data: result.rows
    });
    
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch reviews' 
    });
  } finally {
    client.release();
  }
});

/**
 * GET /api/reviews/:id
 * Get single review by ID
 */
router.get('/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    
    const result = await client.query(`
      SELECT 
        r.*,
        p.name as product_name,
        p.image_url as product_image,
        u.full_name as user_name
      FROM reviews r
      LEFT JOIN products p ON r.product_id = p.id
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Review not found' 
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
    
  } catch (error) {
    console.error('Error fetching review:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch review' 
    });
  } finally {
    client.release();
  }
});

/**
 * POST /api/reviews
 * Create a new review
 */
router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    const { product_id, rating, comment, images } = req.body;
    const user_id = req.user.id;
    
    // Check if user has purchased this product
    const orderCheck = await client.query(`
      SELECT EXISTS (
        SELECT 1 
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        WHERE o.user_id = $1 AND oi.product_id = $2 AND o.status = 'delivered'
      )
    `, [user_id, product_id]);
    
    if (!orderCheck.rows[0].exists) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only review products you have purchased' 
      });
    }
    
    // Check if already reviewed
    const existingReview = await client.query(`
      SELECT id FROM reviews WHERE user_id = $1 AND product_id = $2
    `, [user_id, product_id]);
    
    if (existingReview.rows.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already reviewed this product' 
      });
    }
    
    // Create review
    const result = await client.query(`
      INSERT INTO reviews (user_id, product_id, rating, comment, images, status, created_at)
      VALUES ($1, $2, $3, $4, $5, 'pending', NOW())
      RETURNING *
    `, [user_id, product_id, rating, comment, images || []]);
    
    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: result.rows[0]
    });
    
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create review' 
    });
  } finally {
    client.release();
  }
});

/**
 * PUT /api/reviews/:id
 * Update a review
 */
router.put('/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { rating, comment, images } = req.body;
    const user_id = req.user.id;
    
    // Check ownership
    const review = await client.query(`
      SELECT * FROM reviews WHERE id = $1 AND user_id = $2
    `, [id, user_id]);
    
    if (review.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Review not found or not owned by you' 
      });
    }
    
    // Update review
    const result = await client.query(`
      UPDATE reviews 
      SET rating = COALESCE($1, rating),
          comment = COALESCE($2, comment),
          images = COALESCE($3, images),
          status = 'pending',
          updated_at = NOW()
      WHERE id = $4
      RETURNING *
    `, [rating, comment, images, id]);
    
    res.json({
      success: true,
      message: 'Review updated successfully',
      data: result.rows[0]
    });
    
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update review' 
    });
  } finally {
    client.release();
  }
});

/**
 * DELETE /api/reviews/:id
 * Delete a review
 */
router.delete('/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    
    // Check ownership
    const review = await client.query(`
      SELECT * FROM reviews WHERE id = $1 AND user_id = $2
    `, [id, user_id]);
    
    if (review.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Review not found or not owned by you' 
      });
    }
    
    // Delete review
    await client.query('DELETE FROM reviews WHERE id = $1', [id]);
    
    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete review' 
    });
  } finally {
    client.release();
  }
});

export default router;