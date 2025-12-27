import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const otpService = {
  // Send registration OTP
  sendRegistrationOTP: async (email) => {
    const response = await axios.post(`${API_BASE}/api/otp/send`, {
      email
    });
    return response.data;
  },

  // Verify registration OTP
  verifyRegistrationOTP: async (email, otp) => {
    const response = await axios.post(`${API_BASE}/api/otp/verify`, {
      email,
      otp
    });
    return response.data;
  },

  // Resend OTP
  resendOTP: async (email) => {
    const response = await axios.post(`${API_BASE}/api/otp/resend`, {
      email
    });
    return response.data;
  }
};