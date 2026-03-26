import jwt from 'jsonwebtoken';
import pool from '../db/db.js';

/**
 * ===============================
 * AUTHENTICATE USER (JWT)
 * ===============================
 */
export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET || 'your-secret-key-change-this',
    (err, decoded) => {
      if (err) {
        return res.status(403).json({
          success: false,
          message: 'Invalid or expired token'
        });
      }

      req.user = decoded;
      next();
    }
  );
};

/**
 * ===============================
 * ADMIN CHECK
 * ===============================
 */
export const isAdmin = async (req, res, next) => {
  const client = await pool.connect();

  try {
    const result = await client.query(
      'SELECT role, is_admin FROM users WHERE id = $1',
      [req.user.id]
    );

    if (
      result.rows.length === 0 ||
      (!result.rows[0].is_admin && result.rows[0].role !== 'admin')
    ) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    next();
  } catch (error) {
    console.error('Admin check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  } finally {
    client.release();
  }
};

/**
 * ===============================
 * VENDOR CHECK
 * ===============================
 */
export const isVendor = async (req, res, next) => {
  const client = await pool.connect();

  try {
    const result = await client.query(
      `SELECT u.role, u.is_vendor, va.status
       FROM users u
       LEFT JOIN vendor_applications va ON u.id = va.user_id
       WHERE u.id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const user = result.rows[0];

    // Allow admin automatically
    if (user.role === 'admin') {
      return next();
    }

    // Must be vendor
    if (!user.is_vendor && user.role !== 'vendor') {
      return res.status(403).json({
        success: false,
        message: 'Vendor access required'
      });
    }

    // Vendor must be approved
    if (user.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Your vendor account is pending approval'
      });
    }

    next();
  } catch (error) {
    console.error('Vendor check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  } finally {
    client.release();
  }
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