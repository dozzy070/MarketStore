// backend/routes/product.routes.js - Integrated Optimized Version
import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import pool from '../db/db.js';

const router = express.Router();

/**
 * Helper to check if a column exists in a table
 */
async function columnExists(client, table, column) {
  try {
    const result = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = $1 AND column_name = $2
      );
    `, [table, column]);
    return result.rows[0].exists;
  } catch (error) {
    console.error(`Error checking column ${column} in ${table}:`, error.message);
    return false;
  }
}

/**
 * GET /api/products/public
 * Get all public products (no auth required) - Optimized version
 */
router.get('/public', async (req, res) => {
  const client = await pool.connect();
  try {
    console.log('📦 Fetching public products...');
    
    // Check if products table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'products'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('Products table does not exist');
      return res.json({ success: true, products: [] });
    }
    
    // Check which columns exist
    const hasStatus = await columnExists(client, 'products', 'status');
    const hasPublished = await columnExists(client, 'products', 'published');
    const hasImageUrl = await columnExists(client, 'products', 'image_url');
    const hasImages = await columnExists(client, 'products', 'images');
    const hasRating = await columnExists(client, 'products', 'rating');
    const hasReviewCount = await columnExists(client, 'products', 'review_count');
    const hasDiscount = await columnExists(client, 'products', 'discount');
    const hasOriginalPrice = await columnExists(client, 'products', 'original_price');
    
    // Build query dynamically based on existing columns
    let query = `
      SELECT 
        p.id,
        p.name,
        p.price,
        p.description,
        p.stock_quantity
    `;
    
    if (hasImageUrl) query += `, p.image_url`;
    else query += `, NULL as image_url`;
    
    if (hasImages) query += `, p.images`;
    else query += `, '[]' as images`;
    
    if (hasRating) query += `, COALESCE(p.rating, 0) as rating`;
    else query += `, 0 as rating`;
    
    if (hasReviewCount) query += `, COALESCE(p.review_count, 0) as review_count`;
    else query += `, 0 as review_count`;
    
    if (hasDiscount) query += `, p.discount`;
    else query += `, 0 as discount`;
    
    if (hasOriginalPrice) query += `, p.original_price as "originalPrice"`;
    else query += `, NULL as "originalPrice"`;
    
    query += `, p.category_id, p.vendor_id, p.created_at`;
    query += `, c.name as category_name, u.full_name as vendor_name`;
    query += ` FROM products p`;
    query += ` LEFT JOIN categories c ON p.category_id = c.id`;
    query += ` LEFT JOIN users u ON p.vendor_id = u.id`;
    query += ` WHERE 1=1`;
    
    // Add status filter if column exists
    if (hasStatus) {
      query += ` AND (p.status = 'published' OR p.status IS NULL)`;
    }
    
    if (hasPublished) {
      query += ` AND (p.published = true OR p.published IS NULL)`;
    }
    
    query += ` ORDER BY p.created_at DESC LIMIT 100`;
    
    const result = await client.query(query);
    console.log(`✅ Found ${result.rows.length} products`);
    
    res.json({
      success: true,
      products: result.rows
    });
  } catch (error) {
    console.error('❌ Error fetching public products:', error);
    res.json({ success: true, products: [] });
  } finally {
    client.release();
  }
});

/**
 * GET /api/products/:id
 * Get single product by ID
 */
router.get('/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    
    // Check if products table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'products'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    // Check which columns exist
    const hasImageUrl = await columnExists(client, 'products', 'image_url');
    const hasImages = await columnExists(client, 'products', 'images');
    const hasRating = await columnExists(client, 'products', 'rating');
    const hasReviewCount = await columnExists(client, 'products', 'review_count');
    const hasDiscount = await columnExists(client, 'products', 'discount');
    const hasOriginalPrice = await columnExists(client, 'products', 'original_price');
    
    let query = `
      SELECT 
        p.id,
        p.name,
        p.price,
        p.description,
        p.stock_quantity
    `;
    
    if (hasImageUrl) query += `, p.image_url`;
    else query += `, NULL as image_url`;
    
    if (hasImages) query += `, p.images`;
    else query += `, '[]' as images`;
    
    if (hasRating) query += `, COALESCE(p.rating, 0) as rating`;
    else query += `, 0 as rating`;
    
    if (hasReviewCount) query += `, COALESCE(p.review_count, 0) as review_count`;
    else query += `, 0 as review_count`;
    
    if (hasDiscount) query += `, p.discount`;
    else query += `, 0 as discount`;
    
    if (hasOriginalPrice) query += `, p.original_price as "originalPrice"`;
    else query += `, NULL as "originalPrice"`;
    
    query += `, p.category_id, p.vendor_id, p.created_at`;
    query += `, c.name as category_name, u.full_name as vendor_name`;
    query += ` FROM products p`;
    query += ` LEFT JOIN categories c ON p.category_id = c.id`;
    query += ` LEFT JOIN users u ON p.vendor_id = u.id`;
    query += ` WHERE p.id = $1`;
    
    const result = await client.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    // Try to get reviews if reviews table exists
    let reviews = [];
    const reviewsTableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'reviews'
      );
    `);
    
    if (reviewsTableCheck.rows[0].exists) {
      const reviewsResult = await client.query(`
        SELECT 
          r.id,
          r.rating,
          r.comment,
          r.created_at,
          u.full_name as user_name
        FROM reviews r
        LEFT JOIN users u ON r.user_id = u.id
        WHERE r.product_id = $1 AND (r.status = 'approved' OR r.status IS NULL)
        ORDER BY r.created_at DESC
        LIMIT 10
      `, [id]);
      reviews = reviewsResult.rows;
    }
    
    res.json({
      success: true,
      product: result.rows[0],
      reviews: reviews
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch product' });
  } finally {
    client.release();
  }
});

/**
 * GET /api/products
 * Get products with filters (for search/category pages)
 */
router.get('/', async (req, res) => {
  const client = await pool.connect();
  try {
    const { category, search, minPrice, maxPrice, sort = 'newest', limit = 20, offset = 0 } = req.query;
    
    // Check if products table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'products'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      return res.json({ success: true, products: [], pagination: { total: 0, limit: 20, offset: 0, pages: 0 } });
    }
    
    const hasStatus = await columnExists(client, 'products', 'status');
    const hasPublished = await columnExists(client, 'products', 'published');
    const hasImageUrl = await columnExists(client, 'products', 'image_url');
    const hasDiscount = await columnExists(client, 'products', 'discount');
    
    let query = `
      SELECT 
        p.id,
        p.name,
        p.price,
        p.description,
        p.stock_quantity
    `;
    
    if (hasImageUrl) query += `, p.image_url`;
    else query += `, NULL as image_url`;
    
    if (hasDiscount) query += `, p.discount`;
    else query += `, 0 as discount`;
    
    query += `, p.category_id, p.vendor_id, p.created_at`;
    query += `, c.name as category_name`;
    query += ` FROM products p`;
    query += ` LEFT JOIN categories c ON p.category_id = c.id`;
    query += ` WHERE 1=1`;
    
    const params = [];
    let paramIndex = 1;
    
    if (category && category !== 'all') {
      query += ` AND p.category_id = $${paramIndex}`;
      params.push(parseInt(category));
      paramIndex++;
    }
    
    if (search) {
      query += ` AND p.name ILIKE $${paramIndex}`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    if (minPrice) {
      query += ` AND p.price >= $${paramIndex}`;
      params.push(parseFloat(minPrice));
      paramIndex++;
    }
    
    if (maxPrice) {
      query += ` AND p.price <= $${paramIndex}`;
      params.push(parseFloat(maxPrice));
      paramIndex++;
    }
    
    // Add status filter if column exists
    if (hasStatus) {
      query += ` AND (p.status = 'published' OR p.status IS NULL)`;
    }
    
    if (hasPublished) {
      query += ` AND (p.published = true OR p.published IS NULL)`;
    }
    
    // Sorting
    switch(sort) {
      case 'price-low':
        query += ` ORDER BY p.price ASC`;
        break;
      case 'price-high':
        query += ` ORDER BY p.price DESC`;
        break;
      case 'rating':
        query += ` ORDER BY p.rating DESC NULLS LAST`;
        break;
      case 'discount':
        query += ` ORDER BY p.discount DESC NULLS LAST`;
        break;
      default:
        query += ` ORDER BY p.created_at DESC`;
    }
    
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(offset));
    
    const result = await client.query(query, params);
    
    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM products p
      WHERE 1=1
    `;
    
    const countParams = [];
    let countIndex = 1;
    
    if (category && category !== 'all') {
      countQuery += ` AND p.category_id = $${countIndex}`;
      countParams.push(parseInt(category));
      countIndex++;
    }
    
    if (search) {
      countQuery += ` AND p.name ILIKE $${countIndex}`;
      countParams.push(`%${search}%`);
      countIndex++;
    }
    
    if (minPrice) {
      countQuery += ` AND p.price >= $${countIndex}`;
      countParams.push(parseFloat(minPrice));
      countIndex++;
    }
    
    if (maxPrice) {
      countQuery += ` AND p.price <= $${countIndex}`;
      countParams.push(parseFloat(maxPrice));
      countIndex++;
    }
    
    if (hasStatus) {
      countQuery += ` AND (p.status = 'published' OR p.status IS NULL)`;
    }
    
    if (hasPublished) {
      countQuery += ` AND (p.published = true OR p.published IS NULL)`;
    }
    
    const countResult = await client.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0]?.total || 0);
    
    res.json({
      success: true,
      products: result.rows,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.json({ success: true, products: [] });
  } finally {
    client.release();
  }
});

/**
 * POST /api/products/:id/review
 * Add a review for a product
 */
router.post('/:id/review', authenticate, async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }
    
    if (!comment || comment.trim().length < 10) {
      return res.status(400).json({ success: false, message: 'Review must be at least 10 characters' });
    }
    
    // Check if user has purchased this product
    const orderCheck = await client.query(`
      SELECT EXISTS (
        SELECT 1 
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        WHERE o.user_id = $1 AND oi.product_id = $2 AND o.status = 'delivered'
      )
    `, [userId, id]);
    
    if (!orderCheck.rows[0].exists) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only review products you have purchased' 
      });
    }
    
    // Check if already reviewed
    const existingReview = await client.query(`
      SELECT id FROM reviews WHERE user_id = $1 AND product_id = $2
    `, [userId, id]);
    
    if (existingReview.rows.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already reviewed this product' 
      });
    }
    
    // Add review
    const result = await client.query(`
      INSERT INTO reviews (user_id, product_id, rating, comment, status, created_at)
      VALUES ($1, $2, $3, $4, 'pending', NOW())
      RETURNING *
    `, [userId, id, rating, comment]);
    
    // Update product rating
    await client.query(`
      UPDATE products 
      SET rating = (
        SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE product_id = $1 AND status = 'approved'
      ),
      review_count = (
        SELECT COUNT(*) FROM reviews WHERE product_id = $1 AND status = 'approved'
      )
      WHERE id = $1
    `, [id]);
    
    res.json({
      success: true,
      message: 'Review submitted successfully',
      review: result.rows[0]
    });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ success: false, message: 'Failed to add review' });
  } finally {
    client.release();
  }
});

export default router;