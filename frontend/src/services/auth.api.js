import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Create axios instance with interceptors
const authApi = axios.create({
  baseURL: `${API_BASE}/api/auth`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
authApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
authApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE}/api/auth/refresh-token`, {
            refreshToken
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return authApi(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export const authService = {
  // Sign up
  signUp: async (userData) => {
    const response = await authApi.post('/signup', userData);
    return response.data;
  },

  // Sign in
  signIn: async (credentials) => {
    const response = await authApi.post('/signin', credentials);
    return response.data;
  },

  // Logout
  logout: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await authApi.post('/logout', { refreshToken });
    return response.data;
  },

  // Logout from all devices
  logoutAll: async () => {
    const response = await authApi.post('/logout-all');
    return response.data;
  },

  // Get user profile
  getProfile: async () => {
    const response = await authApi.get('/profile');
    return response.data;
  },

  // Update profile
  updateProfile: async (profileData) => {
    const response = await authApi.put('/profile', profileData);
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await authApi.post('/forgot-password', { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (resetData) => {
    const response = await authApi.post('/reset-password', resetData);
    return response.data;
  },

  // Refresh token
  refreshToken: async (refreshToken) => {
    const response = await axios.post(`${API_BASE}/api/auth/refresh-token`, {
      refreshToken
    });
    return response.data;
  }
};