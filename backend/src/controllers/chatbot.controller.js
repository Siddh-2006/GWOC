import geminiService from '../services/gemini.service.js';
import { checkSafety, getGentleRedirection } from '../utils/safetyLayer.js';

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

    // Generate AI response
    const aiResult = await geminiService.generateResponse(userMessage, chatHistory);
    
    if (!aiResult.success) {
      // If it's a configuration error, provide a helpful fallback
      if (aiResult.error.includes('No Gemini API keys configured')) {
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