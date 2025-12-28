import { GoogleGenerativeAI } from '@google/generative-ai';

// Reflection-specific Gemini AI service
class GeminiReflectionService {
  constructor() {
    // API key will be loaded when needed
  }

  // Generate next question based on previous responses
  async generateNextQuestion(previousResponses = [], currentThemes = [], questionNumber = 1) {
    // Use models available in v1 API free tier
    const fallbackModels = [
      "gemini-2.5-flash",
      "gemini-1.5-flash",
      "gemini-pro"
    ];

    for (let modelIndex = 0; modelIndex < fallbackModels.length; modelIndex++) {
      try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
          throw new Error('GEMINI_API_KEY not configured');
        }

        const prompt = this.buildQuestionPrompt(previousResponses, currentThemes, questionNumber);
        
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ 
          model: fallbackModels[modelIndex],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          }
        }, { apiVersion: 'v1' });

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        return this.parseQuestionResponse(text, questionNumber);
      } catch (error) {
        console.error(`Error generating question with ${fallbackModels[modelIndex]}:`, error.message);
        
        // If this was the last model, return fallback
        if (modelIndex === fallbackModels.length - 1) {
          return this.getFallbackQuestion(questionNumber);
        }
        // Otherwise, try next model
        continue;
      }
    }
    
    return this.getFallbackQuestion(questionNumber);
  }

  // Generate AI summary from all responses
  async generateSummary(responses) {
    // Use models available in v1 API free tier
    const fallbackModels = [
      "gemini-2.5-flash",
      "gemini-1.5-flash",
      "gemini-pro"
    ];

    for (let modelIndex = 0; modelIndex < fallbackModels.length; modelIndex++) {
      try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
          throw new Error('GEMINI_API_KEY not configured');
        }

        const prompt = this.buildSummaryPrompt(responses);
        
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ 
          model: fallbackModels[modelIndex],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 2048,
          }
        }, { apiVersion: 'v1' });

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        return this.parseSummaryResponse(text);
      } catch (error) {
        console.error(`Error generating summary with ${fallbackModels[modelIndex]}:`, error.message);
        
        // If this was the last model, return fallback
        if (modelIndex === fallbackModels.length - 1) {
          return this.getFallbackSummary();
        }
        // Otherwise, try next model
        continue;
      }
    }
    
    return this.getFallbackSummary();
  }

  // Build prompt for question generation
  buildQuestionPrompt(previousResponses, currentThemes, questionNumber) {
    let prompt = `You are a compassionate AI assistant helping create thoughtful reflection questions for mental health preparation. 

CONTEXT:
- This is question ${questionNumber} of up to 10 questions
- The client will use this reflection before booking a therapy session
- Questions should be gentle, non-clinical, and help clients understand their current state

PREVIOUS RESPONSES:
${previousResponses.map((r, i) => `Q${i + 1}: ${r.questionText}\nA${i + 1}: ${r.answer}`).join('\n\n')}

CURRENT THEMES: ${currentThemes.join(', ')}

REQUIREMENTS:
1. Create ONE thoughtful question that builds on previous responses
2. Provide 4-5 multiple choice options
3. Keep language warm and non-clinical
4. Focus on self-awareness and emotional understanding
5. Avoid diagnostic or therapeutic language

RESPONSE FORMAT (JSON):
{
  "question": "Your thoughtful question here",
  "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
  "internalThemes": ["theme1", "theme2"],
  "nextFocus": "Brief note about what this question explores"
}

Generate the next question:`;

    return prompt;
  }

  // Build prompt for summary generation
  buildSummaryPrompt(responses) {
    const responsesText = responses.map((r, i) => 
      `Q${i + 1}: ${r.questionText}\nA${i + 1}: ${r.answer}`
    ).join('\n\n');

    return `You are a compassionate AI assistant creating a neutral summary for therapists based on client reflection responses.

CLIENT RESPONSES:
${responsesText}

REQUIREMENTS:
1. Create a neutral, professional summary for therapist preparation
2. Identify key themes and emotional patterns
3. Suggest therapeutic approaches that might be helpful
4. Provide thoughtful questions the therapist could explore
5. Maintain client dignity and avoid pathologizing language
6. Keep summary concise but insightful

RESPONSE FORMAT (JSON):
{
  "summary": "A compassionate 2-3 sentence summary of the client's current state and what they're seeking",
  "keyThemes": ["theme1", "theme2", "theme3"],
  "possibleApproaches": ["CBT", "Person-Centered", "Mindfulness-Based"],
  "suggestedQuestions": [
    "Question 1 the therapist could explore",
    "Question 2 the therapist could explore", 
    "Question 3 the therapist could explore"
  ]
}

Generate the summary:`;
  }

  // Parse question response from AI
  parseQuestionResponse(text, questionNumber) {
    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          question: parsed.question || `How are you feeling about question ${questionNumber}?`,
          options: parsed.options || ["Good", "Okay", "Not sure", "Difficult"],
          internalThemes: parsed.internalThemes || ["general"],
          nextFocus: parsed.nextFocus || "General wellbeing"
        };
      }
    } catch (error) {
      console.error('Error parsing question response:', error);
    }
    
    return this.getFallbackQuestion(questionNumber);
  }

  // Parse summary response from AI
  parseSummaryResponse(text) {
    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          summary: parsed.summary || "The client has completed a reflection session and is seeking support.",
          keyThemes: parsed.keyThemes || ["General wellbeing"],
          possibleApproaches: parsed.possibleApproaches || ["Person-Centered Therapy"],
          suggestedQuestions: parsed.suggestedQuestions || [
            "What brings you here today?",
            "How are you feeling right now?",
            "What would you like to focus on?"
          ]
        };
      }
    } catch (error) {
      console.error('Error parsing summary response:', error);
    }
    
    return this.getFallbackSummary();
  }

  // Fallback questions when AI fails
  getFallbackQuestion(questionNumber) {
    const fallbackQuestions = [
      {
        question: "How would you describe your overall mood lately?",
        options: ["Generally positive", "Up and down", "Mostly low", "Hard to say", "Prefer not to answer"],
        internalThemes: ["mood", "emotional_state"],
        nextFocus: "Current emotional wellbeing"
      },
      {
        question: "What's been on your mind the most recently?",
        options: ["Work or school stress", "Relationships", "Personal goals", "Health concerns", "Other"],
        internalThemes: ["concerns", "focus_areas"],
        nextFocus: "Primary concerns"
      },
      {
        question: "How well have you been sleeping?",
        options: ["Very well", "Pretty well", "Some difficulties", "Quite poorly", "Prefer not to answer"],
        internalThemes: ["sleep", "self_care"],
        nextFocus: "Sleep and self-care"
      },
      {
        question: "What would help you feel more supported right now?",
        options: ["Someone to listen", "Practical advice", "Emotional support", "Professional guidance", "Not sure"],
        internalThemes: ["support_needs", "goals"],
        nextFocus: "Support preferences"
      },
      {
        question: "How comfortable do you feel talking about personal topics?",
        options: ["Very comfortable", "Somewhat comfortable", "A bit nervous", "Quite anxious", "Prefer to start slowly"],
        internalThemes: ["comfort_level", "therapy_readiness"],
        nextFocus: "Therapy readiness"
      }
    ];

    const index = Math.min(questionNumber - 1, fallbackQuestions.length - 1);
    return fallbackQuestions[index];
  }

  // Fallback summary when AI fails
  getFallbackSummary() {
    return {
      summary: "The client has completed a pre-session reflection and is seeking therapeutic support. They appear ready to engage in the therapeutic process.",
      keyThemes: ["Self-reflection", "Seeking support", "Therapy preparation"],
      possibleApproaches: ["Person-Centered Therapy", "Cognitive Behavioral Therapy"],
      suggestedQuestions: [
        "What brings you here today?",
        "How are you feeling about starting therapy?",
        "What would you like to focus on in our sessions?"
      ]
    };
  }
}

export const geminiService = new GeminiReflectionService();