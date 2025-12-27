import mongoose from 'mongoose';

const reflectionSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auth',
    required: true,
    index: true
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    default: null
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'abandoned'],
    default: 'active',
    index: true
  },
  startedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  completedAt: {
    type: Date,
    default: null
  },
  responses: [{
    questionId: {
      type: String,
      required: true
    },
    questionText: {
      type: String,
      required: true
    },
    answer: {
      type: String,
      default: ''
    },
    answeredAt: {
      type: Date,
      default: Date.now
    },
    skipped: {
      type: Boolean,
      default: false
    }
  }],
  aiSummary: {
    summary: {
      type: String,
      default: ''
    },
    keyThemes: [{
      type: String
    }],
    possibleApproaches: [{
      type: String,
      enum: [
        'Cognitive Behavioural Therapy (CBT)',
        'Dialectical Behavioural Therapy (DBT)',
        'Acceptance & Commitment Therapy (ACT)',
        'Schema Therapy',
        'Emotion-Focused Therapy (EFT)',
        'Emotion-Focused Couples Therapy',
        'Mindfulness-Based Cognitive Therapy',
        'Client-Centred Therapy'
      ]
    }],
    suggestedQuestions: [{
      type: String
    }],
    generatedAt: {
      type: Date,
      default: null
    }
  },
  metadata: {
    totalQuestions: {
      type: Number,
      default: 0
    },
    questionsAnswered: {
      type: Number,
      default: 0
    },
    questionsSkipped: {
      type: Number,
      default: 0
    },
    sessionDuration: {
      type: Number, // milliseconds
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes for performance
reflectionSessionSchema.index({ userId: 1, status: 1 });
reflectionSessionSchema.index({ createdAt: -1 });
reflectionSessionSchema.index({ bookingId: 1 });

// Virtual for calculating session duration
reflectionSessionSchema.virtual('calculatedDuration').get(function() {
  if (this.completedAt && this.startedAt) {
    return this.completedAt.getTime() - this.startedAt.getTime();
  }
  return 0;
});

// Method to add response
reflectionSessionSchema.methods.addResponse = function(questionId, questionText, answer, skipped = false) {
  this.responses.push({
    questionId,
    questionText,
    answer: skipped ? '' : answer,
    answeredAt: new Date(),
    skipped
  });
  
  this.metadata.totalQuestions = this.responses.length;
  this.metadata.questionsAnswered = this.responses.filter(r => !r.skipped).length;
  this.metadata.questionsSkipped = this.responses.filter(r => r.skipped).length;
  
  return this.save();
};

// Method to complete session
reflectionSessionSchema.methods.completeSession = function(aiSummary = null) {
  this.status = 'completed';
  this.completedAt = new Date();
  this.metadata.sessionDuration = this.calculatedDuration;
  
  if (aiSummary) {
    this.aiSummary = {
      ...aiSummary,
      generatedAt: new Date()
    };
  }
  
  return this.save();
};

// Method to abandon session
reflectionSessionSchema.methods.abandonSession = function() {
  this.status = 'abandoned';
  this.completedAt = new Date();
  this.metadata.sessionDuration = this.calculatedDuration;
  
  return this.save();
};

export const ReflectionSession = mongoose.model('ReflectionSession', reflectionSessionSchema);