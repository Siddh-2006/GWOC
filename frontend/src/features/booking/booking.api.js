// API functions for booking functionality
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const bookingApi = {
  getAvailableSlots: async (date) => {
    const response = await axios.get(`${API_BASE}/api/booking/slots?date=${date}`);
    return response.data;
  },

  createBooking: async (bookingData) => {
    const response = await axios.post(`${API_BASE}/api/booking`, bookingData);
    return response.data;
  }
};