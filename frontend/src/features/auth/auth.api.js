import apiClient from '../../api/apiClient';

export const authApi = {
  signup: async (userData) => {
    const response = await apiClient.post('/api/auth/signup', userData);
    return response.data;
  },

  signin: async (credentials) => {
    const response = await apiClient.post('/api/auth/signin', credentials);
    return response.data;
  },

  verifyEmail: async (data) => {
    const response = await apiClient.post('/api/otp/verify', data);
    return response.data;
  },

  resendOTP: async (email) => {
    const response = await apiClient.post('/api/otp/resend', { email });
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await apiClient.post('/api/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (data) => {
    const response = await apiClient.post('/api/auth/reset-password', data);
    return response.data;
  },

  getProfile: async () => {
    const response = await apiClient.get('/api/auth/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await apiClient.put('/api/auth/profile', profileData);
    return response.data;
  },

  logout: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await apiClient.post('/api/auth/logout', { refreshToken });
    return response.data;
  },

  validateToken: async () => {
    const response = await apiClient.get('/api/auth/validate');
    return response.data;
  },

  refreshTokens: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token available');
    
    const response = await apiClient.post('/api/auth/refresh-token', { refreshToken });
    return response.data;
  }
};
