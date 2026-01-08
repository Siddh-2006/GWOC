import { Router } from 'express';
import { reflectionController } from '../controllers/reflection.controller.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// NEW FIRST-SESSION-ONLY REFLECTION SYSTEM

// Protected routes (authentication required)
// GET /api/reflection/eligibility - Check if user is eligible for reflection (first session only)
router.get('/eligibility', authenticateToken, reflectionController.checkEligibility);

// GET /api/reflection/questions - Get reflection questions (first session only)
router.get('/questions', authenticateToken, reflectionController.getQuestions);

// POST /api/reflection/submit - Submit reflection responses (first session only)
router.post('/submit', authenticateToken, reflectionController.submitReflection);

// GET /api/reflection/user/:userId - Get user's reflection data (for admin)
router.get('/user/:userId', authenticateToken, requireAdmin, reflectionController.getUserReflection);

// Admin routes for question management
// GET /api/reflection/admin/questions - Get all questions for admin management
router.get('/admin/questions', authenticateToken, requireAdmin, reflectionController.admin.getQuestions);

// GET /api/reflection/admin/submissions - Get all reflection submissions for admin
router.get('/admin/submissions', authenticateToken, requireAdmin, reflectionController.admin.getSubmissions);

// DELETE /api/reflection/admin/user/:userId - Reset user's reflection (Admin)
router.delete('/admin/user/:userId', authenticateToken, requireAdmin, reflectionController.admin.resetUserReflection);

// POST /api/reflection/admin/user/:userId/regenerate-summary - Re-generate AI summary (Admin)
router.post('/admin/user/:userId/regenerate-summary', authenticateToken, requireAdmin, reflectionController.admin.regenerateSummary);

// PUT /api/reflection/admin/questions/:questionId - Update question
router.put('/admin/questions/:questionId', authenticateToken, requireAdmin, reflectionController.admin.updateQuestion);

// POST /api/reflection/admin/questions - Add new question
router.post('/admin/questions', authenticateToken, requireAdmin, reflectionController.admin.addQuestion);

// DELETE /api/reflection/admin/questions/:questionId - Delete question
router.delete('/admin/questions/:questionId', authenticateToken, requireAdmin, reflectionController.admin.deleteQuestion);

export default router;