import mongoose from 'mongoose';

const JourneyEntrySchema = new mongoose.Schema({
  // User Reference
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Auth', 
    required: true,
    index: true
  },
  
  // Session Reference (optional - can have entries not tied to sessions)
  sessionId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Booking',
    default: null
  },
  
  // Entry Details
  title: {
    type: String,
    required: true,
    maxLength: 200
  },
  
  description: {
    type: String,
    maxLength: 1000
  },
  
  // Entry Type
  type: {
    type: String,
    enum: ['milestone', 'session_summary', 'achievement', 'reflection', 'goal_set', 'goal_completed', 'admin_note'],
    required: true
  },
  
  // Content
  content: {
    // Rich content for the entry
    summary: String,
    insights: [String],
    achievements: [String],
    challenges: [String],
    nextSteps: [String],
    
    // Progress indicators
    moodBefore: {
      type: Number,
      min: 1,
      max: 10
    },
    moodAfter: {
      type: Number,
      min: 1,
      max: 10
    },
    
    // Goals related to this entry
    goalsSet: [{
      goal: String,
      targetDate: Date,
      completed: {
        type: Boolean,
        default: false
      },
      completedDate: Date
    }],
    
    // Media attachments
    attachments: [{
      type: {
        type: String,
        enum: ['image', 'document', 'audio', 'video']
      },
      url: String,
      filename: String,
      description: String
    }]
  },
  
  // Progress Metrics
  progressMetrics: {
    overallProgress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    sessionNumber: Number,
    milestonesReached: Number,
    goalsCompleted: Number
  },
  
  // Visibility and Status
  isVisible: {
    type: Boolean,
    default: true
  },
  
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published'
  },
  
  // Admin fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auth',
    required: true
  },
  
  // Timestamps
  entryDate: {
    type: Date,
    default: Date.now
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

// Update the updatedAt field before saving
JourneyEntrySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for efficient queries
JourneyEntrySchema.index({ userId: 1, entryDate: -1 });
JourneyEntrySchema.index({ userId: 1, type: 1 });
JourneyEntrySchema.index({ sessionId: 1 });
JourneyEntrySchema.index({ userId: 1, status: 1, isVisible: 1 });

// Virtual for calculating days since entry
JourneyEntrySchema.virtual('daysSinceEntry').get(function() {
  const now = new Date();
  const entryDate = new Date(this.entryDate);
  const diffTime = Math.abs(now - entryDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Methods
JourneyEntrySchema.methods.addGoal = function(goal, targetDate) {
  this.content.goalsSet.push({
    goal,
    targetDate,
    completed: false
  });
  return this.save();
};

JourneyEntrySchema.methods.completeGoal = function(goalId) {
  const goal = this.content.goalsSet.id(goalId);
  if (goal) {
    goal.completed = true;
    goal.completedDate = new Date();
    this.progressMetrics.goalsCompleted = (this.progressMetrics.goalsCompleted || 0) + 1;
  }
  return this.save();
};

JourneyEntrySchema.methods.updateProgress = function(progressPercentage) {
  this.progressMetrics.overallProgress = Math.min(100, Math.max(0, progressPercentage));
  return this.save();
};

export const JourneyEntry = mongoose.model('JourneyEntry', JourneyEntrySchema);