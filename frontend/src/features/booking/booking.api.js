// API functions for booking functionality
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Create axios instance with auth token
const createAuthAxios = () => {
  const token = localStorage.getItem('accessToken');
  return axios.create({
    baseURL: `${API_BASE}/api`,
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    }
  });
};

export const bookingApi = {
  // Get available slots for a specific date
  getAvailableSlots: async (date) => {
    try {
      // Use direct axios call since this endpoint is public
      const response = await axios.get(`${API_BASE}/api/booking/slots?date=${date}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Get available slots error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch available slots');
    }
  },

  // Create a new booking
  createBooking: async (bookingData) => {
    try {
      const api = createAuthAxios();
      const response = await api.post('/booking', bookingData);
      return response.data.data;
    } catch (error) {
      console.error('Create booking error:', error);
      
      // Provide more specific error messages
      if (error.response?.status === 401) {
        throw new Error('Please log in to book a session');
      }
      
      throw new Error(error.response?.data?.message || 'Failed to create booking');
    }
  },

  // Get user's bookings
  getUserBookings: async (status = null) => {
    try {
      const api = createAuthAxios();
      const url = status ? `/booking/user?status=${status}` : '/booking/user';
      const response = await api.get(url);
      return response.data.data || [];
    } catch (error) {
      console.error('Get user bookings error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch bookings');
    }
  },

  // Cancel a booking
  cancelBooking: async (bookingId) => {
    try {
      const api = createAuthAxios();
      const response = await api.delete(`/booking/${bookingId}`);
      return response.data.data;
    } catch (error) {
      console.error('Cancel booking error:', error);
      throw new Error(error.response?.data?.message || 'Failed to cancel booking');
    }
  },

  // Admin functions
  admin: {
    // Get all bookings (admin only)
    getAllBookings: async (filters = {}) => {
      try {
        const api = createAuthAxios();
        const params = new URLSearchParams();
        
        if (filters.status) params.append('status', filters.status);
        if (filters.date) params.append('date', filters.date);
        if (filters.page) params.append('page', filters.page);
        if (filters.limit) params.append('limit', filters.limit);
        
        const response = await api.get(`/booking/admin/all?${params.toString()}`);
        return response.data;
      } catch (error) {
        console.error('Get all bookings error:', error);
        throw new Error(error.response?.data?.message || 'Failed to fetch all bookings');
      }
    },

    // Confirm a booking (admin only)
    confirmBooking: async (bookingId, confirmationData) => {
      try {
        const api = createAuthAxios();
        const response = await api.put(`/booking/admin/confirm/${bookingId}`, confirmationData);
        return response.data.data;
      } catch (error) {
        console.error('Confirm booking error:', error);
        throw new Error(error.response?.data?.message || 'Failed to confirm booking');
      }
    },

    // Review a booking (admin only)
    reviewBooking: async (bookingId) => {
      try {
        const api = createAuthAxios();
        const response = await api.put(`/booking/admin/review/${bookingId}`);
        return response.data.data;
      } catch (error) {
        console.error('Review booking error:', error);
        throw new Error(error.response?.data?.message || 'Failed to review booking');
      }
    },

    // Reject a booking (admin only)
    rejectBooking: async (bookingId, rejectionReason) => {
      try {
        const api = createAuthAxios();
        const response = await api.delete(`/booking/admin/reject/${bookingId}`, {
          data: { rejectionReason }
        });
        return response.data.data;
      } catch (error) {
        console.error('Reject booking error:', error);
        throw new Error(error.response?.data?.message || 'Failed to reject booking');
      }
    }
  }
};