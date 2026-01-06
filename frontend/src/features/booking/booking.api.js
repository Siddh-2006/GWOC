// API functions for booking functionality
import apiClient from '../../api/apiClient';

export const bookingApi = {
  // Get available slots for a specific date
  getAvailableSlots: async (date) => {
    try {
      const response = await apiClient.get(`/booking/slots?date=${date}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Get available slots error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch available slots');
    }
  },

  // Create a new booking
  createBooking: async (bookingData) => {
    try {
      const response = await apiClient.post('/booking', bookingData);
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
      const url = status ? `/booking/user?status=${status}` : '/booking/user';
      const response = await apiClient.get(url);
      return response.data.data || [];
    } catch (error) {
      console.error('Get user bookings error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch bookings');
    }
  },

  // Cancel a booking
  cancelBooking: async (bookingId) => {
    try {
      const response = await apiClient.delete(`/booking/${bookingId}`);
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
        const params = new URLSearchParams();

        if (filters.status) params.append('status', filters.status);
        if (filters.date) params.append('date', filters.date);
        if (filters.page) params.append('page', filters.page);
        if (filters.limit) params.append('limit', filters.limit);

        const response = await apiClient.get(`/booking/admin/all?${params.toString()}`);
        return response.data;
      } catch (error) {
        console.error('Get all bookings error:', error);
        throw new Error(error.response?.data?.message || 'Failed to fetch all bookings');
      }
    },

    // Confirm a booking (admin only)
    confirmBooking: async (bookingId, confirmationData) => {
      try {
        const response = await apiClient.put(`/booking/admin/confirm/${bookingId}`, confirmationData);
        return response.data.data;
      } catch (error) {
        console.error('Confirm booking error:', error);
        throw new Error(error.response?.data?.message || 'Failed to confirm booking');
      }
    },

    // Review a booking (admin only)
    reviewBooking: async (bookingId) => {
      try {
        const response = await apiClient.put(`/booking/admin/review/${bookingId}`);
        return response.data.data;
      } catch (error) {
        console.error('Review booking error:', error);
        throw new Error(error.response?.data?.message || 'Failed to review booking');
      }
    },

    // Approve a booking (admin only)
    approveBooking: async (bookingId) => {
      try {
        const response = await apiClient.put(`/booking/admin/approve/${bookingId}`);
        return response.data.data;
      } catch (error) {
        console.error('Approve booking error:', error);
        throw new Error(error.response?.data?.message || 'Failed to approve booking');
      }
    },

    // Reject a booking (admin only)
    rejectBooking: async (bookingId, rejectionReason) => {
      try {
        const response = await apiClient.delete(`/booking/admin/reject/${bookingId}`, {
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