// backend/services/paystackService.js
import axios from 'axios';
import crypto from 'crypto';
import { paystackConfig } from '../db/paystack.js';

const PAYSTACK_SECRET = paystackConfig.secretKey;
const PAYSTACK_BASE_URL = paystackConfig.baseURL;

// Initialize payment
export const initializePayment = async (email, amount, reference, metadata = {}) => {
  try {
    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        email,
        amount: amount * 100, // Paystack uses kobo (multiply by 100)
        reference,
        metadata,
        callback_url: `${process.env.FRONTEND_URL}/payment/verify`,
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    return {
      success: true,
      data: response.data.data,
      authorization_url: response.data.data.authorization_url,
      reference: response.data.data.reference,
    };
  } catch (error) {
    console.error('Paystack initialization error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || 'Payment initialization failed',
    };
  }
};

// Verify payment
export const verifyPayment = async (reference) => {
  try {
    const response = await axios.get(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
        },
      }
    );
    
    const { data } = response.data;
    
    if (data.status === 'success') {
      return {
        success: true,
        data: {
          reference: data.reference,
          amount: data.amount / 100, // Convert back to naira
          status: data.status,
          paidAt: data.paid_at,
          customer: data.customer,
          metadata: data.metadata,
        },
      };
    }
    
    return {
      success: false,
      error: 'Payment verification failed',
    };
  } catch (error) {
    console.error('Paystack verification error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || 'Payment verification failed',
    };
  }
};

// Generate unique reference
export const generateReference = () => {
  return `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
};

// List banks for transfer
export const listBanks = async () => {
  try {
    const response = await axios.get(
      `${PAYSTACK_BASE_URL}/bank`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
        },
      }
    );
    
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    console.error('Error fetching banks:', error);
    return {
      success: false,
      error: 'Failed to fetch banks',
    };
  }
};

// Verify bank account
export const verifyAccountNumber = async (accountNumber, bankCode) => {
  try {
    const response = await axios.get(
      `${PAYSTACK_BASE_URL}/bank/resolve`,
      {
        params: {
          account_number: accountNumber,
          bank_code: bankCode,
        },
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
        },
      }
    );
    
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    console.error('Error verifying account:', error);
    return {
      success: false,
      error: 'Failed to verify account',
    };
  }
};

// Create transfer recipient
export const createTransferRecipient = async (name, accountNumber, bankCode) => {
  try {
    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/transferrecipient`,
      {
        type: 'nuban',
        name,
        account_number: accountNumber,
        bank_code: bankCode,
        currency: 'NGN',
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    return {
      success: true,
      data: response.data.data,
      recipientCode: response.data.data.recipient_code,
    };
  } catch (error) {
    console.error('Error creating recipient:', error);
    return {
      success: false,
      error: 'Failed to create recipient',
    };
  }
};

// Initiate transfer
export const initiateTransfer = async (recipientCode, amount, reason) => {
  try {
    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/transfer`,
      {
        source: 'balance',
        amount: amount * 100,
        recipient: recipientCode,
        reason,
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    console.error('Error initiating transfer:', error);
    return {
      success: false,
      error: 'Failed to initiate transfer',
    };
  }
};

// Webhook verification
export const verifyWebhookSignature = (payload, signature, secret) => {
  const hash = crypto
    .createHmac('sha512', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return hash === signature;
};

export default {
  initializePayment,
  verifyPayment,
  generateReference,
  listBanks,
  verifyAccountNumber,
  createTransferRecipient,
  initiateTransfer,
  verifyWebhookSignature,
};