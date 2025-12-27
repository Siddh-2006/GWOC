import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Clock, User, Filter, Plus, Calendar, Loader2, Building2, MessageSquare, Eye, Mail, Phone, Heart, Image, BookOpen, Trash2 } from 'lucide-react';
import { useBookingStore } from '../../store/useBookingStore';
import { bookingApi } from '../booking/booking.api';
import { slotApi } from '../../services/slot.api';
import { CorporateInquiries } from '../../components/admin/CorporateInquiries';
import ContactMessages from '../../components/admin/ContactMessages';
import AddSlotModal from '../../components/admin/AddSlotModal';

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
    meetingLink: '',
    notes: ''
  });
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await bookingApi.admin.getAllBookings();
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
    }
  }, [activeTab]);

  const handleConfirmBooking = async (bookingId) => {
    try {
      setLoading(true);
      await bookingApi.admin.confirmBooking(bookingId, confirmationData);
      
      // Refresh the bookings list
      await fetchBookings();
      
      // Close the modal and reset form
      setSelectedBooking(null);
      setConfirmationData({
        confirmedDate: '',
        confirmedTime: '',
        meetingLink: '',
        notes: ''
      });
      
    } catch (err) {
      setError('Failed to confirm booking: ' + err.message);
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
    <div className="max-w-7xl mx-auto px-4 py-8">
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
          onClick={() => setActiveTab('media')}
          className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'media' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-primary'
            }`}
        >
          <Image size={16} />
          Media & Resources
        </button>
        <button
          onClick={() => setActiveTab('psycho-education')}
          className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'psycho-education' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-primary'
            }`}
        >
          <BookOpen size={16} />
          Psycho-Education
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
                              booking.status === 'cancelled' ? 'bg-red-100 text-red-600' : 
                              'bg-yellow-100 text-yellow-600'
                            }`}>
                              {booking.status}
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
                                <button
                                  onClick={() => {
                                    setSelectedBooking(booking);
                                    setConfirmationData({
                                      confirmedDate: booking.slotId?.date || '',
                                      confirmedTime: booking.slotId?.startTime || '',
                                      meetingLink: booking.sessionMode === 'online' ? '' : undefined,
                                      notes: ''
                                    });
                                  }}
                                  className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                  title="Confirm Booking"
                                >
                                  <Check size={16} />
                                </button>
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
        ) : activeTab === 'corporate' ? (
          <CorporateInquiries />
        ) : activeTab === 'contacts' ? (
          <ContactMessages />
        ) : activeTab === 'media' ? (
          <div className="p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold">Media & Resources Management</h3>
              <button className="btn-primary py-2 px-4 flex items-center gap-2 text-sm">
                <Plus size={18} />
                Add Media
              </button>
            </div>
            <div className="text-center py-12 text-gray-400">
              Media management coming soon...
            </div>
          </div>
        ) : activeTab === 'psycho-education' ? (
          <div className="p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold">Psycho-Education Content</h3>
              <button className="btn-primary py-2 px-4 flex items-center gap-2 text-sm">
                <Plus size={18} />
                Add Content
              </button>
            </div>
            <div className="text-center py-12 text-gray-400">
              Psycho-education management coming soon...
            </div>
          </div>
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
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirmed Date</label>
                        <input
                          type="date"
                          value={confirmationData.confirmedDate ? new Date(confirmationData.confirmedDate).toISOString().split('T')[0] : ''}
                          onChange={(e) => setConfirmationData({...confirmationData, confirmedDate: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirmed Time</label>
                        <input
                          type="time"
                          value={confirmationData.confirmedTime}
                          onChange={(e) => setConfirmationData({...confirmationData, confirmedTime: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    {selectedBooking.sessionMode === 'online' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Link</label>
                        <input
                          type="url"
                          value={confirmationData.meetingLink}
                          onChange={(e) => setConfirmationData({...confirmationData, meetingLink: e.target.value})}
                          placeholder="https://meet.google.com/..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
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
