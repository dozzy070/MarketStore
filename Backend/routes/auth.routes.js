// backend/routes/auth.routes.js
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { body, validationResult } from 'express-validator';
import pool from '../db/db.js';
import { authenticate } from '../middleware/authMiddleware.js';
import passport from '../db/passport.js';
import {
  sendWelcomeEmail,
  sendLoginAlertEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
  sendEmail, // <-- added for test endpoint
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

// Test email endpoint (now working)
router.get('/test-email', async (req, res) => {
  console.log('🔥🔥🔥 TEST EMAIL endpoint hit');
  const result = await sendEmail('your-email@example.com', 'Test Subject', '<h1>Test</h1>');
  console.log('Test email result:', result);
  res.json(result);
});

/* ================= REGISTER ================= */
router.post('/register', [
  body('fullName').notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['user', 'vendor'])
], async (req, res) => {
  console.log('📥 [REGISTER] Request received');
  let client;
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ [REGISTER] Validation errors:', errors.array());
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

    // Check existing user
    const existing = await client.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      console.log('❌ [REGISTER] Email already exists:', email);
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const isVendor = role === 'vendor';
    const verified = role === 'user'; // auto-verify users; vendors need approval

    const userResult = await client.query(
      `INSERT INTO users (
        full_name, email, password, phone_number, location,
        role, is_vendor, verified, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      RETURNING id, full_name, email, role, is_vendor, verified, created_at`,
      [fullName, email.toLowerCase(), hashedPassword, phoneNumber || null, location || null, role, isVendor, verified]
    );

    const user = userResult.rows[0];
    console.log('✅ [REGISTER] User created successfully:', user.id);

    // Vendor application (if needed)
    if (isVendor) {
      const tableCheck = await client.query(`
        SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'vendor_applications')
      `);
      if (tableCheck.rows[0].exists) {
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
        console.log('📝 [REGISTER] Vendor application created for user:', user.id);
      } else {
        console.warn('⚠️ [REGISTER] vendor_applications table does not exist. Skipping vendor application creation.');
      }
    }

    // ─── EMAIL SERVICE INTEGRATION ─────────────────────────────
    console.log('📧 [REGISTER] About to send welcome email to:', user.email);
    try {
      const emailResult = await sendWelcomeEmail(user);
      console.log('📧 [REGISTER] Welcome email result:', emailResult);
    } catch (emailErr) {
      console.error('❌ [REGISTER] Welcome email error:', emailErr);
      // Do not break registration flow if email fails
    }
    // ────────────────────────────────────────────────────────────

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        isVendor: user.is_vendor,
        isAdmin: user.role === 'admin'
      },
      process.env.JWT_SECRET || 'your-secret-key-change-this',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: role === 'vendor' ? 'Vendor registration submitted for approval' : 'Registration successful',
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        verified: user.verified,
        is_vendor: user.is_vendor
      },
      token
    });
  } catch (error) {
    console.error('❌ [REGISTER] Error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  } finally {
    if (client) client.release();
  }
});

/* ================= LOGIN ================= */
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
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
       LEFT JOIN vendor_applications va ON u.id = va.user_id
       WHERE u.email = $1`,
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const user = result.rows[0];

    // Vendor approval checks
    if (user.role === 'vendor' || user.is_vendor === true) {
      if (user.vendor_status === 'pending') {
        return res.status(403).json({ success: false, message: 'Your vendor account is pending approval' });
      }
      if (user.vendor_status === 'rejected') {
        return res.status(403).json({ success: false, message: 'Your vendor application was rejected' });
      }
      if (!user.verified && user.role === 'vendor') {
        return res.status(403).json({ success: false, message: 'Your vendor account is pending approval' });
      }
    }

    // Validate password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
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
      process.env.JWT_SECRET || 'your-secret-key-change-this',
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
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
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
router.post('/check-email', async (req, res) => {
  let client;
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ exists: false, message: 'Email is required' });

    client = await pool.connect();
    const result = await client.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    res.json({ exists: result.rows.length > 0 });
  } catch (error) {
    console.error('Email check error:', error);
    res.status(500).json({ exists: false, message: 'Server error' });
  } finally {
    if (client) client.release();
  }
});

/* ================= GOOGLE OAUTH ================= */
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'select_account' }));

router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login' }), async (req, res) => {
  try {
    const user = req.user;
    const token = user.token;

    // ─── EMAIL SERVICE INTEGRATION ─────────────────────────────
    // Send welcome email for OAuth users (if they are new)
    if (user.isNew) {
      sendWelcomeEmail(user).catch(err => console.error('OAuth welcome email error:', err));
    }
    // Login alert email
    const { ip, device } = getClientInfo(req);
    const location = await getLocationFromIp(ip);
    sendLoginAlertEmail(user, ip, device, location).catch(err => console.error('OAuth login alert error:', err));
    // ────────────────────────────────────────────────────────────

    delete user.password;
    delete user.token;

    const redirectUrl = `${process.env.FRONTEND_URL}/auth/google-callback?token=${token}&user=${encodeURIComponent(
      JSON.stringify({
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        verified: user.verified
      })
    )}`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Google callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=google_auth_failed`);
  }
});

export default router;