import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
  // User Reference
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Auth', 
    required: true 
  },
  
  // Slot Reference
  slotId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Slot', 
    required: true 
  },
  
  // Personal Information (can be pre-filled from user profile)
  personalInfo: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: true
    },
    numberOfPeople: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
      default: 1
    },
    relationshipStatus: {
      type: String,
      enum: ['single', 'married', 'couple', 'divorced', 'other'],
      required: true
    },
    relationshipStatusOther: {
      type: String,
      trim: true
    }
  },
  
  // Session Content
  sessionContent: {
    topics: {
      type: String,
      required: true,
      maxLength: 1000
    },
    concerns: {
      type: String,
      maxLength: 1000
    },
    goals: {
      type: String,
      maxLength: 500
    }
  },
  
  // Session Mode
  sessionMode: {
    type: String,
    enum: ['online', 'offline'],
    required: true,
    default: 'online'
  },
  
  // Location for offline sessions
  location: {
    type: String,
    required: function() {
      return this.sessionMode === 'offline';
    }
  },
  
  // Booking Status
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'rescheduled'], 
    default: 'pending' 
  },
  
  // Admin Response
  adminResponse: {
    confirmedDate: Date,
    confirmedTime: String,
    meetingLink: String,
    notes: String,
    confirmedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Auth'
    },
    confirmedAt: Date
  },
  
  // Payment Information
  payment: {
    amount: {
      type: Number,
      required: true,
      default: 1500 // Default session price in INR
    },
    currency: {
      type: String,
      default: 'INR'
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    paymentId: String,
    paymentMethod: String,
    paidAt: Date
  },
  
  // Notifications
  notifications: {
    userNotified: {
      type: Boolean,
      default: false
    },
    adminNotified: {
      type: Boolean,
      default: false
    },
    reminderSent: {
      type: Boolean,
      default: false
    },
    confirmationSent: {
      type: Boolean,
      default: false
    }
  },
  
  // Original notes field (keeping for backward compatibility)
  notes: { 
    type: String 
  },
  
  // Timestamps
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
BookingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for efficient queries
BookingSchema.index({ userId: 1, status: 1 });
BookingSchema.index({ status: 1, createdAt: -1 });
BookingSchema.index({ 'payment.status': 1 });

export const Booking = mongoose.model('Booking', BookingSchema);