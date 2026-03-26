// backend/utils/notifications.js
import { createNotification } from '../routes/notification.routes.js';

// Create notification for new order
export const notifyNewOrder = async (vendorId, orderId, customerName, total) => {
  return await createNotification(
    vendorId,
    'order',
    'New Order Received!',
    `${customerName} placed an order worth ₦${total.toLocaleString()}`,
    `/vendor/orders/${orderId}`,
    { orderId, customerName, total }
  );
};

// Create notification for order status update
export const notifyOrderStatusUpdate = async (userId, orderId, status, orderNumber) => {
  const statusMessages = {
    processing: 'is now being processed',
    shipped: 'has been shipped',
    delivered: 'has been delivered',
    cancelled: 'has been cancelled'
  };
  
  const message = statusMessages[status] || `status updated to ${status}`;
  
  return await createNotification(
    userId,
    'order_update',
    `Order ${orderNumber} ${message}`,
    `Your order #${orderNumber} ${message}. Track your delivery for updates.`,
    `/user/orders/${orderId}`,
    { orderId, status, orderNumber }
  );
};

// Create notification for product approval
export const notifyProductApproval = async (vendorId, productName, status, productId) => {
  const isApproved = status === 'approved';
  
  return await createNotification(
    vendorId,
    'product',
    isApproved ? 'Product Approved! 🎉' : 'Product Update',
    isApproved 
      ? `Your product "${productName}" has been approved and is now live!`
      : `Your product "${productName}" needs revision. Check your dashboard for details.`,
    `/vendor/products/${productId}`,
    { productId, productName, status }
  );
};

// Create notification for new vendor application
export const notifyAdminNewVendor = async (adminId, vendorName, businessName, applicationId) => {
  return await createNotification(
    adminId,
    'vendor_application',
    'New Vendor Application',
    `${vendorName} (${businessName}) has applied to become a vendor.`,
    `/admin/vendors/${applicationId}`,
    { applicationId, vendorName, businessName }
  );
};

// Create notification for low stock
export const notifyLowStock = async (vendorId, productName, productId, currentStock) => {
  return await createNotification(
    vendorId,
    'inventory',
    'Low Stock Alert!',
    `Your product "${productName}" has only ${currentStock} units left. Restock soon!`,
    `/vendor/products/${productId}`,
    { productId, productName, currentStock }
  );
};

// Create notification for new review
export const notifyNewReview = async (vendorId, productName, rating, reviewId) => {
  return await createNotification(
    vendorId,
    'review',
    `New ${rating}★ Review`,
    `${productName} received a ${rating}-star review from a customer.`,
    `/vendor/products/${productId}`,
    { reviewId, productId, productName, rating }
  );
};

// Create welcome notification for new users
export const notifyWelcome = async (userId, userName) => {
  return await createNotification(
    userId,
    'welcome',
    'Welcome to MarketStore! 🎉',
    `Hi ${userName}! Thanks for joining. Start shopping and discover amazing deals.`,
    '/',
    { userId }
  );
};