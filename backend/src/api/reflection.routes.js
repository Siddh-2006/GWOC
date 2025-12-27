import { Router } from 'express';
import { reflectionController } from '../controllers/reflection.controller.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// Protected routes (authentication required)
// POST /api/reflection/start - Start new reflection session
router.post('/start', authenticateToken, reflectionController.startReflection);

// POST /api/reflection/:sessionId/answer - Submit answer to question
router.post('/:sessionId/answer', authenticateToken, reflectionController.submitAnswer);

// POST /api/reflection/:sessionId/complete - Complete reflection session
router.post('/:sessionId/complete', authenticateToken, reflectionController.completeReflection);

// GET /api/reflection/:sessionId - Get reflection session data
router.get('/:sessionId', authenticateToken, reflectionController.getReflectionSession);

// DELETE /api/reflection/:sessionId - Abandon reflection session
router.delete('/:sessionId', authenticateToken, reflectionController.abandonReflection);

// GET /api/reflection/user/sessions - Get user's reflection sessions
router.get('/user/sessions', authenticateToken, reflectionController.getUserReflectionSessions);

// Admin routes (admin authentication required)
// GET /api/reflection/admin/all - Get all reflection sessions (admin only)
router.get('/admin/all', authenticateToken, requireAdmin, reflectionController.getAllReflectionSessions);

// GET /api/reflection/admin/summary/:sessionId - Get reflection summary for admin
router.get('/admin/summary/:sessionId', authenticateToken, requireAdmin, reflectionController.getReflectionSummary);

// DELETE /api/reflection/admin/:sessionId - Delete reflection session (admin only)
router.delete('/admin/:sessionId', authenticateToken, requireAdmin, reflectionController.deleteReflectionSession);

export default router;