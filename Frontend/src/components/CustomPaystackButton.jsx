// frontend/src/components/CustomPaystackButton.jsx
import React from 'react';
import { FaCreditCard } from 'react-icons/fa';

const CustomPaystackButton = ({ onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="custom-paystack-btn"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        width: '100%',
        opacity: disabled ? 0.6 : 1,
        transition: 'all 0.3s ease'
      }}
    >
      <FaCreditCard /> Pay Now
    </button>
  );
};

export default CustomPaystackButton;