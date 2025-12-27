import mongoose from 'mongoose';

const corporateInquirySchema = new mongoose.Schema({
  organizationName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  contactPerson: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  engagementType: {
    type: String,
    required: true,
    enum: [
      'workplace-workshops',
      'institutional-education', 
      'event-sessions',
      'community-programs',
      'other'
    ]
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'in-discussion', 'closed'],
    default: 'new'
  },
  adminNotes: {
    type: String,
    trim: true,
    maxlength: 1000,
    default: ''
  },
  // Additional context fields for better inquiry handling
  organizationSize: {
    type: String,
    enum: ['small', 'medium', 'large', 'not-specified'],
    default: 'not-specified'
  },
  preferredContact: {
    type: String,
    enum: ['email', 'phone', 'either'],
    default: 'email'
  }
}, {
  timestamps: true
});

// Index for admin queries
corporateInquirySchema.index({ status: 1, createdAt: -1 });
corporateInquirySchema.index({ email: 1 });

// Virtual for inquiry age
corporateInquirySchema.virtual('inquiryAge').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24)); // days
});

// Method to get engagement type display name
corporateInquirySchema.methods.getEngagementTypeDisplay = function() {
  const displayNames = {
    'workplace-workshops': 'Workplace Workshops',
    'institutional-education': 'Institutional Psycho-Education',
    'event-sessions': 'Event-Based Sessions',
    'community-programs': 'Community Programs',
    'other': 'Other'
  };
  return displayNames[this.engagementType] || this.engagementType;
};

export default mongoose.model('CorporateInquiry', corporateInquirySchema);