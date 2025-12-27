import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  accessToken: localStorage.getItem('accessToken') || null,
  isAuthenticated: !!localStorage.getItem('accessToken'),
  loading: false,
  error: null,

  setAuth: (user, accessToken, refreshToken) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    
    set({
      user,
      accessToken,
      isAuthenticated: true,
      error: null
    });

    // Auto-redirect based on user role
    if (user?.role === 'admin') {
      // Redirect admin users to admin dashboard
      window.location.href = '/admin';
    } else {
      // Redirect regular users to home/dashboard
      window.location.href = '/';
    }
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      error: null
    });
  },

  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error: error || null }),
  clearError: () => set({ error: null })
}));

export default useAuthStore;
