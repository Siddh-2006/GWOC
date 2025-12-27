import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm';
import { SignupForm } from '../components/auth/SignupForm';
import { OTPVerification } from '../components/auth/OTPVerification';
import { ForgotPassword } from '../components/auth/ForgotPassword';
import useAuthStore from '../store/useAuthStore';
import './AuthPage.css';

export const AuthPage = () => {
  const [currentView, setCurrentView] = useState('login'); // 'login', 'signup', 'otp', 'forgot'
  const [verificationEmail, setVerificationEmail] = useState('');
  
  const { isAuthenticated, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Clear errors when switching views
  useEffect(() => {
    clearError();
  }, [currentView, clearError]);

  const handleSwitchToSignup = () => {
    setCurrentView('signup');
  };

  const handleSwitchToLogin = () => {
    setCurrentView('login');
  };

  const handleForgotPassword = () => {
    setCurrentView('forgot');
  };

  const handleRequireVerification = (email) => {
    setVerificationEmail(email);
    setCurrentView('otp');
  };

  const handleVerificationSuccess = () => {
    setCurrentView('login');
    // You can show a success message here
  };

  const handleResetSuccess = () => {
    setCurrentView('login');
    // You can show a success message here
  };

  const handleBackToSignup = () => {
    setCurrentView('signup');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'signup':
        return (
          <SignupForm
            onSwitchToLogin={handleSwitchToLogin}
            onRequireVerification={handleRequireVerification}
          />
        );
      case 'otp':
        return (
          <OTPVerification
            email={verificationEmail}
            onVerificationSuccess={handleVerificationSuccess}
            onBackToSignup={handleBackToSignup}
          />
        );
      case 'forgot':
        return (
          <ForgotPassword
            onBackToLogin={handleSwitchToLogin}
            onResetSuccess={handleResetSuccess}
          />
        );
      default:
        return (
          <LoginForm
            onSwitchToSignup={handleSwitchToSignup}
            onForgotPassword={handleForgotPassword}
          />
        );
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>MindSettler</h1>
          <p>Your mental health companion</p>
        </div>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        {renderCurrentView()}
      </div>
    </div>
  );
};