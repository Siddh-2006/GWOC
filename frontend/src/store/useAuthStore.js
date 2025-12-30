import { create } from 'zustand';
import { authApi } from '../features/auth/auth.api';

// Token validation interval (5 minutes)
const TOKEN_VALIDATION_INTERVAL = 5 * 60 * 1000;

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  accessToken: localStorage.getItem('accessToken') || null,
  isAuthenticated: !!localStorage.getItem('accessToken'),
  loading: false,
  error: null,
  isInitialized: false,
  validationInterval: null,

  // Start periodic token validation
  startTokenValidation: () => {
    const { validationInterval } = get();
    
    // Clear existing interval
    if (validationInterval) {
      clearInterval(validationInterval);
    }
    
    // Start new interval
    const interval = setInterval(async () => {
      const { isAuthenticated, accessToken } = get();
      
      if (isAuthenticated && accessToken) {
        try {
          await authApi.validateToken();
        } catch (error) {
          get().logout();
        }
      }
    }, TOKEN_VALIDATION_INTERVAL);
    
    set({ validationInterval: interval });
  },

  // Stop periodic token validation
  stopTokenValidation: () => {
    const { validationInterval } = get();
    if (validationInterval) {
      clearInterval(validationInterval);
      set({ validationInterval: null });
    }
  },

  // Initialize auth state on app startup
  initializeAuth: async () => {
    set({ loading: true, isInitialized: false });
    
    try {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!accessToken) {
        // No token, user is not logged in
        set({ 
          user: null, 
          accessToken: null, 
          isAuthenticated: false, 
          loading: false, 
          isInitialized: true 
        });
        return;
      }

      try {
        // Try to validate current token
        const response = await authApi.validateToken();
        
        if (response.success) {
          // Token is valid, update user data
          const userData = response.data.user;
          localStorage.setItem('user', JSON.stringify(userData));
          
          set({
            user: userData,
            accessToken,
            isAuthenticated: true,
            loading: false,
            isInitialized: true,
            error: null
          });
          
          // Start periodic token validation
          get().startTokenValidation();
          
          return;
        }
      } catch (tokenError) {
        // Token validation failed, try to refresh
        
        if (refreshToken) {
          try {
            const refreshResponse = await authApi.refreshTokens();
            
            if (refreshResponse.success) {
              const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshResponse.data;
              
              // Update tokens in localStorage
              localStorage.setItem('accessToken', newAccessToken);
              localStorage.setItem('refreshToken', newRefreshToken);
              
              // Validate the new token to get user data
              const validateResponse = await authApi.validateToken();
              
              if (validateResponse.success) {
                const userData = validateResponse.data.user;
                localStorage.setItem('user', JSON.stringify(userData));
                
                set({
                  user: userData,
                  accessToken: newAccessToken,
                  isAuthenticated: true,
                  loading: false,
                  isInitialized: true,
                  error: null
                });
                
                // Start periodic token validation
                get().startTokenValidation();
                
                return;
              }
            }
          } catch (refreshError) {
            // Token refresh failed
          }
        }
        
        // Both validation and refresh failed
        
        // Clear all auth data
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          loading: false,
          isInitialized: true,
          error: 'Session expired. Please log in again.'
        });
        return;
      }
    } catch (error) {
      console.error('❌ Auth initialization error:', error);
      
      // Clear all auth data on error
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        loading: false,
        isInitialized: true,
        error: 'Failed to restore session. Please log in again.'
      });
    }
  },

  setAuth: (user, accessToken, refreshToken) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    
    set({
      user,
      accessToken,
      isAuthenticated: true,
      error: null,
      isInitialized: true
    });

    // Start periodic token validation
    get().startTokenValidation();

    // Note: Redirect is now handled by the AuthRoute component in App.jsx
    // This prevents conflicts with React Router
  },

  logout: () => {
    // Stop token validation
    get().stopTokenValidation();
    
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      error: null,
      isInitialized: true
    });
  },

  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },

  updateUser: (updatedUser) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error: error || null }),
  clearError: () => set({ error: null })
}));

export default useAuthStore;
