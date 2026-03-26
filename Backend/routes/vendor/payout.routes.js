// backend/routes/vendor/payout.routes.js
import express from 'express';
import { authenticate } from '../../middleware/authMiddleware.js';
import pool from '../../db/db.js';
import paystackService from '../../services/paystackService.js';

const router = express.Router();

router.use(authenticate);

/**
 * GET /api/vendor/payouts/earnings
 * Get vendor earnings summary
 */
router.get('/earnings', async (req, res) => {
  const client = await pool.connect();
  try {
    const vendorId = req.user.id;
    
    // Get total earnings
    const earningsResult = await client.query(`
      SELECT 
        COALESCE(SUM(amount), 0) as total_earned,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as total_paid,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as pending_earnings
      FROM vendor_earnings 
      WHERE vendor_id = $1
    `, [vendorId]);
    
    // Get available balance (paid but not withdrawn)
    const withdrawalsResult = await client.query(`
      SELECT COALESCE(SUM(amount), 0) as total_withdrawn
      FROM vendor_withdrawals 
      WHERE vendor_id = $1 AND status = 'approved'
    `, [vendorId]);
    
    const totalEarned = parseFloat(earningsResult.rows[0]?.total_earned || 0);
    const totalPaid = parseFloat(earningsResult.rows[0]?.total_paid || 0);
    const totalWithdrawn = parseFloat(withdrawalsResult.rows[0]?.total_withdrawn || 0);
    
    res.json({
      success: true,
      data: {
        total_earned: totalEarned,
        total_paid: totalPaid,
        pending_earnings: parseFloat(earningsResult.rows[0]?.pending_earnings || 0),
        available_balance: totalPaid - totalWithdrawn,
        total_withdrawn: totalWithdrawn
      }
    });
  } catch (error) {
    console.error('Earnings error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch earnings' });
  } finally {
    client.release();
  }
});

/**
 * GET /api/vendor/payouts
 * Get payout history
 */
router.get('/', async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT * FROM vendor_withdrawals 
      WHERE vendor_id = $1 
      ORDER BY created_at DESC 
      LIMIT 50
    `, [req.user.id]);
    
    res.json({
      success: true,
      withdrawals: result.rows
    });
  } catch (error) {
    console.error('Payout history error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch payout history' });
  } finally {
    client.release();
  }
});

/**
 * POST /api/vendor/payouts/request
 * Request payout
 */
router.post('/request', async (req, res) => {
  const client = await pool.connect();
  try {
    const { amount, bankName, accountNumber, accountName } = req.body;
    const vendorId = req.user.id;
    
    if (!amount || amount < 1000) {
      return res.status(400).json({ success: false, message: 'Minimum withdrawal amount is ₦1,000' });
    }
    
    // Check available balance
    const earningsResult = await client.query(`
      SELECT COALESCE(SUM(amount), 0) as total_paid
      FROM vendor_earnings 
      WHERE vendor_id = $1 AND status = 'paid'
    `, [vendorId]);
    
    const withdrawalsResult = await client.query(`
      SELECT COALESCE(SUM(amount), 0) as total_withdrawn
      FROM vendor_withdrawals 
      WHERE vendor_id = $1 AND status = 'approved'
    `, [vendorId]);
    
    const totalPaid = parseFloat(earningsResult.rows[0]?.total_paid || 0);
    const totalWithdrawn = parseFloat(withdrawalsResult.rows[0]?.total_withdrawn || 0);
    const availableBalance = totalPaid - totalWithdrawn;
    
    if (amount > availableBalance) {
      return res.status(400).json({ success: false, message: 'Insufficient balance' });
    }
    
    // Create withdrawal request
    const reference = `WTH-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    const result = await client.query(`
      INSERT INTO vendor_withdrawals 
        (vendor_id, amount, status, bank_name, account_number, account_name, reference, created_at)
      VALUES ($1, $2, 'pending', $3, $4, $5, $6, NOW())
      RETURNING *
    `, [vendorId, amount, bankName, accountNumber, accountName, reference]);
    
    res.json({
      success: true,
      message: 'Withdrawal request submitted successfully',
      withdrawal: result.rows[0]
    });
  } catch (error) {
    console.error('Withdrawal request error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit withdrawal request' });
  } finally {
    client.release();
  }
});

/**
 * GET /api/vendor/payouts/banks
 * Get list of banks for transfer
 */
router.get('/banks', async (req, res) => {
  try {
    const result = await paystackService.listBanks();
    res.json(result);
  } catch (error) {
    console.error('Bank list error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch banks' });
  }
});

/**
 * POST /api/vendor/payouts/verify-account
 * Verify bank account
 */
router.post('/verify-account', async (req, res) => {
  try {
    const { accountNumber, bankCode } = req.body;
    const result = await paystackService.verifyAccountNumber(accountNumber, bankCode);
    res.json(result);
  } catch (error) {
    console.error('Account verification error:', error);
    res.status(500).json({ success: false, message: 'Failed to verify account' });
  }
});

export default router;