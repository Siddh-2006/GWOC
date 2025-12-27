class ContentValidatorService {
  constructor() {
    // Prohibited terms that should never appear in AI outputs
    this.prohibitedTerms = [
      // Clinical/Diagnostic terms
      'diagnosis', 'diagnose', 'disorder', 'pathology', 'abnormal', 'mental illness',
      'psychiatric condition', 'psychological disorder', 'dsm', 'icd',
      
      // Crisis/Risk terms
      'crisis', 'emergency', 'suicide', 'suicidal', 'self-harm', 'self-injury',
      'danger', 'dangerous', 'risk assessment', 'high risk', 'low risk',
      
      // Directive/Prescriptive terms
      'you should', 'you must', 'you need to', 'i recommend', 'i suggest you',
      'the best therapy', 'the right treatment', 'you require',
      
      // Certainty claims
      'definitely', 'certainly', 'obviously', 'clearly you have', 'you are',
      'this means you', 'you suffer from',
      
      // Inappropriate questioning
      'why did you', 'what caused you to', 'what made you'
    ];

    // Required reassuring phrases for questions
    this.reassuringPhrases = [
      'no right or wrong answer',
      'no right or wrong way',
      'take your time',
      'if you\'d like',
      'feel comfortable',
      'at your own pace',
      'whatever feels right',
      'there\'s no pressure'
    ];

    // Approved therapy approaches (exact matches only)
    this.approvedTherapyApproaches = [
      'Cognitive Behavioural Therapy (CBT)',
      'Dialectical Behavioural Therapy (DBT)',
      'Acceptance & Commitment Therapy (ACT)',
      'Schema Therapy',
      'Emotion-Focused Therapy (EFT)',
      'Emotion-Focused Couples Therapy',
      'Mindfulness-Based Cognitive Therapy',
      'Client-Centred Therapy'
    ];
  }

  // Validate question content
  validateQuestion(questionText, options = []) {
    const validation = {
      isValid: true,
      violations: [],
      warnings: [],
      suggestions: []
    };

    // Check for prohibited terms
    const lowerText = questionText.toLowerCase();
    const foundProhibited = this.prohibitedTerms.filter(term => 
      lowerText.includes(term.toLowerCase())
    );

    if (foundProhibited.length > 0) {
      validation.isValid = false;
      validation.violations.push(`Contains prohibited terms: ${foundProhibited.join(', ')}`);
    }

    // Check for reassuring language
    const hasReassuring = this.reassuringPhrases.some(phrase => 
      lowerText.includes(phrase.toLowerCase())
    );

    if (!hasReassuring) {
      validation.warnings.push('Question lacks reassuring language');
      validation.suggestions.push('Consider adding phrases like "There\'s no right or wrong answer" or "Take your time"');
    }

    // Validate options
    for (const option of options) {
      const optionLower = option.toLowerCase();
      const optionProhibited = this.prohibitedTerms.filter(term => 
        optionLower.includes(term.toLowerCase())
      );
      
      if (optionProhibited.length > 0) {
        validation.isValid = false;
        validation.violations.push(`Option contains prohibited terms: ${optionProhibited.join(', ')}`);
      }
    }

    return validation;
  }
  // Validate summary content
  validateSummary(summary) {
    const validation = {
      isValid: true,
      violations: [],
      warnings: [],
      suggestions: []
    };

    // Check summary text
    const summaryText = summary.summary?.toLowerCase() || '';
    const foundProhibited = this.prohibitedTerms.filter(term => 
      summaryText.includes(term.toLowerCase())
    );

    if (foundProhibited.length > 0) {
      validation.isValid = false;
      validation.violations.push(`Summary contains prohibited terms: ${foundProhibited.join(', ')}`);
    }

    // Check key themes
    if (summary.keyThemes) {
      for (const theme of summary.keyThemes) {
        const themeLower = theme.toLowerCase();
        const themeProhibited = this.prohibitedTerms.filter(term => 
          themeLower.includes(term.toLowerCase())
        );
        
        if (themeProhibited.length > 0) {
          validation.isValid = false;
          validation.violations.push(`Theme contains prohibited terms: ${themeProhibited.join(', ')}`);
        }
      }
    }

    // Validate therapy approaches
    if (summary.possibleApproaches) {
      for (const approach of summary.possibleApproaches) {
        if (!this.approvedTherapyApproaches.includes(approach)) {
          validation.isValid = false;
          validation.violations.push(`Unapproved therapy approach: ${approach}`);
        }
      }
    }

    // Check suggested questions
    if (summary.suggestedQuestions) {
      for (const question of summary.suggestedQuestions) {
        const questionValidation = this.validateQuestion(question);
        if (!questionValidation.isValid) {
          validation.isValid = false;
          validation.violations.push(`Suggested question invalid: ${questionValidation.violations.join(', ')}`);
        }
      }
    }

    return validation;
  }

  // Regenerate content if validation fails
  async regenerateIfInvalid(content, type, regenerateFunction) {
    const maxAttempts = 3;
    let attempts = 0;
    let currentContent = content;

    while (attempts < maxAttempts) {
      const validation = type === 'question' 
        ? this.validateQuestion(currentContent.question, currentContent.options)
        : this.validateSummary(currentContent);

      if (validation.isValid) {
        return {
          content: currentContent,
          attempts: attempts + 1,
          finalValidation: validation
        };
      }

      attempts++;
      if (attempts < maxAttempts) {
        try {
          // Log the violation for monitoring
          console.warn(`Content validation failed (attempt ${attempts}):`, validation.violations);
          
          // Regenerate content
          currentContent = await regenerateFunction();
        } catch (error) {
          console.error(`Regeneration failed on attempt ${attempts}:`, error.message);
          break;
        }
      }
    }

    // If we reach here, all attempts failed
    throw new Error(`Content validation failed after ${maxAttempts} attempts: ${validation.violations.join(', ')}`);
  }
  // Check if content needs human review
  requiresHumanReview(content, type) {
    const reviewTriggers = [
      'trauma', 'abuse', 'violence', 'death', 'loss', 'grief',
      'relationship issues', 'family problems', 'work stress',
      'anxiety', 'depression', 'overwhelming'
    ];

    const textToCheck = type === 'question' 
      ? content.question 
      : content.summary + ' ' + (content.keyThemes?.join(' ') || '');

    const lowerText = textToCheck.toLowerCase();
    const triggersFound = reviewTriggers.filter(trigger => 
      lowerText.includes(trigger.toLowerCase())
    );

    return {
      requiresReview: triggersFound.length > 0,
      triggers: triggersFound,
      priority: triggersFound.length > 2 ? 'high' : 'normal'
    };
  }

  // Log validation events for monitoring
  logValidationEvent(type, content, validation, sessionId = null) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type,
      sessionId,
      isValid: validation.isValid,
      violations: validation.violations,
      warnings: validation.warnings,
      contentPreview: type === 'question' 
        ? content.question?.substring(0, 100) + '...'
        : content.summary?.substring(0, 100) + '...'
    };

    // In production, this would go to a proper logging service
    if (!validation.isValid) {
      console.error('Content validation failure:', logEntry);
    } else if (validation.warnings.length > 0) {
      console.warn('Content validation warnings:', logEntry);
    }

    return logEntry;
  }

  // Get content improvement suggestions
  getImprovementSuggestions(validation) {
    const suggestions = [...validation.suggestions];

    if (validation.violations.some(v => v.includes('prohibited terms'))) {
      suggestions.push('Use neutral, supportive language instead of clinical or directive terms');
    }

    if (validation.warnings.some(w => w.includes('reassuring language'))) {
      suggestions.push('Add reassuring phrases to make the question feel more supportive');
    }

    return suggestions;
  }
}

export const contentValidator = new ContentValidatorService();