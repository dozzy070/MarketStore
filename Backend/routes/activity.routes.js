// backend/routes/activity.routes.js
import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import pool from '../db/db.js';

const router = express.Router();

// Get user activities
router.get('/', authenticate, async (req, res) => {
  const client = await pool.connect();
  try {
    const { limit = 50, offset = 0, type, startDate, endDate } = req.query;
    
    let query = `
      SELECT * FROM activity_logs 
      WHERE user_id = $1
    `;
    const params = [req.user.id];
    let paramIndex = 2;
    
    if (type && type !== 'all') {
      query += ` AND type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }
    
    if (startDate) {
      query += ` AND created_at >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }
    
    if (endDate) {
      query += ` AND created_at <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);
    
    const result = await client.query(query, params);
    
    res.json({
      success: true,
      data: result.rows,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: result.rows.length
      }
    });
    
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch activities' });
  } finally {
    client.release();
  }
});

// Log an activity (called from other routes)
export const logActivity = async (userId, type, description, details = null, req = null) => {
  const client = await pool.connect();
  try {
    const ip = req?.ip || req?.connection?.remoteAddress || null;
    const userAgent = req?.headers['user-agent'] || null;
    
    await client.query(
      `INSERT INTO activity_logs (user_id, type, description, details, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, type, description, details, ip, userAgent]
    );
  } catch (error) {
    console.error('Error logging activity:', error);
  } finally {
    client.release();
  }
};

// Export activities
router.get('/export', authenticate, async (req, res) => {
  const client = await pool.connect();
  try {
    const { type, startDate, endDate } = req.query;
    
    let query = `
      SELECT type, description, details, ip_address, user_agent, created_at 
      FROM activity_logs 
      WHERE user_id = $1
    `;
    const params = [req.user.id];
    let paramIndex = 2;
    
    if (type && type !== 'all') {
      query += ` AND type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }
    
    if (startDate) {
      query += ` AND created_at >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }
    
    if (endDate) {
      query += ` AND created_at <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }
    
    query += ` ORDER BY created_at DESC`;
    
    const result = await client.query(query, params);
    
    // Convert to CSV
    const headers = ['Type', 'Description', 'Details', 'IP Address', 'User Agent', 'Timestamp'];
    const csvRows = [headers];
    
    result.rows.forEach(row => {
      csvRows.push([
        row.type,
        row.description,
        row.details || '',
        row.ip_address || '',
        row.user_agent || '',
        new Date(row.created_at).toISOString()
      ]);
    });
    
    const csv = csvRows.map(row => row.join(',')).join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=activity-log-${Date.now()}.csv`);
    res.send(csv);
    
  } catch (error) {
    console.error('Error exporting activities:', error);
    res.status(500).json({ success: false, message: 'Failed to export activities' });
  } finally {
    client.release();
  }
});

export default router;