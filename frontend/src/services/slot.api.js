import apiClient from '../api/apiClient';

export const slotApi = {
  // Admin slot management
  createSlot: async (slotData) => {
    const response = await apiClient.post('/booking/admin/slots', slotData);
    return response.data;
  },

  getAllSlots: async (params = {}) => {
    const response = await apiClient.get('/booking/admin/slots', { params });
    return response.data;
  },

  updateSlot: async (slotId, updates) => {
    const response = await apiClient.put(`/booking/admin/slots/${slotId}`, updates);
    return response.data;
  },

  deleteSlot: async (slotId) => {
    const response = await apiClient.delete(`/booking/admin/slots/${slotId}`);
    return response.data;
  },

  bulkCleanup: async () => {
    const response = await apiClient.post('/booking/admin/slots/cleanup');
    return response.data;
  }
};