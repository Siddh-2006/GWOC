import { Slot } from '../models/Slot.model.js';

export const slotController = {
  // Create new slot with duplicate prevention
  createSlot: async (req, res) => {
    try {
      const {
        date,
        startTime,
        endTime,
        availableModes,
        pricing,
        therapistId,
        maxBookings = 1
      } = req.body;

      // Validate required fields
      if (!date || !startTime || !endTime) {
        return res.status(400).json({
          success: false,
          message: 'Date, start time, and end time are required'
        });
      }

      // Validate date is not in the past
      const slotDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (slotDate < today) {
        return res.status(400).json({
          success: false,
          message: 'Cannot create slots for past dates'
        });
      }

      // Validate time format and logic
      if (startTime >= endTime) {
        return res.status(400).json({
          success: false,
          message: 'End time must be after start time'
        });
      }

      // Validate pricing
      if (!pricing || !pricing.online || !pricing.offline) {
        return res.status(400).json({
          success: false,
          message: 'Both online and offline pricing are required'
        });
      }

      // Check for exact duplicate slots (same date, start time, end time)
      const duplicateSlot = await Slot.findOne({
        date: new Date(date),
        startTime,
        endTime
      });

      if (duplicateSlot) {
        return res.status(400).json({
          success: false,
          message: 'A slot with the exact same date and time already exists'
        });
      }

      // Check for overlapping slots
      const overlappingSlot = await Slot.findOne({
        date: new Date(date),
        $or: [
          // New slot starts during existing slot
          {
            startTime: { $lte: startTime },
            endTime: { $gt: startTime }
          },
          // New slot ends during existing slot
          {
            startTime: { $lt: endTime },
            endTime: { $gte: endTime }
          },
          // New slot completely contains existing slot
          {
            startTime: { $gte: startTime },
            endTime: { $lte: endTime }
          }
        ]
      });

      if (overlappingSlot) {
        return res.status(400).json({
          success: false,
          message: `Time slot overlaps with existing slot: ${overlappingSlot.startTime} - ${overlappingSlot.endTime}`
        });
      }

      // Create new slot
      const slot = new Slot({
        date: new Date(date),
        startTime,
        endTime,
        availableModes: availableModes || ['online', 'offline'],
        pricing: {
          online: pricing.online,
          offline: pricing.offline
        },
        therapistId: therapistId || null,
        maxBookings,
        isAvailable: true,
        isBlocked: false
      });

      await slot.save();

      res.status(201).json({
        success: true,
        message: 'Slot created successfully',
        data: slot
      });
    } catch (error) {
      console.error('Create slot error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create slot',
        error: error.message
      });
    }
  },

  // Get all slots for admin with automatic cleanup
  getAllSlots: async (req, res) => {
    try {
      // First, clean up expired slots
      await slotController.cleanupExpiredSlots();

      const { 
        date, 
        month, 
        year, 
        isAvailable, 
        page = 1, 
        limit = 50,
        includeExpired = false
      } = req.query;

      let query = {};

      // Filter by date, month, or year
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
      } else if (!includeExpired) {
        // By default, only show future slots
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        query.date = { $gte: today };
      }

      // Filter by availability
      if (isAvailable !== undefined) {
        query.isAvailable = isAvailable === 'true';
      }

      const skip = (page - 1) * limit;

      const slots = await Slot.find(query)
        .populate('therapistId', 'firstName lastName')
        .populate('bookingId', 'personalInfo status')
        .sort({ date: 1, startTime: 1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Slot.countDocuments(query);

      // Add status information to each slot
      const now = new Date();
      const slotsWithStatus = slots.map(slot => {
        const slotDateTime = new Date(slot.date);
        const [hours, minutes] = slot.startTime.split(':');
        slotDateTime.setHours(parseInt(hours), parseInt(minutes));

        let status = 'upcoming';
        if (slotDateTime < now) {
          status = 'expired';
        } else if (slot.bookingId) {
          status = 'booked';
        } else if (slot.isBlocked) {
          status = 'blocked';
        } else if (!slot.isAvailable) {
          status = 'unavailable';
        }

        return {
          ...slot.toObject(),
          status
        };
      });

      res.json({
        success: true,
        data: slotsWithStatus,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get all slots error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch slots',
        error: error.message
      });
    }
  },

  // Clean up expired slots
  cleanupExpiredSlots: async () => {
    try {
      const now = new Date();
      
      // Find slots that have passed their start time and are not booked
      const expiredSlots = await Slot.find({
        isAvailable: true,
        bookingId: null,
        $expr: {
          $lt: [
            {
              $dateAdd: {
                startDate: '$date',
                unit: 'hour',
                amount: { $toInt: { $substr: ['$startTime', 0, 2] } }
              }
            },
            now
          ]
        }
      });

      if (expiredSlots.length > 0) {
        // Mark expired slots as unavailable instead of deleting them
        await Slot.updateMany(
          {
            _id: { $in: expiredSlots.map(slot => slot._id) }
          },
          {
            isAvailable: false,
            blockReason: 'Automatically expired'
          }
        );

        console.log(`🧹 Cleaned up ${expiredSlots.length} expired slots`);
      }

      return expiredSlots.length;
    } catch (error) {
      console.error('Error cleaning up expired slots:', error);
      return 0;
    }
  },

  // Update slot
  updateSlot: async (req, res) => {
    try {
      const { slotId } = req.params;
      const updates = req.body;

      const slot = await Slot.findById(slotId);
      if (!slot) {
        return res.status(404).json({
          success: false,
          message: 'Slot not found'
        });
      }

      // Check if slot is booked before allowing certain updates
      if (slot.bookingId && (updates.date || updates.startTime || updates.endTime)) {
        return res.status(400).json({
          success: false,
          message: 'Cannot modify date/time of a booked slot'
        });
      }

      // If updating date/time, check for duplicates and overlaps
      if (updates.date || updates.startTime || updates.endTime) {
        const checkDate = updates.date ? new Date(updates.date) : slot.date;
        const checkStartTime = updates.startTime || slot.startTime;
        const checkEndTime = updates.endTime || slot.endTime;

        // Check for duplicates (excluding current slot)
        const duplicateSlot = await Slot.findOne({
          _id: { $ne: slotId },
          date: checkDate,
          startTime: checkStartTime,
          endTime: checkEndTime
        });

        if (duplicateSlot) {
          return res.status(400).json({
            success: false,
            message: 'A slot with the same date and time already exists'
          });
        }
      }

      // Update slot
      Object.keys(updates).forEach(key => {
        if (updates[key] !== undefined) {
          slot[key] = updates[key];
        }
      });

      await slot.save();

      res.json({
        success: true,
        message: 'Slot updated successfully',
        data: slot
      });
    } catch (error) {
      console.error('Update slot error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update slot',
        error: error.message
      });
    }
  },

  // Delete slot
  deleteSlot: async (req, res) => {
    try {
      const { slotId } = req.params;

      const slot = await Slot.findById(slotId);
      if (!slot) {
        return res.status(404).json({
          success: false,
          message: 'Slot not found'
        });
      }

      // Check if slot is booked
      if (slot.bookingId) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete a booked slot. Cancel the booking first.'
        });
      }

      await Slot.findByIdAndDelete(slotId);

      res.json({
        success: true,
        message: 'Slot deleted successfully'
      });
    } catch (error) {
      console.error('Delete slot error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete slot',
        error: error.message
      });
    }
  },

  // Bulk cleanup - remove all expired slots
  bulkCleanup: async (req, res) => {
    try {
      const cleanedCount = await slotController.cleanupExpiredSlots();
      
      res.json({
        success: true,
        message: `Cleaned up ${cleanedCount} expired slots`,
        data: { cleanedCount }
      });
    } catch (error) {
      console.error('Bulk cleanup error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cleanup expired slots',
        error: error.message
      });
    }
  }
};