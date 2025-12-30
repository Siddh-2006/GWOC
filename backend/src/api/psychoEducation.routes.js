import { Router } from 'express';
import { psychoEducationController } from '../controllers/psychoEducation.controller.js';
import { authenticateToken, requireAdmin, optionalAuth } from '../middleware/auth.middleware.js';

const router = Router();

// Admin routes (authentication required) - Put these first to avoid conflicts
// POST /api/psycho-education - Create new content
router.post('/', authenticateToken, requireAdmin, psychoEducationController.createContent);

// GET /api/psycho-education/admin/all - Get all content (admin)
router.get('/admin/all', authenticateToken, requireAdmin, psychoEducationController.getAllContent);

// PUT /api/psycho-education/:contentId - Update content
router.put('/:contentId', authenticateToken, requireAdmin, psychoEducationController.updateContent);

// DELETE /api/psycho-education/:contentId - Delete content
router.delete('/:contentId', authenticateToken, requireAdmin, psychoEducationController.deleteContent);

// Public routes
// GET /api/psycho-education/published - Get published content (with optional auth for like status)
router.get('/published', optionalAuth, psychoEducationController.getPublishedContent);

// GET /api/psycho-education/:contentId - Get single content
router.get('/:contentId', psychoEducationController.getContent);

// POST /api/psycho-education/:contentId/like - Like content (requires auth)
router.post('/:contentId/like', authenticateToken, psychoEducationController.likeContent);

export default router;