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

const AdminBookings = () => {
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showUpcomingOnly, setShowUpcomingOnly] = useState(false);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleApprove = async (id) => {
    try {
      await bookingApi.admin.approveBooking(id);
      success('Booking approved!');
      fetchBookings();
    } catch (err) {
      error('Approval failed: ' + err.message);
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
        >
          <Clock size={20} />
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by client name or email..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-off-white border-transparent focus:bg-white focus:border-secondary transition-all outline-none text-sm"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-xl bg-off-white border-transparent focus:bg-white focus:border-secondary transition-all outline-none text-sm font-medium"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="under_review">Under Review</option>
          <option value="awaiting_payment">Payment Pending</option>
          <option value="confirmed">Confirmed</option>
        </select>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showUpcomingOnly}
            onChange={(e) => setShowUpcomingOnly(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-secondary focus:ring-secondary"
          />
          <span className="text-sm font-medium text-gray-600">Upcoming Only</span>
        </label>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
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
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-20 text-center text-gray-400">
                      No bookings found for the selected filters.
                    </td>
                  </tr>
                ) : (
                  bookings.map((booking) => (
                    <tr key={booking._id} className="hover:bg-off-white/30 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-lavender flex items-center justify-center text-primary font-bold text-sm">
                            {booking.personalInfo?.name?.[0] || 'U'}
                          </div>
                          <div>
                            <Link
                              to={`/admin/user/${booking.userId?._id || booking.userId}`}
                              className="font-bold text-primary text-sm hover:text-secondary transition-colors"
                            >
                              {booking.personalInfo?.name}
                            </Link>
                            <div className="flex items-center gap-3 mt-0.5">
                              <span className="text-[11px] text-gray-400 flex items-center gap-1">
                                <Mail size={10} /> {booking.personalInfo?.email}
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
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${booking.status === 'confirmed' ? 'bg-green-100 text-green-600' :
                              booking.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                                'bg-blue-100 text-blue-600'
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
                        <div className="flex justify-end gap-2 shrink-0">
                          <Link
                            to={`/admin/user/${booking.userId?._id || booking.userId}`}
                            className="p-2 rounded-lg bg-off-white text-gray-400 hover:text-primary transition-colors hover:shadow-sm"
                          >
                            <Eye size={16} />
                          </Link>
                          {booking.status === 'pending' && (
                            <button
                              onClick={() => handleApprove(booking._id)}
                              className="p-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors shadow-sm shadow-green-200"
                            >
                              <Check size={16} />
                            </button>
                          )}
                          <button className="p-2 rounded-lg bg-secondary text-white hover:bg-secondary/90 transition-colors shadow-sm shadow-secondary/20">
                            <Plus size={16} />
                          </button>
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
    </div>
  );
};

export default AdminBookings;
