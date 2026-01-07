import { Router } from 'express';
import { journeyController } from '../controllers/journey.controller.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// User routes (authentication required)
// GET /api/journey - Get user's journey timeline
router.get('/', authenticateToken, journeyController.getUserJourney);

// GET /api/journey/:entryId - Get single journey entry
router.get('/:entryId', authenticateToken, journeyController.getJourneyEntry);

// PUT /api/journey/:entryId/goals/:goalId/complete - Complete a goal
router.put('/:entryId/goals/:goalId/complete', authenticateToken, journeyController.completeGoal);

// Admin routes (admin authentication required)
// POST /api/journey - Create new journey entry
router.post('/', authenticateToken, requireAdmin, journeyController.createJourneyEntry);

// PUT /api/journey/:entryId - Update journey entry
router.put('/:entryId', authenticateToken, requireAdmin, journeyController.updateJourneyEntry);

// DELETE /api/journey/:entryId - Delete journey entry
router.delete('/:entryId', authenticateToken, requireAdmin, journeyController.deleteJourneyEntry);

// GET /api/journey/admin/all - Get all journey entries (admin)
router.get('/admin/all', authenticateToken, requireAdmin, journeyController.getAllJourneyEntries);

export default router;