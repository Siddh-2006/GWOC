import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { authService } from '../services/auth.api';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user, setAuth, logout } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    // Verify token on mount if authenticated
    const verifyAuth = async () => {
      if (isAuthenticated && !user) {
        try {
          const response = await authService.getProfile();
          if (response.success) {
            const accessToken = localStorage.getItem('accessToken');
            const refreshToken = localStorage.getItem('refreshToken');
            setAuth(response.data.user, accessToken, refreshToken);
          }
        } catch (error) {
          // Token is invalid, logout user
          logout();
        }
      }
    };

    verifyAuth();
  }, [isAuthenticated, user, setAuth, logout]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect admin users to admin dashboard if they're on the home page
  if (user?.role === 'admin' && location.pathname === '/') {
    return <Navigate to="/admin" replace />;
  }

  return children;
};