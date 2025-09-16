import React from 'react';
import useAuth from '../hooks/useAuth';
import Dashboard from '../components/admin/Dashboard';
import { Navigate } from 'react-router-dom';

const AdminDashboardPage = () => {
  const { user } = useAuth();

  console.log('AdminDashboardPage - user:', user);
  console.log('AdminDashboardPage - user.is_admin:', user?.is_admin);

  // Redirect if not admin
  if (!user || !user.is_admin) {
    console.log('AdminDashboardPage - redirecting to login, user:', user, 'is_admin:', user?.is_admin);
    return <Navigate to="/login" replace />;
  }

  console.log('AdminDashboardPage - rendering Dashboard component');
  return <Dashboard />;
};

export default AdminDashboardPage;
