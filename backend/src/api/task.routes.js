import { Router } from 'express';
import { taskController } from '../controllers/task.controller.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// User routes (authenticated users only)
// GET /api/tasks/my - Get my tasks
router.get('/my', authenticateToken, taskController.getMyTasks);

// PUT /api/tasks/:taskId/status - Update task status (user can only update their own tasks)
router.put('/:taskId/status', authenticateToken, taskController.updateTaskStatus);

// Admin routes (admin authentication required)
// POST /api/tasks - Create new task
router.post('/', authenticateToken, requireAdmin, taskController.createTask);

// GET /api/tasks/admin/all - Get all tasks (admin only)
router.get('/admin/all', authenticateToken, requireAdmin, taskController.getAllTasks);

// GET /api/tasks/booking/:bookingId - Get tasks for a specific booking
router.get('/booking/:bookingId', authenticateToken, requireAdmin, taskController.getTasksByBooking);

// PUT /api/tasks/:taskId - Update task (admin only)
router.put('/:taskId', authenticateToken, requireAdmin, taskController.updateTask);

// DELETE /api/tasks/:taskId - Delete task (admin only)
router.delete('/:taskId', authenticateToken, requireAdmin, taskController.deleteTask);

export default router;