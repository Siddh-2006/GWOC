import { Booking } from '../models/Booking.model.js';
import { Slot } from '../models/Slot.model.js';
import { User } from '../models/User.model.js';
import Auth from '../models/Auth.model.js';
import { sendBookingConfirmation, sendBookingNotification, sendBookingReminder, sendPaymentRequest } from '../services/booking-email.service.js';

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
        location,
        reflectionSessionId,
        transactionId // Extract transaction ID
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

      // Allow transactionId for offline sessions too if they pay in advance, but optional.
      // For Online sessions, payment is compulsory now (as per user request).
      if (sessionMode === 'online' && !transactionId) {
        return res.status(400).json({
          success: false,
          message: 'Payment is required for online sessions. Please provide Transaction ID.'
        });
      }

      // Validate location for offline sessions
      if (sessionMode === 'offline') {
        if (!location || !location.trim()) {
          return res.status(400).json({
            success: false,
            message: 'Location is required for offline sessions'
          });
        }

        // Validate that location is in Surat area
        const normalizedLocation = location.toLowerCase();
        const isSuratLocation = normalizedLocation.includes('surat') ||
          normalizedLocation.includes('gujarat') ||
          ['adajan', 'vesu', 'citylight', 'piplod', 'althan', 'ghod dod', 'ring road', 'udhna', 'katargam']
            .some(area => normalizedLocation.includes(area));

        if (!isSuratLocation) {
          return res.status(400).json({
            success: false,
            message: 'Please provide a location in Surat, Gujarat area. MindSettler operates in Surat only.'
          });
        }
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
        reflectionSessionId: reflectionSessionId || null, // Include reflection session ID if provided
        payment: {
          amount: paymentAmount,
          currency: 'INR',
          status: transactionId ? 'pending_verification' : 'pending',
          paymentId: transactionId || null,
          paymentMethod: transactionId ? 'upi' : undefined
        },
        status: transactionId ? 'awaiting_payment' : 'pending'
      });

      await booking.save();

      // Mark slot as temporarily unavailable during pending status
      slot.isAvailable = false;
      slot.bookingId = booking._id;
      await slot.save();

      // Send notifications
      try {
        // Notify admin about new booking
        await sendBookingNotification(booking, slot, user);
        booking.notifications.adminNotified = true;

        // Send confirmation to user
        await sendBookingConfirmation(booking, slot, booking.status);
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
      const { status, date, page = 1, limit = 10, upcoming } = req.query;

      let query = {};

      // Status filter
      if (status) {
        if (status === 'all') {
          // No status filter
        } else {
          query.status = status;
        }
      }

      // Date filter
      if (date) {
        const targetDate = new Date(date);
        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);

        query.createdAt = {
          $gte: targetDate,
          $lt: nextDay
        };
      }

      // Upcoming filter - exclude sessions where end time has passed
      if (upcoming === 'true') {
        const now = new Date();

        // We need to filter based on slot end time
        // This requires a more complex aggregation
        const bookings = await Booking.aggregate([
          {
            $lookup: {
              from: 'slots',
              localField: 'slotId',
              foreignField: '_id',
              as: 'slotInfo'
            }
          },
          {
            $unwind: '$slotInfo'
          },
          {
            $addFields: {
              sessionEndDateTime: {
                $dateFromString: {
                  dateString: {
                    $concat: [
                      { $dateToString: { format: "%Y-%m-%d", date: "$slotInfo.date" } },
                      "T",
                      "$slotInfo.endTime",
                      ":00.000Z"
                    ]
                  }
                }
              }
            }
          },
          {
            $match: {
              sessionEndDateTime: { $gt: now },
              ...query
            }
          },
          {
            $lookup: {
              from: 'auths',
              localField: 'userId',
              foreignField: '_id',
              as: 'userInfo'
            }
          },
          {
            $lookup: {
              from: 'auths',
              localField: 'adminResponse.confirmedBy',
              foreignField: '_id',
              as: 'confirmedByInfo'
            }
          },
          {
            $sort: { createdAt: -1 }
          },
          {
            $skip: (page - 1) * limit
          },
          {
            $limit: parseInt(limit)
          }
        ]);

        // Get total count for pagination
        const totalPipeline = [
          {
            $lookup: {
              from: 'slots',
              localField: 'slotId',
              foreignField: '_id',
              as: 'slotInfo'
            }
          },
          {
            $unwind: '$slotInfo'
          },
          {
            $addFields: {
              sessionEndDateTime: {
                $dateFromString: {
                  dateString: {
                    $concat: [
                      { $dateToString: { format: "%Y-%m-%d", date: "$slotInfo.date" } },
                      "T",
                      "$slotInfo.endTime",
                      ":00.000Z"
                    ]
                  }
                }
              }
            }
          },
          {
            $match: {
              sessionEndDateTime: { $gt: now },
              ...query
            }
          },
          {
            $count: "total"
          }
        ];

        const totalResult = await Booking.aggregate(totalPipeline);
        const total = totalResult.length > 0 ? totalResult[0].total : 0;

        return res.json({
          success: true,
          data: bookings,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        });
      }

      // Regular query without upcoming filter
      const skip = (page - 1) * limit;

      const bookings = await Booking.find(query)
        .populate('userId', 'firstName lastName email')
        .populate('slotId')
        .populate('adminResponse.confirmedBy', 'firstName lastName')
        .populate('adminResponse.reviewedBy', 'firstName lastName')
        .populate('adminResponse.rejectedBy', 'firstName lastName')
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

  // Admin: Review booking (mark as under review)
  reviewBooking: async (req, res) => {
    try {
      const { bookingId } = req.params;
      const adminId = req.user.userId;

      const booking = await Booking.findById(bookingId);

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }

      if (booking.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Only pending bookings can be reviewed'
        });
      }

      booking.status = 'under_review';
      booking.adminResponse = {
        ...booking.adminResponse,
        reviewedBy: adminId,
        reviewedAt: new Date()
      };

      await booking.save();

      res.json({
        success: true,
        message: 'Booking marked as under review',
        data: booking
      });
    } catch (error) {
      console.error('Review booking error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to review booking',
        error: error.message
      });
    }
  },

  // Admin: Reject booking (delete from database)
  rejectBooking: async (req, res) => {
    try {
      const { bookingId } = req.params;
      const adminId = req.user.userId;
      const { rejectionReason } = req.body;

      const booking = await Booking.findById(bookingId)
        .populate('userId')
        .populate('slotId');

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }

      // Make slot available again before deleting booking
      if (booking.slotId) {
        booking.slotId.isAvailable = true;
        booking.slotId.bookingId = null;
        await booking.slotId.save();
      }

      // Send rejection email to user before deleting
      try {
        await sendBookingConfirmation(booking, booking.slotId, 'rejected', rejectionReason);
      } catch (emailError) {
        console.error('Rejection email error:', emailError);
      }

      // Delete the booking from database
      await Booking.findByIdAndDelete(bookingId);

      res.json({
        success: true,
        message: 'Booking rejected and removed from database',
        data: { bookingId, rejectionReason }
      });
    } catch (error) {
      console.error('Reject booking error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reject booking',
        error: error.message
      });
    }
  },
  // Admin: Approve booking (Request Payment)
  approveBooking: async (req, res) => {
    try {
      const { bookingId } = req.params;
      const adminId = req.user.userId;

      const booking = await Booking.findById(bookingId).populate('slotId');

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }

      // Can only approve pending or under_review bookings
      if (!['pending', 'under_review'].includes(booking.status)) {
        return res.status(400).json({
          success: false,
          message: 'Booking must be pending or under review to be approved'
        });
      }

      // Update status to awaiting_payment
      booking.status = 'awaiting_payment';
      booking.adminResponse = {
        ...booking.adminResponse,
        reviewedBy: adminId,
        reviewedAt: new Date(),
        approvedAt: new Date()
      };

      await booking.save();

      // Send payment request email
      let emailSent = false;
      try {
        await sendPaymentRequest(booking, booking.slotId);
        emailSent = true;
      } catch (emailError) {
        console.error('Payment request email error:', emailError);
        // Continue execution - don't fail the approval if email fails
      }

      res.json({
        success: true,
        message: emailSent
          ? 'Booking approved. Payment request sent to client.'
          : 'Booking approved, but failed to send payment email. Please verify email configuration.',
        data: booking
      });
    } catch (error) {
      console.error('Approve booking error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to approve booking',
        error: error.message
      });
    }
  },

  confirmBooking: async (req, res) => {
    try {
      const { bookingId } = req.params;
      const adminId = req.user.userId;
      const {
        confirmedDate,
        confirmedTime,
        meetingLink,
        notes,
        transactionId
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

      // Use original slot time by default, allow admin to override if needed
      // Handle case where slotId might be null (deleted slot)
      const finalDate = confirmedDate || booking.slotId?.date || new Date();
      const finalTime = confirmedTime || booking.slotId?.startTime || '00:00';

      // Update booking with admin confirmation
      booking.status = 'confirmed';
      booking.adminResponse = {
        ...booking.adminResponse,
        confirmedDate: finalDate,
        confirmedTime: finalTime,
        meetingLink,
        notes,
        confirmedBy: adminId,
        confirmedAt: new Date()
      };

      // Mark payment as completed and save transaction ID
      booking.payment = {
        ...booking.payment,
        status: 'paid',
        paymentId: transactionId || booking.payment?.paymentId, // Save transaction ID if provided
        verifiedBy: adminId,
        verifiedAt: new Date(),
        paidAt: new Date() // Assume paid now if not earlier
      };


      await booking.save();

      // Mark the original slot as permanently booked (remove from availability)
      if (booking.slotId) {
        booking.slotId.isAvailable = false;
        booking.slotId.bookingId = booking._id;
        try {
          await booking.slotId.save();
        } catch (slotError) {
          console.error('Error updating slot status:', slotError);
        }
      }

      // Mark user as having confirmed session (for reflection system)
      if (booking.userId) {
        try {
          await User.findByIdAndUpdate(booking.userId._id, {
            hasConfirmedSession: true
          });
          console.log(`✅ Marked user ${booking.userId._id} as having confirmed session`);
        } catch (userUpdateError) {
          console.error('Error marking user session as confirmed:', userUpdateError);
        }
      }

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
        message: 'Booking confirmed successfully. Slot has been marked as booked.',
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

      // Make slot available again if booking is cancelled
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