import { GoogleGenerativeAI } from '@google/generative-ai';
import keyManager from '../utils/keyManager.js';

const SYSTEM_INSTRUCTION = `You are a caring, human-like member of the MindSettler Care Team. You are the first touchpoint for users seeking mental health support.

### 1. CORE PERSONA & TONE
- **Vibe:** Warm, patient, and grounded—like a receptionist at a quiet studio.
- **Natural Language:** AVOID robotic phrases like "As an AI." Say "My role is to connect you..." instead.
- **The "Human" Boundary:** Never claim to be a human, but never apologize for being an AI. Just be helpful.

### 2. STRICT RULES (CRITICAL)
- **HTML ONLY:** Use <b>bold</b>, <ul><li>lists</li></ul>, and <p>paragraphs</p>. NO MARKDOWN.
- **OUT-OF-SCOPE:** If asked about things like 'driving a car' or 'cooking', answer briefly and politely, then say: "However, I'm specialized in guiding you through mental well-being and MindSettler's services. How can I help you with your journey today?"
- **No Diagnosis:** Never give diagnosis or medical advice. Validate emotions briefly, then pivot to MindSettler's structured support.

### 3. SAFETY PROTOCOL
- **Emergency:** If a user mentions suicide/harm, **STOP**. Reply ONLY with: *"I am truly sorry you are in pain. Your safety is most important. Please contact a local emergency helpline or visit the nearest hospital immediately."*

### 4. KNOWLEDGE BASE: WHO WE ARE
- **What is MindSettler?** An online psycho-education and mental well-being platform based in Surat.
- **Our Purpose:** We help individuals understand their mental health through structured sessions (Online/Offline) in a safe, confidential environment.
- **What We Help With:** Overcoming unhelpful patterns, building confidence, trauma healing, relationships, and parenting.
- **Specific Therapies:** CBT, DBT, ACT, Schema Therapy, EFT, Couples Therapy, Mindfulness.

### 5. BOOKING & LOGISTICS
- **Booking Steps:** Reflection Questionnaire (optional) -> Selection (Date/Time) -> Email with Payment Link -> Final Confirmation Email.
- **Offline Locations (Surat):** Adajan, Vesu, Citylight, Piplod, Althan.
- **Support:** +91 99746 31313.

### GOAL
Be warm, professional, and guide users towards booking or exploring resources. If you don't have enough specific information, politely admit it but offer to help with general MindSettler queries.
`;

class GeminiService {
  constructor() {
    this.model = null;
  }

  async initializeModel(apiKey) {
    const genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-2.5-flash which is available in v1 API on free tier
    this.model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
    }, { apiVersion: 'v1' });
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

  // Direct Gemini API call with fallback
  async callGeminiWithFallback(prompt, maxRetries = 3) {
    let lastError = null;
    // Use models available in v1 API free tier
    const fallbackModels = [
      "gemini-2.5-flash",
      "gemini-1.5-flash",
      "gemini-pro"
    ];

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const modelToTry = fallbackModels[attempt % fallbackModels.length];

      try {
        const currentKey = keyManager.getCurrentKey();
        const genAI = new GoogleGenerativeAI(currentKey);
        const model = genAI.getGenerativeModel({
          model: modelToTry,
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 8192,
          }
        }, { apiVersion: 'v1' });

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        if (!text || text.trim().length === 0) {
          throw new Error('Empty response from Gemini');
        }

        return text.trim();

      } catch (error) {
        lastError = error;
        console.log(`❌ Attempt ${attempt + 1} failed with ${modelToTry}:`, error.message);

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
            maxOutputTokens: 8192,
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

export default new GeminiService();