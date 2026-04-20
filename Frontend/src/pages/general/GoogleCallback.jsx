// frontend/src/pages/GoogleCallback.jsx
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import toast from 'react-hot-toast';

function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const userParam = searchParams.get('user');

    if (token && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        toast.success(`Welcome, ${user.full_name}!`);
        
        // Redirect based on role
        if (user.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (user.role === 'vendor') {
          navigate('/vendor/dashboard');
        } else {
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        toast.error('Failed to complete Google login');
        navigate('/login');
      }
    } else {
      const error = searchParams.get('error');
      toast.error(error || 'Google login failed');
      navigate('/login');
    }
  }, [searchParams, navigate]);

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
