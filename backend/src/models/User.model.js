import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phone: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  
  // Reflection System - First Session Only
  hasConfirmedSession: { type: Boolean, default: false },
  reflectionCompleted: { type: Boolean, default: false },
  reflectionResponses: { type: Object, default: null },
  reflectionSummary: { type: String, default: null },
  
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.model('User', UserSchema);