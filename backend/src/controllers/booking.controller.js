import { Booking } from '../models/Booking.model.js';
import { Slot } from '../models/Slot.model.js';

export const bookingController = {
  // Get available slots
  getAvailableSlots: async (req, res) => {
    try {
      const { date } = req.query;
      const slots = await Slot.find({ 
        date: new Date(date), 
        isAvailable: true 
      });
      res.json(slots);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create new booking
  createBooking: async (req, res) => {
    try {
      const { userId, slotId, notes } = req.body;
      
      // Check if slot is available
      const slot = await Slot.findById(slotId);
      if (!slot || !slot.isAvailable) {
        return res.status(400).json({ error: 'Slot not available' });
      }

      const booking = new Booking({
        userId,
        slotId,
        notes
      });

      await booking.save();
      
      // Mark slot as unavailable
      slot.isAvailable = false;
      await slot.save();

      res.status(201).json(booking);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};