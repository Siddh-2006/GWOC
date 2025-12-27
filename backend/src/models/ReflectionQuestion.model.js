import mongoose from 'mongoose';

const reflectionQuestionSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ReflectionSession',
    required: true,
    index: true
  },
  questionNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  questionText: {
    type: String,
    required: true,
    maxlength: 500
  },
  questionType: {
    type: String,
    enum: ['multiple_choice', 'text', 'scale'],
    default: 'text'
  },
  options: [{
    type: String,
    maxlength: 200
  }],
  internalThemes: [{
    type: String,
    maxlength: 100
  }],
  nextFocus: {
    type: String,
    maxlength: 300,
    default: ''
  },
  generatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for session and question number
reflectionQuestionSchema.index({ sessionId: 1, questionNumber: 1 }, { unique: true });

// Index for performance
reflectionQuestionSchema.index({ generatedAt: -1 });

// Static method to get next question number for session
reflectionQuestionSchema.statics.getNextQuestionNumber = async function(sessionId) {
  const lastQuestion = await this.findOne({ sessionId })
    .sort({ questionNumber: -1 })
    .select('questionNumber');
  
  return lastQuestion ? lastQuestion.questionNumber + 1 : 1;
};

// Static method to validate question content
reflectionQuestionSchema.statics.validateQuestionContent = function(questionText) {
  const prohibitedPhrases = [
    'why did you',
    'diagnosis',
    'disorder',
    'mental illness',
    'pathology',
    'abnormal',
    'crisis',
    'emergency',
    'suicide',
    'self-harm'
  ];
  
  const lowerText = questionText.toLowerCase();
  const hasProhibited = prohibitedPhrases.some(phrase => lowerText.includes(phrase));
  
  if (hasProhibited) {
    throw new Error('Question contains prohibited clinical or crisis language');
  }
  
  // Check for reassuring language
  const reassuringPhrases = [
    'no right or wrong',
    'take your time',
    'if you\'d like',
    'feel comfortable',
    'at your own pace'
  ];
  
  const hasReassuring = reassuringPhrases.some(phrase => lowerText.includes(phrase));
  
  return {
    isValid: true,
    hasReassuring,
    suggestions: hasReassuring ? [] : ['Consider adding reassuring language like "There\'s no right or wrong answer"']
  };
};

export const ReflectionQuestion = mongoose.model('ReflectionQuestion', reflectionQuestionSchema);