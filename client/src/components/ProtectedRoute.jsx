import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-beige-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-stone-200 border-t-primary-800 animate-spin" />
          <span className="text-sm font-semibold text-sage-500 animate-pulse">Synchronizing INARI ledger...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login page and save location
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Role unauthorized
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
