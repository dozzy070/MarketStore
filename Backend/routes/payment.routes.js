// backend/routes/payment.routes.js
import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import pool from '../db/db.js';
import paystackService from '../services/paystackService.js';
import { sendPaymentConfirmationEmail, sendPayoutNotificationEmail } from '../services/emailService.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

/**
 * GET /api/payments/balance
 * Get user's balance (for customers)
 */
router.get('/balance', async (req, res) => {
  const client = await pool.connect();
  try {
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
    client.release();
  }
});

/**
 * POST /api/payments/initialize
 * Initialize payment
 */
router.post('/initialize', async (req, res) => {
  const client = await pool.connect();
  try {
    const { amount, orderId, metadata = {} } = req.body;
    
    if (!amount || amount < 100) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }
    
    const reference = paystackService.generateReference();
    
    // Save payment record
    await client.query(
      `INSERT INTO payments (user_id, reference, amount, status, order_id, created_at)
       VALUES ($1, $2, $3, 'pending', $4, NOW())`,
      [req.user.id, reference, amount, orderId || null]
    );
    
    const result = await paystackService.initializePayment(
      req.user.email,
      amount,
      reference,
      { userId: req.user.id, orderId, ...metadata }
    );
    
    if (result.success) {
      res.json({
        success: true,
        authorization_url: result.authorization_url,
        reference: result.reference
      });
    } else {
      await client.query('UPDATE payments SET status = \'failed\' WHERE reference = $1', [reference]);
      res.status(400).json({ success: false, message: result.error });
    }
  } catch (error) {
    console.error('Payment initialization error:', error);
    res.status(500).json({ success: false, message: 'Payment initialization failed' });
  } finally {
    client.release();
  }
});

/**
 * GET /api/payments/verify/:reference
 * Verify payment
 */
router.get('/verify/:reference', async (req, res) => {
  const client = await pool.connect();
  try {
    const { reference } = req.params;
    
    const result = await paystackService.verifyPayment(reference);
    
    if (result.success) {
      await client.query(
        `UPDATE payments 
         SET status = 'success', paid_at = $1, payment_data = $2
         WHERE reference = $3`,
        [result.data.paidAt, JSON.stringify(result.data), reference]
      );
      
      // Send confirmation email (don't await to not block response)
      sendPaymentConfirmationEmail(req.user, result.data.amount, reference, null).catch(err => 
        console.error('Payment confirmation email error:', err)
      );
      
      res.json({
        success: true,
        message: 'Payment verified successfully',
        payment: result.data
      });
    } else {
      res.status(400).json({ success: false, message: result.error });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ success: false, message: 'Payment verification failed' });
  } finally {
    client.release();
  }
});

/**
 * GET /api/payments/history
 * Get user's payment history
 */
router.get('/history', async (req, res) => {
  const client = await pool.connect();
  try {
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
    client.release();
  }
});

export default router;