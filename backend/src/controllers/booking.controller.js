import { Booking } from '../models/Booking.model.js';
import { Slot } from '../models/Slot.model.js';
import Auth from '../models/Auth.model.js';
import { sendBookingConfirmation, sendBookingNotification, sendBookingReminder } from '../services/booking-email.service.js';

export const bookingController = {
  // Get available slots for booking
  getAvailableSlots: async (req, res) => {
    try {
      const { date, month, year } = req.query;
      
      let query = { 
        isAvailable: true,
        isBlocked: false
      };
      
      // Filter by specific date, month, or year
      if (date) {
        const targetDate = new Date(date);
        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);
        
        query.date = {
          $gte: targetDate,
          $lt: nextDay
        };
      } else if (month && year) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        
        query.date = {
          $gte: startDate,
          $lte: endDate
        };
      } else {
        // Default: next 30 days
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + 30);
        
        query.date = {
          $gte: today,
          $lte: futureDate
        };
      }
      
      const slots = await Slot.find(query)
        .populate('therapistId', 'firstName lastName')
        .sort({ date: 1, startTime: 1 });
      
      res.json({
        success: true,
        data: slots
      });
    } catch (error) {
      console.error('Get available slots error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch available slots',
        error: error.message 
      });
    }
  },

  // Create new booking
  createBooking: async (req, res) => {
    try {
      const userId = req.user.userId;
      const {
        slotId,
        personalInfo,
        sessionContent,
        sessionMode,
        location
      } = req.body;
      
      // Validate required fields
      if (!slotId) {
        return res.status(400).json({
          success: false,
          message: 'Slot ID is required'
        });
      }
      
      if (!personalInfo) {
        return res.status(400).json({
          success: false,
          message: 'Personal information is required'
        });
      }
      
      if (!sessionContent) {
        return res.status(400).json({
          success: false,
          message: 'Session content is required'
        });
      }
      
      // Validate personal info fields
      if (!personalInfo.name || !personalInfo.email || !personalInfo.phone || !personalInfo.relationshipStatus) {
        return res.status(400).json({
          success: false,
          message: 'Missing required personal information fields (name, email, phone, relationship status)'
        });
      }
      
      // Check if "other" relationship status requires additional input
      if (personalInfo.relationshipStatus === 'other' && !personalInfo.relationshipStatusOther) {
        return res.status(400).json({
          success: false,
          message: 'Please specify your relationship status'
        });
      }
      
      // Validate session content fields
      if (!sessionContent.topics) {
        return res.status(400).json({
          success: false,
          message: 'Session topics are required'
        });
      }
      
      // Validate session mode
      if (!sessionMode || !['online', 'offline'].includes(sessionMode)) {
        return res.status(400).json({
          success: false,
          message: 'Valid session mode (online/offline) is required'
        });
      }
      
      // Check if slot is available
      const slot = await Slot.findById(slotId);
      if (!slot || !slot.isAvailable || slot.isBlocked) {
        return res.status(400).json({
          success: false,
          message: 'Selected slot is not available'
        });
      }
      
      // Check if session mode is available for this slot
      if (!slot.availableModes.includes(sessionMode)) {
        return res.status(400).json({
          success: false,
          message: `${sessionMode} sessions are not available for this slot`
        });
      }
      
      // Get user information for pre-filling
      const user = await Auth.findById(userId);
      
      // Calculate payment amount based on session mode
      const paymentAmount = sessionMode === 'online' 
        ? slot.pricing.online 
        : slot.pricing.offline;
      
      // Create booking
      const booking = new Booking({
        userId,
        slotId,
        personalInfo: {
          name: personalInfo.name || `${user.firstName} ${user.lastName}`,
          email: personalInfo.email || user.email,
          phone: personalInfo.phone,
          numberOfPeople: personalInfo.numberOfPeople || 1,
          relationshipStatus: personalInfo.relationshipStatus,
          relationshipStatusOther: personalInfo.relationshipStatusOther
        },
        sessionContent,
        sessionMode,
        location: sessionMode === 'offline' ? location : undefined,
        payment: {
          amount: paymentAmount,
          currency: 'INR',
          status: 'pending'
        },
        status: 'pending'
      });

      await booking.save();
      
      // Mark slot as unavailable and link to booking
      slot.isAvailable = false;
      slot.bookingId = booking._id;
      await slot.save();
      
      // Send notifications
      try {
        // Notify admin about new booking
        await sendBookingNotification(booking, slot, user);
        booking.notifications.adminNotified = true;
        
        // Send confirmation to user
        await sendBookingConfirmation(booking, slot, 'pending');
        booking.notifications.userNotified = true;
        
        await booking.save();
      } catch (emailError) {
        console.error('Email notification error:', emailError);
        // Don't fail the booking if email fails
      }

      // Populate slot information for response
      await booking.populate('slotId');

      res.status(201).json({
        success: true,
        message: 'Booking created successfully. You will receive a confirmation email once approved.',
        data: booking
      });
    } catch (error) {
      console.error('Create booking error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to create booking',
        error: error.message 
      });
    }
  },

  // Get user's bookings
  getUserBookings: async (req, res) => {
    try {
      const userId = req.user.userId;
      const { status } = req.query;
      
      let query = { userId };
      if (status) {
        query.status = status;
      }
      
      const bookings = await Booking.find(query)
        .populate('slotId')
        .populate('adminResponse.confirmedBy', 'firstName lastName')
        .sort({ createdAt: -1 });
      
      res.json({
        success: true,
        data: bookings
      });
    } catch (error) {
      console.error('Get user bookings error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to fetch bookings',
        error: error.message 
      });
    }
  },

  // Admin: Get all bookings
  getAllBookings: async (req, res) => {
    try {
      const { status, date, page = 1, limit = 10 } = req.query;
      
      let query = {};
      if (status) query.status = status;
      if (date) {
        const targetDate = new Date(date);
        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);
        
        query.createdAt = {
          $gte: targetDate,
          $lt: nextDay
        };
      }
      
      const skip = (page - 1) * limit;
      
      const bookings = await Booking.find(query)
        .populate('userId', 'firstName lastName email')
        .populate('slotId')
        .populate('adminResponse.confirmedBy', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
      
      const total = await Booking.countDocuments(query);
      
      res.json({
        success: true,
        data: bookings,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get all bookings error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to fetch bookings',
        error: error.message 
      });
    }
  },

  // Admin: Confirm booking
  confirmBooking: async (req, res) => {
    try {
      const { bookingId } = req.params;
      const adminId = req.user.userId;
      const { 
        confirmedDate, 
        confirmedTime, 
        meetingLink, 
        notes 
      } = req.body;
      
      const booking = await Booking.findById(bookingId)
        .populate('userId')
        .populate('slotId');
      
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }
      
      // Update booking with admin confirmation
      booking.status = 'confirmed';
      booking.adminResponse = {
        confirmedDate: confirmedDate || booking.slotId.date,
        confirmedTime: confirmedTime || booking.slotId.startTime,
        meetingLink: booking.sessionMode === 'online' ? meetingLink : undefined,
        notes,
        confirmedBy: adminId,
        confirmedAt: new Date()
      };
      
      await booking.save();
      
      // Send confirmation email to user
      try {
        await sendBookingConfirmation(booking, booking.slotId, 'confirmed');
        booking.notifications.confirmationSent = true;
        await booking.save();
      } catch (emailError) {
        console.error('Confirmation email error:', emailError);
      }
      
      res.json({
        success: true,
        message: 'Booking confirmed successfully',
        data: booking
      });
    } catch (error) {
      console.error('Confirm booking error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to confirm booking',
        error: error.message 
      });
    }
  },

  // Cancel booking
  cancelBooking: async (req, res) => {
    try {
      const { bookingId } = req.params;
      const userId = req.user.userId;
      const userRole = req.user.role;
      
      const booking = await Booking.findById(bookingId).populate('slotId');
      
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }
      
      // Check if user can cancel this booking
      if (userRole !== 'admin' && booking.userId.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to cancel this booking'
        });
      }
      
      // Update booking status
      booking.status = 'cancelled';
      await booking.save();
      
      // Make slot available again
      if (booking.slotId) {
        booking.slotId.isAvailable = true;
        booking.slotId.bookingId = null;
        await booking.slotId.save();
      }
      
      res.json({
        success: true,
        message: 'Booking cancelled successfully',
        data: booking
      });
    } catch (error) {
      console.error('Cancel booking error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to cancel booking',
        error: error.message 
      });
    }
  }
};