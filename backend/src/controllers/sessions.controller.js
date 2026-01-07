import { Booking } from '../models/Booking.model.js';
import { UserSessionNotes } from '../models/UserSessionNotes.model.js';
import mongoose from 'mongoose';

export const sessionsController = {
  // Get user's sessions (upcoming, ongoing, past)
  getUserSessions: async (req, res) => {
    try {
      let userId = req.user?.userId;
      const { status, page = 1, limit = 10, userId: targetUserId } = req.query;

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

      let query = { userId };
      
      // Filter by status if provided
      if (status && status !== 'all') {
        if (status === 'upcoming') {
          query.status = { $in: ['confirmed'] };
        } else if (status === 'ongoing') {
          query.status = 'confirmed';
          // Add date filter for today's sessions
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
        } else if (status === 'past') {
          query.status = { $in: ['completed', 'cancelled'] };
        } else {
          query.status = status;
        }
      }

      const skip = (page - 1) * limit;

      // Get sessions with populated slot information
      const sessions = await Booking.find(query)
        .populate('slotId', 'date startTime endTime')
        .populate('userId', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      const total = await Booking.countDocuments(query);

      // Get notes for all sessions
      const sessionIds = sessions.map(s => s._id);
      const notesMap = {};
      
      if (sessionIds.length > 0) {
        const allNotes = await UserSessionNotes.find({
          userId,
          bookingId: { $in: sessionIds }
        }).lean();
        
        allNotes.forEach(note => {
          notesMap[note.bookingId.toString()] = note;
        });
      }

      // Categorize sessions based on current date and time
      const now = new Date();
      const categorizedSessions = sessions.map(session => {
        const slot = session.slotId;
        if (!slot) return { ...session, category: 'unknown', hasNotes: false };

        // Helper to formatting date to YYYY-MM-DD
        const formatDate = (date) => {
          const d = new Date(date);
          let month = '' + (d.getMonth() + 1);
          let day = '' + d.getDate();
          const year = d.getFullYear();

          if (month.length < 2) month = '0' + month;
          if (day.length < 2) day = '0' + day;

          return [year, month, day].join('-');
        };

        // Construct IST date string to ensure consistent timezone interpretation
        const dateStr = formatDate(slot.date);
        
        // Create Date objects using IST offset (+05:30)
        // Format: YYYY-MM-DDTHH:mm:00+05:30
        const sessionDate = new Date(`${dateStr}T${slot.startTime}:00+05:30`);
        const sessionEndDate = new Date(`${dateStr}T${slot.endTime}:00+05:30`);
        
        // If the resulting date is invalid (backup), fall back to original logic (should rarely happen)
        if (isNaN(sessionDate.getTime())) {
          // Fallback logic
          const d = new Date(slot.date);
          const [h, m] = slot.startTime.split(':');
          d.setHours(parseInt(h), parseInt(m), 0, 0);
          // ... similarly for end date
        }

        let category;
        
        // Check for Explicitly Past statuses first
        if (session.status === 'completed' || session.status === 'cancelled') {
          category = 'past';
        } 
        // Ongoing: Time is now, and status is confirmed or pending
        else if (now >= sessionDate && now <= sessionEndDate && (session.status === 'confirmed' || session.status === 'pending')) {
          category = 'ongoing';
        } 
        // Upcoming: Future time, and status is confirmed or pending
        else if (sessionDate > now && (session.status === 'confirmed' || session.status === 'pending')) {
          category = 'upcoming';
        } 
        // Default to past (e.g. pending but time has passed, or other statuses)
        else {
          category = 'past';
        }

        const hasNotes = !!notesMap[session._id.toString()];

        return {
          ...session,
          category,
          sessionDateTime: sessionDate,
          sessionEndDateTime: sessionEndDate,
          hasNotes
        };
      });

      res.json({
        success: true,
        data: categorizedSessions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get user sessions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch sessions',
        error: error.message
      });
    }
  },

  // Get session details with notes
  getSessionDetails: async (req, res) => {
    try {
      const userId = req.user?.userId;
      const { sessionId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Get session details
      const session = await Booking.findOne({ 
        _id: sessionId, 
        userId 
      })
        .populate('slotId', 'date startTime endTime')
        .populate('reflectionSessionId')
        .lean();

      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found'
        });
      }

      // Get user notes for this session
      const userNotes = await UserSessionNotes.findOne({
        userId,
        bookingId: sessionId
      }).lean();

      res.json({
        success: true,
        data: {
          session,
          notes: userNotes || null
        }
      });
    } catch (error) {
      console.error('Get session details error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch session details',
        error: error.message
      });
    }
  },

  // Create or update session notes
  updateSessionNotes: async (req, res) => {
    try {
      const userId = req.user?.userId;
      const { sessionId } = req.params;
      const { 
        preSessionNotes, 
        postSessionNotes, 
        keyTakeaways, 
        mood, 
        goals, 
        nextSessionTopics,
        isPrivate = true 
      } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Verify session belongs to user
      const session = await Booking.findOne({ 
        _id: sessionId, 
        userId 
      });

      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found'
        });
      }

      // Create or update notes
      const notesData = {
        userId,
        bookingId: sessionId,
        notes: {
          preSessionNotes: preSessionNotes || '',
          postSessionNotes: postSessionNotes || '',
          keyTakeaways: keyTakeaways || [],
          mood: mood || {},
          goals: goals || [],
          nextSessionTopics: nextSessionTopics || []
        },
        isPrivate
      };

      const userNotes = await UserSessionNotes.findOneAndUpdate(
        { userId, bookingId: sessionId },
        notesData,
        { 
          new: true, 
          upsert: true,
          runValidators: true
        }
      );

      res.json({
        success: true,
        message: 'Session notes updated successfully',
        data: userNotes
      });
    } catch (error) {
      console.error('Update session notes error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update session notes',
        error: error.message
      });
    }
  },

  // Add a goal to session notes
  addSessionGoal: async (req, res) => {
    try {
      const userId = req.user?.userId;
      const { sessionId } = req.params;
      const { goal } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      if (!goal || goal.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Goal is required'
        });
      }

      // Find or create session notes
      let userNotes = await UserSessionNotes.findOne({
        userId,
        bookingId: sessionId
      });

      if (!userNotes) {
        userNotes = new UserSessionNotes({
          userId,
          bookingId: sessionId,
          notes: {
            goals: []
          }
        });
      }

      // Add the goal
      userNotes.notes.goals.push({
        goal: goal.trim(),
        completed: false
      });

      await userNotes.save();

      res.json({
        success: true,
        message: 'Goal added successfully',
        data: userNotes
      });
    } catch (error) {
      console.error('Add session goal error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add goal',
        error: error.message
      });
    }
  },

  // Complete a goal
  completeSessionGoal: async (req, res) => {
    try {
      const userId = req.user?.userId;
      const { sessionId, goalId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const userNotes = await UserSessionNotes.findOne({
        userId,
        bookingId: sessionId
      });

      if (!userNotes) {
        return res.status(404).json({
          success: false,
          message: 'Session notes not found'
        });
      }

      const goal = userNotes.notes.goals.id(goalId);
      if (!goal) {
        return res.status(404).json({
          success: false,
          message: 'Goal not found'
        });
      }

      goal.completed = !goal.completed;
      goal.completedAt = goal.completed ? new Date() : null;

      await userNotes.save();

      res.json({
        success: true,
        message: goal.completed ? 'Goal marked as completed' : 'Goal marked as incomplete',
        data: userNotes
      });
    } catch (error) {
      console.error('Complete session goal error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update goal',
        error: error.message
      });
    }
  }
};