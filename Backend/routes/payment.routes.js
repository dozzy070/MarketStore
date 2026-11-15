// backend/routes/payment.routes.js
import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import pool from '../db/db.js';
import paystackService from '../services/paystackService.js';
import { sendPaymentConfirmationEmail, sendPayoutNotificationEmail } from '../services/emailService.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

const getAmountInKobo = value => {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  const amountInKobo = Math.round(amount * 100);
  return Number.isSafeInteger(amountInKobo) && Math.abs(amount * 100 - amountInKobo) < 0.000001
    ? amountInKobo
    : null;
};

/**
 * GET /api/payments/balance
 * Get user's balance (for customers)
 */
router.get('/balance', async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(`
      SELECT 
        COALESCE(SUM(amount), 0) as total_paid,
        COUNT(*) as total_transactions
      FROM payments 
      WHERE user_id = $1 AND status = 'success'
    `, [req.user.id]);
    
    res.json({
      success: true,
      balance: parseFloat(result.rows[0]?.total_paid || 0),
      total_transactions: parseInt(result.rows[0]?.total_transactions || 0)
    });
  } catch (error) {
    console.error('Balance error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch balance' });
  } finally {
    client?.release();
  }
});

/**
 * POST /api/payments/initialize
 * Initialize payment
 */
router.post('/initialize', async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    const { amount, orderId } = req.body;

    const requestedAmountInKobo = getAmountInKobo(amount);
    if (requestedAmountInKobo === null || requestedAmountInKobo < 10000) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    let order = null;
    let paymentAmountInKobo = requestedAmountInKobo;
    if (orderId !== undefined && orderId !== null) {
      const numericOrderId = Number(orderId);
      if (!Number.isSafeInteger(numericOrderId) || numericOrderId <= 0) {
        return res.status(400).json({ success: false, message: 'Invalid order ID' });
      }

      const orderResult = await client.query(
        `SELECT id, total, payment_status
         FROM orders
         WHERE id = $1 AND user_id = $2`,
        [numericOrderId, req.user.id]
      );
      order = orderResult.rows[0];
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      if (order.payment_status !== 'pending') {
        return res.status(409).json({ success: false, message: 'Order is not awaiting payment' });
      }

      paymentAmountInKobo = getAmountInKobo(order.total);
      if (paymentAmountInKobo === null || paymentAmountInKobo < 10000) {
        return res.status(400).json({ success: false, message: 'Order total is not payable' });
      }
      if (paymentAmountInKobo !== requestedAmountInKobo) {
        return res.status(409).json({ success: false, message: 'Order total changed. Please review your order.' });
      }
    }

    const paymentAmount = paymentAmountInKobo / 100;
    const reference = paystackService.generateReference();
    
    // Save payment record
    await client.query(
      `INSERT INTO payments (user_id, reference, amount, status, order_id, created_at)
       VALUES ($1, $2, $3, 'pending', $4, NOW())`,
      [req.user.id, reference, paymentAmount, order?.id || null]
    );
    
    res.json({
      success: true,
      reference,
      amount: paymentAmount,
      email: req.user.email
    });
  } catch (error) {
    console.error('Payment initialization error:', error);
    res.status(500).json({ success: false, message: 'Payment initialization failed' });
  } finally {
    client?.release();
  }
});

/**
 * GET /api/payments/verify/:reference
 * Verify payment
 */
router.get('/verify/:reference', async (req, res) => {
  let client;
  let transactionStarted = false;
  try {
    client = await pool.connect();
    const { reference } = req.params;

    const paymentResult = await client.query(
      `SELECT id, reference, amount, status, order_id
       FROM payments
       WHERE reference = $1 AND user_id = $2`,
      [reference, req.user.id]
    );
    const payment = paymentResult.rows[0];
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    if (payment.status === 'success') {
      return res.json({
        success: true,
        message: 'Payment already verified',
        payment: {
          reference: payment.reference,
          amount: Number(payment.amount),
          status: payment.status,
          orderId: payment.order_id
        }
      });
    }
    if (payment.status !== 'pending') {
      return res.status(409).json({ success: false, message: 'Payment is not pending verification' });
    }

    const result = await paystackService.verifyPayment(reference);

    if (!result.success) {
      return res.status(400).json({ success: false, message: result.error });
    }

    const verifiedAmount = Number(result.data.amount);
    const verifiedAmountInKobo = getAmountInKobo(verifiedAmount);
    if (result.data.reference !== payment.reference ||
        verifiedAmountInKobo === null ||
        verifiedAmountInKobo !== getAmountInKobo(payment.amount)) {
      return res.status(400).json({ success: false, message: 'Payment details do not match this transaction' });
    }

    if (payment.order_id) {
      const orderResult = await client.query(
        `SELECT id, total, payment_status
         FROM orders
         WHERE id = $1 AND user_id = $2`,
        [payment.order_id, req.user.id]
      );
      const order = orderResult.rows[0];
      if (!order || getAmountInKobo(order.total) !== verifiedAmountInKobo || order.payment_status !== 'pending') {
        return res.status(409).json({ success: false, message: 'Order is no longer awaiting this payment' });
      }
    }

    await client.query('BEGIN');
    transactionStarted = true;
    const updatedPayment = await client.query(
      `UPDATE payments
       SET status = 'success', paid_at = $1, payment_data = $2
       WHERE id = $3 AND user_id = $4 AND reference = $5 AND status = 'pending'
       RETURNING id`,
      [result.data.paidAt, JSON.stringify(result.data), payment.id, req.user.id, reference]
    );

    if (updatedPayment.rowCount === 0) {
      await client.query('ROLLBACK');
      transactionStarted = false;
      const currentPayment = await client.query(
        'SELECT status FROM payments WHERE id = $1 AND user_id = $2',
        [payment.id, req.user.id]
      );
      if (currentPayment.rows[0]?.status === 'success') {
        return res.json({
          success: true,
          message: 'Payment already verified',
          payment: { reference, amount: verifiedAmount, status: 'success' }
        });
      }
      return res.status(409).json({ success: false, message: 'Payment status changed; please refresh and try again' });
    }

    if (payment.order_id) {
      const updatedOrder = await client.query(
        `UPDATE orders
         SET payment_status = 'paid', updated_at = NOW()
         WHERE id = $1 AND user_id = $2 AND payment_status = 'pending' AND total = $3
         RETURNING id`,
        [payment.order_id, req.user.id, Number(payment.amount)]
      );
      if (updatedOrder.rowCount !== 1) {
        await client.query('ROLLBACK');
        transactionStarted = false;
        return res.status(409).json({ success: false, message: 'Order payment status changed; contact support if funds were charged' });
      }
    }
    await client.query('COMMIT');
    transactionStarted = false;

    sendPaymentConfirmationEmail(req.user, verifiedAmount, reference, null).catch(err =>
      console.error('Payment confirmation email error:', err)
    );

    res.json({
      success: true,
      message: 'Payment verified successfully',
      payment: { reference, amount: verifiedAmount, status: 'success', paidAt: result.data.paidAt, orderId: payment.order_id }
    });
  } catch (error) {
    if (transactionStarted) await client.query('ROLLBACK');
    console.error('Payment verification error:', error);
    res.status(500).json({ success: false, message: 'Payment verification failed' });
  } finally {
    client?.release();
  }
});

/**
 * GET /api/payments/history
 * Get user's payment history
 */
router.get('/history', async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(`
      SELECT * FROM payments 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT 50
    `, [req.user.id]);
    
    res.json({
      success: true,
      payments: result.rows
    });
  } catch (error) {
    console.error('Payment history error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch payment history' });
  } finally {
    client?.release();
  }
});

export default router;