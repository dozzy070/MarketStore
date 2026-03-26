// frontend/src/components/PrivateRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth();
  
  console.log('🔒 PrivateRoute - Current state:', { 
    user, 
    loading, 
    isAuthenticated,
    path: window.location.pathname 
  });
  
  // Show nothing while checking authentication (prevents flash of login)
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  // Not authenticated – redirect to login
  if (!isAuthenticated) {
    console.log('❌ PrivateRoute - Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  console.log('✅ PrivateRoute - Authenticated, rendering children');
  return children;
};

export default PrivateRoute;