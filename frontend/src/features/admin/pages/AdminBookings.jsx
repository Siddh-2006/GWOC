import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Mail,
  Phone,
  User,
  Heart,
  Eye,
  Clock,
  Check,
  X,
  Loader2,
  Plus
} from 'lucide-react';
import { bookingApi } from '../../booking/booking.api';
import { Link } from 'react-router-dom';
import { useToast } from '../../../hooks/useToast';
import JourneyEntryButton from '../../../components/admin/JourneyEntryButton';
import TaskAssignmentModal from '../../../components/admin/TaskAssignmentModal';
import UserJourneyEntries from '../../../components/admin/UserJourneyEntries';
import BookingTasks from '../../../components/admin/BookingTasks';

const AdminBookings = () => {
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showUpcomingOnly, setShowUpcomingOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [confirmationData, setConfirmationData] = useState({
    confirmedDate: '',
    confirmedTime: '',
    meetingLink: 'https://meet.google.com/new',
    notes: '',
    transactionId: ''
  });

  const { success, error } = useToast();

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await bookingApi.admin.getAllBookings({
        status: statusFilter,
        upcoming: showUpcomingOnly
      });
      setBookings(response.data || []);
    } catch (err) {
      error('Failed to fetch bookings: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter, showUpcomingOnly]);

  const filteredBookings = bookings.filter(booking => {
    const searchLower = searchTerm.toLowerCase();
    return (
      booking.personalInfo?.name?.toLowerCase().includes(searchLower) ||
      booking.personalInfo?.email?.toLowerCase().includes(searchLower) ||
      booking.personalInfo?.phone?.includes(searchTerm)
    );
  });

  const handleApprove = async (id) => {
    try {
      setLoading(true);
      await bookingApi.admin.approveBooking(id);
      success('Booking approved and payment request sent!');
      fetchBookings();
    } catch (err) {
      error('Approval failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id) => {
    try {
      setLoading(true);
      await bookingApi.admin.reviewBooking(id);
      success('Booking marked as under review');
      fetchBookings();
    } catch (err) {
      error('Review failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedBooking) return;
    try {
      setLoading(true);
      await bookingApi.admin.confirmBooking(selectedBooking._id, confirmationData);
      success('Booking confirmed successfully!');
      setSelectedBooking(null);
      fetchBookings();
    } catch (err) {
      error('Confirmation failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedBooking || !rejectionReason.trim()) {
      error('Please provide a rejection reason');
      return;
    }
    if (!window.confirm('Are you sure you want to reject this booking? This will permanently delete it.')) return;

    try {
      setLoading(true);
      await bookingApi.admin.rejectBooking(selectedBooking._id, rejectionReason);
      success('Booking rejected and removed');
      setSelectedBooking(null);
      setIsRejecting(false);
      setRejectionReason('');
      fetchBookings();
    } catch (err) {
      error('Rejection failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    try {
      return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return timeString;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Session Bookings</h1>
          <p className="text-sm text-gray-500">Manage and respond to client appointment requests.</p>
        </div>
        <button
          onClick={fetchBookings}
          className="p-2.5 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow text-primary"
          disabled={loading}
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Clock size={20} />}
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by client name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-off-white border-transparent focus:bg-white focus:border-secondary transition-all outline-none text-sm"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 rounded-xl bg-off-white border-transparent focus:bg-white focus:border-secondary transition-all outline-none text-sm font-medium"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="under_review">Under Review</option>
          <option value="awaiting_payment">Payment Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="rejected">Rejected</option>
        </select>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showUpcomingOnly}
            onChange={(e) => setShowUpcomingOnly(e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-secondary focus:ring-secondary"
          />
          <span className="text-sm font-medium text-gray-600">Upcoming Only</span>
        </label>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {loading && bookings.length === 0 ? (
          <div className="p-20 flex flex-col items-center justify-center text-gray-400 gap-3">
            <Loader2 className="animate-spin text-secondary" size={40} />
            <p className="font-medium">Fetching bookings...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-off-white/50 border-b border-gray-50">
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Client</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Session</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mode/Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-20 text-center text-gray-400">
                      No bookings found for the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => (
                    <tr key={booking._id} className="hover:bg-off-white/30 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-lavender flex items-center justify-center text-primary font-bold text-sm">
                            {booking.personalInfo?.name?.[0] || 'U'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <Link
                                to={`/admin/user/${booking.userId?._id || booking.userId}`}
                                className="font-bold text-primary text-sm hover:text-secondary transition-colors"
                              >
                                {booking.personalInfo?.name}
                              </Link>
                              {(!booking.userId?.hasConfirmedSession && booking.status !== 'confirmed') && (
                                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-600 text-[9px] font-bold rounded uppercase">First</span>
                              )}
                            </div>
                            <div className="flex flex-col gap-0.5 mt-0.5">
                              <span className="text-[11px] text-gray-400 flex items-center gap-1">
                                <Mail size={10} /> {booking.personalInfo?.email}
                              </span>
                              <span className="text-[11px] text-gray-400 flex items-center gap-1">
                                <Phone size={10} /> {booking.personalInfo?.phone}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div>
                          <p className="text-sm font-bold text-primary">
                            {booking.slotId ? formatDate(booking.slotId.date) : 'Flexible'}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {booking.slotId ? `${formatTime(booking.slotId.startTime)} - ${formatTime(booking.slotId.endTime)}` : 'Contact for timing'}
                          </p>
                          <p className="text-[11px] font-bold text-secondary mt-1">₹{booking.payment?.amount || '0'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${booking.status === 'confirmed' ? 'bg-green-100 text-green-600' :
                              booking.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                                booking.status === 'awaiting_payment' ? 'bg-orange-100 text-orange-600' :
                                  booking.status === 'under_review' ? 'bg-blue-100 text-blue-600' :
                                    'bg-gray-100 text-gray-600'
                              }`}>
                              {booking.status.replace('_', ' ')}
                            </span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase">{booking.sessionMode}</span>
                          </div>
                          <p className="text-[10px] text-gray-400 flex items-center gap-1">
                            <Heart size={10} className="text-secondary" /> {booking.personalInfo?.relationshipStatus}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-1.5 shrink-0">
                          <button
                            onClick={() => setSelectedBooking(booking)}
                            className="p-2 rounded-lg bg-off-white text-gray-400 hover:text-primary transition-colors hover:shadow-sm"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>

                          {booking.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleReview(booking._id)}
                                className="p-2 rounded-lg bg-orange-100 text-orange-600 hover:bg-orange-500 hover:text-white transition-all shadow-sm shadow-orange-100"
                                title="Mark Under Review"
                              >
                                <Clock size={16} />
                              </button>
                              <button
                                onClick={() => handleApprove(booking._id)}
                                className="p-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors shadow-sm shadow-green-200"
                                title="Approve & Request Payment"
                              >
                                <Check size={16} />
                              </button>
                            </>
                          )}

                          {booking.status === 'under_review' && (
                            <button
                              onClick={() => handleApprove(booking._id)}
                              className="p-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors shadow-sm shadow-green-200"
                              title="Approve & Request Payment"
                            >
                              <Check size={16} />
                            </button>
                          )}

                          {booking.status === 'awaiting_payment' && (
                            <button
                              onClick={() => {
                                setSelectedBooking(booking);
                                setConfirmationData({
                                  confirmedDate: booking.slotId?.date ? new Date(booking.slotId.date).toISOString().split('T')[0] : '',
                                  confirmedTime: booking.slotId?.startTime || '',
                                  meetingLink: booking.sessionMode === 'online' ? 'https://meet.google.com/new' : '',
                                  notes: '',
                                  transactionId: ''
                                });
                              }}
                              className="p-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors shadow-sm shadow-green-200"
                              title="Confirm Payment & Session"
                            >
                              <Check size={16} />
                            </button>
                          )}

                          {(booking.status === 'pending' || booking.status === 'under_review' || booking.status === 'awaiting_payment') && (
                            <button
                              onClick={() => {
                                setSelectedBooking(booking);
                                setIsRejecting(true);
                              }}
                              className="p-2 rounded-lg bg-red-100 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                              title="Reject Booking"
                            >
                              <X size={16} />
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setSelectedBooking(booking);
                              setShowTaskModal(true);
                            }}
                            className="p-2 rounded-lg bg-secondary text-white hover:bg-secondary/90 transition-colors shadow-sm shadow-secondary/20"
                            title="Assign Task"
                          >
                            <Plus size={16} />
                          </button>

                          <JourneyEntryButton
                            session={booking}
                            compact={true}
                            onEntryCreated={() => success('Journey entry added!')}
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

      {/* Booking Details Modal */}
      {selectedBooking && !showTaskModal && !isRejecting && selectedBooking.status !== 'awaiting_payment' && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-off-white/50">
              <h3 className="text-xl font-bold text-primary">Booking Details</h3>
              <button onClick={() => setSelectedBooking(null)} className="p-2 hover:bg-white rounded-xl transition-colors text-gray-400">
                <X size={20} />
              </button>
            </div>
            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Client Info & Meta */}
                <div className="space-y-8">
                  {/* Client Info Grid */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Client Information</p>
                      <div className="space-y-1">
                        <p className="font-bold text-primary">{selectedBooking.personalInfo?.name}</p>
                        <p className="text-sm text-gray-500">{selectedBooking.personalInfo?.email}</p>
                        <p className="text-sm text-gray-500">{selectedBooking.personalInfo?.phone}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Background</p>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600"><span className="font-bold">Status:</span> {selectedBooking.personalInfo?.relationshipStatus}</p>
                        <p className="text-sm text-gray-600"><span className="font-bold">Gender:</span> {selectedBooking.personalInfo?.gender}</p>
                        <p className="text-sm text-gray-600"><span className="font-bold">Age:</span> {selectedBooking.personalInfo?.age}</p>
                      </div>
                    </div>
                  </div>

                  {/* Bio/Reason */}
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Reason for Session</p>
                    <div className="p-4 rounded-2xl bg-off-white text-sm text-gray-600 leading-relaxed italic">
                      "{selectedBooking.personalInfo?.bio || 'No reason provided.'}"
                    </div>
                  </div>

                  {/* Session Meta */}
                  <div className="flex gap-4">
                    <div className="flex-1 p-4 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Mode</p>
                      <p className="text-sm font-bold text-primary uppercase tracking-wide">{selectedBooking.sessionMode}</p>
                    </div>
                    <div className="flex-1 p-4 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Status</p>
                      <p className="text-sm font-bold text-secondary uppercase tracking-wide">{selectedBooking.status.replace('_', ' ')}</p>
                    </div>
                  </div>

                  {/* Assigned Tasks */}
                  <div className="border-t border-gray-100 pt-6">
                    <BookingTasks
                      bookingId={selectedBooking._id}
                      onTasksChange={fetchBookings}
                    />
                  </div>
                </div>

                {/* Right Column: Journey Entries */}
                <div className="border-l border-gray-100 pl-4 lg:pl-8">
                  <UserJourneyEntries
                    userId={selectedBooking.userId?._id || selectedBooking.userId}
                    userName={selectedBooking.personalInfo?.name}
                  />
                </div>
              </div>
            </div>
            <div className="p-6 bg-off-white/50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal (Awaiting Payment Status) */}
      {selectedBooking && selectedBooking.status === 'awaiting_payment' && !isRejecting && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-off-white/50">
              <div>
                <h3 className="text-lg font-bold text-primary">Confirm Session</h3>
                <p className="text-xs text-gray-400 mt-0.5">Finalize booking after payment verification</p>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="p-2 text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-8 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Meeting Link (for Online)</label>
                <input
                  type="text"
                  value={confirmationData.meetingLink}
                  onChange={(e) => setConfirmationData(prev => ({ ...prev, meetingLink: e.target.value }))}
                  placeholder="https://meet.google.com/..."
                  className="w-full px-4 py-3 rounded-xl bg-off-white border-transparent focus:bg-white focus:border-secondary outline-none text-sm transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Transaction/Reference ID</label>
                <input
                  type="text"
                  value={confirmationData.transactionId}
                  onChange={(e) => setConfirmationData(prev => ({ ...prev, transactionId: e.target.value }))}
                  placeholder="Optional"
                  className="w-full px-4 py-3 rounded-xl bg-off-white border-transparent focus:bg-white focus:border-secondary outline-none text-sm transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Admin Notes</label>
                <textarea
                  value={confirmationData.notes}
                  onChange={(e) => setConfirmationData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Internal notes or special instructions for client"
                  className="w-full px-4 py-3 rounded-xl bg-off-white border-transparent focus:bg-white focus:border-secondary outline-none text-sm h-24 transition-all"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setSelectedBooking(null)}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-100 text-gray-500 font-bold hover:bg-off-white transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 px-4 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-all shadow-lg shadow-green-100"
              >
                Confirm Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {isRejecting && selectedBooking && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-red-50/50">
              <h3 className="text-lg font-bold text-red-600">Reject Booking</h3>
              <p className="text-xs text-red-400 mt-0.5">Please provide a reason for the client</p>
            </div>
            <div className="p-8">
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="E.g., Requested slot is no longer available, please choose another."
                className="w-full px-4 py-3 rounded-xl bg-red-50/30 border border-red-100 focus:bg-white focus:border-red-500 outline-none text-sm h-32 transition-all"
              />
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => {
                  setIsRejecting(false);
                  setRejectionReason('');
                }}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-100 text-gray-500 font-bold hover:bg-off-white transition-all"
              >
                Go Back
              </button>
              <button
                onClick={handleReject}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-100"
              >
                Reject Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Assignment Modal */}
      {showTaskModal && selectedBooking && (
        <TaskAssignmentModal
          isOpen={showTaskModal}
          onClose={() => {
            setShowTaskModal(false);
            setSelectedBooking(null);
          }}
          booking={selectedBooking}
          onTaskCreated={() => {
            success('Task assigned successfully!');
            fetchBookings();
          }}
        />
      )}
    </div>
  );
};

export default AdminBookings;
