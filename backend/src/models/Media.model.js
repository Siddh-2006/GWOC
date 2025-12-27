import mongoose from 'mongoose';

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
  type: {
    type: String,
    enum: ['video', 'audio', 'document', 'image', 'vlog', 'post'],
    required: true
  },
  category: {
    type: String,
    enum: ['resource', 'psycho-education', 'general'],
    required: true,
    default: 'resource'
  },
  fileUrl: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String
  },
  tags: [{
    type: String,
    trim: true
  }],
  duration: {
    type: Number, // in seconds for video/audio
  },
  fileSize: {
    type: Number // in bytes
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
  likes: {
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
mediaSchema.index({ title: 'text', description: 'text', tags: 'text' });
mediaSchema.index({ type: 1, category: 1, isPublished: 1 });
mediaSchema.index({ createdAt: -1 });

export const Media = mongoose.model('Media', mediaSchema);