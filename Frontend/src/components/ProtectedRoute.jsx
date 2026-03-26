// frontend/src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute - Protects routes that require specific roles
 * Use this for role-based access control (admin, vendor, etc.)
 */
const ProtectedRoute = ({ allowedRoles = [], redirectTo = '/login', fallbackRedirect = '/dashboard' }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  console.log('🛡️ ProtectedRoute - Current state:', { 
    user, 
    isAuthenticated, 
    loading, 
    allowedRoles,
    path: location.pathname 
  });

  // Wait for auth to initialize
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated || !user) {
    console.log('❌ ProtectedRoute - Not authenticated, redirecting to login');
    return <Navigate to={redirectTo} state={{ from: location.pathname }} replace />;
  }

  // Check role permissions
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    console.log('❌ ProtectedRoute - Role not allowed:', user.role, 'Allowed:', allowedRoles);
    return <Navigate to={fallbackRedirect} replace />;
  }

  console.log('✅ ProtectedRoute - Access granted for role:', user.role);
  return <Outlet />;
};

export default ProtectedRoute;