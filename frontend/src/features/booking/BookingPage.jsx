import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useBookingStore } from '../../store/useBookingStore';
import { bookingApi } from './booking.api';

const BookingPage = () => {
  const {
    availableSlots,
    setAvailableSlots,
    addAppointment,
  } = useBookingStore();

  const [selectedSlot, setSelectedSlot] = useState(null);
  const [step, setStep] = useState(1); // 1: Select Slot, 2: Details, 3: Confirmation
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    mode: 'online', // online/offline
    notes: '',
    agreedToTerms: false
  });

  const fetchSlots = async (date) => {
    setLoading(true);
    setError(null);
    try {
      // Dummy data for testing
      const dummySlots = [
        { id: 1, time: '10:00 AM', date: date, status: 'available' },
        { id: 2, time: '11:00 AM', date: date, status: 'available' },
        { id: 3, time: '02:00 PM', date: date, status: 'available' },
        { id: 4, time: '04:00 PM', date: date, status: 'available' },
        { id: 5, time: '05:00 PM', date: date, status: 'available' },
      ];

      // const slots = await bookingApi.getAvailableSlots(date);
      // setAvailableSlots(slots);

      setAvailableSlots(dummySlots);
    } catch (err) {
      setError(err.message || 'Failed to fetch slots');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    fetchSlots(today);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Mocking API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const dummyAppointment = {
        ...formData,
        id: Date.now(),
        slot: selectedSlot,
        date: selectedSlot.date,
        status: 'pending'
      };

      /*
      const appointment = await bookingApi.createBooking({
        ...formData,
        slotId: selectedSlot.id,
        date: selectedSlot.date,
      });
      addAppointment(appointment);
      */

      addAppointment(dummyAppointment);
      setStep(3);
    } catch (err) {
      setError(err.message || 'Failed to book appointment');
      console.error('Booking failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-primary mb-4">Book Your Session</h1>
        <p className="text-gray-600">60-minute personalized psycho-education and guidance session.</p>
      </div>

      {/* Progress Bar */}
      <div className="flex justify-between mb-12 relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-purple-100 -z-10" />
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${step >= s ? 'bg-primary text-white' : 'bg-white text-purple-300 border-2 border-purple-100'
              }`}
          >
            {s === 3 && step === 3 ? <CheckCircle size={20} /> : s}
          </div>
        ))}
      </div>

      <div className="glass-card p-8 md:p-12">
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h3 className="text-2xl font-bold mb-8 flex items-center gap-2">
              <Calendar className="text-secondary" />
              Select an Available Slot
            </h3>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 size={40} className="text-primary animate-spin mb-4" />
                <p className="text-gray-500">Loading available slots...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 text-red-600 p-6 rounded-2xl flex items-center gap-4 mb-8">
                <AlertCircle size={24} />
                <p>{error}</p>
                <button
                  onClick={() => fetchSlots(new Date().toISOString().split('T')[0])}
                  className="ml-auto underline font-medium"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
                {availableSlots.length > 0 ? (
                  availableSlots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-4 rounded-2xl border-2 transition-all text-center ${selectedSlot?.id === slot.id
                        ? 'border-secondary bg-secondary/5 text-secondary shadow-lg scale-105'
                        : 'border-purple-50 hover:border-purple-200'
                        }`}
                    >
                      <Clock size={16} className="mx-auto mb-2" />
                      <p className="font-bold">{slot.time}</p>
                      <p className="text-xs text-gray-400">{slot.date}</p>
                    </button>
                  ))
                ) : (
                  <div className="col-span-full py-12 text-center text-gray-500">
                    No slots available for this date. Please try another day.
                  </div>
                )}
              </div>
            )}

            <button
              disabled={!selectedSlot || loading}
              onClick={() => setStep(2)}
              className="btn-primary w-full disabled:opacity-50 flex items-center justify-center gap-2"
            >
              Continue to Details
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h3 className="text-2xl font-bold mb-8">Personal Details</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    required
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border border-purple-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    required
                    type="email"
                    className="w-full px-4 py-3 rounded-xl border border-purple-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Session Mode</label>
                <div className="flex gap-4">
                  {['online', 'offline'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setFormData({ ...formData, mode: m })}
                      className={`flex-1 py-3 px-4 rounded-xl border-2 capitalize transition-all ${formData.mode === m ? 'border-primary bg-primary/5 text-primary' : 'border-purple-50'
                        }`}
                    >
                      {m} Consultation
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes for the counselor (Optional)</label>
                <textarea
                  className="w-full px-4 py-3 rounded-xl border border-purple-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none h-32"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div className="bg-purple-50 p-4 rounded-xl flex items-start gap-4">
                <input
                  type="checkbox"
                  id="agreedToTerms"
                  required
                  className="mt-1 w-5 h-5 accent-primary cursor-pointer"
                  checked={formData.agreedToTerms}
                  onChange={(e) => setFormData({ ...formData, agreedToTerms: e.target.checked })}
                />
                <label htmlFor="agreedToTerms" className="text-sm text-gray-600 cursor-pointer">
                  I have read and agree to the <a href="/confidentiality" target="_blank" rel="noopener noreferrer" className="text-primary font-bold underline">Confidentiality Policy</a>. I understand that my safety and privacy are priority.
                </label>
              </div>

              <div className="bg-purple-50 p-4 rounded-xl flex items-start gap-3">
                <AlertCircle className="text-primary mt-1" size={20} />
                <p className="text-xs text-gray-600">
                  Payment is required via UPI or Cash at the studio. Our team will contact you for payment confirmation after you submit the request.
                </p>
              </div>

              <div className="flex gap-4">
                <button type="button" onClick={() => setStep(1)} className="flex-1 py-4 text-primary font-semibold">
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || !formData.agreedToTerms}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : 'Request Appointment'}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle size={40} />
            </div>
            <h2 className="text-3xl font-bold mb-4">Request Received!</h2>
            <p className="text-gray-600 mb-10 max-w-md mx-auto">
              Thank you, {formData.name.split(' ')[0]}. Your session request for <span className="font-bold">{selectedSlot?.time}</span> has been sent. We will contact you shortly for payment confirmation.
            </p>
            <div className="space-y-4">
              <button
                onClick={() => window.location.href = '/'}
                className="btn-primary px-10"
              >
                Back to Home
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BookingPage;