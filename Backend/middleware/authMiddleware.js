import jwt from 'jsonwebtoken';
import pool from '../db/db.js';
import { getJwtSecret } from '../utils/jwtSecret.js';

/**
 * ===============================
 * AUTHENTICATE USER (JWT)
 * ===============================
 */
export const authenticate = async (req, res, next) => {
  const [scheme, token, ...extra] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token || extra.length) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  let client;
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    if (!decoded || typeof decoded !== 'object' ||
        !Number.isSafeInteger(Number(decoded.id)) || Number(decoded.id) <= 0) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }

    client = await pool.connect();
    const result = await client.query(`
      SELECT u.id, u.full_name, u.email, u.role, u.is_vendor, u.is_admin, u.verified,
             va.status AS vendor_status
      FROM users u
      LEFT JOIN LATERAL (
        SELECT status
        FROM vendor_applications
        WHERE user_id = u.id
        ORDER BY created_at DESC
        LIMIT 1
      ) va ON true
      WHERE u.id = $1
    `, [decoded.id]);

    if (!result.rows.length) {
      return res.status(401).json({ success: false, message: 'Account not found. Please register or log in again.' });
    }

    const user = result.rows[0];
    if ((user.role === 'vendor' || user.is_vendor) &&
        (user.vendor_status === 'rejected' ||
         (user.vendor_status !== 'approved' && !(user.vendor_status == null && user.verified)))) {
      return res.status(403).json({ success: false, message: 'Your vendor account is pending approval' });
    }

    req.user = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      is_vendor: user.is_vendor,
      is_admin: user.is_admin,
      verified: user.verified,
      vendor_status: user.vendor_status
    };
    return next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
    console.error('Authentication error:', error);
    return res.status(500).json({ success: false, message: 'Unable to authenticate request' });
  } finally {
    client?.release();
  }
};

/**
 * ===============================
 * ADMIN CHECK
 * ===============================
 */
export const isAdmin = async (req, res, next) => {
  if (!req.user?.is_admin && req.user?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  return next();
};

/**
 * ===============================
 * VENDOR CHECK
 * ===============================
 */
export const isVendor = async (req, res, next) => {
  if (req.user?.role === 'admin' || req.user?.is_admin) {
    return next();
  }
  if (!req.user?.is_vendor && req.user?.role !== 'vendor') {
    return res.status(403).json({ success: false, message: 'Vendor access required' });
  }
  if (req.user.vendor_status !== 'approved' &&
      !(req.user.vendor_status == null && req.user.verified)) {
    return res.status(403).json({ success: false, message: 'Your vendor account is pending approval' });
  }
  return next();
};

/**
 * ===============================
 * USER CHECK
 * ===============================
 * Any authenticated user
 */
export const isUser = (req, res, next) => {
  next();
};