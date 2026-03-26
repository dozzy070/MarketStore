import pool from '../db/db.js';

export const createProduct = async (productData, vendorId) => {
  const { name, price, description, category, imageUrl } = productData;
  const query = `
    INSERT INTO products (name, price, description, category, image_url, vendor_id)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  const values = [name, price, description, category, imageUrl, vendorId];
  const result = await pool.query(query, values);
  return result.rows[0];
};

export const getProductsByVendor = async (vendorId) => {
  const query = 'SELECT * FROM products WHERE vendor_id = $1 ORDER BY created_at DESC';
  const result = await pool.query(query, [vendorId]);
  return result.rows;
};

export const getProductById = async (id) => {
  const query = 'SELECT * FROM products WHERE id = $1';
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

export const updateProduct = async (id, productData, vendorId) => {
  const { name, price, description, category, imageUrl } = productData;
  const query = `
    UPDATE products 
    SET name = $1, price = $2, description = $3, category = $4, image_url = $5
    WHERE id = $6 AND vendor_id = $7
    RETURNING *
  `;
  const values = [name, price, description, category, imageUrl, id, vendorId];
  const result = await pool.query(query, values);
  return result.rows[0];
};

export const deleteProduct = async (id, vendorId) => {
  const query = 'DELETE FROM products WHERE id = $1 AND vendor_id = $2 RETURNING id';
  const result = await pool.query(query, [id, vendorId]);
  return result.rows[0];
};

export const getProductStats = async (vendorId) => {
  const query = `
    SELECT 
      COUNT(*) as total_products,
      COALESCE(SUM(oi.quantity * oi.price), 0) as total_sales,
      COUNT(DISTINCT o.id) as total_orders
    FROM products p
    LEFT JOIN order_items oi ON p.id = oi.product_id
    LEFT JOIN orders o ON oi.order_id = o.id AND o.status = 'completed'
    WHERE p.vendor_id = $1
  `;
  const result = await pool.query(query, [vendorId]);
  return result.rows[0];
};