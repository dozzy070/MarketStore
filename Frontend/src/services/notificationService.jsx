// frontend/src/services/notificationService.jsx
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class NotificationService {
  constructor() {
    this.listeners = [];
    this.notifications = [];
    this.unreadCount = 0;
    this.pollingInterval = null;
    this.isPolling = false;
  }

  // Get auth token
  getAuthToken() {
    return localStorage.getItem('token');
  }

  // Create axios instance with auth
  getApi() {
    const token = this.getAuthToken();
    return axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      }
    });
  }

  // Request notification permission (browser feature)
  async requestNotificationPermission() {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  // Show browser notification
  showBrowserNotification(title, body, icon = null) {
    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body: body,
        icon: icon || '/favicon.ico',
        silent: false
      });

      setTimeout(() => notification.close(), 5000);
      return notification;
    }
    return null;
  }

  // Fetch notifications from API
  async fetchNotifications() {
    try {
      const api = this.getApi();
      const response = await api.get('/notifications');
      
      if (response.data) {
        this.notifications = Array.isArray(response.data) ? response.data : (response.data.data || []);
        this.unreadCount = this.notifications.filter(n => !n.read).length;
        this.notifyListeners();
      }
      return this.notifications;
    } catch (error) {
      console.error('Fetch notifications error:', error);
      return [];
    }
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      const api = this.getApi();
      await api.put(`/notifications/${notificationId}/read`);
      
      const notification = this.notifications.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        notification.read = true;
        this.unreadCount = Math.max(0, this.unreadCount - 1);
        this.notifyListeners();
      }
      return true;
    } catch (error) {
      console.error('Mark as read error:', error);
      return false;
    }
  }

  // Mark all as read
  async markAllAsRead() {
    try {
      const api = this.getApi();
      await api.put('/notifications/read-all');
      
      this.notifications.forEach(n => { n.read = true; });
      this.unreadCount = 0;
      this.notifyListeners();
      return true;
    } catch (error) {
      console.error('Mark all as read error:', error);
      return false;
    }
  }

  // Add notification
  async addNotification(notification) {
    try {
      const api = this.getApi();
      const response = await api.post('/notifications', notification);
      
      if (response.data) {
        this.notifications.unshift(response.data);
        if (!response.data.read) this.unreadCount++;
        this.notifyListeners();
        
        // Show browser notification
        this.showBrowserNotification(
          notification.title || 'New Notification',
          notification.message || notification.body || 'You have a new notification'
        );
      }
      return response.data;
    } catch (error) {
      console.error('Add notification error:', error);
      return null;
    }
  }

  // Delete notification
  async deleteNotification(notificationId) {
    try {
      const api = this.getApi();
      await api.delete(`/notifications/${notificationId}`);
      
      const index = this.notifications.findIndex(n => n.id === notificationId);
      if (index !== -1) {
        const wasUnread = !this.notifications[index].read;
        this.notifications.splice(index, 1);
        if (wasUnread) this.unreadCount--;
        this.notifyListeners();
      }
      return true;
    } catch (error) {
      console.error('Delete notification error:', error);
      return false;
    }
  }

  // Subscribe to notifications
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  // Notify all listeners
  notifyListeners() {
    this.listeners.forEach(callback => {
      callback('update', {
        notifications: this.notifications,
        unreadCount: this.unreadCount
      });
    });
  }

  // Start polling for new notifications
  startPolling(interval = 30000) {
    if (this.pollingInterval) return;
    
    this.isPolling = true;
    this.fetchNotifications();
    
    this.pollingInterval = setInterval(() => {
      if (this.isPolling) {
        this.fetchNotifications();
      }
    }, interval);
  }

  // Stop polling
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.isPolling = false;
  }

  // Get current notifications
  getNotifications() {
    return this.notifications;
  }

  // Get unread count
  getUnreadCount() {
    return this.unreadCount;
  }
}

// Create singleton instance
const notificationService = new NotificationService();
export default notificationService;