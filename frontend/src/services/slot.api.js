import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const slotApi = {
  // Admin slot management
  createSlot: async (slotData) => {
    const response = await api.post('/booking/admin/slots', slotData);
    return response.data;
  },

  getAllSlots: async (params = {}) => {
    const response = await api.get('/booking/admin/slots', { params });
    return response.data;
  },

  updateSlot: async (slotId, updates) => {
    const response = await api.put(`/booking/admin/slots/${slotId}`, updates);
    return response.data;
  },

  deleteSlot: async (slotId) => {
    const response = await api.delete(`/booking/admin/slots/${slotId}`);
    return response.data;
  }
};