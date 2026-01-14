import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const authSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String,
    default: 'https://cdn-icons-png.flaticon.com/512/1144/1144760.png',
    maxlength: 1000
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer_not_to_say'],
    default: 'prefer_not_to_say'
  },
  address: {
    type: String,
    maxlength: 300,
    default: ''
  },
  bio: {
    type: String,
    maxlength: 150,
    default: ''
  },
  location: {
    type: String,
    maxlength: 100,
    default: ''
  },
  interests: {
    type: String,
    maxlength: 200,
    default: ''
  },
  quote: {
    type: String,
    maxlength: 200,
    default: ''
  },
  language: {
    type: String,
    maxlength: 50,
    default: 'English'
  },
  personality: {
    type: String,
    maxlength: 100,
    default: ''
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date
  },
  refreshTokens: [{
    token: String,
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 604800 // 7 days
    }
  }]
}, {
  timestamps: true
});

// Hash password before saving
authSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
authSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
authSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.refreshTokens;
  return userObject;
};

export default mongoose.model('Auth', authSchema);