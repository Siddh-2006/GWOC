import { GoogleGenerativeAI } from '@google/generative-ai';

// Enhanced Reflection-specific Gemini AI service with adaptive learning
class GeminiReflectionService {
  constructor() {
    // Multiple API keys support for quota management
    this.apiKeys = [];
    this.currentKeyIndex = 0;
    this.keysLoaded = false;
  }

  // Load and parse multiple API keys (lazy loading)
  loadApiKeys() {
    if (this.keysLoaded) return; // Only load once
    
    // Try both GEMINI_KEYS and GEMINI_API_KEY environment variables
    const keysString = process.env.GEMINI_KEYS || process.env.GEMINI_API_KEY || '';
    this.apiKeys = keysString.split(',').map(key => key.trim()).filter(key => key.length > 0);
    this.keysLoaded = true;
    
    if (this.apiKeys.length === 0) {
      console.error('❌ No Gemini API keys configured. Please set GEMINI_API_KEY or GEMINI_KEYS environment variable.');
    } else {
      console.log(`✅ Loaded ${this.apiKeys.length} Gemini API key(s)`);
    }
  }

  // Get next available API key (round-robin)
  getNextApiKey() {
    // Load keys if not already loaded
    if (!this.keysLoaded) {
      this.loadApiKeys();
    }
    
    if (this.apiKeys.length === 0) {
      throw new Error('No Gemini API keys configured. Please set GEMINI_API_KEY or GEMINI_KEYS environment variable.');
    }
    
    const key = this.apiKeys[this.currentKeyIndex];
    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
    return key;
  }

  // Helper to wait
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Helper to get model
  getModel(modelName) {
    const apiKey = this.getNextApiKey();
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: modelName }, { apiVersion: 'v1' });
  }

  // Analyze client's emotional and psychological state from responses
  analyzeClientState(responses) {
    const analysis = {
      emotionalState: 'neutral',
      stressLevel: 'moderate',
      readinessForTherapy: 'ready',
      primaryConcerns: [],
      copingStrategies: [],
      supportNeeds: [],
      progressionStage: this.determineProgressionStage(responses.length)
    };

    // Analyze responses for emotional indicators
    const allText = responses.map(r => `${r.questionText} ${r.answer}`).join(' ').toLowerCase();
    
    // Emotional state analysis
    if (allText.includes('anxious') || allText.includes('worried') || allText.includes('stressed')) {
      analysis.emotionalState = 'anxious';
      analysis.stressLevel = 'high';
    } else if (allText.includes('sad') || allText.includes('down') || allText.includes('depressed')) {
      analysis.emotionalState = 'low';
    } else if (allText.includes('happy') || allText.includes('good') || allText.includes('positive')) {
      analysis.emotionalState = 'positive';
      analysis.stressLevel = 'low';
    }

    // Identify primary concerns
    if (allText.includes('relationship') || allText.includes('family')) {
      analysis.primaryConcerns.push('relationships');
    }
    if (allText.includes('work') || allText.includes('job') || allText.includes('career')) {
      analysis.primaryConcerns.push('work-related stress');
    }
    if (allText.includes('sleep') || allText.includes('tired')) {
      analysis.primaryConcerns.push('sleep issues');
    }

    return analysis;
  }

  // Determine what stage of questioning we're in
  determineProgressionStage(questionNumber) {
    if (questionNumber <= 3) return 'general'; // General wellbeing and mood
    if (questionNumber <= 6) return 'specific'; // Specific concerns and situations
    if (questionNumber <= 8) return 'deep'; // Deeper emotional exploration
    return 'integration'; // Integration and therapy preparation
  }

  // Hybrid approach: Fixed first questions + AI adaptive questions
  async generateNextQuestion(previousResponses = [], currentThemes = [], questionNumber = 1) {
    // Questions 1-2 are fixed to save tokens and API calls
    if (questionNumber <= 2) {
      return this.getFixedQuestion(questionNumber);
    }
    
    // Questions 3+ are AI-generated based on previous answers
    const fallbackModels = [
      "gemini-2.5-flash",
      "gemini-1.5-flash",
      "gemini-pro"
    ];

    let lastError = null;

    // Analyze client state for adaptive questioning
    const clientAnalysis = this.analyzeClientState(previousResponses);
    
    // Try each model with multiple API keys
    for (let modelIndex = 0; modelIndex < fallbackModels.length; modelIndex++) {
      const maxRetries = 3;
      
      for (let retry = 0; retry < maxRetries; retry++) {
        try {
          const apiKey = this.getNextApiKey();
          const prompt = this.buildUltraCompactPrompt(previousResponses, questionNumber, clientAnalysis);
          
          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({ 
            model: fallbackModels[modelIndex],
            generationConfig: {
              temperature: 0.6,
              maxOutputTokens: 150, // Reduced to ensure complete responses
              topP: 0.7,
              topK: 10
            }
          });

          console.log(`🤖 Generating adaptive question ${questionNumber} with ${fallbackModels[modelIndex]} (attempt ${retry + 1})`);
          
          const result = await model.generateContent(prompt);
          const response = result.response;
          const text = response.text();

          console.log(`✅ AI generated adaptive response for question ${questionNumber}`);
          
          const parsedQuestion = this.parseQuestionResponse(text, questionNumber);
          
          if (parsedQuestion && parsedQuestion.question && parsedQuestion.options && parsedQuestion.options.length >= 3) {
            console.log(`✅ Successfully generated adaptive question ${questionNumber}: "${parsedQuestion.question}"`);
            return parsedQuestion;
          } else {
            throw new Error('Invalid question format received from AI');
          }
          
        } catch (error) {
          lastError = error;
          console.error(`❌ Error generating question with ${fallbackModels[modelIndex]} (attempt ${retry + 1}):`, error.message);
          
          // If quota exceeded, try next API key
          if (error.message.includes('quota') || error.message.includes('limit')) {
            console.log(`⚠️ Quota limit reached, trying next API key...`);
            continue;
          }
          
          // Wait before retry (exponential backoff)
          if (retry < maxRetries - 1) {
            const waitTime = Math.pow(2, retry) * 1000;
            console.log(`⏳ Waiting ${waitTime}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
          }
        }
      }
    }
    
    console.error(`❌ All AI models and keys failed to generate question ${questionNumber}. Using fallback.`);
    return this.getFallbackQuestion(questionNumber, previousResponses);
  }

  // Generate comprehensive AI summary with client perspective and emotional analysis
  async generateSummary(responses) {
    const fallbackModels = [
      "gemini-2.5-flash",
      "gemini-1.5-flash",
      "gemini-pro"
    ];

    let lastError = null;
    const clientAnalysis = this.analyzeClientState(responses);

    // Try each model with multiple API keys
    for (let modelIndex = 0; modelIndex < fallbackModels.length; modelIndex++) {
      const maxRetries = 3;
      
      for (let retry = 0; retry < maxRetries; retry++) {
        try {
          const apiKey = this.getNextApiKey();
          const prompt = this.buildComprehensiveSummaryPrompt(responses, clientAnalysis);
          
          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({ 
            model: fallbackModels[modelIndex],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 2048,
              topP: 0.8,
              topK: 40
            }
          });

          console.log(`🤖 Generating comprehensive summary with ${fallbackModels[modelIndex]} (attempt ${retry + 1})`);

          const result = await model.generateContent(prompt);
          const response = result.response;
          const text = response.text();

          console.log(`✅ AI generated comprehensive summary`);
          
          const parsedSummary = this.parseSummaryResponse(text);
          
          if (parsedSummary && parsedSummary.summary && parsedSummary.keyThemes && parsedSummary.possibleApproaches) {
            console.log(`✅ Successfully generated comprehensive AI summary`);
            return parsedSummary;
          } else {
            throw new Error('Invalid summary format received from AI');
          }
          
        } catch (error) {
          lastError = error;
          console.error(`❌ Error generating summary with ${fallbackModels[modelIndex]} (attempt ${retry + 1}):`, error.message);
          
          // If quota exceeded, try next API key
          if (error.message.includes('quota') || error.message.includes('limit')) {
            console.log(`⚠️ Quota limit reached, trying next API key...`);
            continue;
          }
          
          // Wait before retry (exponential backoff)
          if (retry < maxRetries - 1) {
            const waitTime = Math.pow(2, retry) * 1000;
            console.log(`⏳ Waiting ${waitTime}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
          }
        }
      }
    }
    
    console.error(`❌ All AI models and keys failed to generate summary. Using fallback.`);
    return this.getFallbackSummary();
  }

  // Build ultra-compact adaptive question prompt (OPTIMIZED for token efficiency)
  buildAdaptiveQuestionPrompt(previousResponses, currentThemes, questionNumber, clientAnalysis) {
    // This method is now replaced by buildUltraCompactPrompt for Q3+
    // Keeping for backward compatibility
    return this.buildUltraCompactPrompt(previousResponses, questionNumber, clientAnalysis);
  }

  // Get fixed questions for Q1-Q2 (no AI needed)
  getFixedQuestion(questionNumber) {
    const fixedQuestions = [
      {
        question: "How would you describe your overall mood lately? (There's no right or wrong answer)",
        options: ["Generally positive", "Up and down", "Mostly low", "Hard to say", "Prefer not to answer"],
        internalThemes: ["mood", "emotional_state"],
        nextFocus: "Current emotional wellbeing"
      },
      {
        question: "What's been on your mind the most recently? (Take your time to think about this)",
        options: ["Work or school stress", "Relationships", "Personal goals", "Health concerns", "Other"],
        internalThemes: ["concerns", "focus_areas"],
        nextFocus: "Primary concerns"
      }
    ];

    console.log(`📋 Using fixed question ${questionNumber} (no AI call needed)`);
    return fixedQuestions[questionNumber - 1];
  }

  // Ultra-compact prompt for Q3+ (only uses previous answers)
  buildUltraCompactPrompt(previousResponses, questionNumber, clientAnalysis) {
    // Only use the actual answers, not questions - ultra minimal
    const answers = previousResponses.slice(-2).map(r => r.answer).join(', ');
    
    return `Q${questionNumber}/10 therapy prep. Previous: ${answers}. Client: ${clientAnalysis.emotionalState}.

JSON only:
{"question":"[build on their answers, include 'no right answer']","options":["opt1","opt2","opt3","opt4"]}`;
  }

  // Get stage-specific guidelines for question generation
  getStageGuidelines(stage, questionNumber) {
    switch (stage) {
      case 'general':
        return `GENERAL STAGE (Questions 1-3):
- Focus on overall wellbeing, mood, and general life satisfaction
- Ask about recent feelings and general state of mind
- Explore basic daily functioning and energy levels
- Keep questions broad and non-threatening
- Build rapport and comfort`;

      case 'specific':
        return `SPECIFIC STAGE (Questions 4-6):
- Dive into specific areas of concern or stress
- Explore relationships, work, or life circumstances
- Ask about particular situations causing difficulty
- Identify patterns in thoughts, feelings, or behaviors
- Begin to understand root causes`;

      case 'deep':
        return `DEEP EXPLORATION STAGE (Questions 7-8):
- Explore deeper emotional experiences and patterns
- Ask about coping mechanisms and support systems
- Understand how issues affect daily life and relationships
- Explore client's perspective on their challenges
- Prepare for therapeutic work`;

      case 'integration':
        return `INTEGRATION STAGE (Questions 9-10):
- Focus on therapy goals and expectations
- Explore readiness for change and growth
- Ask about hopes for therapy outcomes
- Understand client's motivation for seeking help
- Prepare for therapeutic relationship`;

      default:
        return 'Focus on the client\'s current needs and emotional state.';
    }
  }

  // Build ultra-compact summary prompt (MINIMAL tokens)
  buildComprehensiveSummaryPrompt(responses, clientAnalysis) {
    // Only use answers, not full questions - much more compact
    const answersOnly = responses.slice(-3).map(r => r.answer).join(', ');

    return `Create therapy summary.

Responses: ${answersOnly}
State: ${clientAnalysis.emotionalState}, ${clientAnalysis.stressLevel} stress

Approaches: "CBT", "DBT", "ACT", "Schema Therapy", "EFT", "Client-Centred Therapy"

JSON:
{
  "summary": "2-3 sentence professional summary",
  "clientPerspective": "how client views situation", 
  "emotionalState": "emotional analysis",
  "strengths": ["strength1", "strength2"],
  "concerns": ["concern1", "concern2"],
  "keyThemes": ["theme1", "theme2"],
  "possibleApproaches": ["approach1", "approach2"],
  "therapyReadiness": "readiness level",
  "suggestedFocus": ["focus1", "focus2"],
  "therapistNotes": "key notes"
}`;
  }

  // Parse question response from AI (Simplified for minimal format)
  parseQuestionResponse(text, questionNumber) {
    try {
      // Clean the text to extract JSON
      let cleanText = text.trim();
      
      // Remove any markdown code blocks
      cleanText = cleanText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      // Try to find and complete incomplete JSON
      let jsonMatch = cleanText.match(/\{[\s\S]*?\}/);
      
      if (!jsonMatch) {
        // Try to find partial JSON and complete it
        const partialMatch = cleanText.match(/\{[\s\S]*/);
        if (partialMatch) {
          let partial = partialMatch[0];
          // Try to close incomplete JSON - handle unterminated strings
          if (!partial.includes('}')) {
            // If there's an unterminated string, try to close it
            if (partial.includes('"question":') && !partial.match(/"question":\s*"[^"]*"/)) {
              // Find the last quote and close the string
              const lastQuoteIndex = partial.lastIndexOf('"');
              if (lastQuoteIndex > -1 && partial.substring(lastQuoteIndex + 1).trim() === '') {
                partial = partial.substring(0, lastQuoteIndex + 1) + '", "options": ["Yes", "No", "Maybe", "Not sure"]}';
              } else {
                partial += '", "options": ["Yes", "No", "Maybe", "Not sure"]}';
              }
            } else {
              partial += '}';
            }
          }
          jsonMatch = [partial];
        }
      }
      
      if (jsonMatch) {
        let jsonStr = jsonMatch[0];
        
        // Fix common JSON issues
        jsonStr = jsonStr.replace(/,\s*}/g, '}'); // Remove trailing commas
        jsonStr = jsonStr.replace(/,\s*]/g, ']'); // Remove trailing commas in arrays
        
        // Handle unterminated strings more aggressively
        if (jsonStr.includes('"question":') && !jsonStr.match(/"question":\s*"[^"]*"/)) {
          // Extract what we can and rebuild
          const questionMatch = jsonStr.match(/"question":\s*"([^"]*)/);
          if (questionMatch) {
            const questionText = questionMatch[1] || `How are you feeling about question ${questionNumber}?`;
            jsonStr = `{"question": "${questionText} (There's no right or wrong answer)", "options": ["Very much", "Somewhat", "Not really", "Not at all"]}`;
          }
        }
        
        const parsed = JSON.parse(jsonStr);
        
        // Validate and fix required fields
        if (!parsed.question) {
          throw new Error('Missing question field');
        }
        
        if (!parsed.options || !Array.isArray(parsed.options) || parsed.options.length < 3) {
          // Generate default options if missing
          parsed.options = [
            "Very much",
            "Somewhat", 
            "Not really",
            "Not at all"
          ];
        }
        
        return {
          question: parsed.question,
          options: parsed.options.slice(0, 4), // Limit to 4 options for simplicity
          internalThemes: ["adaptive"], // Simplified
          nextFocus: "Building on responses" // Simplified
        };
      } else {
        throw new Error('No valid JSON found in AI response');
      }
    } catch (error) {
      console.error('Error parsing question response:', error);
      console.error('Raw AI response (first 200 chars):', text.substring(0, 200));
      
      // Emergency fallback - create a question from the raw text
      try {
        const questionText = text.substring(0, 100).replace(/[{}"\[\]]/g, '').trim();
        if (questionText.length > 10) {
          return {
            question: `${questionText.substring(0, 80)}... (There's no right or wrong answer)`,
            options: ["Very much", "Somewhat", "Not really", "Not at all"],
            internalThemes: ["adaptive"],
            nextFocus: "Building on responses"
          };
        }
      } catch (emergencyError) {
        console.error('Emergency fallback also failed:', emergencyError);
      }
      
      throw error; // Re-throw to trigger retry
    }
  }

  // Parse enhanced summary response from AI
  parseSummaryResponse(text) {
    try {
      // Clean the text to extract JSON
      let cleanText = text.trim();
      
      // Remove any markdown code blocks
      cleanText = cleanText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      // Find JSON object
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // Validate required fields
        if (!parsed.summary || !parsed.keyThemes || !parsed.possibleApproaches) {
          throw new Error('Invalid summary format: missing required fields');
        }
        
        // Map AI-generated approaches to valid enum values
        const validApproaches = this.mapToValidApproaches(parsed.possibleApproaches || []);
        
        // Return enhanced summary with all fields
        return {
          summary: parsed.summary,
          clientPerspective: parsed.clientPerspective || "Client appears engaged in self-reflection and seeking support.",
          emotionalState: parsed.emotionalState || "Client shows awareness of their emotional needs.",
          strengths: Array.isArray(parsed.strengths) ? parsed.strengths : ["Self-awareness", "Willingness to seek help"],
          concerns: Array.isArray(parsed.concerns) ? parsed.concerns : ["General wellbeing"],
          keyThemes: Array.isArray(parsed.keyThemes) ? parsed.keyThemes : ["Self-reflection", "Seeking support"],
          possibleApproaches: validApproaches,
          therapyReadiness: parsed.therapyReadiness || "Client appears ready to engage in therapeutic work.",
          suggestedFocus: Array.isArray(parsed.suggestedFocus) ? parsed.suggestedFocus : [
            "Establish therapeutic rapport",
            "Explore client's primary concerns",
            "Assess coping strategies"
          ],
          therapistNotes: parsed.therapistNotes || "Client has completed pre-session reflection and appears motivated for therapy.",
          // Legacy fields for backward compatibility
          suggestedQuestions: Array.isArray(parsed.suggestedQuestions) ? parsed.suggestedQuestions : [
            "What brings you here today?",
            "How are you feeling right now?",
            "What would you like to focus on?"
          ]
        };
      } else {
        throw new Error('No valid JSON found in AI response');
      }
    } catch (error) {
      console.error('Error parsing summary response:', error);
      console.error('Raw AI response:', text);
      throw error; // Re-throw to trigger retry
    }
  }

  // Map AI-generated approaches to valid enum values
  mapToValidApproaches(aiApproaches) {
    const validEnumValues = [
      'Cognitive Behavioural Therapy (CBT)',
      'Dialectical Behavioural Therapy (DBT)',
      'Acceptance & Commitment Therapy (ACT)',
      'Schema Therapy',
      'Emotion-Focused Therapy (EFT)',
      'Emotion-Focused Couples Therapy',
      'Mindfulness-Based Cognitive Therapy',
      'Client-Centred Therapy'
    ];

    const mappings = {
      'CBT': 'Cognitive Behavioural Therapy (CBT)',
      'Cognitive Behavioral Therapy': 'Cognitive Behavioural Therapy (CBT)',
      'Cognitive Behavioural Therapy': 'Cognitive Behavioural Therapy (CBT)',
      'Person-Centered': 'Client-Centred Therapy',
      'Person-Centered Therapy': 'Client-Centred Therapy',
      'Client-Centered': 'Client-Centred Therapy',
      'Client-Centered Therapy': 'Client-Centred Therapy',
      'DBT': 'Dialectical Behavioural Therapy (DBT)',
      'Dialectical Behavioral Therapy': 'Dialectical Behavioural Therapy (DBT)',
      'ACT': 'Acceptance & Commitment Therapy (ACT)',
      'Acceptance and Commitment Therapy': 'Acceptance & Commitment Therapy (ACT)',
      'EFT': 'Emotion-Focused Therapy (EFT)',
      'Emotion Focused Therapy': 'Emotion-Focused Therapy (EFT)',
      'Mindfulness-Based': 'Mindfulness-Based Cognitive Therapy',
      'Mindfulness': 'Mindfulness-Based Cognitive Therapy',
      'Schema': 'Schema Therapy'
    };

    const mappedApproaches = aiApproaches.map(approach => {
      // Direct match
      if (validEnumValues.includes(approach)) {
        return approach;
      }
      
      // Mapping match
      if (mappings[approach]) {
        return mappings[approach];
      }
      
      // Partial match
      for (const validValue of validEnumValues) {
        if (validValue.toLowerCase().includes(approach.toLowerCase()) || 
            approach.toLowerCase().includes(validValue.toLowerCase().split(' ')[0])) {
          return validValue;
        }
      }
      
      // Default fallback
      return 'Client-Centred Therapy';
    });

    // Remove duplicates and ensure we have at least one approach
    const uniqueApproaches = [...new Set(mappedApproaches)];
    return uniqueApproaches.length > 0 ? uniqueApproaches : ['Client-Centred Therapy'];
  }

  // Fallback questions when AI completely fails (EXTREME EDGE CASE ONLY)
  // This should rarely be used - the system should primarily rely on AI-generated questions
  getFallbackQuestion(questionNumber, previousResponses = []) {
    console.warn(`⚠️ Using fallback question ${questionNumber} - this indicates AI generation failed completely`);
    
    const fallbackQuestions = [
      {
        question: "How would you describe your overall mood lately? (There's no right or wrong answer)",
        options: ["Generally positive", "Up and down", "Mostly low", "Hard to say", "Prefer not to answer"],
        internalThemes: ["mood", "emotional_state"],
        nextFocus: "Current emotional wellbeing"
      },
      {
        question: "What's been on your mind the most recently? (Take your time to think about this)",
        options: ["Work or school stress", "Relationships", "Personal goals", "Health concerns", "Other"],
        internalThemes: ["concerns", "focus_areas"],
        nextFocus: "Primary concerns"
      },
      {
        question: "How well have you been sleeping? (Whatever feels right to share)",
        options: ["Very well", "Pretty well", "Some difficulties", "Quite poorly", "Prefer not to answer"],
        internalThemes: ["sleep", "self_care"],
        nextFocus: "Sleep and self-care"
      },
      {
        question: "What would help you feel more supported right now? (No pressure to have a specific answer)",
        options: ["Someone to listen", "Practical advice", "Emotional support", "Professional guidance", "Not sure"],
        internalThemes: ["support_needs", "goals"],
        nextFocus: "Support preferences"
      },
      {
        question: "How comfortable do you feel talking about personal topics? (There's no right way to feel about this)",
        options: ["Very comfortable", "Somewhat comfortable", "A bit nervous", "Quite anxious", "Prefer to start slowly"],
        internalThemes: ["comfort_level", "therapy_readiness"],
        nextFocus: "Therapy readiness"
      },
      {
        question: "What brings you to seek therapy at this time? (Whatever your reason, it's valid)",
        options: ["Specific challenges", "Personal growth", "Life transitions", "Relationship issues", "General support"],
        internalThemes: ["motivation", "goals"],
        nextFocus: "Therapy motivation"
      },
      {
        question: "How do you typically cope with stress? (There's no right or wrong way)",
        options: ["Talk to others", "Exercise or activities", "Take time alone", "Problem-solving", "Varies by situation"],
        internalThemes: ["coping_strategies", "resilience"],
        nextFocus: "Coping mechanisms"
      },
      {
        question: "What does emotional support look like for you? (Take your time with this)",
        options: ["Active listening", "Practical advice", "Encouragement", "Problem-solving together", "Just being present"],
        internalThemes: ["support_style", "preferences"],
        nextFocus: "Support preferences"
      },
      {
        question: "How do you feel about change in your life? (No right or wrong answer here)",
        options: ["Embrace it", "Cautiously optimistic", "Somewhat resistant", "Find it difficult", "Depends on the change"],
        internalThemes: ["change_readiness", "adaptability"],
        nextFocus: "Change orientation"
      },
      {
        question: "What would success in therapy look like for you? (Whatever comes to mind is fine)",
        options: ["Better coping skills", "Improved relationships", "Personal insight", "Specific goal achievement", "General wellbeing"],
        internalThemes: ["therapy_goals", "expectations"],
        nextFocus: "Therapy expectations"
      }
    ];

    // Filter out questions that have already been asked
    const askedQuestions = previousResponses.map(r => r.questionText);
    const availableQuestions = fallbackQuestions.filter(q => 
      !askedQuestions.some(asked => asked.includes(q.question.split('?')[0]))
    );

    // If we've asked all questions, use modulo to cycle through
    if (availableQuestions.length === 0) {
      const index = (questionNumber - 1) % fallbackQuestions.length;
      return fallbackQuestions[index];
    }

    // Use modulo on available questions to ensure we don't repeat
    const index = (questionNumber - 1) % availableQuestions.length;
    return availableQuestions[index];
  }

  // Enhanced fallback summary when AI completely fails (EXTREME EDGE CASE ONLY)
  getFallbackSummary() {
    console.warn(`⚠️ Using enhanced fallback summary - this indicates AI generation failed completely`);
    
    return {
      summary: "The client has completed a comprehensive pre-session reflection and demonstrates readiness to engage in therapeutic work. They show self-awareness and motivation for personal growth.",
      clientPerspective: "Client appears to view their situation as an opportunity for growth and is actively seeking professional support to address their concerns.",
      emotionalState: "Client demonstrates emotional awareness and appears stable enough to engage in therapeutic work, though specific concerns may need exploration.",
      strengths: ["Self-awareness", "Motivation for change", "Willingness to seek help", "Engagement in self-reflection"],
      concerns: ["General wellbeing", "Personal growth", "Life transitions"],
      keyThemes: ["Self-reflection", "Seeking support", "Personal growth", "Therapy preparation"],
      possibleApproaches: ["Client-Centred Therapy", "Cognitive Behavioural Therapy (CBT)"],
      therapyReadiness: "Client appears ready and motivated to engage in therapeutic work, having completed thoughtful pre-session preparation.",
      suggestedFocus: [
        "Establish therapeutic rapport and trust",
        "Explore client's primary concerns and goals",
        "Assess current coping strategies and support systems"
      ],
      therapistNotes: "Client has engaged in pre-session reflection process, indicating motivation and preparation for therapy. Consider building on this foundation of self-awareness.",
      // Legacy fields for backward compatibility
      suggestedQuestions: [
        "What brings you here today?",
        "How are you feeling about starting therapy?",
        "What would you like to focus on in our sessions?"
      ]
    };
  }
  /**
   * Generate first session summary (one-time only)
   * Uses the new ethical prompt for first-time clients
   */
  async generateFirstSessionSummary(responses, questions) {
    const models = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-pro"];
    let lastError = null;
    
    console.log(`🤖 Starting summary generation with models: ${models.join(', ')}`);

    for (const modelName of models) {
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const model = this.getModel(modelName);
          
          // Build context from responses
          let responseContext = '';
          Object.entries(responses).forEach(([key, response]) => {
            responseContext += `${response.questionText}\nSelected: ${response.selectedLabel}\n\n`;
          });

          const prompt = `You are an experienced, ethical psychologist acting only as an observer.

Context:
These responses were provided by a client before their FIRST therapy session.
This reflection will not be repeated for future sessions.

Your task:
- Summarize the person's emotional awareness, coping style, adaptability, interpersonal orientation, and openness to growth.
- Describe patterns neutrally and respectfully.
- Highlight individuality and sensitivities.
- Provide context for a human-led first conversation.

STRICT RULES:
- Do NOT diagnose.
- Do NOT suggest or recommend therapy.
- Do NOT label conditions or disorders.
- Do NOT use alarming or clinical language.
- Do NOT assume crisis or pathology.

Tone:
Calm, observational, non-judgmental.
Use uncertainty language such as:
- "appears to"
- "may suggest"
- "based on limited responses"

Structure output exactly as:

REFLECTION SUMMARY:
[1–2 paragraphs]

OBSERVED PATTERNS:
- Emotional awareness: [brief observation]
- Emotional expression: [brief observation]
- Coping style: [brief observation]
- Adaptability: [brief observation]
- Interpersonal orientation: [brief observation]
- Openness to growth: [brief observation]

UNIQUE NOTES:
[short paragraph highlighting individuality]

End with:
"This summary is intended to support human understanding for the first session only."

Client Responses:
${responseContext}`;

          const result = await model.generateContent(prompt);
          const summary = result.response.text().trim();

          // Basic validation
          if (summary && summary.length > 100 && summary.includes('REFLECTION SUMMARY:')) {
            console.log(`✅ First session summary generated successfully with ${modelName} (attempt ${attempt})`);
            return summary;
          } else {
            throw new Error('Generated summary failed validation');
          }

        } catch (error) {
          lastError = error;
          console.error(`❌ Summary generation failed with ${modelName} (attempt ${attempt}):`, error.message);
          
          if (error.message.includes('404')) {
            console.error(`⚠️ Model ${modelName} is not supported on the current API version/tier. Trying next model...`);
            break; // Stop retrying this model, move to next in list
          }

          if (attempt < 3) {
            await this.delay(1000 * attempt); // Exponential backoff
          }
        }
      }
    }

    console.error('❌ All summary generation attempts failed:', lastError?.message);
    throw new Error('Failed to generate reflection summary after all attempts');
  }
}

export const geminiService = new GeminiReflectionService();