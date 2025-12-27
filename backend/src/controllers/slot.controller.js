import { Slot } from '../models/Slot.model.js';

export const slotController = {
  // Create new slot
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

      // Validate pricing
      if (!pricing || !pricing.online || !pricing.offline) {
        return res.status(400).json({
          success: false,
          message: 'Both online and offline pricing are required'
        });
      }

      // Check for overlapping slots
      const overlappingSlot = await Slot.findOne({
        date: new Date(date),
        $or: [
          {
            startTime: { $lt: endTime },
            endTime: { $gt: startTime }
          }
        ]
      });

      if (overlappingSlot) {
        return res.status(400).json({
          success: false,
          message: 'A slot already exists for this time period'
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

  // Get all slots for admin
  getAllSlots: async (req, res) => {
    try {
      const { 
        date, 
        month, 
        year, 
        isAvailable, 
        page = 1, 
        limit = 50 
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

      res.json({
        success: true,
        data: slots,
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
          message: 'Cannot delete a booked slot'
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
  }
};