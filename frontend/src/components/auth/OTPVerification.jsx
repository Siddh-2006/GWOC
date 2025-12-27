import React, { useState, useEffect } from 'react';
import { otpService } from '../../services/otp.api';
import useAuthStore from '../../store/useAuthStore';
import './AuthForms.css';

export const OTPVerification = ({ email, onVerificationSuccess, onBackToSignup }) => {
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState({});
  const [countdown, setCountdown] = useState(0);
  
  const { setLoading, setError, loading } = useAuthStore();

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    if (value.length <= 6) {
      setOtp(value);
      if (errors.otp) {
        setErrors(prev => ({ ...prev, otp: '' }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!otp) {
      newErrors.otp = 'OTP is required';
    } else if (otp.length !== 6) {
      newErrors.otp = 'OTP must be 6 digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await otpService.verifyRegistrationOTP(email, otp);
      
      if (response.success) {
        onVerificationSuccess();
      } else {
        setError(response.message || 'OTP verification failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'OTP verification failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;

    setLoading(true);
    setError(null);

    try {
      const response = await otpService.resendOTP(email);
      
      if (response.success) {
        setCountdown(60); // 60 seconds countdown
        setOtp(''); // Clear current OTP
        // Show success message (you can add a toast notification here)
      } else {
        setError(response.message || 'Failed to resend OTP');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to resend OTP. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <h2>Verify Your Email</h2>
      <p className="verification-text">
        We've sent a 6-digit verification code to <strong>{email}</strong>
      </p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="otp">Verification Code</label>
          <input
            type="text"
            id="otp"
            name="otp"
            value={otp}
            onChange={handleChange}
            className={`otp-input ${errors.otp ? 'error' : ''}`}
            placeholder="Enter 6-digit code"
            maxLength="6"
          />
          {errors.otp && <span className="error-text">{errors.otp}</span>}
        </div>

        <button 
          type="submit" 
          className="auth-button"
          disabled={loading}
        >
          {loading ? 'Verifying...' : 'Verify Email'}
        </button>
      </form>

      <div className="auth-links">
        <p>
          Didn't receive the code?{' '}
          <button 
            type="button" 
            className="link-button"
            onClick={handleResendOTP}
            disabled={countdown > 0 || loading}
          >
            {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
          </button>
        </p>
        
        <button 
          type="button" 
          className="link-button"
          onClick={onBackToSignup}
        >
          ← Back to Sign Up
        </button>
      </div>
    </div>
  );
};