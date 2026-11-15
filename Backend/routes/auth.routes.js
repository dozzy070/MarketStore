// backend/routes/auth.routes.js
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { body, validationResult } from 'express-validator';
import pool from '../db/db.js';
import { authenticate } from '../middleware/authMiddleware.js';
import passport from '../db/passport.js';
import { getJwtSecret } from '../utils/jwtSecret.js';
import {
  sendWelcomeEmail,
  sendLoginAlertEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
} from '../services/emailService.js';

const router = express.Router();

// Helper functions (unchanged)
const getClientInfo = (req) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'];
  let device = 'Unknown';
  if (userAgent) {
    if (userAgent.includes('Mobile')) device = 'Mobile';
    else if (userAgent.includes('Tablet')) device = 'Tablet';
    else device = 'Desktop';
  }
  return { ip, device, userAgent };
};

const getLocationFromIp = async (ip) => {
  if (ip === '::1' || ip === '127.0.0.1') return 'Localhost';
  return 'Unknown Location';
};

/* ================= REGISTER ================= */
router.post('/register', [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isString().isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role').optional().isIn(['user', 'vendor'])
], async (req, res) => {
  let client;
  let transactionStarted = false;
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
      fullName,
      email,
      password,
      phoneNumber,
      location,
      role = 'user',
      businessName,
      businessAddress,
      businessPhone,
      taxId,
      storeDescription
    } = req.body;

    client = await pool.connect();
    await client.query('BEGIN');
    transactionStarted = true;

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await client.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
    if (existing.rows.length > 0) {
      await client.query('ROLLBACK');
      transactionStarted = false;
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const isVendor = role === 'vendor';
    const verified = role === 'user';

    const userResult = await client.query(
      `INSERT INTO users (
        full_name, email, password, phone_number, location,
        role, is_vendor, verified, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      RETURNING id, full_name, email, role, is_vendor, verified, created_at`,
      [fullName.trim(), normalizedEmail, hashedPassword, phoneNumber || null, location || null, role, isVendor, verified]
    );

    const user = userResult.rows[0];

    if (isVendor) {
      await client.query(
        `INSERT INTO vendor_applications (
          user_id, business_name, business_address, business_phone,
          tax_id, description, status, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, 'pending', NOW())`,
        [
          user.id,
          businessName || fullName,
          businessAddress || location,
          businessPhone || phoneNumber,
          taxId || null,
          storeDescription || `${fullName}'s store`
        ]
      );
    }

    await client.query('COMMIT');
    transactionStarted = false;

    try {
      await sendWelcomeEmail(user);
    } catch (emailErr) {
      console.error('Registration welcome email failed:', emailErr);
    }

    res.status(201).json({
      success: true,
      message: role === 'vendor'
        ? 'Vendor application submitted for approval. Log in after an administrator approves it.'
        : 'Registration successful. Please log in.',
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        verified: user.verified,
        is_vendor: user.is_vendor
      }
    });
  } catch (error) {
    if (transactionStarted && client) await client.query('ROLLBACK');
    if (error.code === '23505') {
      return res.status(409).json({ success: false, message: 'User with this email already exists' });
    }
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  } finally {
    if (client) client.release();
  }
});

/* ================= LOGIN ================= */
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isString().notEmpty()
], async (req, res) => {
  let client;
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;
    client = await pool.connect();

    const result = await client.query(
      `SELECT u.*, va.status AS vendor_status, va.business_name
       FROM users u
       LEFT JOIN LATERAL (
         SELECT status, business_name
         FROM vendor_applications
         WHERE user_id = u.id
         ORDER BY created_at DESC
         LIMIT 1
       ) va ON true
       WHERE u.email = $1`,
      [email.trim().toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const user = result.rows[0];

    const isValid = typeof user.password === 'string' && await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.role === 'vendor' || user.is_vendor === true) {
      if (user.vendor_status === 'rejected') {
        return res.status(403).json({ success: false, message: 'Your vendor application was rejected' });
      }
      if (user.vendor_status !== 'approved' &&
          !(user.vendor_status == null && user.verified)) {
        return res.status(403).json({ success: false, message: 'Your vendor account is pending approval' });
      }
    }

    // ─── EMAIL SERVICE INTEGRATION ─────────────────────────────
    // Login alert email (non‑blocking)
    const { ip, device } = getClientInfo(req);
    const location = await getLocationFromIp(ip);
    sendLoginAlertEmail(user, ip, device, location).catch(err => console.error('Login alert error:', err));
    // ────────────────────────────────────────────────────────────

    // Generate token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        isVendor: user.is_vendor || user.role === 'vendor',
        isAdmin: user.is_admin || user.role === 'admin'
      },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    delete user.password;

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone_number: user.phone_number,
        location: user.location,
        role: user.role,
        isVendor: user.is_vendor || user.role === 'vendor',
        isAdmin: user.is_admin || user.role === 'admin',
        verified: user.verified
      },
      token
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  } finally {
    if (client) client.release();
  }
});

router.get('/verify', authenticate, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user.id,
      full_name: req.user.full_name,
      email: req.user.email,
      role: req.user.role,
      is_vendor: req.user.is_vendor,
      is_admin: req.user.is_admin,
      verified: req.user.verified
    }
  });
});

/* ================= FORGOT PASSWORD ================= */
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  let client;
  try {
    const { email } = req.body;
    client = await pool.connect();

    const userResult = await client.query(
      'SELECT id, full_name, email FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    // Always return success to avoid email enumeration
    if (userResult.rows.length === 0) {
      return res.json({ success: true, message: 'If an account exists, a password reset link will be sent.' });
    }

    const user = userResult.rows[0];
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 3600000); // 1 hour

    await client.query(
      'UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3',
      [resetToken, expiry, user.id]
    );

    // ─── EMAIL SERVICE INTEGRATION ─────────────────────────────
    // Send password reset email (await but catch errors)
    await sendPasswordResetEmail(user, resetToken).catch(err => console.error('Reset email error:', err));
    // ────────────────────────────────────────────────────────────

    res.json({ success: true, message: 'If an account exists, a password reset link will be sent.' });
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    if (client) client.release();
  }
});

/* ================= RESET PASSWORD ================= */
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
], async (req, res) => {
  let client;
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { token, newPassword } = req.body;
    client = await pool.connect();

    const result = await client.query(
      `SELECT id, full_name, email FROM users
       WHERE reset_token = $1 AND reset_token_expiry > NOW()`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    const user = result.rows[0];
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await client.query(
      `UPDATE users SET password = $1, reset_token = NULL, reset_token_expiry = NULL, updated_at = NOW()
       WHERE id = $2`,
      [hashedPassword, user.id]
    );

    // ─── EMAIL SERVICE INTEGRATION ─────────────────────────────
    // Send password changed confirmation (non‑blocking)
    sendPasswordChangedEmail(user).catch(err => console.error('Password changed email error:', err));
    // ────────────────────────────────────────────────────────────

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('❌ Reset password error:', error);
    res.status(500).json({ success: false, message: 'Server error during password reset' });
  } finally {
    if (client) client.release();
  }
});

/* ================= CHECK EMAIL AVAILABILITY ================= */
router.post('/check-email', [
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email } = req.body;
    const result = await pool.query('SELECT id FROM users WHERE email = $1', [String(email).toLowerCase()]);

    res.json({
      success: true,
      exists: result.rows.length > 0,
      message: result.rows.length > 0 ? 'Email is already registered.' : 'Email is available.'
    });
  } catch (error) {
    console.error('❌ Check email error:', error);
    res.status(500).json({ success: false, message: 'Server error while checking email' });
  }
});

/* ================= GOOGLE OAUTH ================= */
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'select_account' }));

router.get('/google/callback', passport.authenticate('google', {
  session: false,
  failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=google_account_not_registered`
}), async (req, res) => {
  try {
    const user = req.user;
    const token = user.token;

    const { ip, device } = getClientInfo(req);
    const location = await getLocationFromIp(ip);
    sendLoginAlertEmail(user, ip, device, location).catch(err => console.error('OAuth login alert error:', err));

    const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/google-callback#token=${encodeURIComponent(token)}`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Google callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=google_auth_failed`);
  }
});

export default router;