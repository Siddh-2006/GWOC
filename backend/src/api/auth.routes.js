import express from 'express';
import passport from 'passport';
import {
  signUp,
  signIn,
  logout,
  logoutAll,
  refreshToken,
  getProfile,
  getUserProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
  validateToken,
  markUserConfirmedSession,
  googleAuthCallback
} from '../controllers/auth.controller.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Google OAuth routes
router.get('/google', passport.authenticate('google', { 
  scope: ['profile', 'email'],
  session: false 
}));

router.get('/google/callback', 
  passport.authenticate('google', { 
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=auth_failed`
  }),
  googleAuthCallback
);

// Protected routes
router.get('/validate', authenticateToken, validateToken);
router.post('/logout', authenticateToken, logout);
router.post('/logout-all', authenticateToken, logoutAll);
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);

// Admin routes
router.get('/users/:userId/profile', authenticateToken, requireAdmin, getUserProfile);
router.post('/users/:userId/mark-confirmed-session', authenticateToken, requireAdmin, markUserConfirmedSession);

export default router;