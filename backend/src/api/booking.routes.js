import { Router } from 'express';
import { bookingController } from '../controllers/booking.controller.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// Public routes (no authentication required)
// GET /api/booking/slots - Get available slots
router.get('/slots', bookingController.getAvailableSlots);

// Protected routes (authentication required)
// POST /api/booking - Create new booking
router.post('/', authenticateToken, bookingController.createBooking);

// GET /api/booking/user - Get user's bookings
router.get('/user', authenticateToken, bookingController.getUserBookings);

// DELETE /api/booking/:bookingId - Cancel booking
router.delete('/:bookingId', authenticateToken, bookingController.cancelBooking);

// Admin routes (admin authentication required)
// GET /api/booking/admin/all - Get all bookings (admin only)
router.get('/admin/all', authenticateToken, requireAdmin, bookingController.getAllBookings);

// PUT /api/booking/admin/confirm/:bookingId - Confirm booking (admin only)
router.put('/admin/confirm/:bookingId', authenticateToken, requireAdmin, bookingController.confirmBooking);

export default router;