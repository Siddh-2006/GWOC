import express from 'express';
import {
  submitContactForm,
  getContactMessages,
  getContactMessage,
  updateContactStatus,
  deleteContactMessage,
  getContactStats
} from '../controllers/contactController.js';
import { validateContactForm, validateContactUpdate } from '../validation/contactValidation.js';
import { contactFormLimiter, generalLimiter } from '../middleware/rateLimiter.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/submit', contactFormLimiter, validateContactForm, submitContactForm);

// Admin routes (protected)
router.use(generalLimiter); // Apply general rate limiting to admin routes
router.get('/messages', authenticateToken, requireAdmin, getContactMessages);
router.get('/messages/:id', authenticateToken, requireAdmin, getContactMessage);
router.patch('/messages/:id', authenticateToken, requireAdmin, validateContactUpdate, updateContactStatus);
router.delete('/messages/:id', authenticateToken, requireAdmin, deleteContactMessage);
router.get('/stats', authenticateToken, requireAdmin, getContactStats);

export default router;