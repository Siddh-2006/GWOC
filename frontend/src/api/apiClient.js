import axios from 'axios';

// Environment-aware API base URL
const getApiBaseUrl = () => {
  // Check if we have environment variable
  if (import.meta.env.VITE_API_URL) {
    // Add /api to the base URL since our environment variables now contain just the domain
    return `${import.meta.env.VITE_API_URL}/api`;
  }

  // Fallback logic based on environment
  if (import.meta.env.PROD) {
    // Production build - default to Vercel if VITE_API_URL is missing
    // IMPORTANT: In Vercel, set VITE_API_URL to your new Render URL
    return 'https://gwoc-lovat.vercel.app/api';
  } else {
    // Development - use local backend
    return 'http://localhost:3001/api';
  }
};

const API_BASE = getApiBaseUrl();

console.log('🔗 API Base URL:', API_BASE);

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000 // 30 second timeout
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling token expiration
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and not already retrying and not a refresh token request or logout request
    if (error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/refresh-token') &&
      !originalRequest.url?.includes('/logout')) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token available');

        const response = await axios.post(`${API_BASE}/auth/refresh-token`, { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh token expired or invalid - clear all auth data
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');

        // Only redirect to login if not already on auth pages
        const currentPath = window.location.pathname;
        const authPages = ['/login', '/signup', '/verify-email', '/forgot-password', '/reset-password'];

        if (!authPages.includes(currentPath)) {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
