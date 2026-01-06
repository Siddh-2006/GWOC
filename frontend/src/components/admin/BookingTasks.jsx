import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, AlertCircle, Calendar, User, Trash2 } from 'lucide-react';
import { taskApi } from '../../services/task.api';

const BookingTasks = ({ bookingId, onTasksChange }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (bookingId) {
      fetchTasks();
    }
  }, [bookingId]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await taskApi.admin.getTasksByBooking(bookingId);
      setTasks(response.data || []);
    } catch (err) {
      setError('Failed to load tasks');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await taskApi.admin.deleteTask(taskId);
      setTasks(prev => prev.filter(task => task._id !== taskId));
      onTasksChange?.();
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="text-green-500" size={16} />;
      case 'in_progress': return <Clock className="text-blue-500" size={16} />;
      case 'pending': return <AlertCircle className="text-orange-500" size={16} />;
      default: return <Clock className="text-gray-500" size={16} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-700 bg-green-100';
      case 'in_progress': return 'text-blue-700 bg-blue-100';
      case 'pending': return 'text-orange-700 bg-orange-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        <AlertCircle className="mx-auto mb-2" size={24} />
        <p>{error}</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <CheckCircle className="mx-auto mb-2 opacity-50" size={24} />
        <p>No tasks assigned for this booking</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
        <CheckCircle size={20} />
        Assigned Tasks ({tasks.length})
      </h4>
      
      <div className="space-y-3">
        {tasks.map((task) => (
          <motion.div
            key={task._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-50 rounded-xl p-4 border border-gray-100"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(task.status)}
                  <h5 className="font-medium text-gray-900 truncate">{task.title}</h5>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                  <span className={`px-2 py-1 rounded-full font-medium ${getStatusColor(task.status)}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                  
                  {task.dueDate && (
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      Due: {formatDate(task.dueDate)}
                    </span>
                  )}
                  
                  <span className="flex items-center gap-1">
                    <User size={12} />
                    {task.assignedBy.firstName} {task.assignedBy.lastName}
                  </span>
                  
                  <span>
                    Created: {formatDate(task.createdAt)}
                  </span>
                </div>
                
                {task.notes && (
                  <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Notes:</span> {task.notes}
                    </p>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => handleDeleteTask(task._id)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete task"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default BookingTasks;