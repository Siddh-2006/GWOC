import React, { useState } from 'react';
import { authService } from '../../services/auth.api';
import useAuthStore from '../../store/useAuthStore';
import './AuthForms.css';

export const ForgotPassword = ({ onBackToLogin, onResetSuccess }) => {
  const [step, setStep] = useState('email'); // 'email' or 'reset'
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  
  const { setLoading, setError, loading } = useAuthStore();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateEmailForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateResetForm = () => {
    const newErrors = {};
    
    if (!formData.otp) {
      newErrors.otp = 'OTP is required';
    } else if (formData.otp.length !== 6) {
      newErrors.otp = 'OTP must be 6 digits';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEmailForm()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await authService.forgotPassword(formData.email);
      
      if (response.success) {
        setStep('reset');
      } else {
        setError(response.message || 'Failed to send reset code');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to send reset code. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateResetForm()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await authService.resetPassword({
        email: formData.email,
        otp: formData.otp,
        password: formData.password
      });
      
      if (response.success) {
        onResetSuccess();
      } else {
        setError(response.message || 'Password reset failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Password reset failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (step === 'email') {
    return (
      <div className="auth-form">
        <h2>Reset Your Password</h2>
        <p className="verification-text">
          Enter your email address and we'll send you a code to reset your password.
        </p>
        
        <form onSubmit={handleEmailSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              placeholder="Enter your email"
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Code'}
          </button>
        </form>

        <div className="auth-links">
          <button 
            type="button" 
            className="link-button"
            onClick={onBackToLogin}
          >
            ← Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-form">
      <h2>Reset Your Password</h2>
      <p className="verification-text">
        Enter the 6-digit code sent to <strong>{formData.email}</strong> and your new password.
      </p>
      
      <form onSubmit={handleResetSubmit}>
        <div className="form-group">
          <label htmlFor="otp">Verification Code</label>
          <input
            type="text"
            id="otp"
            name="otp"
            value={formData.otp}
            onChange={handleChange}
            className={`otp-input ${errors.otp ? 'error' : ''}`}
            placeholder="Enter 6-digit code"
            maxLength="6"
          />
          {errors.otp && <span className="error-text">{errors.otp}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="password">New Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={errors.password ? 'error' : ''}
            placeholder="Enter new password (min 6 characters)"
          />
          {errors.password && <span className="error-text">{errors.password}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm New Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={errors.confirmPassword ? 'error' : ''}
            placeholder="Confirm new password"
          />
          {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
        </div>

        <button 
          type="submit" 
          className="auth-button"
          disabled={loading}
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>

      <div className="auth-links">
        <button 
          type="button" 
          className="link-button"
          onClick={() => setStep('email')}
        >
          ← Back to Email
        </button>
      </div>
    </div>
  );
};