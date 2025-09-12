import React from 'react';
import useAuth from '../hooks/useAuth';
import Dashboard from '../components/admin/Dashboard';
import { Navigate } from 'react-router-dom';

const AdminDashboardPage = () => {
  const { user } = useAuth();

  // Redirect if not admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return <Dashboard />;
};

export default AdminDashboardPage;
