import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL+"/api",
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const mediaApi = {
  // Public endpoints
  getPublishedMedia: async (params = {}) => {
    const response = await api.get('/media/published', { params });
    return response.data;
  },

  getMedia: async (mediaId) => {
    const response = await api.get(`/media/${mediaId}`);
    return response.data;
  },

  likeMedia: async (mediaId) => {
    const response = await api.post(`/media/${mediaId}/like`);
    return response.data;
  },

  addComment: async (mediaId, content) => {
    const response = await api.post(`/media/${mediaId}/comment`, { content });
    return response.data;
  },

  shareMedia: async (mediaId) => {
    const response = await api.post(`/media/${mediaId}/share`);
    return response.data;
  },

  // Admin endpoints
  createMedia: async (mediaData) => {
    const response = await api.post('/media', mediaData);
    return response.data;
  },

  getAllMedia: async (params = {}) => {
    const response = await api.get('/media/admin/all', { params });
    return response.data;
  },

  updateMedia: async (mediaId, updates) => {
    const response = await api.put(`/media/${mediaId}`, updates);
    return response.data;
  },

  deleteMedia: async (mediaId) => {
    const response = await api.delete(`/media/${mediaId}`);
    return response.data;
  }
};