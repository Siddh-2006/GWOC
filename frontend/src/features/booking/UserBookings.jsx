import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Video, Phone, Mail, AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { bookingApi } from './booking.api';

const UserBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, confirmed, cancelled

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const userBookings = await bookingApi.getUserBookings();
      setBookings(userBookings);
    } catch (err) {
      setError(err.message || 'Failed to fetch your bookings');
      console.error('Fetch user bookings error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await bookingApi.cancelBooking(bookingId);
      await fetchBookings(); // Refresh the list
    } catch (err) {
      alert('Failed to cancel booking: ' + err.message);
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'cancelled':
        return <XCircle className="text-red-600" size={20} />;
      case 'completed':
        return <CheckCircle className="text-blue-600" size={20} />;
      case 'awaiting_payment':
        return <AlertCircle className="text-orange-600" size={20} />;
      default:
        return <Clock className="text-yellow-600" size={20} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'awaiting_payment':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-primary" size={32} />
          <span className="ml-3 text-gray-600">Loading your bookings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-primary mb-4">My Bookings</h1>
        <p className="text-gray-600">Track and manage your session bookings.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-3">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-purple-50 p-1 rounded-2xl mb-8 w-fit overflow-x-auto">
        {[
          { key: 'all', label: 'All Bookings' },
          { key: 'pending', label: 'Pending' },
          { key: 'awaiting_payment', label: 'Payment Pending' },
          { key: 'confirmed', label: 'Confirmed' },
          { key: 'cancelled', label: 'Cancelled' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${filter === tab.key
              ? 'bg-white shadow text-primary'
              : 'text-gray-500 hover:text-primary'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      <div className="space-y-6">
        {filteredBookings.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {filter === 'all' ? 'No bookings yet' : `No ${filter.replace('_', ' ')} bookings`}
            </h3>
            <p className="text-gray-500 mb-6">
              {filter === 'all'
                ? "You haven't made any session bookings yet."
                : `You don't have any bookings in this status.`}
            </p>
            {filter === 'all' && (
              <button
                onClick={() => window.location.href = '/booking'}
                className="btn-primary"
              >
                Book Your First Session
              </button>
            )}
          </div>
        ) : (
          filteredBookings.map((booking) => (
            <motion.div
              key={booking._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                {/* Booking Info */}
                <div className="flex-1 w-full">
                  <div className="flex items-center gap-3 mb-4">
                    {getStatusIcon(booking.status)}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
                      {booking.status === 'awaiting_payment' ? 'Payment Pending' :
                        booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="text-primary" size={18} />
                      <div>
                        <p className="font-semibold">
                          {booking.slotId ? formatDate(booking.slotId.date) : 'Date TBD'}
                        </p>
                        <p className="text-sm text-gray-500">Session Date</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Clock className="text-primary" size={18} />
                      <div>
                        <p className="font-semibold">
                          {booking.slotId
                            ? `${formatTime(booking.slotId.startTime)} - ${formatTime(booking.slotId.endTime)}`
                            : 'Time TBD'}
                        </p>
                        <p className="text-sm text-gray-500">Session Time</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {booking.sessionMode === 'online' ? (
                        <Video className="text-primary" size={18} />
                      ) : (
                        <MapPin className="text-primary" size={18} />
                      )}
                      <div>
                        <p className="font-semibold capitalize">{booking.sessionMode} Session</p>
                        <p className="text-sm text-gray-500">
                          {booking.sessionMode === 'online' ? 'Video Call' : 'In-Person'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-green-600 font-bold text-lg">₹{booking.payment?.amount}</span>
                      <div>
                        <p className="font-semibold">Session Fee</p>
                        <p className="text-sm text-gray-500">
                          Status: <span className={booking.status === 'awaiting_payment' ? 'text-orange-600 font-medium' : ''}>
                            {booking.status === 'awaiting_payment' ? 'Pending Payment' : (booking.payment?.status || 'Pending')}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Instructions for Awaiting Payment */}
                  {booking.status === 'awaiting_payment' && (
                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-200 mb-4">
                      <h4 className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
                        <AlertCircle size={16} />
                        Action Required: Complete Payment
                      </h4>
                      <p className="text-sm text-orange-700 mb-3">
                        Your slot is reserved! Please complete the payment of <strong>₹{booking.payment?.amount}</strong> to confirm your booking.
                      </p>
                      <div className="bg-white p-3 rounded-lg border border-orange-100 text-sm">
                        <p className="mb-1 text-gray-600">UPI ID: <span className="font-mono font-bold text-gray-800 select-all">itssiddh7@okicici</span></p>
                        <p className="text-xs text-gray-500">Please send a screenshot of the payment to our support email/WhatsApp.</p>
                      </div>
                    </div>
                  )}

                  {/* Session Topics */}
                  {booking.sessionContent?.topics && (
                    <div className="bg-purple-50 p-3 rounded-lg mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">Topics to Discuss:</p>
                      <p className="text-sm text-gray-600">{booking.sessionContent.topics}</p>
                    </div>
                  )}

                  {/* Confirmed Details */}
                  {booking.status === 'confirmed' && booking.adminResponse && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Session Confirmed!</h4>
                      <div className="space-y-2 text-sm">
                        {booking.adminResponse.meetingLink && (
                          <div className="flex items-center gap-2">
                            <Video size={16} className="text-green-600" />
                            <a
                              href={booking.adminResponse.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-700 hover:underline font-medium"
                            >
                              Join Meeting
                            </a>
                          </div>
                        )}
                        {booking.adminResponse.notes && (
                          <div>
                            <span className="font-medium text-green-800">Note:</span>
                            <span className="text-green-700 ml-2">{booking.adminResponse.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 lg:w-48">
                  {(booking.status === 'pending' || booking.status === 'awaiting_payment') && (
                    <button
                      onClick={() => handleCancelBooking(booking._id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                    >
                      Cancel Booking
                    </button>
                  )}

                  {booking.status === 'confirmed' && booking.adminResponse?.meetingLink && (
                    <a
                      href={booking.adminResponse.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm text-center"
                    >
                      Join Session
                    </a>
                  )}

                  <div className="text-xs text-gray-500 text-center">
                    Booked on {new Date(booking.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Help Section */}
      <div className="mt-12 glass-card p-6">
        <h3 className="text-lg font-semibold mb-4">Need Help?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-3">
            <Mail className="text-primary" size={18} />
            <div>
              <p className="font-medium">Email Support</p>
              <p className="text-gray-600">support@mindsettler.com</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="text-primary" size={18} />
            <div>
              <p className="font-medium">Phone Support</p>
              <p className="text-gray-600">+91 9876543210</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserBookings;