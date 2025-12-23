import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Send, Loader2, AlertCircle, Mail, CheckCircle } from 'lucide-react';
import { authApi } from './auth.api';
import useAuthStore from '../../store/useAuthStore';
import Logo from '../../components/Logo';

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setError, setLoading, loading, error, clearError } = useAuthStore();

  const email = location.state?.email;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendLoading, setResendLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email) {
      navigate('/signup');
    }
  }, [email, navigate]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }

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
    if (otpValue.length !== 6) return setError('Please enter a 6-digit code');

    setLoading(true);
    try {
      const response = await authApi.verifyEmail({ email, otp: otpValue });
      if (response.success) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      await authApi.resendOTP(email);
      // Optional: Show success message for resend
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setResendLoading(false);
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
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-3xl font-bold text-primary">Verified!</h2>
          <p className="text-gray-600">Your email has been successfully verified. Redirecting you to login...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full glass-card p-8 md:p-12"
      >
        <div className="text-center mb-10">
          <Logo className="h-12 mx-auto mb-8" />
          <div className="w-16 h-16 bg-purple-100/50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary">
            <Mail size={32} />
          </div>
          <h2 className="text-3xl font-bold text-primary mb-2">Verify Your Email</h2>
          <p className="text-gray-500">We've sent a 6-digit code to <span className="text-primary font-bold">{email}</span></p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 border border-red-100">
            <AlertCircle size={20} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="flex justify-between gap-2 md:gap-4">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-full h-14 md:h-16 text-center text-2xl font-bold bg-purple-50/50 border border-purple-100 rounded-xl md:rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:bg-white focus:border-primary transition-all shadow-sm"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Verify Code'}
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-gray-500 mb-4">Didn't receive the code?</p>
          <button
            onClick={handleResend}
            disabled={resendLoading}
            className="flex items-center gap-2 mx-auto text-primary font-bold hover:text-secondary transition-colors underline underline-offset-4 decoration-secondary/30 disabled:opacity-50"
          >
            {resendLoading ? <Loader2 className="animate-spin" size={18} /> : (
              <>
                <Send size={18} />
                Resend OTP
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
