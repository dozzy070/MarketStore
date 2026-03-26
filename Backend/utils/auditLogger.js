// backend/utils/auditLogger.js
import pool from '../db/db.js';

/**
 * Log an action to the audit log
 * @param {Object} data - Log data
 * @param {number} data.userId - User ID
 * @param {string} data.userName - User name (optional)
 * @param {string} data.action - Action type (login, logout, create, update, delete, etc.)
 * @param {string} data.description - Description of the action
 * @param {string} data.details - Additional details (optional)
 * @param {string} data.ipAddress - IP address (optional)
 * @param {string} data.userAgent - User agent (optional)
 * @param {string} data.entityType - Type of entity affected (optional)
 * @param {number} data.entityId - ID of entity affected (optional)
 */
export const logActivity = async (data) => {
  const client = await pool.connect();
  
  try {
    const {
      userId,
      userName,
      action,
      description,
      details,
      ipAddress,
      userAgent,
      entityType,
      entityId
    } = data;
    
    await client.query(
      `INSERT INTO audit_logs (
        user_id, user_name, action, description, details, 
        ip_address, user_agent, entity_type, entity_id, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
      [
        userId || null,
        userName || null,
        action,
        description,
        details || null,
        ipAddress || null,
        userAgent || null,
        entityType || null,
        entityId || null
      ]
    );
    
    console.log(`📝 Audit log: ${action} - ${description}`);
    
  } catch (error) {
    console.error('Error logging activity:', error);
  } finally {
    client.release();
  }
};

/**
 * Middleware to automatically log requests
 * @param {string} action - Action type
 * @param {Function} getDescription - Function to get description from request
 */
export const auditLogMiddleware = (action, getDescription) => {
  return async (req, res, next) => {
    const originalJson = res.json;
    
    // Override res.json to capture response
    res.json = function(data) {
      // Only log if response was successful
      if (data?.success !== false) {
        logActivity({
          userId: req.user?.id,
          userName: req.user?.full_name,
          action: action,
          description: getDescription ? getDescription(req, data) : `${action} operation performed`,
          ipAddress: req.ip || req.connection?.remoteAddress,
          userAgent: req.headers['user-agent'],
          entityType: req.params?.entityType || req.body?.entityType,
          entityId: req.params?.id || data?.data?.id
        }).catch(console.error);
      }
      
      // Call original json
      return originalJson.call(this, data);
    };
    
    next();
  };
};