import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Loading from '../ui/Loading';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Debug logging
  console.log('AdminRoute - user:', user);
  console.log('AdminRoute - loading:', loading);
  console.log('AdminRoute - user.is_admin:', user?.is_admin);

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    console.log('AdminRoute - No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (!user.is_admin) {
    console.log('AdminRoute - User is not admin, redirecting to home');
    return <Navigate to="/" replace />;
  }

  console.log('AdminRoute - User is admin, rendering children');
  return children;
};

export default AdminRoute;

