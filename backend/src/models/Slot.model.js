import mongoose from 'mongoose';

const SlotSchema = new mongoose.Schema({
  // Date for the slot
  date: { 
    type: Date, 
    required: true 
  },
  
  // Time information
  startTime: { 
    type: String, 
    required: true // Format: "09:00", "14:30"
  },
  
  endTime: { 
    type: String, 
    required: true // Format: "10:00", "15:30"
  },
  
  // Duration in minutes
  duration: {
    type: Number,
    default: 60,
    enum: [30, 45, 60, 90, 120]
  },
  
  // Availability
  isAvailable: { 
    type: Boolean, 
    default: true 
  },
  
  // Session modes available for this slot
  availableModes: [{
    type: String,
    enum: ['online', 'offline']
  }],
  
  // Default modes if not specified
  defaultModes: {
    type: [String],
    default: ['online', 'offline']
  },
  
  // Therapist/Admin reference
  therapistId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Auth' // Changed from 'User' to 'Auth' to match auth system
  },
  
  // Booking reference (when slot is booked)
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    default: null
  },
  
  // Pricing for this slot
  pricing: {
    online: {
      type: Number,
      default: 1200 // INR
    },
    offline: {
      type: Number,
      default: 1500 // INR
    }
  },
  
  // Location for offline sessions
  offlineLocation: {
    address: {
      type: String,
      default: "MindSettler Studio, Pune, Maharashtra"
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    instructions: String
  },
  
  // Admin can block specific slots
  isBlocked: {
    type: Boolean,
    default: false
  },
  
  blockReason: {
    type: String,
    trim: true
  },
  
  // Recurring slot information
  isRecurring: {
    type: Boolean,
    default: false
  },
  
  recurringPattern: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    default: 'weekly'
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
SlotSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Set default available modes if not specified
  if (!this.availableModes || this.availableModes.length === 0) {
    this.availableModes = this.defaultModes;
  }
  
  next();
});

// Indexes for efficient queries
SlotSchema.index({ date: 1, startTime: 1 });
SlotSchema.index({ isAvailable: 1, date: 1 });
SlotSchema.index({ therapistId: 1, date: 1 });

// Compound index for finding available slots
SlotSchema.index({ 
  date: 1, 
  isAvailable: 1, 
  isBlocked: 1 
});

export const Slot = mongoose.model('Slot', SlotSchema);