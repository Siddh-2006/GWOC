import express from 'express';
import { sessionsController } from '../controllers/sessions.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/sessions - Get user's sessions
router.get('/', sessionsController.getUserSessions);

// GET /api/sessions/:sessionId - Get session details with notes
router.get('/:sessionId', sessionsController.getSessionDetails);

// PUT /api/sessions/:sessionId/notes - Create or update session notes
router.put('/:sessionId/notes', sessionsController.updateSessionNotes);

// POST /api/sessions/:sessionId/goals - Add a goal to session notes
router.post('/:sessionId/goals', sessionsController.addSessionGoal);

// PUT /api/sessions/:sessionId/goals/:goalId - Toggle goal completion
router.put('/:sessionId/goals/:goalId', sessionsController.completeSessionGoal);

export default router;