// backend/routes/order.routes.js
import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import pool from '../db/db.js';
import { ensureStoreSchema } from '../models/store.model.js';

const router = express.Router();

const parseOrderId = value => {
  const match = /^(?:ORD-2024-)?(\d+)$/.exec(String(value));
  if (!match) return null;
  const id = Number(match[1]);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
};

const formatOrderId = id => `ORD-2024-${String(id).padStart(3, '0')}`;

// Get all orders for authenticated user
router.get('/', authenticate, async (req, res) => {
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
        o.updated_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', oi.id,
              'product_id', oi.product_id,
              'product_name', p.name,
              'quantity', oi.quantity,
              'price', oi.price,
              'image_url', p.image_url
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
    
    // Convert numeric IDs to string format for frontend
    const ordersWithStringIds = result.rows.map(order => ({
      ...order,
      id: formatOrderId(order.id)
    }));
    
    res.json({ 
      success: true, 
      data: ordersWithStringIds 
    });
    
  } catch (error) {
    console.error('❌ Get orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  } finally {
    if (client) client.release();
  }
});

// Get a single order owned by the authenticated user
router.get('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const numericId = parseOrderId(id);
  if (!numericId) {
    return res.status(400).json({ success: false, message: 'Invalid order ID' });
  }

  let client;
  try {
    client = await pool.connect();
    
    const result = await client.query(
      `SELECT 
        o.id,
        o.user_id,
        o.total,
        o.status,
        o.payment_status,
        o.shipping_address,
        o.shipping_method,
        o.tracking_number,
        o.created_at,
        o.updated_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', oi.id,
              'product_id', oi.product_id,
              'product_name', p.name,
              'quantity', oi.quantity,
              'price', oi.price,
              'image_url', p.image_url
            )
          ) FILTER (WHERE oi.id IS NOT NULL),
          '[]'::json
        ) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE o.id = $1 AND o.user_id = $2
       GROUP BY o.id`,
      [numericId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    const orderData = result.rows[0];
    orderData.id = formatOrderId(orderData.id);
    res.json({ 
      success: true, 
      data: orderData 
    });
    
  } catch (error) {
    console.error('❌ Get order error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch order' });
  } finally {
    if (client) client.release();
  }
});

// Create new order
router.post('/', authenticate, async (req, res) => {
  let client;
  let transactionStarted = false;
  try {
    const { items, shipping_address } = req.body;
    const shippingMethod = req.body.shipping_method || shipping_address?.method || 'standard';
    const shippingFees = { standard: 2500, express: 5000, pickup: 0 };

    if (!Array.isArray(items) || items.length === 0 || !shipping_address || typeof shipping_address !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'A shipping address and at least one item are required'
      });
    }

    const requiredShippingFields = ['fullName', 'email', 'phone', 'address', 'city', 'state'];
    if (requiredShippingFields.some(field =>
      typeof shipping_address[field] !== 'string' ||
      !shipping_address[field].trim() ||
      shipping_address[field].length > 250
    ) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shipping_address.email)) {
      return res.status(400).json({ success: false, message: 'Shipping information is incomplete or invalid' });
    }
    const safeShippingAddress = Object.fromEntries(
      [...requiredShippingFields, 'apartment', 'zipCode', 'country'].map(field => [
        field,
        typeof shipping_address[field] === 'string' ? shipping_address[field].trim().slice(0, 250) : ''
      ])
    );
    safeShippingAddress.method = shippingMethod;

    if (!Object.hasOwn(shippingFees, shippingMethod)) {
      return res.status(400).json({ success: false, message: 'Invalid shipping method' });
    }

    const quantityByProduct = new Map();
    for (const item of items) {
      const productId = Number(item?.product_id);
      const quantity = Number(item?.quantity);
      if (!Number.isSafeInteger(productId) || productId <= 0 ||
          !Number.isSafeInteger(quantity) || quantity <= 0) {
        return res.status(400).json({ success: false, message: 'Invalid product or quantity' });
      }
      const combinedQuantity = (quantityByProduct.get(productId) || 0) + quantity;
      if (!Number.isSafeInteger(combinedQuantity)) {
        return res.status(400).json({ success: false, message: 'Product quantity is too large' });
      }
      quantityByProduct.set(productId, combinedQuantity);
    }

    await ensureStoreSchema();
    client = await pool.connect();
    await client.query('BEGIN');
    transactionStarted = true;

    const productColumnsResult = await client.query(
      `SELECT column_name
       FROM information_schema.columns
       WHERE table_name = 'products' AND column_name IN ('published', 'status')`
    );
    const productColumns = new Set(productColumnsResult.rows.map(row => row.column_name));
    const visibilityFilters = [];
    if (productColumns.has('published')) visibilityFilters.push('COALESCE(p.published, true) = true');
    if (productColumns.has('status')) visibilityFilters.push("COALESCE(p.status, 'published') = 'published'");

    const productResult = await client.query(
      `SELECT p.id, p.name, p.price, p.stock_quantity
       FROM products p
       INNER JOIN vendor_stores vs ON vs.vendor_id = p.vendor_id AND vs.status = 'active'
       INNER JOIN users u ON u.id = p.vendor_id AND (u.role = 'vendor' OR u.is_vendor = true)
       LEFT JOIN LATERAL (
         SELECT status
         FROM vendor_applications
         WHERE user_id = u.id
         ORDER BY created_at DESC
         LIMIT 1
       ) va ON true
       WHERE p.id = ANY($1)
         AND COALESCE(va.status, CASE WHEN u.verified THEN 'approved' ELSE 'pending' END) = 'approved'
         ${visibilityFilters.length ? `AND ${visibilityFilters.join(' AND ')}` : ''}
       FOR UPDATE OF p`,
      [[...quantityByProduct.keys()]]
    );
    if (productResult.rows.length !== quantityByProduct.size) {
      await client.query('ROLLBACK');
      transactionStarted = false;
      return res.status(409).json({ success: false, message: 'One or more products are no longer available' });
    }

    const productsById = new Map(productResult.rows.map(product => [Number(product.id), product]));
    let subtotal = 0;
    for (const [productId, quantity] of quantityByProduct) {
      const product = productsById.get(productId);
      const price = Number(product.price);
      const availableStock = Number(product.stock_quantity);
      if (!Number.isFinite(price) || price < 0 ||
          !Number.isSafeInteger(availableStock) || availableStock < quantity) {
        await client.query('ROLLBACK');
        transactionStarted = false;
        return res.status(409).json({ success: false, message: 'Product price or stock changed. Please review your cart.' });
      }
      subtotal += price * quantity;
    }

    subtotal = Math.round(subtotal * 100) / 100;
    const tax = Math.round(subtotal * 0.075 * 100) / 100;
    const total = Math.round((subtotal + shippingFees[shippingMethod] + tax) * 100) / 100;
    if (total < 100) {
      await client.query('ROLLBACK');
      transactionStarted = false;
      return res.status(400).json({ success: false, message: 'Order total must be at least ₦100' });
    }
    const expectedTotalInKobo = Math.round(Number(req.body.total) * 100);
    if (!Number.isSafeInteger(expectedTotalInKobo) ||
        Math.abs(Number(req.body.total) * 100 - expectedTotalInKobo) >= 0.000001 ||
        expectedTotalInKobo !== Math.round(total * 100)) {
      await client.query('ROLLBACK');
      transactionStarted = false;
      return res.status(409).json({
        success: false,
        message: 'Product prices or order costs changed. Please review your cart and try again.'
      });
    }

    const orderResult = await client.query(
      `INSERT INTO orders (user_id, total, shipping_address, shipping_method, status, payment_status, created_at)
       VALUES ($1, $2, $3, $4, 'pending', 'pending', NOW())
       RETURNING id`,
      [req.user.id, total, safeShippingAddress, shippingMethod]
    );
    
    const orderId = orderResult.rows[0].id;
    const orderNumber = `ORD-2024-${String(orderId).padStart(3, '0')}`;
    
    for (const [productId, quantity] of quantityByProduct) {
      const product = productsById.get(productId);
      const price = Number(product.price);
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES ($1, $2, $3, $4)`,
        [orderId, productId, quantity, price]
      );
      
      const stockUpdate = await client.query(
        `UPDATE products 
         SET stock_quantity = stock_quantity - $1
         WHERE id = $2 AND stock_quantity >= $1
         RETURNING id`,
        [quantity, productId]
      );
      if (stockUpdate.rowCount !== 1) {
        throw new Error('Product stock changed while placing the order');
      }
    }
    
    await client.query('COMMIT');
    transactionStarted = false;
    
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { orderId, id: orderId, orderNumber, subtotal, shipping: shippingFees[shippingMethod], tax, total }
    });
    
  } catch (error) {
    if (transactionStarted && client) await client.query('ROLLBACK');
    console.error('❌ Create order error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create order'
    });
  } finally {
    if (client) client.release();
  }
});

// Update order status
router.put('/:id/status', authenticate, async (req, res) => {
  let client;
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (req.user.role !== 'admin' && !req.user.is_admin) {
      return res.status(403).json({ success: false, message: 'Only administrators can update order status' });
    }
    
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    const numericId = parseOrderId(id);
    if (!numericId) return res.status(400).json({ success: false, message: 'Invalid order ID' });
    
    client = await pool.connect();
    
    const result = await client.query(
      `UPDATE orders 
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [status, numericId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or you do not have permission'
      });
    }
    
    res.json({
      success: true,
      message: 'Order status updated',
      data: result.rows[0]
    });
    
  } catch (error) {
    console.error('❌ Update order status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update order status',
      error: error.message 
    });
  } finally {
    if (client) client.release();
  }
});

// Cancel order
router.post('/:id/cancel', authenticate, async (req, res) => {
  let client;
  let transactionStarted = false;
  try {
    const { id } = req.params;
    const numericId = parseOrderId(id);
    if (!numericId) return res.status(400).json({ success: false, message: 'Invalid order ID' });
    
    client = await pool.connect();
    
    await client.query('BEGIN');
    transactionStarted = true;
    
    // Check if order can be cancelled
    const orderCheck = await client.query(
      `SELECT status, payment_status FROM orders WHERE id = $1 AND user_id = $2 FOR UPDATE`,
      [numericId, req.user.id]
    );
    
    if (orderCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      transactionStarted = false;
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    if (orderCheck.rows[0].status !== 'pending' || orderCheck.rows[0].payment_status !== 'pending') {
      await client.query('ROLLBACK');
      transactionStarted = false;
      return res.status(400).json({
        success: false,
        message: 'Only unpaid pending orders can be cancelled'
      });
    }
    
    // Get order items to restore stock
    const itemsResult = await client.query(
      `SELECT product_id, quantity FROM order_items WHERE order_id = $1`,
      [numericId]
    );
    
    // Restore stock
    for (const item of itemsResult.rows) {
      await client.query(
        `UPDATE products 
         SET stock_quantity = stock_quantity + $1
         WHERE id = $2`,
        [item.quantity, item.product_id]
      );
    }
    
    // Update order status
    await client.query(
      `UPDATE orders
       SET status = 'cancelled', updated_at = NOW()
       WHERE id = $1 AND user_id = $2 AND status = 'pending' AND payment_status = 'pending'`,
      [numericId, req.user.id]
    );
    
    await client.query('COMMIT');
    transactionStarted = false;
    
    res.json({
      success: true,
      message: 'Order cancelled successfully'
    });
    
  } catch (error) {
    if (transactionStarted && client) await client.query('ROLLBACK');
    console.error('❌ Cancel order error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to cancel order'
    });
  } finally {
    if (client) client.release();
  }
});

export default router;