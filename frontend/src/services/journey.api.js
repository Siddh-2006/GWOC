import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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

export const journeyApi = {
  // Get user's journey timeline
  getUserJourney: async (params = {}) => {
    const response = await api.get('/journey', { params });
    return response.data;
  },

  // Get single journey entry
  getJourneyEntry: async (entryId) => {
    const response = await api.get(`/journey/${entryId}`);
    return response.data;
  },

  // Complete a goal
  completeGoal: async (entryId, goalId) => {
    const response = await api.put(`/journey/${entryId}/goals/${goalId}/complete`);
    return response.data;
  },

  // Admin endpoints
  createJourneyEntry: async (entryData) => {
    const response = await api.post('/journey', entryData);
    return response.data;
  },

  updateJourneyEntry: async (entryId, updates) => {
    const response = await api.put(`/journey/${entryId}`, updates);
    return response.data;
  },

  deleteJourneyEntry: async (entryId) => {
    const response = await api.delete(`/journey/${entryId}`);
    return response.data;
  },

  getAllJourneyEntries: async (params = {}) => {
    const response = await api.get('/journey/admin/all', { params });
    return response.data;
  }
};