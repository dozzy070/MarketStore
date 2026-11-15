// backend/websocket.js
import WebSocket from 'ws';
import jwt from 'jsonwebtoken';
import pool from './db/db.js';
import { getJwtSecret } from './utils/jwtSecret.js';

let wss;

export const initWebSocket = (server) => {
  console.log('🔌 Initializing WebSocket server...');
  
  try {
    // This is the correct way - WebSocket is the default import
    wss = new WebSocket.Server({ server });
    
    wss.on('connection', async (ws, req) => {
      console.log('🔌 New WebSocket connection attempt');
      
      const url = new URL(req.url, `http://${req.headers.host}`);
      const token = url.searchParams.get('token');
      
      if (!token) {
        console.log('❌ WebSocket connection rejected: No token');
        ws.close();
        return;
      }
      
      try {
        const decoded = jwt.verify(token, getJwtSecret());
        const account = await pool.query(`
          SELECT u.id, u.role, u.is_vendor, u.verified, va.status AS vendor_status
          FROM users u
          LEFT JOIN LATERAL (
            SELECT status
            FROM vendor_applications
            WHERE user_id = u.id
            ORDER BY created_at DESC
            LIMIT 1
          ) va ON true
          WHERE u.id = $1
        `,
          [decoded.id]
        );
        if (!account.rows.length) {
          ws.close(1008, 'Account is not registered');
          return;
        }

        const user = account.rows[0];
        if ((user.role === 'vendor' || user.is_vendor) &&
            (user.vendor_status === 'rejected' ||
             (user.vendor_status !== 'approved' && !(user.vendor_status == null && user.verified)))) {
          ws.close(1008, 'Vendor approval is required');
          return;
        }

        ws.userId = user.id;
        ws.userRole = user.role;
        
        console.log(`✅ WebSocket connected for user: ${ws.userId}`);
        
        // Send welcome message
        ws.send(JSON.stringify({
          type: 'connection',
          message: 'Connected to notification server',
          userId: ws.userId
        }));
        
        ws.on('close', () => {
          console.log(`🔌 WebSocket disconnected for user: ${ws.userId}`);
        });
        
        ws.on('error', (error) => {
          console.error(`WebSocket error for user ${ws.userId}:`, error);
        });
        
      } catch (error) {
        console.error('WebSocket auth error:', error);
        ws.close();
      }
    });
    
    console.log('✅ WebSocket server initialized');
    
  } catch (error) {
    console.error('Failed to initialize WebSocket:', error);
  }
  
  return wss;
};

export const sendNotification = async (userId, notification) => {
  if (!wss) {
    console.log('WebSocket server not initialized');
    return null;
  }
  
  let client;
  try {
    client = await pool.connect();
    
    // Save to database
    const result = await client.query(
      `INSERT INTO notifications (user_id, type, title, message, link, metadata, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING *`,
      [userId, notification.type, notification.title, notification.message, notification.link, notification.metadata || {}]
    );
    
    const savedNotification = result.rows[0];
    
    // Send to WebSocket clients
    let sent = 0;
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN && client.userId === userId) {
        client.send(JSON.stringify(savedNotification));
        sent++;
      }
    });
    
    if (sent > 0) {
      console.log(`📨 Notification sent to ${sent} client(s) for user ${userId}`);
    }
    
    return savedNotification;
    
  } catch (error) {
    console.error('Send notification error:', error);
    return null;
  } finally {
    if (client) client.release();
  }
};

export default { initWebSocket, sendNotification };