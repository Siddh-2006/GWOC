import { Router } from 'express';
import { chat, healthCheck, getBotInfo } from '../controllers/chatbot.controller.js';
import { optionalAuth } from '../middleware/auth.middleware.js';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiter for chatbot - protect against spam/DoS attacks
const chatbotRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // limit each IP to 30 requests per windowMs
    message: {
        success: false,
        message: "Too many chat requests from this IP, please try again after 15 minutes",
        response: "I'm receiving too many messages right now. Please take a moment to breathe and try again in 15 minutes. 🧘‍♂️"
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Chatbot routes
router.post('/chat', chatbotRateLimiter, optionalAuth, chat);
router.post('/message', chatbotRateLimiter, optionalAuth, chat); // Keep existing endpoint for compatibility
router.get('/health', healthCheck);
router.get('/info', getBotInfo);

export default router;