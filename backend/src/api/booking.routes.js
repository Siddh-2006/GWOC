import { Router } from 'express';
import { bookingController } from '../controllers/booking.controller.js';
import { slotController } from '../controllers/slot.controller.js';
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

// PUT /api/booking/admin/review/:bookingId - Review booking (admin only)
router.put('/admin/review/:bookingId', authenticateToken, requireAdmin, bookingController.reviewBooking);

// DELETE /api/booking/admin/reject/:bookingId - Reject booking (admin only)
router.delete('/admin/reject/:bookingId', authenticateToken, requireAdmin, bookingController.rejectBooking);

// Slot management routes (admin only)
// POST /api/booking/admin/slots - Create new slot
router.post('/admin/slots', authenticateToken, requireAdmin, slotController.createSlot);

// GET /api/booking/admin/slots - Get all slots for admin
router.get('/admin/slots', authenticateToken, requireAdmin, slotController.getAllSlots);

// PUT /api/booking/admin/slots/:slotId - Update slot
router.put('/admin/slots/:slotId', authenticateToken, requireAdmin, slotController.updateSlot);

// DELETE /api/booking/admin/slots/:slotId - Delete slot
router.delete('/admin/slots/:slotId', authenticateToken, requireAdmin, slotController.deleteSlot);

export default router;