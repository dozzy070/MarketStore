import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import pool from '../db/db.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// ================================
// Utils
// ================================
const generateResetToken = () => crypto.randomBytes(32).toString('hex');
const TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

// ================================
// Forgot Password - Request Reset
// ================================
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email } = req.body;
    const userResult = await pool.query(
      'SELECT id, full_name, email FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      // Security: don't reveal if user exists
      return res.json({ 
        success: true,
        message: 'If an account exists with this email, you will receive reset instructions.'
      });
    }

    const user = userResult.rows[0];
    const resetToken = generateResetToken();
    const tokenExpiry = new Date(Date.now() + TOKEN_EXPIRY_MS);

    await pool.query(
      `UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3`,
      [resetToken, tokenExpiry, user.id]
    );

    console.log('=================================');
    console.log('PASSWORD RESET TOKEN');
    console.log('User:', user.email);
    console.log('Reset link: http://localhost:3000/reset-password/' + resetToken);
    console.log('=================================');

    // TODO: send email with reset link in production

    res.json({ 
      success: true,
      message: 'If an account exists with this email, you will receive reset instructions.'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ================================
// Verify Reset Token
// ================================
router.get('/verify-reset-token/:token', async (req, res) => {
  try {
    const { token } = req.params;

    if (!token || token.length < 32) {
      return res.status(400).json({ success: false, message: 'Invalid token' });
    }

    const result = await pool.query(
      `SELECT id, email FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    res.json({ success: true, message: 'Token is valid' });

  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ================================
// Reset Password
// ================================
router.post('/reset-password', [
  body('token').notEmpty(),
  body('password').isLength({ min: 6 }),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) throw new Error('Passwords do not match');
    return true;
  })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { token, password } = req.body;

    const userResult = await pool.query(
      `SELECT id, email FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()`,
      [token]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    const user = userResult.rows[0];
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `UPDATE users 
       SET password = $1, reset_token = NULL, reset_token_expiry = NULL, updated_at = NOW()
       WHERE id = $2`,
      [hashedPassword, user.id]
    );

    res.json({
      success: true,
      message: 'Password reset successful. You can now login with your new password.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;