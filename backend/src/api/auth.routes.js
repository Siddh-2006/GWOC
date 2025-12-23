import express from 'express';
import {
  signUp,
  signIn,
  logout,
  logoutAll,
  refreshToken,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword
} from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.post('/logout', authenticateToken, logout);
router.post('/logout-all', authenticateToken, logoutAll);
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);

export default router;