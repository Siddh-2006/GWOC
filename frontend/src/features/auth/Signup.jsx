import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, CheckCircle, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { authApi } from './auth.api';
import useAuthStore from '../../store/useAuthStore';
import Logo from '../../components/Logo';
import GoogleSignInButton from '../../components/GoogleSignInButton';

const Signup = () => {
  const navigate = useNavigate();
  const { setError, setLoading, loading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters long');
    }
    if (!passwordRegex.test(formData.password)) {
      return setError('Password must contain at least one uppercase letter, one lowercase letter, and one number');
    }

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);
    clearError();

    try {
      const response = await authApi.signup({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password
      });

      if (response.success) {
        // Redirect to email verification with email in state
        navigate('/verify-email', { state: { email: formData.email } });
      } else {
        setError(response.message || 'Signup failed');
      }
    } catch (err) {
      console.error('Signup error:', err);
      const errorMessage = err.response?.data?.message || err.response?.data?.errors?.[0] || err.message || 'Something went wrong during signup';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-4 py-20">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[2.5rem] overflow-hidden shadow-2xl min-h-[700px]">

        {/* Left Side: Theme/Branding */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative hidden lg:flex flex-col justify-between p-12 bg-primary text-white"
        >
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-secondary/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-purple-400/10 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10">
            <Link to="/">
              <Logo variant="white" className="h-14 mb-12" />

            </Link>
            <h1 className="text-5xl font-bold leading-tight mb-6">
              Start Your Journey to <span className="text-secondary italic">Inner Peace</span>
            </h1>
            <p className="text-purple-100/70 text-lg max-w-md leading-relaxed">
              Join our community of mindful individuals and access professional psycho-education and support tailored just for you.
            </p>
          </div>

          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-secondary">
                <CheckCircle size={24} />
              </div>
              <p className="font-medium">Personalized Wellness Paths</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-secondary">
                <CheckCircle size={24} />
              </div>
              <p className="font-medium">Safe & Confidential Sessions</p>
            </div>
          </div>
        </motion.div>

        {/* Right Side: Signup Form */}
        <div className="p-8 md:p-16 flex flex-col justify-center bg-white relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="mb-10 lg:hidden text-center">
              <Logo variant="white" className="h-10 mx-auto" />

            </div>

            <h2 className="text-4xl font-bold text-primary mb-2">Create Account</h2>
            <p className="text-gray-500 mb-8">Join the MindSettler community today.</p>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-8 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 border border-red-100"
              >
                <AlertCircle size={20} />
                <p className="text-sm font-medium">{error}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-primary px-1">First Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
                    <input
                      required
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full bg-purple-50/50 border border-purple-100 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary/50 transition-all font-medium"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-primary px-1">Last Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
                    <input
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full bg-purple-50/50 border border-purple-100 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary/50 transition-all font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-primary px-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
                  <input
                    required
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-purple-50/50 border border-purple-100 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary/50 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-primary px-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
                  <input
                    required
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-purple-50/50 border border-purple-100 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary/50 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-primary px-1">Confirm Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
                  <input
                    required
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full bg-purple-50/50 border border-purple-100 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary/50 transition-all font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:hover:scale-100"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    Sign Up
                    <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">Or continue with</span>
              </div>
            </div>

            {/* Google Sign-In */}
            <GoogleSignInButton text="Sign up with Google" />

            <div className="mt-10 text-center">
              <p className="text-gray-500 font-medium">
                Already have an account? {' '}
                <Link to="/login" className="text-primary font-bold hover:text-secondary transition-colors underline underline-offset-4 decoration-secondary/30">
                  Sign In
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
