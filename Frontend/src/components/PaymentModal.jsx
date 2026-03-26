// frontend/src/components/PaymentModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { FaCreditCard, FaSpinner } from 'react-icons/fa';
import { paymentAPI } from '../services/api';
import toast from 'react-hot-toast';

function PaymentModal({ show, onClose, amount: presetAmount, onSuccess }) {
  const [amount, setAmount] = useState(presetAmount || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paystackLoaded, setPaystackLoaded] = useState(false);
  const [publicKey, setPublicKey] = useState(null);

  useEffect(() => {
    const key = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
    if (key) setPublicKey(key);
    else setError('Payment system not configured. Contact support.');
  }, []);

  useEffect(() => {
    if (!show || !publicKey) return;

    if (window.PaystackPop) {
      setPaystackLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => setPaystackLoaded(true);
    script.onerror = () => setError('Failed to load payment system. Check your internet.');
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, [show, publicKey]);

  const verifyPayment = async (reference) => {
    try {
      const response = await paymentAPI.verifyPayment(reference);
      if (response.data.success) {
        toast.success('Payment successful!');
        if (onSuccess) onSuccess(response.data.payment);
        onClose();
      } else {
        toast.error(response.data.message || 'Verification failed');
      }
    } catch (err) {
      toast.error('Payment verification failed. Contact support.');
    } finally {
      setLoading(false);
    }
  };

  const initializePayment = async () => {
    const numAmount = parseFloat(amount);
    if (!amount || numAmount < 100) {
      setError('Amount must be at least ₦100');
      return;
    }
    if (!publicKey || !paystackLoaded) {
      setError('Payment system not ready. Please wait.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userStr = localStorage.getItem('user');
      let userEmail = 'customer@marketstore.com';
      let userName = 'Customer';
      if (userStr) {
        const user = JSON.parse(userStr);
        userEmail = user.email || userEmail;
        userName = user.full_name || userName;
      }

      const { data } = await paymentAPI.initializePayment({ amount: numAmount });
      if (!data.success) throw new Error(data.message);

      const handler = window.PaystackPop.setup({
        key: publicKey,
        email: userEmail,
        amount: numAmount * 100,
        ref: data.reference,
        metadata: {
          custom_fields: [{ display_name: 'Customer Name', variable_name: 'customer_name', value: userName }]
        },
        callback: (res) => verifyPayment(res.reference),
        onClose: () => {
          setLoading(false);
          toast.error('Payment cancelled');
        }
      });
      handler.openIframe();
    } catch (err) {
      setError(err.message || 'Payment initialization failed');
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title><FaCreditCard className="me-2" /> Make Payment</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger" dismissible>{error}</Alert>}
        <div className="text-center mb-4">
          <Form.Control
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="text-center h2 py-3"
            style={{ fontSize: '2rem', fontWeight: 'bold' }}
            min="100"
            step="100"
            disabled={loading}
          />
          <small className="text-muted">Minimum: ₦100</small>
        </div>
        <div className="payment-methods p-3 border rounded-3 bg-light d-flex align-items-center">
          <FaCreditCard size={24} className="text-primary me-3" />
          <div><h6 className="mb-0">Pay with Card</h6><small>Visa, Mastercard, Verve</small></div>
        </div>
        <div className="mt-3 small text-muted"><FaSpinner className="me-1" /> Secure payment by Paystack</div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <button
          onClick={initializePayment}
          disabled={loading || !amount || parseFloat(amount) < 100 || !paystackLoaded || !publicKey}
          className="btn btn-primary custom-paystack-btn"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            opacity: loading || !amount ? 0.6 : 1,
          }}
        >
          {loading ? <Spinner size="sm" /> : <FaCreditCard />} {loading ? 'Processing...' : 'Pay Now'}
        </button>
      </Modal.Footer>
    </Modal>
  );
}
export default PaymentModal;