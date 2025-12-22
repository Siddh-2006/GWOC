import express from 'express';
import {
  signUp,
  signIn,
  logout,
  logoutAll,
  refreshToken,
  getProfile,
  updateProfile
} from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/refresh-token', refreshToken);

// Protected routes
router.post('/logout', authenticateToken, logout);
router.post('/logout-all', authenticateToken, logoutAll);
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);

export default router;