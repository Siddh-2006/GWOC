import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Clock, User, Filter, Plus, Calendar, Loader2, Building2, MessageSquare, Eye, Mail, Phone, Heart, Image, BookOpen, Trash2 } from 'lucide-react';
import { useBookingStore } from '../../store/useBookingStore';
import { bookingApi } from '../booking/booking.api';
import { slotApi } from '../../services/slot.api';
import { CorporateInquiries } from '../../components/admin/CorporateInquiries';
import ContactMessages from '../../components/admin/ContactMessages';
import AddSlotModal from '../../components/admin/AddSlotModal';
import ReflectionQuestions from '../../components/admin/ReflectionQuestions';

const AdminDashboard = () => {
  const {
    appointments,
    availableSlots,
    updateAppointmentStatus,
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
    notes: ''
  });
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);
  const [reflectionSummaries, setReflectionSummaries] = useState([]);
  const [loadingReflections, setLoadingReflections] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showUpcomingOnly, setShowUpcomingOnly] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

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
      setAvailableSlots(response.data || []);
    } catch (err) {
      console.error('Fetch slots error:', err);
    }
  };

  const fetchReflectionSummaries = async () => {
    setLoadingReflections(true);
    try {
      const response = await fetch('http://localhost:3001/api/reflection/admin/all', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setReflectionSummaries(data.data || []);
      } else {
        console.error('Failed to fetch reflection summaries:', data.message);
      }
    } catch (err) {
      console.error('Fetch reflection summaries error:', err);
    } finally {
      setLoadingReflections(false);
    }
  };

  const handleSlotAdded = (newSlot) => {
    setAvailableSlots(prev => [...prev, newSlot]);
  };

  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm('Are you sure you want to delete this slot?')) return;
    
    try {
      await slotApi.deleteSlot(slotId);
      setAvailableSlots(prev => prev.filter(slot => slot._id !== slotId));
    } catch (err) {
      setError('Failed to delete slot: ' + err.message);
    }
  };

  useEffect(() => {
    if (activeTab === 'bookings') {
      fetchBookings();
    } else if (activeTab === 'slots') {
      fetchSlots();
    } else if (activeTab === 'reflections') {
      fetchReflectionSummaries();
    }
  }, [activeTab]);

  const handleConfirmBooking = async (bookingId) => {
    try {
      setLoading(true);
      await bookingApi.admin.confirmBooking(bookingId, confirmationData);
      
      // Mark user as having confirmed session (for reflection eligibility)
      if (selectedBooking?.userId) {
        try {
          await fetch(`http://localhost:3001/api/auth/users/${selectedBooking.userId}/mark-confirmed-session`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
              'Content-Type': 'application/json'
            }
          });
        } catch (error) {
          console.error('Failed to update user session status:', error);
          // Don't fail the booking confirmation for this
        }
      }
      
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
      setRejectionReason('');
    } catch (err) {
      setError('Failed to reject booking: ' + err.message);
    } finally {
      setLoading(false);
    }
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
          onClick={() => setActiveTab('reflections')}
          className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'reflections' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-primary'
            }`}
        >
          <Heart size={16} />
          Reflection Summaries
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
                              <p className="text-xs text-green-600 font-medium">
                                ₹{booking.payment?.amount || 'N/A'}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              booking.status === 'confirmed' ? 'bg-green-100 text-green-600' :
                              booking.status === 'under_review' ? 'bg-blue-100 text-blue-600' :
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
                                onClick={() => setSelectedBooking(booking)}
                                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                title="View Details"
                              >
                                <Eye size={16} />
                              </button>
                              
                              {booking.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleReviewBooking(booking._id)}
                                    className="p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                                    title="Mark as Under Review"
                                    disabled={loading}
                                  >
                                    <Clock size={16} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedBooking(booking);
                                      // Pre-fill with original slot time (admin can change if needed)
                                      setConfirmationData({
                                        confirmedDate: booking.slotId?.date ? new Date(booking.slotId.date).toISOString().split('T')[0] : '',
                                        confirmedTime: booking.slotId?.startTime || '',
                                        meetingLink: booking.sessionMode === 'online' ? 'https://meet.google.com/new' : undefined,
                                        notes: ''
                                      });
                                    }}
                                    className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                    title="Confirm Booking"
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
                              
                              {booking.status === 'under_review' && (
                                <>
                                  <button
                                    onClick={() => {
                                      setSelectedBooking(booking);
                                      // Pre-fill with original slot time (admin can change if needed)
                                      setConfirmationData({
                                        confirmedDate: booking.slotId?.date ? new Date(booking.slotId.date).toISOString().split('T')[0] : '',
                                        confirmedTime: booking.slotId?.startTime || '',
                                        meetingLink: booking.sessionMode === 'online' ? 'https://meet.google.com/new' : undefined,
                                        notes: ''
                                      });
                                    }}
                                    className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                    title="Confirm Booking"
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
              <h3 className="text-xl font-bold">Manage Available Slots</h3>
              <button 
                onClick={() => setShowAddSlotModal(true)}
                className="btn-primary py-2 px-4 flex items-center gap-2 text-sm"
              >
                <Plus size={18} />
                Add Slot
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {availableSlots.map((slot) => (
                <div key={slot._id} className="p-4 rounded-2xl border border-purple-100 group hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="font-bold text-primary">{slot.startTime} - {slot.endTime}</p>
                      <p className="text-xs text-gray-400">{formatDate(slot.date)}</p>
                      <p className="text-xs text-green-600">₹{slot.pricing?.online} - ₹{slot.pricing?.offline}</p>
                      <div className="flex gap-1 mt-1">
                        {slot.availableModes?.map(mode => (
                          <span key={mode} className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full">
                            {mode}
                          </span>
                        ))}
                      </div>
                      {slot.isAvailable ? (
                        <span className="text-[10px] px-2 py-0.5 bg-green-100 text-green-600 rounded-full">Available</span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 bg-red-100 text-red-600 rounded-full">Booked</span>
                      )}
                    </div>
                    <button 
                      onClick={() => handleDeleteSlot(slot._id)}
                      className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={!slot.isAvailable}
                      title={slot.isAvailable ? "Delete slot" : "Cannot delete booked slot"}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {availableSlots.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-400">
                  No slots available. Click "Add Slot" to create your first time slot.
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'reflections' ? (
          <div className="p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Reflection Summaries</h2>
              <div className="text-sm text-gray-500">
                AI-generated summaries to help prepare for sessions
              </div>
            </div>
            
            {/* Disclaimer */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-amber-600 text-sm font-bold">!</span>
                </div>
                <div>
                  <h4 className="font-semibold text-amber-800 mb-2">Important Disclaimer</h4>
                  <p className="text-amber-700 text-sm leading-relaxed">
                    These AI-generated summaries are for preparation purposes only. They do not replace professional judgment, 
                    diagnosis, or therapeutic assessment. Always rely on your clinical expertise and direct client interaction 
                    for all therapeutic decisions.
                  </p>
                </div>
              </div>
            </div>

            {/* Reflection Summaries List */}
            <div className="space-y-4">
              {loadingReflections ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="animate-spin text-primary" size={32} />
                  <span className="ml-3 text-gray-500">Loading reflection summaries...</span>
                </div>
              ) : reflectionSummaries.length > 0 ? (
                <div className="space-y-4">
                  {reflectionSummaries.map((session) => (
                    <div key={session._id} className="bg-white border border-gray-200 rounded-xl p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {session.userId?.firstName} {session.userId?.lastName}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {session.userId?.email}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Session: {new Date(session.startedAt).toLocaleDateString()} at {new Date(session.startedAt).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            session.status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : session.status === 'active'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {session.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            {session.responses?.length || 0} responses
                          </span>
                        </div>
                      </div>
                      
                      {session.aiSummary ? (
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium text-gray-800 mb-2">Summary</h4>
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                              {session.aiSummary.summary}
                            </p>
                          </div>
                          
                          {session.aiSummary.keyThemes && session.aiSummary.keyThemes.length > 0 && (
                            <div>
                              <h4 className="font-medium text-gray-800 mb-2">Key Themes</h4>
                              <div className="flex flex-wrap gap-2">
                                {session.aiSummary.keyThemes.map((theme, index) => (
                                  <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                                    {theme}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {session.aiSummary.possibleApproaches && session.aiSummary.possibleApproaches.length > 0 && (
                            <div>
                              <h4 className="font-medium text-gray-800 mb-2">Possible Therapeutic Approaches</h4>
                              <div className="flex flex-wrap gap-2">
                                {session.aiSummary.possibleApproaches.map((approach, index) => (
                                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                    {approach}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {session.aiSummary.suggestedQuestions && session.aiSummary.suggestedQuestions.length > 0 && (
                            <div>
                              <h4 className="font-medium text-gray-800 mb-2">Suggested Opening Questions</h4>
                              <ul className="text-sm text-gray-600 space-y-1">
                                {session.aiSummary.suggestedQuestions.map((question, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <span className="text-gray-400 mt-1">•</span>
                                    <span>"{question}"</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          <p className="text-sm">No summary generated yet</p>
                          {session.status === 'active' && (
                            <p className="text-xs mt-1">Session is still in progress</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Heart size={48} className="mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">No Reflection Summaries Yet</h3>
                  <p className="mb-4">
                    When clients complete pre-session reflections, their summaries will appear here to help you prepare for sessions.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 max-w-md mx-auto">
                    <p className="text-sm text-blue-800">
                      Summaries are automatically generated when clients complete their reflection sessions and include neutral themes, 
                      possible therapeutic approaches, and suggested opening questions.
                    </p>
                  </div>
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
      {selectedBooking && (
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
              {!selectedBooking.userId?.hasConfirmedSession && (
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <h4 className="font-semibold mb-3 text-blue-800 flex items-center gap-2">
                    <Heart size={16} />
                    Reflection Summary (First Session Only)
                  </h4>
                  <div className="text-sm text-blue-700">
                    <p className="mb-2">
                      Based on the client's responses, the individual appears to have moderate emotional awareness and tends to process stress internally. 
                      They show openness to reflection, though adaptability to change may take time.
                    </p>
                    <p>
                      Interpersonally, they value understanding and emotional connection, suggesting that rapport-building may be important early in the session.
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
                </div>
              </div>

              {/* Confirmation Form (for pending bookings) */}
              {selectedBooking.status === 'pending' && (
                <div className="bg-green-50 p-4 rounded-xl">
                  <h4 className="font-semibold mb-3">Confirm Booking</h4>
                  <div className="bg-blue-50 p-3 rounded-lg mb-4 text-sm text-blue-700">
                    <p><strong>Default:</strong> Booking will be confirmed with original slot time.</p>
                    <p><strong>Optional:</strong> You can modify the date/time below if needed.</p>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Confirmed Date <span className="text-gray-400">(Optional - defaults to original)</span>
                        </label>
                        <input
                          type="date"
                          value={confirmationData.confirmedDate}
                          onChange={(e) => setConfirmationData({...confirmationData, confirmedDate: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="Leave empty to use original date"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Original: {selectedBooking.slotId ? formatDate(selectedBooking.slotId.date) : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Confirmed Time <span className="text-gray-400">(Optional - defaults to original)</span>
                        </label>
                        <input
                          type="time"
                          value={confirmationData.confirmedTime}
                          onChange={(e) => setConfirmationData({...confirmationData, confirmedTime: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="Leave empty to use original time"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Original: {selectedBooking.slotId ? `${formatTime(selectedBooking.slotId.startTime)} - ${formatTime(selectedBooking.slotId.endTime)}` : 'N/A'}
                        </p>
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
                            onChange={(e) => setConfirmationData({...confirmationData, meetingLink: e.target.value})}
                            placeholder="https://meet.google.com/..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            required
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setConfirmationData({...confirmationData, meetingLink: 'https://meet.google.com/new'})}
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
                        onChange={(e) => setConfirmationData({...confirmationData, notes: e.target.value})}
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
                        disabled={loading}
                        className="btn-primary flex items-center gap-2 disabled:opacity-50"
                      >
                        {loading ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                        Confirm Booking
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
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {selectedBooking && selectedBooking.status === 'pending' && rejectionReason !== null && (
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
    </div>
  );
};

export default AdminDashboard;
