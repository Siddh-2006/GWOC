import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auth',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const psychoEducationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  contentType: {
    type: String,
    enum: ['qa', 'theory', 'quote', 'article', 'tip', 'exercise', 'life-area'],
    required: true
  },
  content: {
    // For Q&A type
    question: {
      type: String
    },
    answer: {
      type: String
    },
    
    // For theory/article type
    body: {
      type: String
    },
    
    // For quote type
    quote: {
      type: String
    },
    author: {
      type: String
    },
    
    // For tip/exercise type
    steps: [{
      title: String,
      description: String,
      order: Number
    }]
  },
  tags: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    enum: ['anxiety', 'depression', 'relationships', 'stress', 'self-care', 'mindfulness', 'general'],
    required: true
  },
  estimatedReadTime: {
    type: Number // in minutes
  },
  mediaAttachments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Media'
  }],
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auth'
  }],
  comments: [commentSchema],
  helpful: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auth'
  }],
  shares: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auth',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auth'
  }
}, {
  timestamps: true
});

// Index for better search performance
psychoEducationSchema.index({ title: 'text', description: 'text', tags: 'text' });
psychoEducationSchema.index({ contentType: 1, category: 1, isPublished: 1 });
psychoEducationSchema.index({ createdAt: -1 });

export const PsychoEducation = mongoose.model('PsychoEducation', psychoEducationSchema);