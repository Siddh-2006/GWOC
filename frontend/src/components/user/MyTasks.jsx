import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, AlertCircle, Calendar, User, ChevronDown, ChevronUp } from 'lucide-react';
import { taskApi } from '../../services/task.api';

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [counts, setCounts] = useState({ pending: 0, in_progress: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [expandedTask, setExpandedTask] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, [filter]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await taskApi.getMyTasks(params);
      setTasks(response.data || []);
      setCounts(response.counts || { pending: 0, in_progress: 0, completed: 0 });
    } catch (err) {
      setError('Failed to load tasks');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (taskId, newStatus, notes = '') => {
    try {
      await taskApi.updateTaskStatus(taskId, { status: newStatus, notes });
      await fetchTasks(); // Refresh tasks
    } catch (err) {
      console.error('Error updating task status:', err);
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="text-green-500" size={20} />;
      case 'in_progress': return <Clock className="text-blue-500" size={20} />;
      case 'pending': return <AlertCircle className="text-orange-500" size={20} />;
      default: return <Clock className="text-gray-500" size={20} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-700 bg-green-100 border-green-200';
      case 'in_progress': return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'pending': return 'text-orange-700 bg-orange-100 border-orange-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
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

  const filterOptions = [
    { value: 'all', label: 'All Tasks', count: counts.pending + counts.in_progress + counts.completed },
    { value: 'pending', label: 'Pending', count: counts.pending },
    { value: 'in_progress', label: 'In Progress', count: counts.in_progress },
    { value: 'completed', label: 'Completed', count: counts.completed }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-600">
        <AlertCircle className="mx-auto mb-4" size={48} />
        <p className="text-lg font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Tasks</h2>
          <p className="text-gray-600">Track and manage your assigned tasks</p>
        </div>
        
        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                filter === option.value
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {option.label} ({option.count})
            </button>
          ))}
        </div>
      </div>

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle className="mx-auto mb-4 opacity-50" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
          <p className="text-gray-600">
            {filter === 'all' 
              ? "You don't have any tasks assigned yet."
              : `No ${filter.replace('_', ' ')} tasks found.`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <motion.div
              key={task._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {getStatusIcon(task.status)}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1">{task.title}</h3>
                      <p className="text-gray-600 text-sm line-clamp-2">{task.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <button
                      onClick={() => setExpandedTask(expandedTask === task._id ? null : task._id)}
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      {expandedTask === task._id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>
                </div>

                {/* Task Meta Info */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                  <span className={`px-3 py-1 rounded-full font-medium border ${getStatusColor(task.status)}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                  
                  {task.dueDate && (
                    <span className={`flex items-center gap-1 ${isOverdue(task.dueDate) && task.status !== 'completed' ? 'text-red-600 font-medium' : ''}`}>
                      <Calendar size={14} />
                      Due: {formatDate(task.dueDate)}
                      {isOverdue(task.dueDate) && task.status !== 'completed' && (
                        <span className="text-red-600 font-medium">(Overdue)</span>
                      )}
                    </span>
                  )}
                  
                  <span className="flex items-center gap-1">
                    <User size={14} />
                    Assigned by: {task.assignedBy.firstName} {task.assignedBy.lastName}
                  </span>
                </div>

                {/* Status Update Buttons */}
                {task.status !== 'completed' && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {task.status === 'pending' && (
                      <button
                        onClick={() => handleStatusUpdate(task._id, 'in_progress')}
                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors font-medium"
                      >
                        Start Task
                      </button>
                    )}
                    
                    {task.status === 'in_progress' && (
                      <button
                        onClick={() => handleStatusUpdate(task._id, 'completed')}
                        className="px-4 py-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors font-medium"
                      >
                        Mark Complete
                      </button>
                    )}
                    
                    {task.status === 'in_progress' && (
                      <button
                        onClick={() => handleStatusUpdate(task._id, 'pending')}
                        className="px-4 py-2 bg-orange-100 text-orange-700 rounded-xl hover:bg-orange-200 transition-colors font-medium"
                      >
                        Mark Pending
                      </button>
                    )}
                  </div>
                )}

                {/* Expanded Details */}
                {expandedTask === task._id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-gray-100 pt-4 space-y-4"
                  >
                    {task.notes && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Additional Notes</h4>
                        <p className="text-gray-600 text-sm">{task.notes}</p>
                      </div>
                    )}
                    
                    {task.bookingId && (
                      <div className="bg-blue-50 rounded-xl p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Related Session</h4>
                        <p className="text-gray-600 text-sm">
                          <span className="font-medium">Type:</span> {task.bookingId.sessionType}
                        </p>
                        <p className="text-gray-600 text-sm">
                          <span className="font-medium">Created:</span> {formatDate(task.bookingId.createdAt)}
                        </p>
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>Created: {formatDate(task.createdAt)}</p>
                      {task.completedAt && (
                        <p>Completed: {formatDate(task.completedAt)}</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTasks;