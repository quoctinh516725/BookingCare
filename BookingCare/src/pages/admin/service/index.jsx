import React from 'react';
import { AdminServiceCacheProvider } from '../contexts/AdminServiceCacheContext';
import ServiceList from './ServiceList';
import ServiceCategories from './ServiceCategories';
import { Routes, Route, useLocation } from 'react-router-dom';

// Wrapped service components with cache provider
const AdminServicePage = () => {
  const location = useLocation();
  const pathName = location.pathname;
  
  // Determine which component to render based on the current path
  const renderComponent = () => {
    if (pathName.includes('/categories')) {
      return <ServiceCategories />;
    } else {
      return <ServiceList />;
    }
  };

  return (
    <AdminServiceCacheProvider>
      {renderComponent()}
    </AdminServiceCacheProvider>
  );
};

export default AdminServicePage; 