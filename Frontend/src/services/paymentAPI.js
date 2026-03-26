// frontend/src/services/paymentAPI.js
import api from './api';

export const paymentAPI = {
  initializePayment: (data) => api.post('/payments/initialize', data),
  verifyPayment: (reference) => api.get(`/payments/verify/${reference}`),
  getPaymentHistory: () => api.get('/payments/history'),
};

export default paymentAPI;