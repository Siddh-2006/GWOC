import { geminiService } from './gemini.service.js';
import { contentValidator } from './content-validator.service.js';

class ReflectionProcessorService {
  constructor() {
    this.maxQuestions = 10;
    this.earlyStopThreshold = 0.8; // Stop early if 80% clarity achieved
  }

  // Process user response and determine next action
  async processResponse(session, questionId, answer, skipped = false) {
    try {
      // Add response to session
      const question = await this.getQuestionById(questionId);
      if (!question) {
        throw new Error('Question not found');
      }

      await session.addResponse(questionId, question.questionText, answer, skipped);

      // Analyze session progress
      const analysis = this.analyzeSessionProgress(session);
      
      // Determine next action
      if (analysis.shouldStop || session.responses.length >= this.maxQuestions) {
        return {
          action: 'complete',
          reason: analysis.shouldStop ? 'clarity_achieved' : 'max_questions_reached',
          analysis
        };
      }

      // Generate next question
      const nextQuestion = await this.generateAdaptiveQuestion(session, analysis);
      
      return {
        action: 'continue',
        nextQuestion,
        analysis
      };
    } catch (error) {
      console.error('Response processing error:', error);
      throw error;
    }
  }

  // Analyze session progress to determine if early stopping is appropriate
  analyzeSessionProgress(session) {
    const responses = session.responses.filter(r => !r.skipped && r.answer.trim());
    const totalResponses = session.responses.length;
    
    // Calculate response quality metrics
    const avgResponseLength = responses.length > 0 
      ? responses.reduce((sum, r) => sum + r.answer.length, 0) / responses.length
      : 0;
    
    const responseRate = totalResponses > 0 ? responses.length / totalResponses : 0;
    
    // Detect emerging themes
    const themes = this.extractThemes(responses);
    const themeConsistency = this.calculateThemeConsistency(themes);
    
    // Calculate clarity score
    const clarityScore = this.calculateClarityScore({
      responseCount: responses.length,
      avgLength: avgResponseLength,
      responseRate,
      themeConsistency,
      totalQuestions: totalResponses
    });

    return {
      clarityScore,
      shouldStop: clarityScore >= this.earlyStopThreshold && responses.length >= 3,
      themes,
      responseCount: responses.length,
      totalQuestions: totalResponses,
      responseRate,
      avgResponseLength,
      themeConsistency
    };
  }

  // Extract themes from responses using simple keyword analysis
  extractThemes(responses) {
    const themeKeywords = {
      emotions: ['feel', 'feeling', 'emotion', 'sad', 'happy', 'angry', 'anxious', 'worried', 'excited'],
      relationships: ['family', 'friend', 'partner', 'relationship', 'marriage', 'parent', 'child'],
      work: ['work', 'job', 'career', 'boss', 'colleague', 'stress', 'pressure'],
      health: ['health', 'sleep', 'tired', 'energy', 'physical', 'body'],
      goals: ['goal', 'future', 'plan', 'want', 'hope', 'dream', 'achieve'],
      challenges: ['problem', 'difficult', 'struggle', 'challenge', 'hard', 'tough'],
      growth: ['learn', 'grow', 'change', 'improve', 'better', 'develop']
    };

    const allText = responses.map(r => r.answer.toLowerCase()).join(' ');
    const detectedThemes = [];

    for (const [theme, keywords] of Object.entries(themeKeywords)) {
      const matches = keywords.filter(keyword => allText.includes(keyword));
      if (matches.length > 0) {
        detectedThemes.push({
          theme,
          strength: matches.length / keywords.length,
          keywords: matches
        });
      }
    }

    return detectedThemes.sort((a, b) => b.strength - a.strength);
  }

  // Calculate theme consistency across responses
  calculateThemeConsistency(themes) {
    if (themes.length === 0) return 0;
    
    // Simple consistency measure based on theme strength distribution
    const totalStrength = themes.reduce((sum, t) => sum + t.strength, 0);
    const avgStrength = totalStrength / themes.length;
    
    // Higher consistency when themes are more evenly distributed
    const variance = themes.reduce((sum, t) => sum + Math.pow(t.strength - avgStrength, 2), 0) / themes.length;
    
    return Math.max(0, 1 - variance);
  }
  // Calculate overall clarity score
  calculateClarityScore(metrics) {
    const {
      responseCount,
      avgLength,
      responseRate,
      themeConsistency,
      totalQuestions
    } = metrics;

    // Normalize metrics to 0-1 scale
    const responseCountScore = Math.min(responseCount / 5, 1); // Max at 5 responses
    const lengthScore = Math.min(avgLength / 100, 1); // Max at 100 chars
    const rateScore = responseRate;
    const consistencyScore = themeConsistency;
    const progressScore = Math.min(totalQuestions / 5, 1); // Max at 5 questions

    // Weighted combination
    const clarityScore = (
      responseCountScore * 0.3 +
      lengthScore * 0.2 +
      rateScore * 0.2 +
      consistencyScore * 0.2 +
      progressScore * 0.1
    );

    return Math.min(clarityScore, 1);
  }

  // Generate adaptive next question based on session analysis
  async generateAdaptiveQuestion(session, analysis) {
    try {
      const responses = session.responses.map(r => ({
        questionText: r.questionText,
        answer: r.answer,
        skipped: r.skipped
      }));

      const currentThemes = analysis.themes.map(t => t.theme);
      const questionNumber = session.responses.length + 1;

      // Use Gemini to generate contextual question
      const questionData = await geminiService.generateNextQuestion(
        responses,
        currentThemes,
        questionNumber
      );

      // Validate and potentially regenerate if needed
      const validatedQuestion = await contentValidator.regenerateIfInvalid(
        questionData,
        'question',
        () => geminiService.generateNextQuestion(responses, currentThemes, questionNumber)
      );

      return validatedQuestion.content;
    } catch (error) {
      console.error('Adaptive question generation error:', error);
      
      // Fallback to simple question
      return geminiService.getFallbackQuestion(session.responses.length + 1);
    }
  }

  // Generate final summary with enhanced context
  async generateEnhancedSummary(session) {
    try {
      const responses = session.responses
        .filter(r => !r.skipped && r.answer.trim())
        .map(r => ({
          questionText: r.questionText,
          answer: r.answer
        }));

      if (responses.length === 0) {
        return this.getEmptySessionSummary();
      }

      // Analyze session for additional context
      const analysis = this.analyzeSessionProgress(session);
      
      // Generate AI summary with context
      const aiSummary = await geminiService.generateSummary(responses);
      
      // Enhance summary with analysis insights
      const enhancedSummary = this.enhanceSummaryWithAnalysis(aiSummary, analysis);
      
      // Validate final summary
      const validatedSummary = await contentValidator.regenerateIfInvalid(
        enhancedSummary,
        'summary',
        () => geminiService.generateSummary(responses)
      );

      return validatedSummary.content;
    } catch (error) {
      console.error('Enhanced summary generation error:', error);
      return geminiService.getFallbackSummary();
    }
  }

  // Enhance AI summary with session analysis
  enhanceSummaryWithAnalysis(aiSummary, analysis) {
    const enhanced = { ...aiSummary };

    // Add theme insights to key themes
    if (analysis.themes.length > 0) {
      const topThemes = analysis.themes.slice(0, 3).map(t => t.theme);
      enhanced.keyThemes = [
        ...new Set([...enhanced.keyThemes, ...topThemes])
      ].slice(0, 5); // Limit to 5 themes
    }

    // Adjust suggested questions based on themes
    if (analysis.themes.some(t => t.theme === 'emotions')) {
      enhanced.suggestedQuestions.push("How are you feeling about exploring these emotions together?");
    }

    if (analysis.themes.some(t => t.theme === 'relationships')) {
      enhanced.suggestedQuestions.push("Would you like to talk about how relationships are affecting you?");
    }

    // Limit to 4 suggested questions
    enhanced.suggestedQuestions = enhanced.suggestedQuestions.slice(0, 4);

    return enhanced;
  }
  // Get empty session summary
  getEmptySessionSummary() {
    return {
      summary: "The client initiated a reflection session, indicating readiness to engage in the therapeutic process. While specific responses were not provided, their willingness to begin this reflection demonstrates openness to self-exploration.",
      keyThemes: [
        "Engagement with therapeutic process",
        "Readiness for self-reflection",
        "Initial therapeutic contact"
      ],
      possibleApproaches: [
        "Client-Centred Therapy",
        "Cognitive Behavioural Therapy (CBT)"
      ],
      suggestedQuestions: [
        "What feels most important to talk about today?",
        "How are you feeling about being here?",
        "Where would you like to begin our conversation?",
        "What brought you here today?"
      ]
    };
  }

  // Helper method to get question by ID
  async getQuestionById(questionId) {
    try {
      const { ReflectionQuestion } = await import('../models/ReflectionQuestion.model.js');
      return await ReflectionQuestion.findById(questionId);
    } catch (error) {
      console.error('Error getting question by ID:', error);
      return null;
    }
  }

  // Validate session state before processing
  validateSessionState(session) {
    if (!session) {
      throw new Error('Session is required');
    }

    if (session.status !== 'active') {
      throw new Error('Session is not active');
    }

    if (session.responses.length >= this.maxQuestions) {
      throw new Error('Maximum questions already reached');
    }

    return true;
  }

  // Get session statistics for monitoring
  getSessionStatistics(session) {
    const responses = session.responses;
    const answered = responses.filter(r => !r.skipped && r.answer.trim());
    const skipped = responses.filter(r => r.skipped);

    return {
      totalQuestions: responses.length,
      questionsAnswered: answered.length,
      questionsSkipped: skipped.length,
      responseRate: responses.length > 0 ? answered.length / responses.length : 0,
      avgResponseLength: answered.length > 0 
        ? answered.reduce((sum, r) => sum + r.answer.length, 0) / answered.length 
        : 0,
      sessionDuration: session.calculatedDuration || 0
    };
  }

  // Check if session requires human review
  requiresHumanReview(session, summary) {
    const stats = this.getSessionStatistics(session);
    
    // Trigger human review for certain conditions
    const reviewTriggers = {
      lowEngagement: stats.responseRate < 0.3,
      veryShortResponses: stats.avgResponseLength < 10,
      allSkipped: stats.questionsSkipped === stats.totalQuestions,
      sensitiveContent: this.containsSensitiveContent(session.responses)
    };

    const triggeredReasons = Object.entries(reviewTriggers)
      .filter(([_, triggered]) => triggered)
      .map(([reason, _]) => reason);

    return {
      requiresReview: triggeredReasons.length > 0,
      reasons: triggeredReasons,
      priority: triggeredReasons.includes('sensitiveContent') ? 'high' : 'normal',
      stats
    };
  }

  // Check for sensitive content in responses
  containsSensitiveContent(responses) {
    const sensitiveKeywords = [
      'trauma', 'abuse', 'violence', 'death', 'suicide', 'self-harm',
      'crisis', 'emergency', 'danger', 'hurt myself', 'end it all'
    ];

    const allText = responses
      .filter(r => !r.skipped && r.answer.trim())
      .map(r => r.answer.toLowerCase())
      .join(' ');

    return sensitiveKeywords.some(keyword => allText.includes(keyword));
  }
}

export const reflectionProcessor = new ReflectionProcessorService();