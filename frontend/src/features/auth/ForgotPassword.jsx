import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowRight, Loader2, AlertCircle, KeyRound } from 'lucide-react';
import { authApi } from './auth.api';
import useAuthStore from '../../store/useAuthStore';
import Logo from '../../components/Logo';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { setError, setLoading, loading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearError();
    
    try {
      const response = await authApi.forgotPassword(email);
      
      if (response.success) {
        navigate('/reset-password', { state: { email } });
      } else {
        setError(response.message || 'Failed to send reset email');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Something went wrong. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-4 py-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl w-full glass-card p-8 md:p-12"
      >
        <div className="text-center mb-10">
          <Logo className="h-12 mx-auto mb-8" />
          <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-secondary">
            <KeyRound size={32} />
          </div>
          <h2 className="text-3xl font-bold text-primary mb-2">Forgot Password?</h2>
          <p className="text-gray-500">No worries! Enter your email and we'll send you an OTP to reset your password.</p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 border border-red-100">
            <AlertCircle size={20} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-primary px-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
              <input
                required
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (error) clearError(); }}
                className="w-full bg-purple-50/50 border border-purple-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white focus:border-primary transition-all font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                Send Reset OTP
                <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        <div className="mt-10 text-center">
          <Link to="/login" className="text-primary font-bold hover:text-secondary transition-colors underline underline-offset-4 decoration-secondary/30">
            Back to Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
