import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://gwoc-lovat.vercel.app';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const sessionsApi = {
  // Get user's sessions
  getUserSessions: async (params = {}) => {
    const response = await api.get('/sessions', { params });
    return response.data;
  },

  // Get session details with notes
  getSessionDetails: async (sessionId) => {
    const response = await api.get(`/sessions/${sessionId}`);
    return response.data;
  },

  // Update session notes
  updateSessionNotes: async (sessionId, notesData) => {
    const response = await api.put(`/sessions/${sessionId}/notes`, notesData);
    return response.data;
  },

  // Add a goal to session
  addSessionGoal: async (sessionId, goal) => {
    const response = await api.post(`/sessions/${sessionId}/goals`, { goal });
    return response.data;
  },

  // Toggle goal completion
  toggleGoalCompletion: async (sessionId, goalId) => {
    const response = await api.put(`/sessions/${sessionId}/goals/${goalId}`);
    return response.data;
  }
};