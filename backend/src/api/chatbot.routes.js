import { Router } from 'express';
import { chat, healthCheck, getBotInfo } from '../controllers/chatbot.controller.js';
import { optionalAuth } from '../middleware/auth.middleware.js';

const router = Router();

// Chatbot routes
router.post('/chat', optionalAuth, chat);
router.post('/message', optionalAuth, chat); // Keep existing endpoint for compatibility
router.get('/health', healthCheck);
router.get('/info', getBotInfo);

export default router;