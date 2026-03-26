// backend/routes/notification.routes.js
import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import pool from '../db/db.js';

const router = express.Router();

// Get all notifications for the authenticated user
router.get('/', authenticate, async (req, res) => {
  let client;
  try {
    console.log(`🔔 Fetching notifications for user: ${req.user.id}`);
    
    client = await pool.connect();
    
    const result = await client.query(
      `SELECT * FROM notifications 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 50`,
      [req.user.id]
    );
    
    // Get unread count
    const unreadResult = await client.query(
      `SELECT COUNT(*) FROM notifications 
       WHERE user_id = $1 AND is_read = false`,
      [req.user.id]
    );
    
    console.log(`✅ Found ${result.rows.length} notifications, ${unreadResult.rows[0].count} unread`);
    
    res.json({
      success: true,
      notifications: result.rows,
      unreadCount: parseInt(unreadResult.rows[0].count)
    });
    
  } catch (error) {
    console.error('❌ Get notifications error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch notifications',
      error: error.message 
    });
  } finally {
    if (client) client.release();
  }
});

// Mark notification as read
router.patch('/:id/read', authenticate, async (req, res) => {
  let client;
  try {
    const { id } = req.params;
    console.log(`📖 Marking notification ${id} as read for user: ${req.user.id}`);
    
    client = await pool.connect();
    
    const result = await client.query(
      `UPDATE notifications 
       SET is_read = true, updated_at = NOW() 
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    res.json({ 
      success: true, 
      notification: result.rows[0] 
    });
    
  } catch (error) {
    console.error('❌ Mark notification read error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to mark notification as read' 
    });
  } finally {
    if (client) client.release();
  }
});

// Mark all notifications as read
router.patch('/read-all', authenticate, async (req, res) => {
  let client;
  try {
    console.log(`📖 Marking all notifications as read for user: ${req.user.id}`);
    
    client = await pool.connect();
    
    await client.query(
      `UPDATE notifications 
       SET is_read = true, updated_at = NOW() 
       WHERE user_id = $1 AND is_read = false`,
      [req.user.id]
    );
    
    res.json({ 
      success: true, 
      message: 'All notifications marked as read' 
    });
    
  } catch (error) {
    console.error('❌ Mark all read error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to mark notifications as read' 
    });
  } finally {
    if (client) client.release();
  }
});

// Delete a notification
router.delete('/:id', authenticate, async (req, res) => {
  let client;
  try {
    const { id } = req.params;
    console.log(`🗑️ Deleting notification ${id} for user: ${req.user.id}`);
    
    client = await pool.connect();
    
    const result = await client.query(
      `DELETE FROM notifications 
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Notification deleted successfully' 
    });
    
  } catch (error) {
    console.error('❌ Delete notification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete notification' 
    });
  } finally {
    if (client) client.release();
  }
});

// Create a notification (for internal use)
export const createNotification = async (userId, type, title, message, link = null, metadata = {}) => {
  let client;
  try {
    client = await pool.connect();
    
    const result = await client.query(
      `INSERT INTO notifications (user_id, type, title, message, link, metadata, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING *`,
      [userId, type, title, message, link, metadata]
    );
    
    console.log(`✅ Notification created for user ${userId}: ${title}`);
    return result.rows[0];
    
  } catch (error) {
    console.error('❌ Create notification error:', error);
    return null;
  } finally {
    if (client) client.release();
  }
};

export default router;