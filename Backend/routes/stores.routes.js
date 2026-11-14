import express from 'express';
import pool from '../db/db.js';
import { ensureStoreSchema } from '../models/store.model.js';

const router = express.Router();

const getProductVisibilityFilters = async (client, alias = 'p') => {
  const columns = await client.query(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'products'
      AND column_name IN ('status', 'published')
  `);
  const availableColumns = new Set(columns.rows.map((row) => row.column_name));
  const filters = [];

  if (availableColumns.has('status')) {
    filters.push(`(${alias}.status = 'published' OR ${alias}.status IS NULL)`);
  }
  if (availableColumns.has('published')) {
    filters.push(`(${alias}.published = true OR ${alias}.published IS NULL)`);
  }

  return filters.length ? `AND ${filters.join(' AND ')}` : '';
};

const getStoreQuery = (productFilters) => `
  SELECT
    u.id,
    COALESCE(NULLIF(BTRIM(vs.store_name), ''), NULLIF(BTRIM(va.business_name), ''), u.full_name) AS name,
    COALESCE(NULLIF(BTRIM(vs.store_description), ''), NULLIF(BTRIM(va.description), ''), u.store_description, u.bio, '') AS description,
    COALESCE(vs.store_logo, '') AS logo_url,
    COALESCE(vs.store_banner, '') AS cover_url,
    COALESCE(NULLIF(vs.store_address, ''), va.business_address, '') AS location,
    COALESCE(NULLIF(vs.store_email, ''), '') AS email,
    COALESCE(NULLIF(vs.store_phone, ''), va.business_phone, '') AS phone,
    COALESCE(vs.store_website, '') AS website_url,
    COALESCE(vs.shipping_policy, '') AS shipping_policy,
    COALESCE(vs.social_media, '{}'::jsonb) AS social_media,
    COALESCE(vs.payment_methods, '[]'::jsonb) AS payment_methods,
    COALESCE(vs.business_hours, '{}'::jsonb) AS business_hours,
    COALESCE(va.status = 'approved', u.verified, false) AS verified,
    u.created_at AS joined_date,
    (
      SELECT COUNT(*)
      FROM products p
      WHERE p.vendor_id = u.id ${productFilters}
    )::int AS product_count,
    (
      SELECT COUNT(DISTINCT o.id)
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      JOIN products p ON p.id = oi.product_id
      WHERE p.vendor_id = u.id
        AND o.status IN ('delivered', 'completed')
    )::int AS completed_order_count,
    COALESCE((
      SELECT AVG(r.rating)
      FROM reviews r
      JOIN products p ON p.id = r.product_id
      WHERE p.vendor_id = u.id AND r.status = 'approved'
    ), 0)::numeric(4, 2) AS rating,
    (
      SELECT COUNT(*)
      FROM reviews r
      JOIN products p ON p.id = r.product_id
      WHERE p.vendor_id = u.id AND r.status = 'approved'
    )::int AS review_count
  FROM users u
  LEFT JOIN LATERAL (
    SELECT business_name, description, business_phone, business_address, status
    FROM vendor_applications
    WHERE user_id = u.id
    ORDER BY created_at DESC
    LIMIT 1
  ) va ON true
  LEFT JOIN vendor_stores vs ON vs.vendor_id = u.id
  WHERE (u.role = 'vendor' OR u.is_vendor = true)
    AND COALESCE(va.status, CASE WHEN u.verified THEN 'approved' ELSE 'pending' END) = 'approved'
`;

router.get('/', async (req, res) => {
  let client;
  try {
    await ensureStoreSchema();
    const requestedLimit = Number.parseInt(req.query.limit, 10);
    const limit = Number.isInteger(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 100) : 100;
    client = await pool.connect();
    const productFilters = await getProductVisibilityFilters(client);
    const stores = await client.query(
      `${getStoreQuery(productFilters)} ORDER BY rating DESC, name ASC LIMIT $1`,
      [limit]
    );
    const stats = await client.query(`
      SELECT
        COUNT(*)::int AS total_stores,
        COUNT(*) FILTER (WHERE COALESCE(va.status = 'approved', u.verified, false))::int AS verified_stores,
        COALESCE(SUM((
          SELECT COUNT(*)
          FROM products p
          WHERE p.vendor_id = u.id ${productFilters}
        )), 0)::int AS total_products,
        (
          SELECT COUNT(DISTINCT o.id)
          FROM orders o
          JOIN order_items oi ON oi.order_id = o.id
          JOIN products p ON p.id = oi.product_id
          JOIN users ou ON ou.id = p.vendor_id
          LEFT JOIN LATERAL (
            SELECT status
            FROM vendor_applications
            WHERE user_id = ou.id
            ORDER BY created_at DESC
            LIMIT 1
          ) ova ON true
          WHERE o.status IN ('delivered', 'completed')
            AND (ou.role = 'vendor' OR ou.is_vendor = true)
            AND COALESCE(ova.status, CASE WHEN ou.verified THEN 'approved' ELSE 'pending' END) = 'approved'
        )::int AS total_completed_orders,
        COALESCE((
          SELECT AVG(r.rating)
          FROM reviews r
          JOIN products p ON p.id = r.product_id
          JOIN users ru ON ru.id = p.vendor_id
          LEFT JOIN LATERAL (
            SELECT status
            FROM vendor_applications
            WHERE user_id = ru.id
            ORDER BY created_at DESC
            LIMIT 1
          ) rva ON true
          WHERE r.status = 'approved'
            AND (ru.role = 'vendor' OR ru.is_vendor = true)
            AND COALESCE(rva.status, CASE WHEN ru.verified THEN 'approved' ELSE 'pending' END) = 'approved'
        ), 0)::numeric(4, 2) AS average_rating,
        (
          SELECT COUNT(*)
          FROM reviews r
          JOIN products p ON p.id = r.product_id
          JOIN users ru ON ru.id = p.vendor_id
          LEFT JOIN LATERAL (
            SELECT status
            FROM vendor_applications
            WHERE user_id = ru.id
            ORDER BY created_at DESC
            LIMIT 1
          ) rva ON true
          WHERE r.status = 'approved'
            AND (ru.role = 'vendor' OR ru.is_vendor = true)
            AND COALESCE(rva.status, CASE WHEN ru.verified THEN 'approved' ELSE 'pending' END) = 'approved'
        )::int AS total_reviews
      FROM users u
      LEFT JOIN LATERAL (
        SELECT status
        FROM vendor_applications
        WHERE user_id = u.id
        ORDER BY created_at DESC
        LIMIT 1
      ) va ON true
      WHERE (u.role = 'vendor' OR u.is_vendor = true)
        AND COALESCE(va.status, CASE WHEN u.verified THEN 'approved' ELSE 'pending' END) = 'approved'
    `);

    res.json({
      success: true,
      data: stores.rows,
      stats: stats.rows[0]
    });
  } catch (error) {
    console.error('Failed to fetch public stores:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stores' });
  } finally {
    client?.release();
  }
});

router.get('/:id', async (req, res) => {
  const vendorId = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(vendorId) || vendorId < 1) {
    return res.status(400).json({ success: false, message: 'Invalid store ID' });
  }

  let client;
  try {
    await ensureStoreSchema();
    client = await pool.connect();
    const productFilters = await getProductVisibilityFilters(client);
    const storeResult = await client.query(
      `${getStoreQuery(productFilters)} AND u.id = $1 LIMIT 1`,
      [vendorId]
    );

    if (!storeResult.rows.length) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    const products = await client.query(`
      SELECT
        p.id,
        p.name,
        p.price,
        p.image_url,
        p.stock_quantity,
        COALESCE(AVG(r.rating), 0)::numeric(4, 2) AS rating,
        COUNT(r.id)::int AS review_count
      FROM products p
      LEFT JOIN reviews r ON r.product_id = p.id AND r.status = 'approved'
      WHERE p.vendor_id = $1 ${productFilters}
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `, [vendorId]);

    const reviews = await client.query(`
      SELECT
        r.id,
        r.rating,
        r.comment,
        r.created_at,
        u.full_name AS user_name,
        p.name AS product_name
      FROM reviews r
      JOIN products p ON p.id = r.product_id
      JOIN users u ON u.id = r.user_id
      WHERE p.vendor_id = $1
        AND r.status = 'approved'
        AND r.comment IS NOT NULL
        AND BTRIM(r.comment) <> ''
      ORDER BY r.created_at DESC
      LIMIT 20
    `, [vendorId]);

    res.json({
      success: true,
      data: {
        store: storeResult.rows[0],
        products: products.rows,
        reviews: reviews.rows
      }
    });
  } catch (error) {
    console.error(`Failed to fetch store ${vendorId}:`, error);
    res.status(500).json({ success: false, message: 'Failed to fetch store details' });
  } finally {
    client?.release();
  }
});

export default router;
