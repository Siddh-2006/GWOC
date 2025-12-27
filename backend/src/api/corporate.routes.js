import express from 'express';
import {
  createInquiry,
  getInquiries,
  getInquiryById,
  updateInquiry,
  getInquiryStats
} from '../controllers/corporate.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public route - Corporate inquiry submission
router.post('/inquiry', createInquiry);

// Admin routes - Protected by authentication
router.get('/admin/inquiries', authenticateToken, getInquiries);
router.get('/admin/inquiries/stats', authenticateToken, getInquiryStats);
router.get('/admin/inquiries/:id', authenticateToken, getInquiryById);
router.patch('/admin/inquiries/:id', authenticateToken, updateInquiry);

export default router;