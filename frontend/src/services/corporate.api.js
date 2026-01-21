import apiClient from '../api/apiClient';

export const corporateService = {
  /**
   * Submit corporate inquiry
   * Calm, human-centered submission process
   */
  submitInquiry: async (inquiryData) => {
    const response = await apiClient.post('/corporate/inquiry', inquiryData);
    return response.data;
  },

  /**
   * Admin functions (require authentication)
   */
  admin: {
    // Get all inquiries with filtering
    getInquiries: async (filters = {}) => {
      const response = await apiClient.get('/corporate/admin/inquiries', {
        params: filters
      });
      return response.data;
    },

    // Get single inquiry
    getInquiry: async (id) => {
      const response = await apiClient.get(`/corporate/admin/inquiries/${id}`);
      return response.data;
    },

    // Update inquiry
    updateInquiry: async (id, updateData) => {
      const response = await apiClient.patch(`/corporate/admin/inquiries/${id}`, updateData);
      return response.data;
    },

    // Get statistics
    getStats: async () => {
      const response = await apiClient.get('/corporate/admin/inquiries/stats');
      return response.data;
    }
  }
};