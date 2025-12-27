import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import Chatbot from './features/chatbot/Chatbot';

import Booking from './features/booking/BookingPage';
import AdminDashboard from './features/admin/AdminDashboard';
import Home from './pages/Home';
import About from './pages/About';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import BlogPage from './pages/BlogPage';
import { Corporate } from './pages/Corporate';

import PrivacyPolicy from './pages/policies/PrivacyPolicy';
import RefundPolicy from './pages/policies/RefundPolicy';
import ConfidentialityPolicy from './pages/policies/ConfidentialityPolicy';

import Signup from './features/auth/Signup';
import Login from './features/auth/Login';
import VerifyEmail from './features/auth/VerifyEmail';
import ForgotPassword from './features/auth/ForgotPassword';
import ResetPassword from './features/auth/ResetPassword';

import useAuthStore from './store/useAuthStore';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/" replace />;

  return children;
};

// Admin Route Component - Redirects admin users to admin dashboard
const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  // If user is admin, redirect to admin dashboard
  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

// Placeholder components until pages are created
const Placeholder = ({ title }) => (
  <div className="py-20 text-center min-h-[60vh] flex flex-col justify-center items-center">
    <h1 className="text-4xl font-bold text-primary">{title}</h1>
    <p className="mt-4 text-gray-600">This section is coming soon.</p>
  </div>
);

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Layout>
        <Routes>
          <Route path="/" element={
            <AdminRoute>
              <Home />
            </AdminRoute>
          } />
          <Route path="/about" element={<About />} />
          <Route path="/psycho-education" element={<Placeholder title="Psycho-Education Awareness" />} />
          <Route path="/how-it-works" element={<Placeholder title="How It Works" />} />
          <Route path="/resources" element={<BlogPage />} />
          <Route path="/faqs" element={<FAQ />} />
          <Route path="/contact" element={<Contact />} />

          <Route
            path="/booking"
            element={
              <ProtectedRoute>
                <Booking />
              </ProtectedRoute>
            }
          />

          <Route path="/corporate" element={<Corporate />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/confidentiality" element={<ConfidentialityPolicy />} />

          <Route
            path="/admin/*"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Auth Routes */}
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
        <Chatbot />
      </Layout>
    </Router>
  );
}

export default App;
