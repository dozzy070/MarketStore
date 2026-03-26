// frontend/src/components/NotificationBell.jsx
import React, { useState, useEffect } from 'react';
import { Badge, Dropdown, Button } from 'react-bootstrap';
import { FaBell, FaCheck, FaTimes, FaTrash, FaCheckDouble } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import notificationService from '../services/notificationService';
import toast from 'react-hot-toast';

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.fetchNotifications();
      setNotifications(data);
      setUnreadCount(notificationService.getUnreadCount());
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    
    // Start polling for new notifications
    notificationService.startPolling(30000);
    
    // Subscribe to real-time updates
    const unsubscribe = notificationService.subscribe((event, data) => {
      if (event === 'update') {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
        
        // Trigger dashboard update when new notifications arrive
        window.dispatchEvent(new CustomEvent('notificationUpdate', { 
          detail: { type: 'new_notification', count: data.unreadCount } 
        }));
      }
    });
    
    return () => {
      notificationService.stopPolling();
      unsubscribe();
    };
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      const success = await notificationService.markAsRead(notificationId);
      if (success) {
        await loadNotifications();
        // Trigger dashboard update
        window.dispatchEvent(new CustomEvent('notificationUpdate', { 
          detail: { type: 'notification_read', id: notificationId } 
        }));
        toast.success('Notification marked as read');
      }
    } catch (error) {
      console.error('Error marking as read:', error);
      toast.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      const success = await notificationService.markAllAsRead();
      if (success) {
        await loadNotifications();
        // Trigger dashboard update
        window.dispatchEvent(new CustomEvent('notificationUpdate', { 
          detail: { type: 'all_read' } 
        }));
        toast.success('All notifications marked as read');
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const success = await notificationService.deleteNotification(notificationId);
      if (success) {
        await loadNotifications();
        toast.success('Notification deleted');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const handleNotificationClick = (notification) => {
    // Mark as read when clicked
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // Navigate based on notification type
    if (notification.link) {
      navigate(notification.link);
    } else if (notification.type === 'vendor_application') {
      navigate('/admin/vendors?filter=pending');
    } else if (notification.type === 'product_approval') {
      navigate('/admin/products?filter=pending');
    } else if (notification.type === 'review_approval') {
      navigate('/admin/reviews?filter=pending');
    } else if (notification.type === 'order') {
      navigate('/admin/orders');
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Dropdown align="end">
      <Dropdown.Toggle variant="link" className="notification-bell p-0 position-relative">
        <FaBell size={20} className="text-muted" />
        {unreadCount > 0 && (
          <Badge 
            bg="danger" 
            className="position-absolute top-0 start-100 translate-middle rounded-circle"
            style={{ fontSize: '10px', padding: '2px 5px' }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu className="notification-dropdown p-0" style={{ width: '350px', maxHeight: '500px', overflow: 'auto' }}>
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
          <h6 className="mb-0">Notifications</h6>
          {unreadCount > 0 && (
            <Button 
              variant="link" 
              size="sm" 
              className="p-0 text-decoration-none"
              onClick={markAllAsRead}
            >
              <FaCheckDouble className="me-1" size={12} /> Mark all read
            </Button>
          )}
        </div>

        {loading && notifications.length === 0 ? (
          <div className="text-center py-4">
            <div className="spinner-border spinner-border-sm text-primary" />
            <p className="text-muted small mt-2 mb-0">Loading...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-4">
            <FaBell size={30} className="text-muted mb-2" />
            <p className="text-muted mb-0">No notifications</p>
          </div>
        ) : (
          <div className="notification-list">
            {notifications.map(notification => (
              <div 
                key={notification.id} 
                className={`notification-item d-flex align-items-start p-3 border-bottom ${!notification.read ? 'bg-light' : ''}`}
                style={{ cursor: 'pointer' }}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start">
                    <h6 className="mb-1">{notification.title || notification.type}</h6>
                    <small className="text-muted ms-2">{formatTime(notification.created_at)}</small>
                  </div>
                  <p className="small text-muted mb-1">{notification.message || notification.description}</p>
                  {notification.details && (
                    <p className="small text-muted mb-0">{notification.details}</p>
                  )}
                </div>
                <div className="d-flex gap-1 ms-2">
                  {!notification.read && (
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="p-0 text-success"
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notification.id);
                      }}
                      title="Mark as read"
                    >
                      <FaCheck size={12} />
                    </Button>
                  )}
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="p-0 text-danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                    title="Delete"
                  >
                    <FaTrash size={12} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="p-2 border-top text-center">
          <Button 
            variant="link" 
            size="sm" 
            className="text-decoration-none"
            onClick={() => navigate('/notifications')}
          >
            View All Notifications
          </Button>
        </div>
      </Dropdown.Menu>

      <style>{`
        .notification-bell {
          background: none;
          border: none;
          cursor: pointer;
        }
        .notification-bell:hover {
          opacity: 0.8;
        }
        .notification-dropdown {
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
        }
        .notification-item {
          transition: all 0.2s ease;
        }
        .notification-item:hover {
          background: #f8f9fa;
        }
        .dark-theme .notification-item:hover {
          background: #2d3748;
        }
        .dark-theme .bg-light {
          background-color: #2d3748 !important;
        }
      `}</style>
    </Dropdown>
  );
}

export default NotificationBell;