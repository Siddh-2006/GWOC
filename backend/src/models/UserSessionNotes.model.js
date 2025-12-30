import mongoose from 'mongoose';

const UserSessionNotesSchema = new mongoose.Schema({
  // User Reference
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Auth', 
    required: true,
    index: true
  },
  
  // Booking Reference
  bookingId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Booking', 
    required: true,
    index: true
  },
  
  // User's personal notes about the session
  notes: {
    preSessionNotes: {
      type: String,
      maxLength: 2000,
      default: ''
    },
    postSessionNotes: {
      type: String,
      maxLength: 2000,
      default: ''
    },
    keyTakeaways: [{
      type: String,
      maxLength: 500
    }],
    mood: {
      before: {
        type: Number,
        min: 1,
        max: 10
      },
      after: {
        type: Number,
        min: 1,
        max: 10
      }
    },
    goals: [{
      goal: {
        type: String,
        maxLength: 300
      },
      completed: {
        type: Boolean,
        default: false
      },
      completedAt: Date
    }],
    nextSessionTopics: [{
      type: String,
      maxLength: 300
    }]
  },
  
  // Privacy settings
  isPrivate: {
    type: Boolean,
    default: true
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
UserSessionNotesSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for efficient queries
UserSessionNotesSchema.index({ userId: 1, bookingId: 1 }, { unique: true });
UserSessionNotesSchema.index({ userId: 1, createdAt: -1 });

// Methods
UserSessionNotesSchema.methods.addKeyTakeaway = function(takeaway) {
  this.notes.keyTakeaways.push(takeaway);
  return this.save();
};

UserSessionNotesSchema.methods.addGoal = function(goal) {
  this.notes.goals.push({ goal, completed: false });
  return this.save();
};

UserSessionNotesSchema.methods.completeGoal = function(goalId) {
  const goal = this.notes.goals.id(goalId);
  if (goal) {
    goal.completed = true;
    goal.completedAt = new Date();
  }
  return this.save();
};

export const UserSessionNotes = mongoose.model('UserSessionNotes', UserSessionNotesSchema);