import { Router } from 'express';
import { chatbotController } from '../controllers/chatbot.controller.js';

const router = Router();

// POST /api/chatbot/message
router.post('/message', chatbotController.handleMessage);

export default router;