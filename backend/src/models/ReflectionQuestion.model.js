import mongoose from 'mongoose';

const ReflectionQuestionSchema = new mongoose.Schema({
  questionNumber: {
    type: Number,
    required: true,
    unique: true,
    min: 1,
    max: 20
  },
  
  category: {
    type: String,
    required: true,
    enum: [
      'emotional-awareness',
      'emotional-expression', 
      'stress-response',
      'self-reflection',
      'adaptability',
      'relationship-orientation',
      'coping-style',
      'sense-of-control',
      'openness-to-growth',
      'self-description'
    ]
  },
  
  questionText: {
    type: String,
    required: true,
    maxLength: 500
  },
  
  options: [{
    value: {
      type: String,
      required: true,
      maxLength: 200
    },
    label: {
      type: String,
      required: true,
      maxLength: 200
    }
  }],
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
ReflectionQuestionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Ensure we have exactly the questions we need
ReflectionQuestionSchema.index({ questionNumber: 1 }, { unique: true });
ReflectionQuestionSchema.index({ isActive: 1 });

export const ReflectionQuestion = mongoose.model('ReflectionQuestion', ReflectionQuestionSchema);