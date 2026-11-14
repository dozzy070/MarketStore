import express from 'express';
import pool from '../db/db.js';

const router = express.Router();

let tableInitialization;

const ensureNewsletterTable = () => {
  if (!tableInitialization) {
    tableInitialization = pool.query(`
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        email TEXT PRIMARY KEY,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `).catch((error) => {
      tableInitialization = null;
      throw error;
    });
  }

  return tableInitialization;
};

router.post('/subscribe', async (req, res) => {
  const email = typeof req.body.email === 'string'
    ? req.body.email.trim().toLowerCase()
    : '';

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address.'
    });
  }

  try {
    await ensureNewsletterTable();
    const result = await pool.query(
      `INSERT INTO newsletter_subscribers (email)
       VALUES ($1)
       ON CONFLICT (email) DO NOTHING
       RETURNING email`,
      [email]
    );

    res.status(result.rowCount ? 201 : 200).json({
      success: true,
      message: result.rowCount
        ? 'You are subscribed to DoorMart updates.'
        : 'This email is already subscribed.'
    });
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to subscribe right now. Please try again later.'
    });
  }
});

export default router;
