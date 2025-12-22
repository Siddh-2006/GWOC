import mongoose from 'mongoose';

const ContentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['article', 'video', 'resource'], required: true },
  content: { type: String, required: true },
  tags: [{ type: String }],
  isPublished: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export const Content = mongoose.model('Content', ContentSchema);