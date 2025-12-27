import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { authService } from '../services/auth.api';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user, setAuth, logout } = useAuthStore();

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
    return <Navigate to="/auth" replace />;
  }

  return children;
};