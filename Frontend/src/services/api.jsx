// frontend/src/services/api.jsx
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  verify: () => api.get('/auth/verify'),
  checkEmail: (email) => api.post('/auth/check-email', { email }),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getOrders: () => api.get('/users/orders'),
  getWishlist: () => api.get('/users/wishlist'),
};

// Vendor API - Complete with all methods including payouts
export const vendorAPI = {
  // Dashboard
  getDashboardStats: () => api.get('/vendor/dashboard/stats'),
  getSalesAnalytics: (period) => api.get('/vendor/analytics', { params: { period } }),
  
  // Profile
  getProfile: () => api.get('/vendor/profile'),
  updateProfile: (data) => api.put('/vendor/profile', data),
  updatePassword: (data) => api.put('/vendor/profile/password', data),
  
  // Products
  getProducts: (params) => api.get('/vendor/products', { params }),
  getProduct: (id) => api.get(`/vendor/products/${id}`),
  createProduct: (data) => api.post('/vendor/products', data),
  updateProduct: (id, data) => api.put(`/vendor/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/vendor/products/${id}`),
  updateProductStatus: (id, status) => api.put(`/vendor/products/${id}/status`, { status }),
  
  // Orders
  getOrders: (params) => api.get('/vendor/orders', { params }),
  getOrder: (id) => api.get(`/vendor/orders/${id}`),
  updateOrderStatus: (id, status) => api.put(`/vendor/orders/${id}/status`, { status }),
  
  // Store
  getStore: () => api.get('/vendor/store'),
  updateStore: (data) => api.put('/vendor/store', data),
  getStoreSettings: () => api.get('/vendor/store/settings'),
  updateStoreSettings: (data) => api.put('/vendor/store/settings', data),
  
  // Payouts - Added methods
  getEarnings: () => api.get('/vendor/payouts/earnings'),
  getWithdrawals: () => api.get('/vendor/payouts'),
  requestPayout: (data) => api.post('/vendor/payouts/request', data),
  getPayoutSettings: () => api.get('/vendor/payouts/settings'),
  updatePayoutSettings: (data) => api.put('/vendor/payouts/settings', data),
  getBanks: () => api.get('/vendor/payouts/banks'),
  verifyAccount: (data) => api.post('/vendor/payouts/verify-account', data),
  
  // Reviews
  getProductReviews: (productId) => api.get(`/vendor/products/${productId}/reviews`),
  respondToReview: (reviewId, response) => api.post(`/vendor/reviews/${reviewId}/respond`, { response }),
  
  // Analytics
  getAnalytics: (params) => api.get('/vendor/analytics', { params }),
  getTopProducts: (limit) => api.get('/vendor/analytics/top-products', { params: { limit } }),
  getSalesByCategory: () => api.get('/vendor/analytics/sales-by-category'),
};

// Product API
export const productAPI = {
  getProducts: (params) => api.get('/products', { params }),
  getProduct: (id) => api.get(`/products/${id}`),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
};

// Category API
export const categoryAPI = {
  getCategories: () => api.get('/categories'),
  getCategory: (id) => api.get(`/categories/${id}`),
  createCategory: (data) => api.post('/categories', data),
  updateCategory: (id, data) => api.put(`/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/categories/${id}`),
};

// Order API
export const orderAPI = {
  getOrders: () => api.get('/orders'),
  getOrder: (id) => api.get(`/orders/${id}`),
  createOrder: (data) => api.post('/orders', data),
  updateOrderStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
};

// Admin API
export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  updateUserRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getVendors: () => api.get('/admin/vendors'),
  approveVendor: (id) => api.put(`/admin/vendors/${id}/approve`),
  rejectVendor: (id) => api.put(`/admin/vendors/${id}/reject`),
  getPendingVendors: () => api.get('/admin/vendors/pending'),
  getPendingVendorsCount: () => api.get('/admin/vendors/pending/count'),
  getAllProducts: () => api.get('/admin/products'),
  updateProductStatus: (id, status) => api.put(`/admin/products/${id}/status`, { status }),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  approveProduct: (id) => api.put(`/admin/products/${id}/approve`),
  getPendingProductsCount: () => api.get('/admin/products/pending/count'),
  getAllOrders: () => api.get('/admin/orders'),
  updateOrderStatus: (id, status) => api.put(`/admin/orders/${id}/status`, { status }),
  getReviews: () => api.get('/admin/reviews'),
  approveReview: (id) => api.put(`/admin/reviews/${id}/approve`),
  rejectReview: (id) => api.put(`/admin/reviews/${id}/reject`),
  deleteReview: (id) => api.delete(`/admin/reviews/${id}`),
  getPendingReviewsCount: () => api.get('/admin/reviews/pending/count'),
  getAnalytics: () => api.get('/admin/analytics'),
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
  getAuditLog: (id) => api.get(`/admin/audit-logs/${id}`),
  exportAuditLogs: (params) => api.get('/admin/audit-logs/export', { params, responseType: 'blob' }),
};

// Activity API
export const activityAPI = {
  getActivities: (params) => api.get('/activity', { params }),
  getActivity: (id) => api.get(`/activity/${id}`),
  exportActivities: (params) => api.get('/activity/export', { params, responseType: 'blob' }),
  logActivity: (data) => api.post('/activity', data),
};

// Review API
export const reviewAPI = {
  getReviews: (params) => api.get('/reviews', { params }),
  createReview: (data) => api.post('/reviews', data),
  updateReview: (id, data) => api.put(`/reviews/${id}`, data),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
  reportReview: (id) => api.post(`/reviews/${id}/report`),
};

// Cart API
export const cartAPI = {
  getCart: () => api.get('/cart'),
  addToCart: (data) => api.post('/cart', data),
  updateCartItem: (id, quantity) => api.put(`/cart/${id}`, { quantity }),
  removeFromCart: (id) => api.delete(`/cart/${id}`),
  clearCart: () => api.delete('/cart'),
};

// Payment API - Single definition with all methods
export const paymentAPI = {
  initializePayment: (data) => api.post('/payments/initialize', data),
  verifyPayment: (reference) => api.get(`/payments/verify/${reference}`),
  getPaymentHistory: () => api.get('/payments/history'),
  getBalance: () => api.get('/payments/balance'),
};

// Export all APIs as default
export default {
  authAPI,
  userAPI,
  vendorAPI,
  productAPI,
  categoryAPI,
  orderAPI,
  adminAPI,
  activityAPI,
  reviewAPI,
  cartAPI,
  paymentAPI,
};