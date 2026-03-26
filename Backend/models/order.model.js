import pool from '../db/db.js';

export const getOrdersByVendor = async (vendorId) => {
  const query = `
    SELECT o.*, 
           json_agg(json_build_object(
             'id', oi.id,
             'product_id', oi.product_id,
             'quantity', oi.quantity,
             'price', oi.price,
             'product_name', p.name
           )) as items
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    JOIN products p ON oi.product_id = p.id
    WHERE p.vendor_id = $1
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `;
  const result = await pool.query(query, [vendorId]);
  return result.rows;
};

export const getOrderById = async (id, vendorId) => {
  const query = `
    SELECT o.*, 
           json_agg(json_build_object(
             'id', oi.id,
             'product_id', oi.product_id,
             'quantity', oi.quantity,
             'price', oi.price,
             'product_name', p.name
           )) as items
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    JOIN products p ON oi.product_id = p.id
    WHERE o.id = $1 AND p.vendor_id = $2
    GROUP BY o.id
  `;
  const result = await pool.query(query, [id, vendorId]);
  return result.rows[0];
};

export const updateOrderStatus = async (id, status, vendorId) => {
  const query = `
    UPDATE orders o
    SET status = $1
    FROM order_items oi
    WHERE o.id = oi.order_id 
      AND oi.product_id IN (SELECT id FROM products WHERE vendor_id = $3)
      AND o.id = $2
    RETURNING o.*
  `;
  const result = await pool.query(query, [status, id, vendorId]);
  return result.rows[0];
};