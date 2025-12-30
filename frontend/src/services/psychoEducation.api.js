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

export const psychoEducationApi = {
  // Public endpoints
  getPublishedContent: async (params = {}) => {
    const response = await api.get('/psycho-education/published', { params });
    return response.data;
  },

  getContent: async (contentId) => {
    const response = await api.get(`/psycho-education/${contentId}`);
    return response.data;
  },

  likeContent: async (contentId) => {
    const response = await api.post(`/psycho-education/${contentId}/like`);
    return response.data;
  },

  markHelpful: async (contentId) => {
    const response = await api.post(`/psycho-education/${contentId}/helpful`);
    return response.data;
  },

  addComment: async (contentId, content) => {
    const response = await api.post(`/psycho-education/${contentId}/comment`, { content });
    return response.data;
  },

  shareContent: async (contentId) => {
    const response = await api.post(`/psycho-education/${contentId}/share`);
    return response.data;
  },

  // Admin endpoints
  createContent: async (contentData) => {
    const response = await api.post('/psycho-education', contentData);
    return response.data;
  },

  getAllContent: async (params = {}) => {
    const response = await api.get('/psycho-education/admin/all', { params });
    return response.data;
  },

  updateContent: async (contentId, updates) => {
    const response = await api.put(`/psycho-education/${contentId}`, updates);
    return response.data;
  },

  deleteContent: async (contentId) => {
    const response = await api.delete(`/psycho-education/${contentId}`);
    return response.data;
  }
};