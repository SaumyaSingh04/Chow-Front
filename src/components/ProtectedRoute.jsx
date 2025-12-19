import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  console.log('ProtectedRoute - Token:', !!token);
  console.log('ProtectedRoute - User:', user);
  console.log('ProtectedRoute - RequireAdmin:', requireAdmin);
  console.log('ProtectedRoute - User Role:', user.role);

  if (!token) {
    console.log('No token, redirecting to login');
    return <Navigate to="/account" replace />;
  }

  if (requireAdmin && user.role !== 'admin') {
    console.log('Not admin, redirecting to home');
    return <Navigate to="/" replace />;
  }

  console.log('Access granted');
  return children;
};

export default ProtectedRoute;