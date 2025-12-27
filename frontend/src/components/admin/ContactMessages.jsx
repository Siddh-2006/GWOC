import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Search, 
  Filter, 
  Eye, 
  Trash2, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  Reply,
  Calendar,
  User,
  AlertCircle
} from 'lucide-react';
import contactAPI from '../../services/contact.api.js';

const ContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchMessages();
    fetchStats();
  }, [filters]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      
      const params = { ...filters };
      if (params.status === 'all') delete params.status;
      
      const response = await contactAPI.getContactMessages(params);
      
      setMessages(response.data.contacts);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to fetch messages. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await contactAPI.getContactStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('Failed to fetch statistics. Please try again.');
    }
  };

  const handleStatusUpdate = async (id, status, adminNotes = '') => {
    try {
      await contactAPI.updateContactStatus(id, { status, adminNotes });
      fetchMessages();
      fetchStats();
      if (selectedMessage && selectedMessage._id === id) {
        setSelectedMessage({ ...selectedMessage, status, adminNotes });
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await contactAPI.deleteContactMessage(id);
        fetchMessages();
        fetchStats();
        if (selectedMessage && selectedMessage._id === id) {
          setSelectedMessage(null);
        }
      } catch (error) {
        console.error('Error deleting message:', error);
      }
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'unread': return <AlertCircle className="text-red-500" size={16} />;
      case 'read': return <Eye className="text-yellow-500" size={16} />;
      case 'replied': return <CheckCircle className="text-green-500" size={16} />;
      default: return <MessageSquare className="text-gray-500" size={16} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'unread': return 'bg-red-100 text-red-800';
      case 'read': return 'bg-yellow-100 text-yellow-800';
      case 'replied': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Messages</h1>
        <p className="text-gray-600">Manage and respond to customer inquiries</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Messages</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total || 0}</p>
            </div>
            <MessageSquare className="text-blue-500" size={24} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unread</p>
              <p className="text-2xl font-bold text-red-600">{stats.unread || 0}</p>
            </div>
            <AlertCircle className="text-red-500" size={24} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Read</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.read || 0}</p>
            </div>
            <Eye className="text-yellow-500" size={24} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Replied</p>
              <p className="text-2xl font-bold text-green-600">{stats.replied || 0}</p>
            </div>
            <CheckCircle className="text-green-500" size={24} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search messages..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
            >
              <option value="all">All Status</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
              <option value="replied">Replied</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Messages</h2>
            </div>
            
            <div className="divide-y">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-2 text-gray-500">Loading messages...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-gray-500">No messages found</p>
                </div>
              ) : (
                messages.map((message) => (
                  <motion.div
                    key={message._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      selectedMessage?._id === message._id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                    onClick={() => setSelectedMessage(message)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {getStatusIcon(message.status)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(message.status)}`}>
                            {message.status}
                          </span>
                        </div>
                        
                        <h3 className="font-medium text-gray-900 truncate">{message.subject}</h3>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <User size={14} />
                          {message.name} • {message.email}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <Calendar size={14} />
                          {formatDate(message.createdAt)}
                        </p>
                      </div>
                      
                      <div className="flex gap-1 ml-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusUpdate(message._id, 'replied');
                          }}
                          className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                          title="Mark as replied"
                        >
                          <Reply size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(message._id);
                          }}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete message"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="p-4 border-t flex items-center justify-between">
                <p className="text-sm text-gray-700">
                  Showing {((pagination.current - 1) * filters.limit) + 1} to {Math.min(pagination.current * filters.limit, pagination.total)} of {pagination.total} results
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                    disabled={!pagination.hasPrev}
                    className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                    disabled={!pagination.hasNext}
                    className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border sticky top-6">
            {selectedMessage ? (
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Message Details</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedMessage.status)}`}>
                    {selectedMessage.status}
                  </span>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">From</label>
                    <p className="text-gray-900">{selectedMessage.name}</p>
                    <p className="text-sm text-gray-600">{selectedMessage.email}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Subject</label>
                    <p className="text-gray-900">{selectedMessage.subject}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Message</label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-900 whitespace-pre-wrap">{selectedMessage.message}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Received</label>
                    <p className="text-gray-600">{formatDate(selectedMessage.createdAt)}</p>
                  </div>
                  
                  {selectedMessage.adminNotes && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Admin Notes</label>
                      <p className="text-gray-900">{selectedMessage.adminNotes}</p>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 space-y-2">
                  <button
                    onClick={() => handleStatusUpdate(selectedMessage._id, 'read')}
                    className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    Mark as Read
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedMessage._id, 'replied')}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Mark as Replied
                  </button>
                  <button
                    onClick={() => handleDelete(selectedMessage._id)}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete Message
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-gray-500">Select a message to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactMessages;