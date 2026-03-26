// backend/routes/admin/payout.routes.js
import express from 'express';
import { authenticate, isAdmin } from '../../middleware/authMiddleware.js';
import pool from '../../db/db.js';
import paystackService from '../../services/paystackService.js';
import { sendPayoutApprovalEmail, sendPayoutRejectionEmail } from '../../services/emailService.js';

const router = express.Router();

router.use(authenticate, isAdmin);

/**
 * GET /api/admin/payouts
 * Get all pending withdrawals
 */
router.get('/payouts', async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT 
        w.*,
        u.full_name as vendor_name,
        u.email as vendor_email
      FROM vendor_withdrawals w
      JOIN users u ON w.vendor_id = u.id
      WHERE w.status = 'pending'
      ORDER BY w.created_at ASC
    `);
    
    res.json({
      success: true,
      withdrawals: result.rows
    });
  } catch (error) {
    console.error('Admin payout fetch error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch withdrawals' });
  } finally {
    client.release();
  }
});

/**
 * PUT /api/admin/payouts/:id/approve
 * Approve payout and process transfer
 */
router.put('/payouts/:id/approve', async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    
    // Get withdrawal details
    const withdrawal = await client.query(`
      SELECT w.*, u.email, u.full_name
      FROM vendor_withdrawals w
      JOIN users u ON w.vendor_id = u.id
      WHERE w.id = $1
    `, [id]);
    
    if (withdrawal.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Withdrawal not found' });
    }
    
    const w = withdrawal.rows[0];
    
    // Get bank code if not present
    let bankCode = w.bank_code;
    if (!bankCode && w.bank_name) {
      const banks = await paystackService.listBanks();
      const bank = banks.data?.find(b => b.name.toLowerCase().includes(w.bank_name.toLowerCase()));
      bankCode = bank?.code;
    }
    
    // Create transfer recipient
    const recipientResult = await paystackService.createTransferRecipient(
      w.account_name,
      w.account_number,
      bankCode
    );
    
    if (!recipientResult.success) {
      return res.status(400).json({ success: false, message: recipientResult.error });
    }
    
    // Initiate transfer
    const transferResult = await paystackService.initiateTransfer(
      recipientResult.recipientCode,
      w.amount,
      `Payout for vendor ${w.vendor_id} - ${w.reference}`
    );
    
    if (!transferResult.success) {
      return res.status(400).json({ success: false, message: transferResult.error });
    }
    
    // Update withdrawal status
    await client.query(`
      UPDATE vendor_withdrawals 
      SET status = 'approved', 
          processed_at = NOW(), 
          reference = $1,
          bank_code = COALESCE($2, bank_code)
      WHERE id = $3
    `, [transferResult.data.reference, bankCode, id]);
    
    // Send email notification
    const bankDetails = {
      bankName: w.bank_name,
      accountNumber: w.account_number,
      accountName: w.account_name
    };
    
    await sendPayoutApprovalEmail(
      { email: w.email, full_name: w.full_name },
      w.amount,
      transferResult.data.reference,
      bankDetails
    ).catch(err => console.error('Payout approval email error:', err));
    
    res.json({
      success: true,
      message: 'Payout approved and processed',
      transfer: transferResult.data
    });
  } catch (error) {
    console.error('Payout approval error:', error);
    res.status(500).json({ success: false, message: 'Failed to approve payout' });
  } finally {
    client.release();
  }
});

/**
 * PUT /api/admin/payouts/:id/reject
 * Reject payout
 */
router.put('/payouts/:id/reject', async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    // Get withdrawal details
    const withdrawal = await client.query(`
      SELECT w.*, u.email, u.full_name
      FROM vendor_withdrawals w
      JOIN users u ON w.vendor_id = u.id
      WHERE w.id = $1
    `, [id]);
    
    if (withdrawal.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Withdrawal not found' });
    }
    
    const w = withdrawal.rows[0];
    
    // Update withdrawal status
    const result = await client.query(`
      UPDATE vendor_withdrawals 
      SET status = 'rejected', 
          rejection_reason = $1, 
          processed_at = NOW()
      WHERE id = $2
      RETURNING *
    `, [reason || 'No reason provided', id]);
    
    // Send rejection email
    await sendPayoutRejectionEmail(
      { email: w.email, full_name: w.full_name },
      w.amount,
      reason || 'No reason provided',
      w.reference
    ).catch(err => console.error('Payout rejection email error:', err));
    
    res.json({
      success: true,
      message: 'Payout rejected',
      withdrawal: result.rows[0]
    });
  } catch (error) {
    console.error('Payout rejection error:', error);
    res.status(500).json({ success: false, message: 'Failed to reject payout' });
  } finally {
    client.release();
  }
});

/**
 * GET /api/admin/payouts/all
 * Get all withdrawals (with filters)
 */
router.get('/payouts/all', async (req, res) => {
  const client = await pool.connect();
  try {
    const { status, startDate, endDate } = req.query;
    
    let query = `
      SELECT 
        w.*,
        u.full_name as vendor_name,
        u.email as vendor_email
      FROM vendor_withdrawals w
      JOIN users u ON w.vendor_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;
    
    if (status && status !== 'all') {
      query += ` AND w.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    if (startDate) {
      query += ` AND w.created_at >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }
    
    if (endDate) {
      query += ` AND w.created_at <= $${paramIndex}::date + interval '1 day'`;
      params.push(endDate);
      paramIndex++;
    }
    
    query += ` ORDER BY w.created_at DESC`;
    
    const result = await client.query(query, params);
    
    res.json({
      success: true,
      withdrawals: result.rows
    });
  } catch (error) {
    console.error('Admin payouts fetch error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch withdrawals' });
  } finally {
    client.release();
  }
});

export default router;