import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2, AlertCircle, Headphones } from 'lucide-react';
import { authApi } from './auth.api';
import useAuthStore from '../../store/useAuthStore';
import Logo from '../../components/Logo';

const Login = () => {
  const navigate = useNavigate();
  const { setAuth, setError, setLoading, loading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
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
    setLoading(true);
    try {
      const response = await authApi.signin(formData);
      if (response.success) {
        setAuth(response.data.user, response.data.accessToken, response.data.refreshToken);

        // Handle redirect based on user role
        if (response.data.user?.role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/profile', { replace: true });
        }
      }
    } catch (err) {
      if (err.response?.status === 401 && err.response?.data?.message?.includes('verified')) {
        // Redirect to verification if email not verified
        navigate('/verify-email', { state: { email: formData.email } });
      } else {
        setError(err.response?.data?.message || 'Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-4 py-20">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[2.5rem] overflow-hidden shadow-2xl min-h-[700px]">

        {/* Left Side: Branding (Mirrored from Signup) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative hidden lg:flex flex-col justify-between p-12 bg-primary text-white"
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-secondary/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-400/10 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10">
            <Link to="/">
              <Logo variant="invert" className="h-14 mb-12" />
            </Link>
            <h1 className="text-5xl font-bold leading-tight mb-6">
              Welcome Back to <span className="text-secondary italic">MindSettler</span>
            </h1>
            <p className="text-purple-100/70 text-lg max-w-md leading-relaxed">
              Continue your journey towards clarity and emotional resilience. We're glad to have you back.
            </p>
          </div>

          <div className="relative z-10 p-8 glass-card border-white/10 bg-white/5 backdrop-blur-xl rounded-[2rem] space-y-4">
            <div className="flex items-center gap-4 text-secondary">
              <Headphones size={24} />
              <h4 className="font-bold text-xl text-white">Need immediate support?</h4>
            </div>
            <p className="text-purple-100/70 text-sm leading-relaxed">
              If you're in a crisis, our chatbot is available 24/7 to guide you to immediate resources.
            </p>
          </div>
        </motion.div>

        {/* Right Side: Login Form */}
        <div className="p-8 md:p-16 flex flex-col justify-center bg-white relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="mb-10 lg:hidden text-center">
              <Logo className="h-10 mx-auto" />
            </div>

            <h2 className="text-4xl font-bold text-primary mb-2 text-center lg:text-left">Sign In</h2>
            <p className="text-gray-500 mb-8 text-center lg:text-left">Enter your credentials to access your account.</p>

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

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-primary px-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
                  <input
                    required
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-purple-50/50 border border-purple-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary/50 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-sm font-bold text-primary">Password</label>
                  <Link to="/forgot-password" size="sm" className="text-xs font-bold text-secondary hover:underline">
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
                  <input
                    required
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-purple-50/50 border border-purple-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary/50 transition-all font-medium"
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
                    Sign In
                    <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-12 text-center">
              <p className="text-gray-500 font-medium">
                New to MindSettler? {' '}
                <Link to="/signup" className="text-primary font-bold hover:text-secondary transition-colors underline underline-offset-4 decoration-secondary/30">
                  Create Account
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;
