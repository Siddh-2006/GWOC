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

/**
 * New: Asset schema for multiple files (images primarily)
 */
const mediaAssetSchema = new mongoose.Schema({
  fileUrl: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String
  },
  mimeType: {
    type: String
  },
  fileSize: {
    type: Number
  },
  duration: {
    type: Number // optional (for future video/audio assets)
  },
  assetType: {
    type: String,
    enum: ['image', 'video', 'audio', 'document'],
    required: true
  }
}, { _id: false });

const mediaSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String,
    required: true
  },

  /**
   * Content type (WHAT this post is)
   */
  type: {
    type: String,
    enum: ['video', 'audio', 'document', 'image', 'vlog', 'post'],
    required: true
  },

  /**
   * OLD (kept for backward compatibility)
   * Used for videos, audio, documents
   */
  fileUrl: {
    type: String
  },

  thumbnailUrl: {
    type: String
  },

  /**
   * NEW: Used for posts with multiple images
   */
  assets: {
    type: [mediaAssetSchema],
    default: []
  },

  tags: [{
    type: String,
    trim: true
  }],

  duration: {
    type: Number
  },

  fileSize: {
    type: Number
  },

  mimeType: {
    type: String
  },

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

  viewedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auth'
  }],

  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auth'
  }],

  comments: [commentSchema],

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


// 🔒 Validation: ensure media has content
mediaSchema.pre('validate', function (next) {
  // For posts, require assets
  if (this.type === 'post') {
    if (!this.assets || this.assets.length === 0) {
      return next(new Error('Post type media must have at least one asset'));
    }
  } else {
    // For other types (video, audio, document), require fileUrl
    if (!this.fileUrl) {
      return next(new Error('Media must have fileUrl for video, audio, or document types'));
    }
  }
  
  next();
});

// Indexes
mediaSchema.index({ title: 'text', description: 'text', tags: 'text' });
mediaSchema.index({ type: 1, isPublished: 1 });
mediaSchema.index({ createdAt: -1 });

export const Media = mongoose.model('Media', mediaSchema);
