// backend/websocket.js
import WebSocket from 'ws';
import jwt from 'jsonwebtoken';
import pool from './db/db.js';

let wss;

export const initWebSocket = (server) => {
  console.log('🔌 Initializing WebSocket server...');
  
  try {
    // This is the correct way - WebSocket is the default import
    wss = new WebSocket.Server({ server });
    
    wss.on('connection', (ws, req) => {
      console.log('🔌 New WebSocket connection attempt');
      
      const url = new URL(req.url, `http://${req.headers.host}`);
      const token = url.searchParams.get('token');
      
      if (!token) {
        console.log('❌ WebSocket connection rejected: No token');
        ws.close();
        return;
      }
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this');
        ws.userId = decoded.id;
        ws.userRole = decoded.role;
        
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