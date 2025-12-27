import { Router } from 'express';
import { mediaController } from '../controllers/media.controller.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// Admin routes (authentication required) - Put these first to avoid conflicts
// POST /api/media - Create new media
router.post('/', authenticateToken, requireAdmin, mediaController.createMedia);

// GET /api/media/admin/all - Get all media (admin)
router.get('/admin/all', authenticateToken, requireAdmin, mediaController.getAllMedia);

// PUT /api/media/:mediaId - Update media
router.put('/:mediaId', authenticateToken, requireAdmin, mediaController.updateMedia);

// DELETE /api/media/:mediaId - Delete media
router.delete('/:mediaId', authenticateToken, requireAdmin, mediaController.deleteMedia);

// Public routes
// GET /api/media/published - Get published media
router.get('/published', mediaController.getPublishedMedia);

// GET /api/media/:mediaId - Get single media
router.get('/:mediaId', mediaController.getMedia);

// POST /api/media/:mediaId/like - Like media
router.post('/:mediaId/like', mediaController.likeMedia);

// POST /api/media/:mediaId/comment - Add comment to media
router.post('/:mediaId/comment', mediaController.addComment);

// POST /api/media/:mediaId/share - Share media
router.post('/:mediaId/share', mediaController.shareMedia);

export default router;