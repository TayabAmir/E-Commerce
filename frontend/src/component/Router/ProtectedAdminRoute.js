import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import Loader from '../layout/Loader/Loader';

const ProtectedRoute = () => {
  const { loading, isAuthenticated, user } = useSelector((state) => state.user);

  if (loading) {
    return <div> <Loader/> </div>;
  }

  return (isAuthenticated && user.role === "admin" ) ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
