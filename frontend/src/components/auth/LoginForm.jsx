import React, { useState } from 'react';
import { authService } from '../../services/auth.api';
import useAuthStore from '../../store/useAuthStore';
import './AuthForms.css';

export const LoginForm = ({ onSwitchToSignup, onForgotPassword }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  
  const { setAuth, setLoading, setError, loading } = useAuthStore();

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

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
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
      const response = await authService.signIn(formData);
      
      if (response.success) {
        const { user, accessToken, refreshToken } = response.data;
        setAuth(user, accessToken, refreshToken);
        // Redirect will be handled by the parent component or router
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <h2>Sign In to MindSettler</h2>
      
      <form onSubmit={handleSubmit}>
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

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={errors.password ? 'error' : ''}
            placeholder="Enter your password"
          />
          {errors.password && <span className="error-text">{errors.password}</span>}
        </div>

        <button 
          type="submit" 
          className="auth-button"
          disabled={loading}
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      <div className="auth-links">
        <button 
          type="button" 
          className="link-button"
          onClick={onForgotPassword}
        >
          Forgot Password?
        </button>
        
        <p>
          Don't have an account?{' '}
          <button 
            type="button" 
            className="link-button"
            onClick={onSwitchToSignup}
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
};