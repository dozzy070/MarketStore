// backend/routes/admin/auditLog.routes.js
import express from 'express';
import { authenticate, isAdmin } from '../../middleware/authMiddleware.js';
import pool from '../../db/db.js';

const router = express.Router();

// Apply authentication and admin check to all routes
router.use(authenticate, isAdmin);

/**
 * GET /api/admin/audit-logs
 * Get all audit logs with filtering
 */
router.get('/', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { 
      filter, 
      search, 
      startDate, 
      endDate,
      page = 1,
      limit = 50,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;
    
    let query = `
      SELECT 
        al.id,
        al.user_id,
        al.user_name,
        al.action,
        al.description,
        al.details,
        al.ip_address,
        al.user_agent,
        al.entity_type,
        al.entity_id,
        al.created_at as timestamp
      FROM audit_logs al
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    // Filter by action type
    if (filter && filter !== 'all') {
      query += ` AND al.action = $${paramIndex}`;
      params.push(filter);
      paramIndex++;
    }
    
    // Search in description, user_name, and details
    if (search) {
      query += ` AND (al.description ILIKE $${paramIndex} 
                OR al.user_name ILIKE $${paramIndex} 
                OR al.details ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    // Filter by date range
    if (startDate) {
      query += ` AND al.created_at >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }
    
    if (endDate) {
      query += ` AND al.created_at <= $${paramIndex}::date + interval '1 day'`;
      params.push(endDate);
      paramIndex++;
    }
    
    // Get total count for pagination
    const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as total FROM');
    const countResult = await client.query(countQuery, params);
    const total = parseInt(countResult.rows[0]?.total || 0);
    
    // Add sorting and pagination
    query += ` ORDER BY al.${sortBy} ${sortOrder}`;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));
    
    const result = await client.query(query, params);
    
    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
    
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch audit logs',
      error: error.message 
    });
  } finally {
    client.release();
  }
});

/**
 * GET /api/admin/audit-logs/:id
 * Get single audit log by ID
 */
router.get('/:id', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    
    const result = await client.query(
      `SELECT 
        al.id,
        al.user_id,
        al.user_name,
        al.action,
        al.description,
        al.details,
        al.ip_address,
        al.user_agent,
        al.entity_type,
        al.entity_id,
        al.created_at as timestamp
      FROM audit_logs al
      WHERE al.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Audit log not found' 
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
    
  } catch (error) {
    console.error('Error fetching audit log:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch audit log' 
    });
  } finally {
    client.release();
  }
});

/**
 * GET /api/admin/audit-logs/export
 * Export audit logs as CSV
 */
router.get('/export', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { filter, search, startDate, endDate } = req.query;
    
    let query = `
      SELECT 
        al.user_name as "User",
        al.action as "Action",
        al.description as "Description",
        al.details as "Details",
        al.ip_address as "IP Address",
        al.user_agent as "User Agent",
        al.created_at as "Timestamp"
      FROM audit_logs al
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (filter && filter !== 'all') {
      query += ` AND al.action = $${paramIndex}`;
      params.push(filter);
      paramIndex++;
    }
    
    if (search) {
      query += ` AND (al.description ILIKE $${paramIndex} 
                OR al.user_name ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    if (startDate) {
      query += ` AND al.created_at >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }
    
    if (endDate) {
      query += ` AND al.created_at <= $${paramIndex}::date + interval '1 day'`;
      params.push(endDate);
      paramIndex++;
    }
    
    query += ` ORDER BY al.created_at DESC`;
    
    const result = await client.query(query, params);
    
    // Convert to CSV
    const headers = ['User', 'Action', 'Description', 'Details', 'IP Address', 'User Agent', 'Timestamp'];
    const csvRows = [headers];
    
    result.rows.forEach(row => {
      csvRows.push([
        row.User || '',
        row.Action || '',
        row.Description || '',
        row.Details || '',
        row['IP Address'] || '',
        row['User Agent'] || '',
        new Date(row.Timestamp).toISOString()
      ].map(cell => `"${String(cell).replace(/"/g, '""')}"`));
    });
    
    const csv = csvRows.map(row => row.join(',')).join('\n');
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=audit-log-${Date.now()}.csv`);
    res.setHeader('Content-Length', Buffer.byteLength(csv, 'utf8'));
    res.send(csv);
    
  } catch (error) {
    console.error('Error exporting audit logs:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to export audit logs' 
    });
  } finally {
    client.release();
  }
});

export default router;