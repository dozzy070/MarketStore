import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

function DashboardRedirect() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (user?.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user?.role === 'vendor') {
        navigate('/vendor/dashboard', { replace: true });
      } else {
        // Default to user dashboard for customers or any other role
        navigate('/user/dashboard', { replace: true });
      }
    }
  }, [user, loading, navigate]);

  return <LoadingSpinner />;
}

export default DashboardRedirect;