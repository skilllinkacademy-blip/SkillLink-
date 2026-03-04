import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export default function ProtectedRoute({ children, requireAuth = true }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (requireAuth && !user) {
    // Redirect to auth if trying to access app while not logged in
    const returnTo = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/auth?mode=login&returnTo=${returnTo}`} replace />;
  }

  if (!requireAuth && user) {
    // Redirect to app if trying to access landing/auth while logged in
    return <Navigate to="/app/opportunities" replace />;
  }

  return <>{children}</>;
}
