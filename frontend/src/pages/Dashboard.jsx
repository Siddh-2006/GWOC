import React, { useEffect } from 'react';
import useAuthStore from '../store/useAuthStore';
import { authService } from '../services/auth.api';
import './Dashboard.css';

export const Dashboard = () => {
  const { user, logout, setLoading } = useAuthStore();

  const handleLogout = async () => {
    setLoading(true);
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logout();
      setLoading(false);
    }
  };

  const handleLogoutAll = async () => {
    setLoading(true);
    try {
      await authService.logoutAll();
    } catch (error) {
      console.error('Logout all error:', error);
    } finally {
      logout();
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Welcome to MindSettler</h1>
        <div className="user-info">
          <span>Hello, {user?.firstName || 'User'}!</span>
          <div className="user-actions">
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
            <button onClick={handleLogoutAll} className="logout-all-btn">
              Logout All Devices
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="welcome-section">
          <h2>Your Mental Health Journey Starts Here</h2>
          <p>Access our AI-powered chatbot, book appointments, and explore mental health resources.</p>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>AI Chatbot</h3>
            <p>Get instant support and guidance from our AI mental health assistant.</p>
            <button className="card-button">Start Chat</button>
          </div>

          <div className="dashboard-card">
            <h3>Book Appointment</h3>
            <p>Schedule a session with our qualified mental health professionals.</p>
            <button className="card-button">Book Now</button>
          </div>

          <div className="dashboard-card">
            <h3>Resources</h3>
            <p>Explore articles, videos, and tools for mental wellness.</p>
            <button className="card-button">Browse Resources</button>
          </div>

          <div className="dashboard-card">
            <h3>My Profile</h3>
            <p>Manage your account settings and preferences.</p>
            <button className="card-button">View Profile</button>
          </div>
        </div>

        <div className="user-details">
          <h3>Account Information</h3>
          <div className="user-detail-grid">
            <div className="detail-item">
              <label>Name:</label>
              <span>{user?.name || `${user?.firstName} ${user?.lastName}`}</span>
            </div>
            <div className="detail-item">
              <label>Email:</label>
              <span>{user?.email}</span>
            </div>
            <div className="detail-item">
              <label>Role:</label>
              <span>{user?.role}</span>
            </div>
            <div className="detail-item">
              <label>Member Since:</label>
              <span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};