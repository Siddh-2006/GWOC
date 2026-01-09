import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  X, CheckCircle, Clock, AlertCircle, Calendar,
  User, Target, MessageSquare
} from 'lucide-react';
import { taskApi } from '../../services/task.api';

const SessionTasksModal = ({ session, isOpen, onClose }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && session?._id) {
      fetchSessionTasks();
    }
  }, [isOpen, session?._id]);

  const fetchSessionTasks = async () => {
    try {
      setLoading(true);
      setError('');
      // Get all user tasks and filter for this session
      const response = await taskApi.getMyTasks();
      const sessionTasks = response.data?.filter(task =>
        task.bookingId && task.bookingId._id === session._id
      ) || [];
      setTasks(sessionTasks);
    } catch (err) {
      setError('Failed to load tasks');
      console.error('Error fetching session tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskStatusUpdate = async (taskId, newStatus) => {
    try {
      await taskApi.updateTaskStatus(taskId, { status: newStatus });
      // Refresh tasks
      await fetchSessionTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const getTaskStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100 border-green-200';
      case 'in_progress': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'pending': return 'text-orange-600 bg-orange-100 border-orange-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getTaskStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle size={20} className="text-green-600" />;
      case 'in_progress': return <Clock size={20} className="text-blue-600" />;
      case 'pending': return <AlertCircle size={20} className="text-orange-600" />;
      default: return <Clock size={20} className="text-gray-600" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
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

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <CheckCircle className="text-purple-600" size={28} />
                My Tasks
              </h2>
              <p className="text-gray-600 mt-1">
                Tasks assigned for your {session.sessionType || 'individual'} session
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent"></div>
              <p className="ml-3 text-gray-600">Loading tasks...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
              <p className="text-red-600 font-medium">{error}</p>
              <button
                onClick={fetchSessionTasks}
                className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="mx-auto mb-4 opacity-50" size={64} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Tasks Assigned</h3>
              <p className="text-gray-600">
                No tasks have been assigned for this session yet.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {tasks.map((task) => (
                <motion.div
                  key={task._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-50 rounded-2xl p-6 border border-gray-200"
                >
                  {/* Task Header */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-start gap-3 flex-1">
                      {getTaskStatusIcon(task.status)}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-lg mb-1">{task.title}</h3>
                        <p className="text-gray-600">{task.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getTaskStatusColor(task.status)}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Task Meta Info */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                    {task.dueDate && (
                      <span className={`flex items-center gap-1 ${isOverdue(task.dueDate) && task.status !== 'completed' ? 'text-red-600 font-medium' : ''}`}>
                        <Calendar size={14} />
                        Due: {formatDate(task.dueDate)}
                        {isOverdue(task.dueDate) && task.status !== 'completed' && (
                          <span className="text-red-600 font-medium ml-1">(Overdue)</span>
                        )}
                      </span>
                    )}

                    <span className="flex items-center gap-1">
                      <User size={14} />
                      Assigned by: {task.assignedBy?.firstName} {task.assignedBy?.lastName}
                    </span>

                    <span>
                      Created: {formatDate(task.createdAt)}
                    </span>

                    {task.completedAt && (
                      <span className="text-green-600">
                        Completed: {formatDate(task.completedAt)}
                      </span>
                    )}
                  </div>

                  {/* Admin Notes */}
                  {task.notes && (
                    <div className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                        <MessageSquare size={16} />
                        Admin Notes
                      </h4>
                      <p className="text-gray-600">{task.notes}</p>
                    </div>
                  )}

                  {/* Task Action Buttons */}
                  {task.status !== 'completed' && (
                    <div className="flex gap-3">
                      {task.status === 'pending' && (
                        <button
                          onClick={() => handleTaskStatusUpdate(task._id, 'in_progress')}
                          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors font-medium"
                        >
                          Start Task
                        </button>
                      )}

                      {task.status === 'in_progress' && (
                        <>
                          <button
                            onClick={() => handleTaskStatusUpdate(task._id, 'completed')}
                            className="px-4 py-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors font-medium"
                          >
                            Mark Complete
                          </button>
                          <button
                            onClick={() => handleTaskStatusUpdate(task._id, 'pending')}
                            className="px-4 py-2 bg-orange-100 text-orange-700 rounded-xl hover:bg-orange-200 transition-colors font-medium"
                          >
                            Mark Pending
                          </button>
                        </>
                      )}
                    </div>
                  )}

                  {task.status === 'completed' && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle size={16} />
                      <span className="font-medium">Task Completed</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default SessionTasksModal;