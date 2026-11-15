import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { completeLogin } = useAuth();

  useEffect(() => {
    const completeGoogleLogin = async () => {
      const token = new URLSearchParams(window.location.hash.slice(1)).get('token');
      window.history.replaceState(null, '', window.location.pathname);

      if (!token) {
        const error = searchParams.get('error');
        toast.error(error === 'google_account_not_registered'
          ? 'This Google account is not linked to a registered account. Log in with your email and password.'
          : 'Google login failed');
        navigate('/login', { replace: true });
        return;
      }

      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const response = await axios.get(`${API_URL}/auth/verify`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const user = response.data?.user;
        if (response.data?.success !== true || !user) {
          throw new Error('Unable to verify Google login');
        }

        completeLogin(token, user);
        toast.success(`Welcome, ${user.full_name}!`);
        navigate(user.role === 'admin'
          ? '/admin/dashboard'
          : user.role === 'vendor'
            ? '/vendor/dashboard'
            : '/dashboard', { replace: true });
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.error('Google login failed. Please register or log in with your account.');
        navigate('/login', { replace: true });
      }
    };

    void completeGoogleLogin();
  }, [completeLogin, navigate, searchParams]);

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <div className="text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Completing Google login...</p>
      </div>
    </div>
  );
}

export default GoogleCallback;
