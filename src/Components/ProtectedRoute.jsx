import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

// Protected route component - redirects to login if not authenticated
export const ProtectedRoute = () => {
  const { isLoggedIn, loading } = useAuth();
  
  // If we're still loading, show nothing or a loading spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }
  
  // If user is not logged in, redirect to login page
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  // If user is logged in, render the child routes
  return <Outlet />;
};

// Public only route - redirects to home if already authenticated (for login/signup pages)
export const PublicOnlyRoute = ({ children }) => {
  const { isLoggedIn, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }
  
  if (isLoggedIn) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

export default { ProtectedRoute, PublicOnlyRoute };