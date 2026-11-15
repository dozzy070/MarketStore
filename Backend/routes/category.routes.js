import express from 'express';
import { authenticate, isAdmin } from '../middleware/authMiddleware.js';
import pool from '../db/db.js';
import { ensureStoreSchema } from '../models/store.model.js';

const router = express.Router();
let categorySchemaPromise;

const ensureCategorySchema = async () => {
  if (!categorySchemaPromise) {
    categorySchemaPromise = pool.query(`
      ALTER TABLE categories
        ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active',
        ADD COLUMN IF NOT EXISTS icon TEXT,
        ADD COLUMN IF NOT EXISTS requested_by INTEGER
    `).then(() => undefined).catch((error) => {
      categorySchemaPromise = undefined;
      throw error;
    });
  }
  await categorySchemaPromise;
};

const adminOnly = [authenticate, isAdmin];

const getProductVisibilityFilters = async (client) => {
  const result = await client.query(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'products'
      AND column_name IN ('status', 'published')
  `);
  const columns = new Set(result.rows.map((row) => row.column_name));
  const filters = [];
  if (columns.has('status')) filters.push(`(p.status = 'published' OR p.status IS NULL)`);
  if (columns.has('published')) filters.push(`(p.published = true OR p.published IS NULL)`);
  return filters.length ? `AND ${filters.join(' AND ')}` : '';
};

const getApprovedVendorFilter = `
  AND EXISTS (
    SELECT 1
    FROM users u
    INNER JOIN vendor_stores vs ON vs.vendor_id = u.id AND vs.status = 'active'
    LEFT JOIN LATERAL (
      SELECT status
      FROM vendor_applications
      WHERE user_id = u.id
      ORDER BY created_at DESC
      LIMIT 1
    ) va ON true
    WHERE u.id = p.vendor_id
      AND (u.role = 'vendor' OR u.is_vendor = true)
      AND COALESCE(va.status, CASE WHEN u.verified THEN 'approved' ELSE 'pending' END) = 'approved'
  )
`;

router.get('/admin/all', ...adminOnly, async (req, res) => {
  try {
    await ensureCategorySchema();
    const result = await pool.query(`
      SELECT
        c.*,
        u.full_name AS requested_by_name,
        (SELECT COUNT(*)::int FROM products p WHERE p.category_id = c.id) AS product_count
      FROM categories c
      LEFT JOIN users u ON u.id = c.requested_by
      ORDER BY CASE WHEN c.status = 'pending' THEN 0 ELSE 1 END, c.name ASC
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Failed to fetch admin categories:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
});

router.patch('/admin/:id/status', ...adminOnly, async (req, res) => {
  const { status } = req.body;
  if (!['active', 'pending', 'rejected'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid category status' });
  }
  try {
    await ensureCategorySchema();
    const result = await pool.query(
      `UPDATE categories SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, req.params.id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Failed to update category status:', error);
    res.status(500).json({ success: false, message: 'Failed to update category status' });
  }
});

router.post('/admin', ...adminOnly, async (req, res) => {
  const { name, description, image_url, icon } = req.body;
  if (typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Category name is required' });
  }
  try {
    await ensureCategorySchema();
    const result = await pool.query(`
      INSERT INTO categories (name, description, image_url, icon, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, 'active', NOW(), NOW())
      RETURNING *
    `, [name.trim(), description || null, image_url || null, icon || null]);
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Failed to create category:', error);
    res.status(500).json({ success: false, message: 'Failed to create category' });
  }
});

router.put('/admin/:id', ...adminOnly, async (req, res) => {
  const { name, description, image_url, icon } = req.body;
  if (name !== undefined && (typeof name !== 'string' || !name.trim())) {
    return res.status(400).json({ success: false, message: 'Category name cannot be empty' });
  }
  try {
    await ensureCategorySchema();
    const result = await pool.query(`
      UPDATE categories
      SET name = COALESCE($1, name),
          description = COALESCE($2, description),
          image_url = COALESCE($3, image_url),
          icon = COALESCE($4, icon),
          updated_at = NOW()
      WHERE id = $5
      RETURNING *
    `, [name?.trim() || null, description ?? null, image_url ?? null, icon ?? null, req.params.id]);
    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Failed to update category:', error);
    res.status(500).json({ success: false, message: 'Failed to update category' });
  }
});

router.delete('/admin/:id', ...adminOnly, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM categories WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    if (error.code === '23503') {
      return res.status(400).json({ success: false, message: 'Cannot delete a category with existing products' });
    }
    console.error('Failed to delete category:', error);
    res.status(500).json({ success: false, message: 'Failed to delete category' });
  }
});

router.get('/', async (req, res) => {
  try {
    await ensureCategorySchema();
    const result = await pool.query(
      `SELECT * FROM categories WHERE status = 'active' ORDER BY name ASC`
    );
    res.json({ success: true, data: result.rows, count: result.rows.length });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
});

router.get('/:id/products', async (req, res) => {
  let client;
  try {
    await ensureCategorySchema();
    await ensureStoreSchema();
    client = await pool.connect();
    const productFilters = await getProductVisibilityFilters(client);
    const result = await client.query(`
      SELECT p.*
      FROM products p
      INNER JOIN categories c ON c.id = p.category_id AND c.status = 'active'
      WHERE p.category_id = $1
        ${productFilters}
        ${getApprovedVendorFilter}
      ORDER BY p.created_at DESC
    `, [req.params.id]);
    res.json({ success: true, data: result.rows, count: result.rows.length });
  } catch (error) {
    console.error('Error fetching category products:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  } finally {
    client?.release();
  }
});

router.get('/:id', async (req, res) => {
  try {
    await ensureCategorySchema();
    const result = await pool.query(
      `SELECT * FROM categories WHERE id = $1 AND status = 'active'`,
      [req.params.id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch category' });
  }
});

router.post('/', ...adminOnly, async (req, res) => {
  const { name, description, image_url, icon } = req.body;
  if (typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Category name is required' });
  }
  try {
    await ensureCategorySchema();
    const result = await pool.query(`
      INSERT INTO categories (name, description, image_url, icon, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, 'active', NOW(), NOW())
      RETURNING *
    `, [name.trim(), description || null, image_url || null, icon || null]);
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ success: false, message: 'Failed to create category' });
  }
});

router.put('/:id', ...adminOnly, async (req, res) => {
  const { name, description, image_url, icon } = req.body;
  if (name !== undefined && (typeof name !== 'string' || !name.trim())) {
    return res.status(400).json({ success: false, message: 'Category name cannot be empty' });
  }
  try {
    await ensureCategorySchema();
    const result = await pool.query(`
      UPDATE categories
      SET name = COALESCE($1, name),
          description = COALESCE($2, description),
          image_url = COALESCE($3, image_url),
          icon = COALESCE($4, icon),
          updated_at = NOW()
      WHERE id = $5
      RETURNING *
    `, [name?.trim() || null, description ?? null, image_url ?? null, icon ?? null, req.params.id]);
    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ success: false, message: 'Failed to update category' });
  }
});

router.delete('/:id', ...adminOnly, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM categories WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    if (error.code === '23503') {
      return res.status(400).json({ success: false, message: 'Cannot delete a category with existing products' });
    }
    console.error('Error deleting category:', error);
    res.status(500).json({ success: false, message: 'Failed to delete category' });
  }
});

export default router;
