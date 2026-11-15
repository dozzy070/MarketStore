// backend/routes/reviews.routes.js
import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import pool from '../db/db.js';

const router = express.Router();

// ─────────────────────────────────────────────
// Admin guard (self-contained — no separate file needed)
// ─────────────────────────────────────────────
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

// ═════════════════════════════════════════════
// PUBLIC — landing page testimonials
// Only featured + approved reviews appear here
// ═════════════════════════════════════════════
router.get('/featured', async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT
        r.id,
        r.rating,
        r.comment,
        r.created_at,
        u.full_name AS user_name,
        p.name AS product_name
      FROM reviews r
      INNER JOIN products p ON p.id = r.product_id
      INNER JOIN users u ON u.id = r.user_id
      WHERE r.status = 'approved'
        AND r.is_featured = TRUE
        AND r.comment IS NOT NULL
        AND BTRIM(r.comment) <> ''
      ORDER BY r.featured_order ASC NULLS LAST, r.created_at DESC
      LIMIT 12
    `);

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching featured reviews:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch featured reviews' });
  } finally {
    client.release();
  }
});

// ─────────────────────────────────────────────
// Everything below requires authentication
// ─────────────────────────────────────────────
router.use(authenticate);

// ═════════════════════════════════════════════
// ADMIN ROUTES  (must stay before /:id !)
// ═════════════════════════════════════════════

/**
 * GET /api/reviews/admin/all
 * Optional query: ?status=pending|approved|rejected
 */
router.get('/admin/all', requireAdmin, async (req, res) => {
  const client = await pool.connect();
  try {
    const { status } = req.query;

    let query = `
      SELECT
        r.id,
        r.user_id,
        r.product_id,
        r.rating,
        r.comment,
        r.status,
        r.is_featured,
        r.featured_order,
        r.created_at,
        u.full_name AS user_name,
        p.name      AS product_name,
        p.image_url AS product_image
      FROM reviews r
      LEFT JOIN users u    ON u.id = r.user_id
      LEFT JOIN products p ON p.id = r.product_id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      params.push(status);
      query += ` AND r.status = $${params.length}`;
    }

    query += ` ORDER BY r.is_featured DESC, r.created_at DESC`;

    const result = await client.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching all reviews (admin):', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
  } finally {
    client.release();
  }
});

/**
 * PATCH /api/reviews/admin/:id/feature
 * Body: { is_featured: true | false, featured_order?: number }
 */
router.patch('/admin/:id/feature', requireAdmin, async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { is_featured, featured_order } = req.body;

    if (typeof is_featured !== 'boolean') {
      return res.status(400).json({ success: false, message: 'is_featured must be true or false' });
    }
    if (featured_order !== undefined && !Number.isInteger(featured_order)) {
      return res.status(400).json({ success: false, message: 'featured_order must be an integer' });
    }

    // Block featuring a review that hasn't been approved yet
    if (is_featured) {
      const check = await client.query(`SELECT status FROM reviews WHERE id = $1`, [id]);
      if (check.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Review not found' });
      }
      if (check.rows[0].status !== 'approved') {
        return res.status(400).json({
          success: false,
          message: 'Approve the review first, then feature it.',
        });
      }
    }

    // COALESCE keeps the existing order if the client only sends is_featured
    const result = await client.query(
      `UPDATE reviews
         SET is_featured = $1,
             featured_order = COALESCE($2, featured_order, 0),
             updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [is_featured, featured_order ?? null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    res.json({
      success: true,
      message: is_featured ? 'Review featured on landing page' : 'Review removed from landing page',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error toggling featured review:', error);
    res.status(500).json({ success: false, message: 'Failed to update review' });
  } finally {
    client.release();
  }
});

/**
 * PATCH /api/reviews/admin/:id/status
 * Body: { status: 'approved' | 'pending' | 'rejected' }
 */
router.patch('/admin/:id/status', requireAdmin, async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ['approved', 'pending', 'rejected'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: `status must be one of: ${allowed.join(', ')}` });
    }

    const result = await client.query(
      `UPDATE reviews
         SET status = $1,
             is_featured = CASE WHEN $1::text = 'rejected' THEN FALSE ELSE is_featured END,
             updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    res.json({ success: true, message: `Review ${status}`, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating review status:', error);
    res.status(500).json({ success: false, message: 'Failed to update review' });
  } finally {
    client.release();
  }
});

/**
 * DELETE /api/reviews/admin/:id
 */
router.delete('/admin/:id', requireAdmin, async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const result = await client.query(`DELETE FROM reviews WHERE id = $1 RETURNING id`, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    console.error('Error deleting review (admin):', error);
    res.status(500).json({ success: false, message: 'Failed to delete review' });
  } finally {
    client.release();
  }
});

// ═════════════════════════════════════════════
// USER ROUTES
// ═════════════════════════════════════════════

/**
 * GET /api/reviews?user_id=&product_id=
 * Only admins and the review's author can see non-approved reviews.
 */
router.get('/', async (req, res) => {
  const client = await pool.connect();
  try {
    const { user_id, product_id } = req.query;
    const isAdmin = req.user.role === 'admin';
    const isOwn   = user_id && String(user_id) === String(req.user.id);

    let query = `
      SELECT r.id, r.user_id, r.product_id, r.rating, r.comment, r.images,
             r.status, r.created_at, r.updated_at,
             p.name AS product_name, p.image_url AS product_image,
             u.full_name AS user_name
      FROM reviews r
      LEFT JOIN products p ON r.product_id = p.id
      LEFT JOIN users u ON r.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (user_id)    { params.push(user_id);    query += ` AND r.user_id = $${params.length}`; }
    if (product_id) { params.push(product_id); query += ` AND r.product_id = $${params.length}`; }

    // Anyone other than an admin looking at someone else's reviews
    // (or looking at product reviews) only sees approved ones.
    if (!isAdmin && !isOwn) {
      query += ` AND r.status = 'approved'`;
    }

    query += ` ORDER BY r.created_at DESC`;

    const result = await client.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
  } finally {
    client.release();
  }
});

router.get('/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT r.*, p.name AS product_name, p.image_url AS product_image,
             u.full_name AS user_name
      FROM reviews r
      LEFT JOIN products p ON r.product_id = p.id
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.id = $1
    `, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const review = result.rows[0];
    const isAdmin = req.user.role === 'admin';
    const isOwner = String(review.user_id) === String(req.user.id);

    if (!isAdmin && !isOwner && review.status !== 'approved') {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    res.json({ success: true, data: review });
  } catch (error) {
    console.error('Error fetching review:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch review' });
  } finally {
    client.release();
  }
});

router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    const { product_id, rating, comment, images } = req.body;
    const user_id = req.user.id;
    const ratingNum = Number(rating);

    if (!product_id || !Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({
        success: false,
        message: 'product_id and a rating between 1 and 5 are required',
      });
    }

    const orderCheck = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        WHERE o.user_id = $1 AND oi.product_id = $2 AND o.status = 'delivered'
      )
    `, [user_id, product_id]);

    if (!orderCheck.rows[0].exists) {
      return res.status(403).json({ success: false, message: 'You can only review products you have purchased' });
    }

    const existing = await client.query(
      `SELECT id FROM reviews WHERE user_id = $1 AND product_id = $2`,
      [user_id, product_id]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
    }

    const result = await client.query(`
      INSERT INTO reviews (user_id, product_id, rating, comment, images, status, created_at)
      VALUES ($1, $2, $3, $4, $5, 'pending', NOW())
      RETURNING *
    `, [user_id, product_id, ratingNum, comment, images || []]);

    res.status(201).json({ success: true, message: 'Review submitted successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ success: false, message: 'Failed to create review' });
  } finally {
    client.release();
  }
});

router.put('/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { rating, comment, images } = req.body;
    const user_id = req.user.id;

    if (rating !== undefined) {
      const ratingNum = Number(rating);
      if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        return res.status(400).json({ success: false, message: 'rating must be between 1 and 5' });
      }
    }

    const review = await client.query(`SELECT * FROM reviews WHERE id = $1 AND user_id = $2`, [id, user_id]);
    if (review.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Review not found or not owned by you' });
    }

    const result = await client.query(`
      UPDATE reviews
         SET rating = COALESCE($1, rating),
             comment = COALESCE($2, comment),
             images = COALESCE($3, images),
             status = 'pending',
             updated_at = NOW()
       WHERE id = $4
       RETURNING *
    `, [rating ?? null, comment ?? null, images ?? null, id]);

    res.json({ success: true, message: 'Review updated successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ success: false, message: 'Failed to update review' });
  } finally {
    client.release();
  }
});

router.delete('/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const review = await client.query(`SELECT * FROM reviews WHERE id = $1 AND user_id = $2`, [id, user_id]);
    if (review.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Review not found or not owned by you' });
    }

    await client.query('DELETE FROM reviews WHERE id = $1', [id]);
    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ success: false, message: 'Failed to delete review' });
  } finally {
    client.release();
  }
});

export default router;