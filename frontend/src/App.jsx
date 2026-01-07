import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/Layout';

import ScrollToTop from './components/ScrollToTop';
import Chatbot from './features/chatbot/Chatbot';

import Booking from './features/booking/BookingPage';
import UserBookings from './features/booking/UserBookings';
import AdminDashboard from './features/admin/AdminDashboard';
import Home from './pages/Home';
import About from './pages/About';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import BlogPage from './pages/BlogPage';
import ResourcesOld from './pages/Resources';
import Resources from './pages/content-web/ResourcesPage';
import Profile from './pages/Profile';
import ProfileSimple from './pages/ProfileSimple';
import { Corporate } from './pages/Corporate';

import PsychoEducationHub from './pages/PsychoEducationHub';
import PsychoEducationOld from './pages/PsychoEducation';
import LibraryPage from './pages/content-web/LibraryPage';

import PrivacyPolicy from './pages/policies/PrivacyPolicy';
import RefundPolicy from './pages/policies/RefundPolicy';
import ConfidentialityPolicy from './pages/policies/ConfidentialityPolicy';


import Signup from './features/auth/Signup';
import Login from './features/auth/Login';
import VerifyEmail from './features/auth/VerifyEmail';
import ForgotPassword from './features/auth/ForgotPassword';
import ResetPassword from './features/auth/ResetPassword';
import PaymentPage from './pages/PaymentPage';

import useAuthStore from './store/useAuthStore';
import ResourceReader from './features/psycho-education/ResourceReader';

// Loading component for auth initialization
const AuthLoader = () => (
  <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-gray-600">Initializing session...</p>
    </div>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false, redirectAdminToAdmin = false }) => {
  const { isAuthenticated, user, isInitialized } = useAuthStore();

  if (!isInitialized) return <AuthLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/" replace />;

  // Special case: redirect admin users to admin dashboard for profile route
  if (redirectAdminToAdmin && user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

// Auth Route Component (redirects authenticated users)
const AuthRoute = ({ children }) => {
  const { isAuthenticated, user, isInitialized } = useAuthStore();

  if (!isInitialized) return <AuthLoader />;

  if (isAuthenticated) {
    // Redirect based on user role
    if (user?.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/profile" replace />;
    }
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
  const { initializeAuth, isInitialized } = useAuthStore();

  // Initialize auth on app startup
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Show loading screen while initializing auth
  if (!isInitialized) {
    return <AuthLoader />;
  }
  return (
    <Router>
      <ScrollToTop />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/psycho-education" element={<PsychoEducationHub />} />
          <Route path="/psycho-education/read/:slug" element={<ResourceReader />} />
          <Route path="/psycho-education/library" element={<LibraryPage />} />
          <Route path="/how-it-works" element={<Placeholder title="How It Works" />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/blog" element={<BlogPage />} />
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

          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute>
                <UserBookings />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute redirectAdminToAdmin>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile-simple"
            element={
              <ProtectedRoute>
                <ProfileSimple />
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


          <Route path="/signup" element={<AuthRoute><Signup /></AuthRoute>} />
          <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
          <Route path="/verify-email" element={<AuthRoute><VerifyEmail /></AuthRoute>} />
          <Route path="/forgot-password" element={<AuthRoute><ForgotPassword /></AuthRoute>} />
          <Route path="/reset-password" element={<AuthRoute><ResetPassword /></AuthRoute>} />

          <Route path="/pay" element={<PaymentPage />} />
        </Routes>
        <Chatbot />
      </Layout>
    </Router>
  );
}

export default App;
