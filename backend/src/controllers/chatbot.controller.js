import axios from 'axios';
import geminiService from '../services/gemini.service.js';
import { checkSafety, getGentleRedirection } from '../utils/safetyLayer.js';
import Auth from '../models/Auth.model.js';
import { Booking } from '../models/Booking.model.js';
import { Media } from '../models/Media.model.js';

// Configuration
const RAG_SERVICE_URL = process.env.CHATBOT_API_URL || 'https://mindsettler-chatbot-latest.onrender.com';

// Chat with the bot
export const chat = async (req, res) => {
  try {
    const { message, chatHistory = [] } = req.body;

    // Validate input
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message is required and must be a non-empty string'
      });
    }

    // Trim and validate message length
    const userMessage = message.trim();
    if (userMessage.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Message is too long. Please keep it under 1000 characters.'
      });
    }

    // Safety check - CRITICAL: This runs before AI
    const safetyCheck = checkSafety(userMessage);

    if (!safetyCheck.isSafe) {
      // Emergency detected - return crisis response immediately
      return res.json({
        success: true,
        response: safetyCheck.response,
        isEmergency: true,
        timestamp: new Date().toISOString()
      });
    }

    // --- ENHANCEMENT: FETCH USER CONTEXT ---
    let userContext = '';
    let userIdValue = 'guest_user';

    if (req.user) {
      try {
        const userId = req.user.userId;
        userIdValue = userId.toString();

        // 1. Fetch Profile Info
        const userAuth = await Auth.findById(userId).select('firstName lastName email bio interests personality quote');

        // 2. Fetch Recent Bookings
        const userBookings = await Booking.find({ userId })
          .populate('slotId')
          .sort({ createdAt: -1 })
          .limit(5);

        // 3. Fetch Liked Media
        const likedMedia = await Media.find({ likes: userId })
          .select('title type')
          .limit(5);

        // Construct Context String
        userContext = `User Profile:
- Name: ${userAuth?.firstName || ''} ${userAuth?.lastName || ''}
- Email: ${userAuth?.email || ''}
- Bio: ${userAuth?.bio || 'No bio provided'}
- Interests: ${userAuth?.interests || 'None listed'}
- Personality: ${userAuth?.personality || 'Not specified'}
- Theme Song/Quote: ${userAuth?.quote || 'None'}

Recent Bookings/Sessions:
${userBookings.length > 0
            ? userBookings.map(b => `- ${b.sessionMode} session on ${b.slotId?.date ? new Date(b.slotId.date).toLocaleDateString() : 'TBD'} (${b.status})`).join('\n')
            : '- No bookings found'}

Recently Liked Content:
${likedMedia.length > 0
            ? likedMedia.map(m => `- "${m.title}" (${m.type})`).join('\n')
            : '- No liked posts yet'}`;

        console.log(`👤 Context fetched for: ${userAuth?.firstName}`);
      } catch (contextError) {
        console.error('Error fetching user context for chatbot:', contextError);
      }
    }

    // --- PRIMARY: TRY RAG MICROSERVICE ---
    try {
      console.log(`🤖 Attempting RAG request to: ${RAG_SERVICE_URL}/chat`);
      const authHeader = req.headers.authorization;

      const ragResponse = await axios.post(`${RAG_SERVICE_URL}/chat`, {
        message: userMessage,
        chatHistory: chatHistory,
        user_id: userIdValue,
        user_context: userContext
      }, {
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10s timeout
      });

      if (ragResponse.data && ragResponse.data.text) {
        const data = ragResponse.data;
        return res.json({
          success: true,
          response: data.text,
          actions: data.actions || [],
          isEmergency: data.isEmergency || false,
          timestamp: new Date().toISOString(),
          source: 'rag-microservice'
        });
      }
    } catch (ragError) {
      console.error('⚠️ RAG Service unavailable, falling back to local Gemini:', ragError.message);
    }

    // --- FALLBACK: USE LOCAL GEMINI SERVICE (The "Old Prompt") ---
    const aiResult = await geminiService.generateResponse(userMessage, chatHistory);

    if (!aiResult.success) {
      // If it's a configuration error, provide a helpful fallback
      if (aiResult.error && aiResult.error.includes('No Gemini API keys configured')) {
        return res.json({
          success: true,
          response: "I apologize, but I'm currently experiencing technical difficulties with my AI system. However, I'm still here to help! For immediate assistance with booking sessions or questions about MindSettler, please call us at +91 99746 31313. Our team is ready to help you.",
          timestamp: new Date().toISOString(),
          fallbackMode: true
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Failed to generate response',
        error: aiResult.error
      });
    }

    let finalResponse = aiResult.response;

    // If the message had concerning keywords, add gentle redirection
    if (safetyCheck.hasConcerns) {
      finalResponse = getGentleRedirection();
    }

    // Return successful response
    res.json({
      success: true,
      response: finalResponse,
      timestamp: new Date().toISOString(),
      source: 'local-gemini',
      keyStats: aiResult.keyStats // For debugging (remove in production)
    });

  } catch (error) {
    console.error('❌ Chat controller error:', error);

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      response: "I apologize, but I'm experiencing some technical difficulties. Please try again in a moment, or call us directly at +91 99746 31313.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Health check for the chatbot service
export const healthCheck = async (req, res) => {
  try {
    // Check if Gemini keys are configured
    if (!process.env.GEMINI_KEYS) {
      return res.status(503).json({
        success: false,
        service: 'MindSettler Chatbot',
        status: 'misconfigured',
        error: 'Gemini API keys not configured',
        timestamp: new Date().toISOString(),
        details: {
          keysAvailable: 0,
          safetyLayer: 'active',
          issue: 'GEMINI_KEYS environment variable not set'
        }
      });
    }

    const health = await geminiService.healthCheck();

    res.json({
      success: true,
      service: 'MindSettler Chatbot',
      status: health.status,
      timestamp: new Date().toISOString(),
      details: {
        keysAvailable: health.keysAvailable,
        currentKey: health.currentKey,
        safetyLayer: 'active'
      }
    });

  } catch (error) {
    console.error('❌ Health check error:', error);

    res.status(500).json({
      success: false,
      service: 'MindSettler Chatbot',
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// Get chatbot info/capabilities
export const getBotInfo = async (req, res) => {
  res.json({
    success: true,
    bot: {
      name: 'MindSettler Assistant',
      version: '1.0.0',
      capabilities: [
        'Answer questions about MindSettler services',
        'Help with booking sessions',
        'Provide information about therapies offered',
        'Guide users to appropriate resources'
      ],
      limitations: [
        'Cannot provide medical advice or diagnosis',
        'Cannot act as a therapist or counselor',
        'Cannot handle emergency situations'
      ],
      contact: {
        phone: '+91 99746 31313',
        emergency: 'Please call 112 or visit nearest hospital'
      }
    },
    timestamp: new Date().toISOString()
  });
};