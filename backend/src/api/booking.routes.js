import { Router } from 'express';
import { bookingController } from '../controllers/booking.controller.js';

const router = Router();

// GET /api/booking/slots
router.get('/slots', bookingController.getAvailableSlots);

// POST /api/booking
router.post('/', bookingController.createBooking);

export default router;