import { JourneyEntry } from '../models/Journey.model.js';
import { Booking } from '../models/Booking.model.js';
import mongoose from 'mongoose';

export const journeyController = {
  // Get user's journey timeline
  getUserJourney: async (req, res) => {
    try {
      let userId = req.user?.userId;
      const { page = 1, limit = 20, type, userId: targetUserId } = req.query;

      // If requester is admin and targetUserId is provided, use it
      if (req.user?.role === 'admin' && targetUserId) {
        userId = targetUserId;
      }

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      let query = { 
        userId,
        status: 'published',
        isVisible: true
      };
      
      if (type) {
        query.type = type;
      }

      const skip = (page - 1) * limit;

      const journeyEntries = await JourneyEntry.find(query)
        .populate('sessionId', 'slotId status sessionContent')
        .populate('createdBy', 'firstName lastName')
        .sort({ entryDate: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      const total = await JourneyEntry.countDocuments(query);

      // Calculate overall progress
      const allEntries = await JourneyEntry.find({ userId, status: 'published' }).lean();
      const totalSessions = allEntries.filter(entry => entry.type === 'session_summary').length;
      const totalMilestones = allEntries.filter(entry => entry.type === 'milestone').length;
      const totalGoalsCompleted = allEntries.reduce((sum, entry) => {
        return sum + (entry.progressMetrics?.goalsCompleted || 0);
      }, 0);

      const overallProgress = allEntries.length > 0 
        ? Math.round(allEntries.reduce((sum, entry) => sum + (entry.progressMetrics?.overallProgress || 0), 0) / allEntries.length)
        : 0;

      res.json({
        success: true,
        data: {
          entries: journeyEntries,
          stats: {
            totalEntries: allEntries.length,
            totalSessions,
            totalMilestones,
            totalGoalsCompleted,
            overallProgress
          }
        },
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get user journey error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch journey',
        error: error.message
      });
    }
  },

  // Get single journey entry
  getJourneyEntry: async (req, res) => {
    try {
      const userId = req.user?.userId;
      const { entryId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const entry = await JourneyEntry.findOne({ 
        _id: entryId, 
        userId,
        status: 'published',
        isVisible: true
      })
        .populate('sessionId', 'slotId status sessionContent')
        .populate('createdBy', 'firstName lastName')
        .lean();

      if (!entry) {
        return res.status(404).json({
          success: false,
          message: 'Journey entry not found'
        });
      }

      res.json({
        success: true,
        data: entry
      });
    } catch (error) {
      console.error('Get journey entry error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch journey entry',
        error: error.message
      });
    }
  },

  // Create journey entry (Admin only)
  createJourneyEntry: async (req, res) => {
    try {
      const adminId = req.user?.userId;
      const {
        userId,
        sessionId,
        title,
        description,
        type,
        content,
        progressMetrics,
        entryDate
      } = req.body;

      if (!adminId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Validate required fields
      if (!userId || !title || !type) {
        return res.status(400).json({
          success: false,
          message: 'User ID, title, and type are required'
        });
      }

      // If sessionId is provided, verify it exists and belongs to the user
      if (sessionId) {
        const session = await Booking.findOne({ _id: sessionId, userId });
        if (!session) {
          return res.status(404).json({
            success: false,
            message: 'Session not found or does not belong to user'
          });
        }
      }

      // Calculate session number if it's a session summary
      let sessionNumber = null;
      if (type === 'session_summary') {
        const sessionCount = await JourneyEntry.countDocuments({
          userId,
          type: 'session_summary'
        });
        sessionNumber = sessionCount + 1;
      }

      const journeyEntry = new JourneyEntry({
        userId,
        sessionId: sessionId || null,
        title,
        description: description || '',
        type,
        content: content || {},
        progressMetrics: {
          ...progressMetrics,
          sessionNumber
        },
        entryDate: entryDate ? new Date(entryDate) : new Date(),
        createdBy: adminId
      });

      await journeyEntry.save();

      // Populate the created entry
      await journeyEntry.populate('sessionId', 'slotId status sessionContent');
      await journeyEntry.populate('createdBy', 'firstName lastName');

      res.status(201).json({
        success: true,
        message: 'Journey entry created successfully',
        data: journeyEntry
      });
    } catch (error) {
      console.error('Create journey entry error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create journey entry',
        error: error.message
      });
    }
  },

  // Update journey entry (Admin only)
  updateJourneyEntry: async (req, res) => {
    try {
      const adminId = req.user?.userId;
      const { entryId } = req.params;
      const updates = req.body;

      if (!adminId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const entry = await JourneyEntry.findById(entryId);
      if (!entry) {
        return res.status(404).json({
          success: false,
          message: 'Journey entry not found'
        });
      }

      // Update fields
      Object.keys(updates).forEach(key => {
        if (updates[key] !== undefined && key !== '_id' && key !== 'createdAt') {
          if (key === 'content' && typeof updates[key] === 'object') {
            entry.content = { ...entry.content, ...updates[key] };
          } else if (key === 'progressMetrics' && typeof updates[key] === 'object') {
            entry.progressMetrics = { ...entry.progressMetrics, ...updates[key] };
          } else {
            entry[key] = updates[key];
          }
        }
      });

      await entry.save();

      // Populate the updated entry
      await entry.populate('sessionId', 'slotId status sessionContent');
      await entry.populate('createdBy', 'firstName lastName');

      res.json({
        success: true,
        message: 'Journey entry updated successfully',
        data: entry
      });
    } catch (error) {
      console.error('Update journey entry error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update journey entry',
        error: error.message
      });
    }
  },

  // Delete journey entry (Admin only)
  deleteJourneyEntry: async (req, res) => {
    try {
      const adminId = req.user?.userId;
      const { entryId } = req.params;

      if (!adminId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const entry = await JourneyEntry.findByIdAndDelete(entryId);
      if (!entry) {
        return res.status(404).json({
          success: false,
          message: 'Journey entry not found'
        });
      }

      res.json({
        success: true,
        message: 'Journey entry deleted successfully'
      });
    } catch (error) {
      console.error('Delete journey entry error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete journey entry',
        error: error.message
      });
    }
  },

  // Get all journey entries for admin
  getAllJourneyEntries: async (req, res) => {
    try {
      const {
        userId,
        type,
        status,
        page = 1,
        limit = 20
      } = req.query;

      let query = {};
      
      if (userId) query.userId = userId;
      if (type) query.type = type;
      if (status) query.status = status;

      const skip = (page - 1) * limit;

      const entries = await JourneyEntry.find(query)
        .populate('userId', 'firstName lastName email')
        .populate('sessionId', 'slotId status sessionContent')
        .populate('createdBy', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await JourneyEntry.countDocuments(query);

      res.json({
        success: true,
        data: entries,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get all journey entries error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch journey entries',
        error: error.message
      });
    }
  },

  // Complete a goal in journey entry
  completeGoal: async (req, res) => {
    try {
      const userId = req.user?.userId;
      const { entryId, goalId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const entry = await JourneyEntry.findOne({ _id: entryId, userId });
      if (!entry) {
        return res.status(404).json({
          success: false,
          message: 'Journey entry not found'
        });
      }

      const goal = entry.content.goalsSet.id(goalId);
      if (!goal) {
        return res.status(404).json({
          success: false,
          message: 'Goal not found'
        });
      }

      goal.completed = !goal.completed;
      goal.completedDate = goal.completed ? new Date() : null;

      if (goal.completed) {
        entry.progressMetrics.goalsCompleted = (entry.progressMetrics.goalsCompleted || 0) + 1;
      } else {
        entry.progressMetrics.goalsCompleted = Math.max(0, (entry.progressMetrics.goalsCompleted || 0) - 1);
      }

      await entry.save();

      res.json({
        success: true,
        message: goal.completed ? 'Goal marked as completed' : 'Goal marked as incomplete',
        data: entry
      });
    } catch (error) {
      console.error('Complete goal error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update goal',
        error: error.message
      });
    }
  }
};