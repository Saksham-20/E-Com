import React from 'react';
import useAuth from '../hooks/useAuth';
import Analytics from '../components/admin/Analytics';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { Navigate } from 'react-router-dom';

const AdminAnalyticsPage = () => {
  const { user } = useAuth();

  // Redirect if not admin
  if (!user || !user.is_admin) {
    return <Navigate to="/login" replace />;
  }

  return (
    <ErrorBoundary>
      <Analytics />
    </ErrorBoundary>
  );
};

export default AdminAnalyticsPage;
