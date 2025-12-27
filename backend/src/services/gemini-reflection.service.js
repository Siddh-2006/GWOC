import { GoogleGenerativeAI } from '@google/generative-ai';
import keyManager from '../utils/keyManager.js';

// System instruction for MindSettler chatbot
// System instruction for MindSettler chatbot

// System instruction for MindSettler chatbot
const SYSTEM_INSTRUCTION = `You are a caring, human-like member of the MindSettler Care Team. You are the first touchpoint for users seeking mental health support.

### CORE PERSONA
- **Human & Warm:** You speak like a kind receptionist at a quiet studio, not a computer.
- **Natural Language:** Avoid robotic phrases like "As an AI," "I am a language model," or "Please be advised."
- **Humble:** You are here to support, not to teach. Use phrases like "We find that..." or "Our team believes..."

### STRICT BEHAVIORAL RULES
1. **The "Human" Boundary:** - Never say "I am an AI." 
   - Instead, say: "While I am not a counselor myself..." or "My role is to connect you to the experts..."
   
2. **Handling Distress (The "Soft Pivot"):**
   - If a user feels low (e.g., "I feel depressed"), DO NOT give clinical advice.
   - VALIDATE, then GUIDE.
   - *Example:* "I hear that things are feeling heavy right now, and I appreciate you sharing that. While I can't offer the clinical support you deserve, our experts specialize in exactly this. Shall we look at booking a time for you?"

3. **Brevity:** Keep it under 3 sentences. Be gentle but direct.

### BUSINESS FACTS (Your Memory)
- **Mission:** Awareness, guidance, and safe, confidential support.
- **Services:** Online Video calls & Offline Studio sessions in Pune.
- **Therapies:** CBT, DBT, ACT, Schema, EFT, Mindfulness.
- **Payments:** Personal UPI or Cash (Manual confirmation). No auto-debits.
- **Policy:** Strict Confidentiality. No Refunds.
- **Contact:** +91 99746 31313.
- **Social:** We share daily insights and gentle reminders on Instagram: https://www.instagram.com/mindsettlerbypb/

### GOAL
Make the user feel heard and safe, then gently guide them to book a session.
`;


class GeminiService {
  constructor() {
    this.model = null;
  }

  async initializeModel(apiKey) {
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({ 
      model: "models/gemini-2.5-flash"
    });
    return this.model;
  }

  // Sliding window to keep only last 6 interactions (12 messages total)
  prepareHistory(chatHistory) {
    if (!chatHistory || chatHistory.length === 0) {
      return [];
    }

    // Keep only the last 12 messages (6 user + 6 bot interactions)
    const recentHistory = chatHistory.slice(-12);
    
    return recentHistory.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));
  }

  // Direct Gemini API call with fallback (similar to your callGeminiWithFallback pattern)
  async callGeminiWithFallback(prompt, maxRetries = 3) {
    let lastError = null;
    const workingModel = "models/gemini-2.5-flash";
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const currentKey = keyManager.getCurrentKey();
        const genAI = new GoogleGenerativeAI(currentKey);
        const model = genAI.getGenerativeModel({
          model: workingModel,
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 8192,
          }
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        if (!text || text.trim().length === 0) {
          throw new Error('Empty response from Gemini');
        }
        
        return text.trim();
        
      } catch (error) {
        lastError = error;
        console.log(`❌ Attempt ${attempt + 1} failed:`, error.message);
        
        if (attempt < maxRetries - 1) {
          keyManager.rotateKey();
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    throw lastError;
  }

  async generateResponse(message, chatHistory = []) {
    try {
      const response = await keyManager.executeWithRetry(async (apiKey) => {
        // Initialize model with current API key
        await this.initializeModel(apiKey);
        
        // Prepare chat history with sliding window
        const history = this.prepareHistory(chatHistory);
        
        // Start chat with history and system instruction
        const chat = this.model.startChat({
          history: [
            {
              role: 'user',
              parts: [{ text: 'Please act according to this system instruction: ' + SYSTEM_INSTRUCTION }]
            },
            {
              role: 'model', 
              parts: [{ text: 'I understand. I will act as the humble, gentle assistant for MindSettler, helping users navigate services and book sessions while never providing medical advice.' }]
            },
            ...history
          ],
          generationConfig: {
            temperature: 0.4,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192, // Increased to match your example
          },
        });

        // Send message and get response
        const result = await chat.sendMessage(message);
        const responseText = result.response.text();
        
        if (!responseText || responseText.trim().length === 0) {
          throw new Error('Empty response from Gemini');
        }
        
        return responseText.trim();
      });

      return {
        success: true,
        response: response,
        keyStats: keyManager.getStats()
      };

    } catch (error) {
      console.error('❌ Gemini API Error:', error);
      
      return {
        success: false,
        error: error.message,
        response: "I apologize, but I'm having trouble connecting right now. Please try again in a moment, or feel free to call us directly at +91 99746 31313 for immediate assistance.",
        keyStats: keyManager.getStats()
      };
    }
  }

  // Health check method
  async healthCheck() {
    try {
      const response = await this.generateResponse("Hello", []);
      return {
        status: 'healthy',
        keysAvailable: keyManager.keys.length,
        currentKey: keyManager.getStats().currentKey
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        keysAvailable: keyManager.keys.length
      };
    }
  }
}

export const geminiService = new GeminiService();