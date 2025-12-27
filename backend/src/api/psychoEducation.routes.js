import { Router } from 'express';
import { psychoEducationController } from '../controllers/psychoEducation.controller.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware.js';

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
// GET /api/psycho-education/published - Get published content
router.get('/published', psychoEducationController.getPublishedContent);

// GET /api/psycho-education/:contentId - Get single content
router.get('/:contentId', psychoEducationController.getContent);

// POST /api/psycho-education/:contentId/like - Like content
router.post('/:contentId/like', psychoEducationController.likeContent);

// POST /api/psycho-education/:contentId/helpful - Mark as helpful
router.post('/:contentId/helpful', psychoEducationController.markHelpful);

export default router;