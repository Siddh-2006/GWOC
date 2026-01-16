import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Clock, User, Filter, Plus, Calendar, Loader2, Building2, MessageSquare, Eye, Mail, Phone, Heart, Trash2, FileText, Brain } from 'lucide-react';
import { useBookingStore } from '../../store/useBookingStore';
import { bookingApi } from '../booking/booking.api';
import { slotApi } from '../../services/slot.api';
import { CorporateInquiries } from '../../components/admin/CorporateInquiries';
import ContactMessages from '../../components/admin/ContactMessages';
import AddSlotModal from '../../components/admin/AddSlotModal';
import ReflectionQuestions from '../../components/admin/ReflectionQuestions';
import TaskAssignmentModal from '../../components/admin/TaskAssignmentModal';
import BookingTasks from '../../components/admin/BookingTasks';
import JourneyEntryButton from '../../components/admin/JourneyEntryButton';
import UserJourneyEntries from '../../components/admin/UserJourneyEntries';
import { useToast } from '../../hooks/useToast';
import ToastContainer from '../../components/ToastContainer';
import RAGUploadModal from '../../components/admin/RAGUploadModal';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const {
    availableSlots,
    setAvailableSlots,
  } = useBookingStore();

  const [activeTab, setActiveTab] = useState('bookings');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [confirmationData, setConfirmationData] = useState({
    confirmedDate: '',
    confirmedTime: '',
    meetingLink: 'https://meet.google.com/new',
    notes: '',
    transactionId: ''
  });
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showRagModal, setShowRagModal] = useState(false);
  const [taskBooking, setTaskBooking] = useState(null);
  const { toasts, success, error: showToast, removeToast } = useToast();
  const [statusFilter, setStatusFilter] = useState('all');
  const [showUpcomingOnly, setShowUpcomingOnly] = useState(false);
  const [rejectionReason, setRejectionReason] = useState(null); // Initialize as null to differentiate modes

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters = {
        status: statusFilter,
        upcoming: showUpcomingOnly
      };
      const response = await bookingApi.admin.getAllBookings(filters);
      setBookings(response.data || []);
    } catch (err) {
      setError('Failed to fetch bookings: ' + err.message);
      console.error('Fetch bookings error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async () => {
    try {
      const response = await slotApi.getAllSlots();
      setAvailableSlots(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Fetch slots error:', err);
      setAvailableSlots([]); // Ensure it's always an array
    }
  };

  const handleSlotAdded = (newSlot) => {
    console.log('Adding new slot to dashboard:', newSlot);
    setAvailableSlots(prev => {
      const prevArray = Array.isArray(prev) ? prev : [];
      const updated = [...prevArray, newSlot];
      console.log('Updated slots list:', updated.length);
      return updated;
    });
    setShowAddSlotModal(false);
    success('Time slot created successfully!');
  };

  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm('Are you sure you want to delete this slot?')) return;

    try {
      await slotApi.deleteSlot(slotId);
      setAvailableSlots(prev => {
        const prevArray = Array.isArray(prev) ? prev : [];
        return prevArray.filter(slot => slot._id !== slotId);
      });
      success('Time slot deleted successfully!');
    } catch (err) {
      setError('Failed to delete slot: ' + err.message);
      showToast('Failed to delete slot: ' + err.message);
    }
  };

  useEffect(() => {
    if (activeTab === 'bookings') {
      fetchBookings();
    } else if (activeTab === 'slots') {
      fetchSlots();
    }
  }, [activeTab]);

  const handleConfirmBooking = async (bookingId) => {
    try {
      setLoading(true);
      await bookingApi.admin.confirmBooking(bookingId, confirmationData);



      // Refresh both bookings and slots lists to show updated availability
      await fetchBookings();
      if (activeTab === 'slots') {
        await fetchSlots();
      }

      // Close the modal and reset form
      setSelectedBooking(null);
      setConfirmationData({
        confirmedDate: '',
        confirmedTime: '',
        meetingLink: 'https://meet.google.com/new',
        notes: ''
      });

    } catch (err) {
      setError('Failed to confirm booking: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveBooking = async (bookingId) => {
    try {
      setLoading(true);
      await bookingApi.admin.approveBooking(bookingId);
      await fetchBookings();
      success('Booking approved and payment request sent!');
    } catch (err) {
      setError('Failed to approve booking: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewBooking = async (bookingId) => {
    try {
      setLoading(true);
      await bookingApi.admin.reviewBooking(bookingId);
      await fetchBookings();
    } catch (err) {
      setError('Failed to review booking: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectBooking = async (bookingId) => {
    if (!rejectionReason.trim()) {
      setError('Please provide a rejection reason');
      return;
    }

    if (!window.confirm('Are you sure you want to reject this booking? This will permanently delete it from the database.')) {
      return;
    }

    try {
      setLoading(true);
      await bookingApi.admin.rejectBooking(bookingId, rejectionReason);
      await fetchBookings();
      setSelectedBooking(null);
      setRejectionReason(null);
    } catch (err) {
      setError('Failed to reject booking: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Task assignment handlers
  const handleAssignTask = (booking) => {
    setTaskBooking(booking);
    setShowTaskModal(true);
  };

  const handleTaskCreated = () => {
    success('Task assigned successfully!');
    // Refresh bookings to update any task counts if needed
    fetchBookings();
  };

  // Journey entry handlers
  const handleJourneyEntryCreated = (entry) => {
    success('Journey entry created successfully!');
    // Optionally refresh bookings if needed
    fetchBookings();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const stats = [
    {
      label: 'Pending',
      count: bookings.filter(b => b.status === 'pending').length,
      color: 'text-yellow-600 bg-yellow-100'
    },
    {
      label: 'Under Review',
      count: bookings.filter(b => b.status === 'under_review').length,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      label: 'Payment Pending',
      count: bookings.filter(b => b.status === 'awaiting_payment').length,
      color: 'text-orange-600 bg-orange-100'
    },
    {
      label: 'Confirmed',
      count: bookings.filter(b => b.status === 'confirmed').length,
      color: 'text-green-600 bg-green-100'
    },
    {
      label: 'Total Bookings',
      count: bookings.length,
      color: 'text-purple-600 bg-purple-100'
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pt-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
          <p className="text-gray-500">Manage your sessions and appointment requests.</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              if (activeTab === 'bookings') fetchBookings();
              else if (activeTab === 'slots') fetchSlots();
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : '🔄'}
            Refresh
          </button>
          <button
            onClick={() => setShowRagModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 shadow-lg shadow-purple-200"
          >
            <Brain size={16} />
            Feed Brain
          </button>
          <div className="flex gap-4">
            {stats.map((stat, i) => (
              <div key={i} className={`px-4 py-2 rounded-xl flex items-center gap-3 ${stat.color}`}>
                <span className="font-bold text-lg">{stat.count}</span>
                <span className="text-xs uppercase font-semibold">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-purple-50 p-1 rounded-2xl mb-8 w-fit">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'bookings' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-primary'
            }`}
        >
          Session Bookings
        </button>
        <button
          onClick={() => setActiveTab('slots')}
          className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'slots' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-primary'
            }`}
        >
          Time Slots
        </button>
        <button
          onClick={() => setActiveTab('corporate')}
          className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'corporate' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-primary'
            }`}
        >
          <Building2 size={16} />
          Corporate Inquiries
        </button>
        <button
          onClick={() => setActiveTab('contacts')}
          className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'contacts' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-primary'
            }`}
        >
          <MessageSquare size={16} />
          Contact Messages
        </button>
        <button
          onClick={() => setActiveTab('reflection-questions')}
          className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'reflection-questions' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-primary'
            }`}
        >
          <Heart size={16} />
          Reflection Questions
        </button>
        <button
          onClick={() => navigate('/resources')}
          className="px-6 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 text-gray-500 hover:text-primary hover:bg-white/50"
        >
          <FileText size={16} />
          Resources
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      <div className="glass-card overflow-hidden">
        {activeTab === 'bookings' ? (
          <div>
            {/* Filter Controls */}
            <div className="p-6 border-b border-purple-100">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Filters:</span>
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="under_review">Under Review</option>
                  <option value="awaiting_payment">Payment Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="rejected">Rejected</option>
                </select>

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showUpcomingOnly}
                    onChange={(e) => setShowUpcomingOnly(e.target.checked)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-gray-700">Upcoming sessions only</span>
                </label>

                <button
                  onClick={fetchBookings}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm"
                  disabled={loading}
                >
                  Apply Filters
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-primary" size={32} />
                <span className="ml-3 text-gray-600">Loading bookings...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-purple-50/50">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-primary uppercase">Client</th>
                      <th className="px-6 py-4 text-xs font-bold text-primary uppercase">Session Details</th>
                      <th className="px-6 py-4 text-xs font-bold text-primary uppercase">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-primary uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-50">
                    {bookings.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-12 text-center text-gray-400">
                          No booking requests yet.
                        </td>
                      </tr>
                    ) : (
                      bookings.map((booking) => (
                        <tr key={booking._id} className="hover:bg-purple-50/20 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-primary">
                                <User size={18} />
                              </div>
                              <div>
                                <p className="font-bold text-sm">{booking.personalInfo?.name}</p>
                                <p className="text-xs text-gray-400 flex items-center gap-1">
                                  <Mail size={12} />
                                  {booking.personalInfo?.email}
                                </p>
                                <p className="text-xs text-gray-400 flex items-center gap-1">
                                  <Phone size={12} />
                                  {booking.personalInfo?.phone}
                                </p>
                                {/* First-time client indicator */}
                                {!booking.userId?.hasConfirmedSession && (
                                  <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                                    First Session
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <p className="text-sm font-medium">
                                {booking.slotId ? formatDate(booking.slotId.date) : 'Date not available'}
                              </p>
                              <p className="text-xs text-secondary">
                                {booking.slotId ? `${formatTime(booking.slotId.startTime)} - ${formatTime(booking.slotId.endTime)}` : 'Time not available'}
                              </p>
                              <p className="text-xs text-gray-500 capitalize flex items-center gap-1">
                                <Heart size={12} />
                                {booking.sessionMode} • {booking.personalInfo?.relationshipStatus}
                              </p>
                              <p className={`text-xs font-medium ${booking.payment?.status === 'completed' ? 'text-green-600' :
                                booking.status === 'awaiting_payment' ? 'text-orange-600' : 'text-gray-500'
                                }`}>
                                ₹{booking.payment?.amount || 'N/A'}
                                {booking.payment?.status === 'completed' && ' (Paid)'}
                                {booking.status === 'awaiting_payment' && ' (Payment Pending)'}
                              </p>
                              {booking.payment?.paymentId && (
                                <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                                  Ref: {booking.payment.paymentId}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${booking.status === 'confirmed' ? 'bg-green-100 text-green-600' :
                              booking.status === 'under_review' ? 'bg-blue-100 text-blue-600' :
                                booking.status === 'awaiting_payment' ? 'bg-orange-100 text-orange-600' :
                                  booking.status === 'rejected' ? 'bg-red-100 text-red-600' :
                                    booking.status === 'cancelled' ? 'bg-gray-100 text-gray-600' :
                                      'bg-yellow-100 text-yellow-600'
                              }`}>
                              {booking.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setRejectionReason(null);
                                }}
                                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                title="View Details"
                              >
                                <Eye size={16} />
                              </button>

                              {(booking.status === 'pending' || booking.status === 'under_review') && (
                                <>
                                  {booking.status === 'pending' && (
                                    <button
                                      onClick={() => handleReviewBooking(booking._id)}
                                      className="p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                                      title="Mark as Under Review"
                                      disabled={loading}
                                    >
                                      <Clock size={16} />
                                    </button>
                                  )}

                                  <button
                                    onClick={() => handleApproveBooking(booking._id)}
                                    className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    title="Approve & Request Payment"
                                    disabled={loading}
                                  >
                                    <Mail size={16} />
                                  </button>

                                  <button
                                    onClick={() => {
                                      setSelectedBooking(booking);
                                      setRejectionReason('');
                                    }}
                                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                    title="Reject Booking"
                                  >
                                    <X size={16} />
                                  </button>
                                </>
                              )}

                              {booking.status === 'awaiting_payment' && (
                                <>
                                  <button
                                    onClick={() => {
                                      setSelectedBooking(booking);
                                      setRejectionReason(null);
                                      setConfirmationData({
                                        confirmedDate: booking.slotId?.date ? new Date(booking.slotId.date).toISOString().split('T')[0] : '',
                                        confirmedTime: booking.slotId?.startTime || '',
                                        meetingLink: booking.sessionMode === 'online' ? 'https://meet.google.com/new' : undefined,
                                        notes: '',
                                        transactionId: ''
                                      });
                                    }}
                                    className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                    title="Mark Payment Received & Confirm"
                                  >
                                    <Check size={16} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedBooking(booking);
                                      setRejectionReason('');
                                    }}
                                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                    title="Reject Booking"
                                  >
                                    <X size={16} />
                                  </button>
                                </>
                              )}

                              {/* Assign Task Button - Available for all bookings */}
                              <button
                                onClick={() => handleAssignTask(booking)}
                                className="p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                                title="Assign Task"
                              >
                                <Plus size={16} />
                              </button>

                              {/* Journey Entry Button - Available for all bookings */}
                              <JourneyEntryButton
                                session={booking}
                                onEntryCreated={handleJourneyEntryCreated}
                                compact={true}
                              />
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : activeTab === 'slots' ? (
          <div className="p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-bold text-primary">Time Slot Management</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Create and manage available appointment slots
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Available: {Array.isArray(availableSlots) ? availableSlots.filter(s => s.isAvailable && !s.bookingId).length : 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    Booked: {Array.isArray(availableSlots) ? availableSlots.filter(s => s.bookingId).length : 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    Blocked: {Array.isArray(availableSlots) ? availableSlots.filter(s => s.isBlocked).length : 0}
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={async () => {
                    try {
                      const result = await slotApi.bulkCleanup();
                      await fetchSlots();
                      setError('');
                      success(`Cleaned up ${result.data?.cleanedCount || 0} expired slots`);
                    } catch (err) {
                      setError('Failed to cleanup slots: ' + err.message);
                      showToast('Failed to cleanup slots: ' + err.message);
                    }
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm"
                >
                  <Trash2 size={16} />
                  Cleanup Expired
                </button>
                <button
                  onClick={() => setShowAddSlotModal(true)}
                  className="btn-primary py-2 px-4 flex items-center gap-2 text-sm"
                >
                  <Plus size={18} />
                  Add Slot
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            {Array.isArray(availableSlots) && availableSlots.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Slots</p>
                      <p className="text-2xl font-bold text-gray-900">{availableSlots.length}</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Clock size={20} className="text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Available</p>
                      <p className="text-2xl font-bold text-green-600">
                        {availableSlots.filter(s => s.isAvailable && !s.bookingId).length}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Booked</p>
                      <p className="text-2xl font-bold text-red-600">
                        {availableSlots.filter(s => s.bookingId).length}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">This Week</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {availableSlots.filter(s => {
                          const slotDate = new Date(s.date);
                          const now = new Date();
                          const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                          return slotDate >= now && slotDate <= weekFromNow;
                        }).length}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Calendar size={20} className="text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Slots Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.isArray(availableSlots) && availableSlots
                .sort((a, b) => {
                  const dateA = new Date(a.date);
                  const dateB = new Date(b.date);
                  if (dateA.getTime() !== dateB.getTime()) {
                    return dateA - dateB;
                  }
                  return a.startTime.localeCompare(b.startTime);
                })
                .map((slot) => {
                  const slotDateTime = new Date(slot.date);
                  const [hours, minutes] = slot.startTime.split(':');
                  slotDateTime.setHours(parseInt(hours), parseInt(minutes));
                  const now = new Date();
                  const isExpired = slotDateTime < now;

                  let statusColor = 'green';
                  let statusText = 'Available';

                  if (isExpired) {
                    statusColor = 'gray';
                    statusText = 'Expired';
                  } else if (slot.bookingId) {
                    statusColor = 'red';
                    statusText = 'Booked';
                  } else if (slot.isBlocked) {
                    statusColor = 'yellow';
                    statusText = 'Blocked';
                  } else if (!slot.isAvailable) {
                    statusColor = 'gray';
                    statusText = 'Unavailable';
                  }

                  return (
                    <div key={slot._id} className={`p-4 rounded-xl border group hover:shadow-md transition-all ${isExpired ? 'border-gray-200 bg-gray-50' :
                      slot.bookingId ? 'border-red-200 bg-red-50' :
                        slot.isBlocked ? 'border-yellow-200 bg-yellow-50' :
                          'border-green-200 bg-green-50'
                      }`}>
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-bold text-gray-800">{slot.startTime} - {slot.endTime}</p>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColor === 'green' ? 'bg-green-100 text-green-700' :
                              statusColor === 'red' ? 'bg-red-100 text-red-700' :
                                statusColor === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-gray-100 text-gray-700'
                              }`}>
                              {statusText}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{formatDate(slot.date)}</p>
                          <div className="space-y-1">
                            <p className="text-xs text-gray-500">
                              💰 Online: ₹{slot.pricing?.online} | Offline: ₹{slot.pricing?.offline}
                            </p>
                            <div className="flex gap-1">
                              {slot.availableModes?.map(mode => (
                                <span key={mode} className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full">
                                  {mode === 'online' ? '💻' : '🏢'} {mode}
                                </span>
                              ))}
                            </div>
                            {slot.blockReason && (
                              <p className="text-[10px] text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                                {slot.blockReason}
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteSlot(slot._id)}
                          className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                          disabled={!!slot.bookingId}
                          title={slot.bookingId ? "Cannot delete booked slot" : "Delete slot"}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              {(!Array.isArray(availableSlots) || availableSlots.length === 0) && (
                <div className="col-span-full text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock size={24} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Time Slots</h3>
                  <p className="text-gray-500 mb-6">
                    Create your first time slot to start accepting bookings.
                  </p>
                  <button
                    onClick={() => setShowAddSlotModal(true)}
                    className="btn-primary py-2 px-4 flex items-center gap-2 mx-auto"
                  >
                    <Plus size={18} />
                    Create First Slot
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'corporate' ? (
          <CorporateInquiries />
        ) : activeTab === 'contacts' ? (
          <ContactMessages />
        ) : activeTab === 'reflection-questions' ? (
          <ReflectionQuestions />
        ) : null}
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && rejectionReason === null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Booking Details</h3>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Client Information */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <h4 className="font-semibold mb-3">Client Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <p className="font-medium">{selectedBooking.personalInfo?.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <p className="font-medium">{selectedBooking.personalInfo?.email}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Phone:</span>
                    <p className="font-medium">{selectedBooking.personalInfo?.phone}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Relationship Status:</span>
                    <p className="font-medium capitalize">{selectedBooking.personalInfo?.relationshipStatus}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Number of People:</span>
                    <p className="font-medium">{selectedBooking.personalInfo?.numberOfPeople}</p>
                  </div>
                </div>
              </div>

              {/* Reflection Summary (First Session Only) */}
              {!selectedBooking.userId?.hasConfirmedSession && selectedBooking.userId?.reflectionCompleted && (
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <h4 className="font-semibold mb-3 text-blue-800 flex items-center gap-2">
                    <Heart size={16} />
                    Reflection Summary (First Session Only)
                  </h4>
                  <div className="text-sm text-blue-700">
                    <p className="mb-2">
                      {selectedBooking.userId?.reflectionSummary || 'Reflection submitted but no AI summary available.'}
                    </p>
                    <button
                      onClick={() => {
                        // TODO: Implement view reflection responses modal
                        alert('View Reflection Responses - To be implemented');
                      }}
                      className="mt-3 px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-xs hover:bg-blue-200 transition-colors"
                    >
                      View Reflection Responses
                    </button>
                  </div>
                </div>
              )}

              {/* Session Content */}
              <div className="bg-blue-50 p-4 rounded-xl">
                <h4 className="font-semibold mb-3">Session Content</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-600">Topics to Discuss:</span>
                    <p className="mt-1 p-2 bg-white rounded border">{selectedBooking.sessionContent?.topics}</p>
                  </div>
                  {selectedBooking.sessionContent?.concerns && (
                    <div>
                      <span className="text-gray-600">Concerns:</span>
                      <p className="mt-1 p-2 bg-white rounded border">{selectedBooking.sessionContent.concerns}</p>
                    </div>
                  )}
                  {selectedBooking.sessionContent?.goals && (
                    <div>
                      <span className="text-gray-600">Goals:</span>
                      <p className="mt-1 p-2 bg-white rounded border">{selectedBooking.sessionContent.goals}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Session Details */}
              <div className="bg-purple-50 p-4 rounded-xl">
                <h4 className="font-semibold mb-3">Session Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Date:</span>
                    <p className="font-medium">{selectedBooking.slotId ? formatDate(selectedBooking.slotId.date) : 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Time:</span>
                    <p className="font-medium">
                      {selectedBooking.slotId ? `${formatTime(selectedBooking.slotId.startTime)} - ${formatTime(selectedBooking.slotId.endTime)}` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Mode:</span>
                    <p className="font-medium capitalize">{selectedBooking.sessionMode}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Amount:</span>
                    <p className="font-medium text-green-600">₹{selectedBooking.payment?.amount}</p>
                  </div>
                  {selectedBooking.payment?.paymentId && (
                    <div className="md:col-span-2 bg-gray-50 p-2 rounded border border-gray-200">
                      <span className="text-xs text-gray-500 block">Transaction ID / Reference:</span>
                      <p className="font-mono text-sm font-medium">{selectedBooking.payment.paymentId}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Confirmation Form (for pending, under_review, OR awaiting_payment bookings) */}
              {(selectedBooking.status === 'awaiting_payment' || selectedBooking.status === 'pending' || selectedBooking.status === 'under_review') && (
                <div className="bg-green-50 p-4 rounded-xl">
                  <h4 className="font-semibold mb-3">Confirm Booking</h4>
                  <div className="bg-blue-50 p-3 rounded-lg mb-4 text-sm text-blue-700">
                    <p><strong>Default:</strong> Booking will be confirmed with original slot time.</p>
                    <p><strong>Optional:</strong> You can modify the date/time below if needed.</p>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Transaction ID <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={confirmationData.transactionId || ''}
                          onChange={(e) => setConfirmationData({ ...confirmationData, transactionId: e.target.value })}
                          placeholder="Enter payment transaction ID / Reference No."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white shadow-sm"
                          required
                          autoFocus
                        />
                        <p className="text-xs text-gray-500 mt-1">Enter the ID to enable the Submit button.</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Confirmed Date <span className="text-gray-400">(Optional)</span>
                        </label>
                        <input
                          type="date"
                          value={confirmationData.confirmedDate}
                          onChange={(e) => setConfirmationData({ ...confirmationData, confirmedDate: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Confirmed Time <span className="text-gray-400">(Optional)</span>
                        </label>
                        <input
                          type="time"
                          value={confirmationData.confirmedTime}
                          onChange={(e) => setConfirmationData({ ...confirmationData, confirmedTime: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                    </div>

                    {selectedBooking.sessionMode === 'online' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Google Meet Link <span className="text-red-500">*</span>
                        </label>
                        <div className="space-y-2">
                          <input
                            type="url"
                            value={confirmationData.meetingLink}
                            onChange={(e) => setConfirmationData({ ...confirmationData, meetingLink: e.target.value })}
                            placeholder="https://meet.google.com/..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            required
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setConfirmationData({ ...confirmationData, meetingLink: 'https://meet.google.com/new' })}
                              className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                            >
                              Generate New Meet
                            </button>
                            <span className="text-xs text-gray-500 flex items-center">
                              💡 Click "Generate New Meet" for a fresh Google Meet room
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                      <textarea
                        value={confirmationData.notes}
                        onChange={(e) => setConfirmationData({ ...confirmationData, notes: e.target.value })}
                        placeholder="Any additional notes for the client..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent h-20"
                      />
                    </div>

                    <div className="bg-yellow-50 p-3 rounded-lg text-sm text-yellow-700">
                      <p><strong>Note:</strong> Confirming this booking will permanently mark the original time slot as "booked" and remove it from availability.</p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleConfirmBooking(selectedBooking._id)}
                        disabled={loading || !confirmationData.transactionId}
                        className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium shadow-sm transition-colors"
                      >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                        Submit & Send Confirmation Email
                      </button>
                      <button
                        onClick={() => setSelectedBooking(null)}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Confirmed Details (for confirmed bookings) */}
              {selectedBooking.status === 'confirmed' && selectedBooking.adminResponse && (
                <div className="bg-green-50 p-4 rounded-xl">
                  <h4 className="font-semibold mb-3">Confirmation Details</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Confirmed Date:</span>
                      <p className="font-medium">{formatDate(selectedBooking.adminResponse.confirmedDate)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Confirmed Time:</span>
                      <p className="font-medium">{formatTime(selectedBooking.adminResponse.confirmedTime)}</p>
                    </div>
                    {selectedBooking.adminResponse.meetingLink && (
                      <div>
                        <span className="text-gray-600">Meeting Link:</span>
                        <p className="font-medium">
                          <a href={selectedBooking.adminResponse.meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {selectedBooking.adminResponse.meetingLink}
                          </a>
                        </p>
                      </div>
                    )}
                    {selectedBooking.adminResponse.notes && (
                      <div>
                        <span className="text-gray-600">Admin Notes:</span>
                        <p className="font-medium">{selectedBooking.adminResponse.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tasks Section */}
              <div className="border-t border-gray-200 pt-6">
                <BookingTasks
                  bookingId={selectedBooking._id}
                  onTasksChange={() => {
                    // Optionally refresh booking data if needed
                  }}
                />
              </div>

              {/* Journey Entries Section */}
              <div className="border-t border-gray-200 pt-6">
                <UserJourneyEntries
                  userId={selectedBooking.userId}
                  userName={selectedBooking.personalInfo?.name}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {selectedBooking && ['pending', 'under_review'].includes(selectedBooking.status) && rejectionReason !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-red-600">Reject Booking</h3>
                <button
                  onClick={() => {
                    setSelectedBooking(null);
                    setRejectionReason('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-red-50 p-4 rounded-xl mb-4">
                <p className="text-red-800 text-sm">
                  <strong>Warning:</strong> Rejecting this booking will permanently delete it from the database and make the slot available again.
                </p>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Client:</strong> {selectedBooking.personalInfo?.name}
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  <strong>Session:</strong> {selectedBooking.slotId ? formatDate(selectedBooking.slotId.date) : 'N/A'} at {selectedBooking.slotId ? formatTime(selectedBooking.slotId.startTime) : 'N/A'}
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please provide a reason for rejection (this will be sent to the client)..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent h-24 resize-none"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleRejectBooking(selectedBooking._id)}
                  disabled={loading || !rejectionReason.trim()}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Rejecting...' : 'Reject Booking'}
                </button>
                <button
                  onClick={() => {
                    setSelectedBooking(null);
                    setRejectionReason('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Slot Modal */}
      <AddSlotModal
        isOpen={showAddSlotModal}
        onClose={() => setShowAddSlotModal(false)}
        onSlotAdded={handleSlotAdded}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Task Assignment Modal */}
      <TaskAssignmentModal
        booking={taskBooking}
        isOpen={showTaskModal}
        onClose={() => {
          setShowTaskModal(false);
          setTaskBooking(null);
        }}
        onTaskCreated={handleTaskCreated}
      />

      <RAGUploadModal isOpen={showRagModal} onClose={() => setShowRagModal(false)} />
    </div>
  );
};

export default AdminDashboard;
