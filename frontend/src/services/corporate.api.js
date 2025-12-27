import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Create axios instance for corporate API calls
const corporateApi = axios.create({
  baseURL: `${API_BASE}/api/corporate`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const corporateService = {
  /**
   * Submit corporate inquiry
   * Calm, human-centered submission process
   */
  submitInquiry: async (inquiryData) => {
    const response = await corporateApi.post('/inquiry', inquiryData);
    return response.data;
  },

  /**
   * Admin functions (require authentication)
   */
  admin: {
    // Get all inquiries with filtering
    getInquiries: async (filters = {}) => {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${API_BASE}/api/corporate/admin/inquiries`, {
        headers: { Authorization: `Bearer ${token}` },
        params: filters
      });
      return response.data;
    },

    // Get single inquiry
    getInquiry: async (id) => {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${API_BASE}/api/corporate/admin/inquiries/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },

    // Update inquiry
    updateInquiry: async (id, updateData) => {
      const token = localStorage.getItem('accessToken');
      const response = await axios.patch(`${API_BASE}/api/corporate/admin/inquiries/${id}`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },

    // Get statistics
    getStats: async () => {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${API_BASE}/api/corporate/admin/inquiries/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    }
  }
};