import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Lock, Loader2, AlertCircle, CheckCircle, ShieldCheck } from 'lucide-react';
import { authApi } from './auth.api';
import useAuthStore from '../../store/useAuthStore';
import Logo from '../../components/Logo';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setError, setLoading, loading, error, clearError } = useAuthStore();

  const email = location.state?.email;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const inputRefs = useRef([]);

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1].focus();
    if (error) clearError();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');

    if (otpValue.length !== 6) return setError('Please enter the 6-digit code');
    if (password !== confirmPassword) return setError('Passwords do not match');

    setLoading(true);
    try {
      const response = await authApi.resetPassword({
        email,
        otp: otpValue,
        password
      });

      if (response.success) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please check your code.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full glass-card p-12 text-center space-y-6"
        >
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto transition-transform animate-bounce">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-3xl font-bold text-primary">Success!</h2>
          <p className="text-gray-600">Your password has been reset. You're being redirected to the login page.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full glass-card p-8 md:p-12"
      >
        <div className="text-center mb-10">
          <Logo className="h-12 mx-auto mb-8" />
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-600">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-3xl font-bold text-primary mb-2">Reset Password</h2>
          <p className="text-gray-500">Enter the code sent to your email and choose a strong new password.</p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 border border-red-100">
            <AlertCircle size={20} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <label className="text-sm font-bold text-primary px-1">Verification Code</label>
            <div className="flex justify-between gap-2 md:gap-4">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-full h-14 md:h-16 text-center text-2xl font-bold bg-purple-50/50 border border-purple-100 rounded-xl outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white focus:border-primary transition-all shadow-sm"
                />
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-primary px-1">New Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
                <input
                  required
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (error) clearError(); }}
                  className="w-full bg-purple-50/50 border border-purple-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white focus:border-primary transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-primary px-1">Confirm New Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
                <input
                  required
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); if (error) clearError(); }}
                  className="w-full bg-purple-50/50 border border-purple-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white focus:border-primary transition-all font-medium"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Reset My Password'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
