// frontend/src/components/GoogleLoginButton.jsx
import React from 'react';
import { FaGoogle } from 'react-icons/fa';
import { Button } from 'react-bootstrap';

function GoogleLoginButton() {
  const handleGoogleLogin = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    window.location.assign(`${apiUrl.replace(/\/+$/, '')}/auth/google`);
  };

  return (
    <Button 
      variant="outline-danger" 
      className="w-100 py-2 d-flex align-items-center justify-content-center gap-2"
      onClick={handleGoogleLogin}
      style={{ borderRadius: '50px' }}
    >
      <FaGoogle /> Continue with Google
    </Button>
  );
}

export default GoogleLoginButton;