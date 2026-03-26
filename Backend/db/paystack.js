// backend/config/paystack.js
export const paystackConfig = {
  secretKey: process.env.PAYSTACK_SECRET_KEY,
  publicKey: process.env.PAYSTACK_PUBLIC_KEY,
  baseURL: 'https://api.paystack.co',
};

export default paystackConfig;