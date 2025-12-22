import { Session } from '../models/Session.model.js';
import { GeminiClient } from '../ai/gemini.client.js';
import { IntentClassifier } from '../safety/intent.classifier.js';
import { DISCLAIMERS } from '../safety/disclaimers.js';

const geminiClient = new GeminiClient(process.env.GEMINI_API_KEY);

export const chatbotController = {
  // Handle chat message
  handleMessage: async (req, res) => {
    try {
      const { userId, message, sessionId } = req.body;

      // Classify intent
      const intent = IntentClassifier.classifyMessage(message);

      // Check for crisis
      if (IntentClassifier.requiresEscalation(intent)) {
        return res.json({
          response: DISCLAIMERS.CRISIS,
          intent: 'crisis',
          requiresEscalation: true
        });
      }

      // Get or create session
      let session = sessionId 
        ? await Session.findById(sessionId)
        : new Session({ userId, messages: [] });

      // Add user message
      session.messages.push({
        role: 'user',
        content: message
      });

      // Generate AI response
      const aiResponse = await geminiClient.generateResponse(message);

      // Add AI response
      session.messages.push({
        role: 'assistant',
        content: aiResponse
      });

      await session.save();

      res.json({
        response: aiResponse,
        sessionId: session._id,
        intent
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};