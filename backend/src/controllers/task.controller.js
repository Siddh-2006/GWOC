import Task from '../models/Task.model.js';
import Auth from '../models/Auth.model.js';
import { Booking } from '../models/Booking.model.js';

export const taskController = {
  // Admin: Create task for a user (from booking)
  createTask: async (req, res) => {
    try {
      const { title, description, priority, dueDate, assignedTo, bookingId, notes } = req.body;
      const assignedBy = req.user.userId;

      // Validate required fields
      if (!title || !description || !assignedTo || !bookingId) {
        return res.status(400).json({
          success: false,
          message: 'Title, description, assignedTo, and bookingId are required'
        });
      }

      // Verify booking exists and admin has access
      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }

      // Verify assigned user exists
      const assignedUser = await Auth.findById(assignedTo);
      if (!assignedUser) {
        return res.status(404).json({
          success: false,
          message: 'Assigned user not found'
        });
      }

      const task = new Task({
        title,
        description,
        priority: priority || 'medium',
        dueDate: dueDate ? new Date(dueDate) : undefined,
        assignedTo,
        assignedBy,
        bookingId,
        notes
      });

      await task.save();

      // Populate references for response
      await task.populate([
        { path: 'assignedTo', select: 'firstName lastName email' },
        { path: 'assignedBy', select: 'firstName lastName email' },
        { path: 'bookingId', select: 'sessionType status' }
      ]);

      res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: task
      });

    } catch (error) {
      console.error('Create task error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Admin: Get all tasks
  getAllTasks: async (req, res) => {
    try {
      const { status, priority, assignedTo, page = 1, limit = 20 } = req.query;
      
      const filter = {};
      if (status) filter.status = status;
      if (priority) filter.priority = priority;
      if (assignedTo) filter.assignedTo = assignedTo;

      const skip = (page - 1) * limit;

      const tasks = await Task.find(filter)
        .populate('assignedTo', 'firstName lastName email')
        .populate('assignedBy', 'firstName lastName email')
        .populate('bookingId', 'sessionType status createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Task.countDocuments(filter);

      res.json({
        success: true,
        data: tasks,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      console.error('Get all tasks error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Admin: Get tasks for a specific booking
  getTasksByBooking: async (req, res) => {
    try {
      const { bookingId } = req.params;

      const tasks = await Task.find({ bookingId })
        .populate('assignedTo', 'firstName lastName email')
        .populate('assignedBy', 'firstName lastName email')
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        data: tasks
      });

    } catch (error) {
      console.error('Get tasks by booking error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // User: Get my tasks
  getMyTasks: async (req, res) => {
    try {
      const userId = req.user.userId;
      const { status, page = 1, limit = 20 } = req.query;

      const filter = { assignedTo: userId };
      if (status) filter.status = status;

      const skip = (page - 1) * limit;

      const tasks = await Task.find(filter)
        .populate('assignedBy', 'firstName lastName email')
        .populate('bookingId', 'sessionType status createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Task.countDocuments(filter);

      // Get task counts by status
      const statusCounts = await Task.aggregate([
        { $match: { assignedTo: userId } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);

      const counts = {
        pending: 0,
        in_progress: 0,
        completed: 0
      };

      statusCounts.forEach(item => {
        counts[item._id] = item.count;
      });

      res.json({
        success: true,
        data: tasks,
        counts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      console.error('Get my tasks error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // User: Update task status
  updateTaskStatus: async (req, res) => {
    try {
      const { taskId } = req.params;
      const { status, notes } = req.body;
      const userId = req.user.userId;

      if (!['pending', 'in_progress', 'completed'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status'
        });
      }

      const task = await Task.findOne({ _id: taskId, assignedTo: userId });
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found'
        });
      }

      task.status = status;
      if (notes) task.notes = notes;
      if (status === 'completed') {
        task.completedAt = new Date();
      } else if (task.completedAt) {
        task.completedAt = undefined;
      }

      await task.save();

      await task.populate([
        { path: 'assignedBy', select: 'firstName lastName email' },
        { path: 'bookingId', select: 'sessionType status createdAt' }
      ]);

      res.json({
        success: true,
        message: 'Task updated successfully',
        data: task
      });

    } catch (error) {
      console.error('Update task status error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Admin: Update task
  updateTask: async (req, res) => {
    try {
      const { taskId } = req.params;
      const { title, description, priority, dueDate, status, notes } = req.body;

      const task = await Task.findById(taskId);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found'
        });
      }

      // Update fields if provided
      if (title) task.title = title;
      if (description) task.description = description;
      if (priority) task.priority = priority;
      if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : null;
      if (status) {
        task.status = status;
        if (status === 'completed' && !task.completedAt) {
          task.completedAt = new Date();
        } else if (status !== 'completed') {
          task.completedAt = undefined;
        }
      }
      if (notes !== undefined) task.notes = notes;

      await task.save();

      await task.populate([
        { path: 'assignedTo', select: 'firstName lastName email' },
        { path: 'assignedBy', select: 'firstName lastName email' },
        { path: 'bookingId', select: 'sessionType status createdAt' }
      ]);

      res.json({
        success: true,
        message: 'Task updated successfully',
        data: task
      });

    } catch (error) {
      console.error('Update task error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Admin: Delete task
  deleteTask: async (req, res) => {
    try {
      const { taskId } = req.params;

      const task = await Task.findByIdAndDelete(taskId);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found'
        });
      }

      res.json({
        success: true,
        message: 'Task deleted successfully'
      });

    } catch (error) {
      console.error('Delete task error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};