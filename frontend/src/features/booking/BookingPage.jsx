import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, CheckCircle, AlertCircle, Loader2, User, MessageSquare } from 'lucide-react';
import { useBookingStore } from '../../store/useBookingStore';
import { bookingApi } from './booking.api';
import useAuthStore from '../../store/useAuthStore';

const BookingPage = () => {
  const { user } = useAuthStore();
  const {
    availableSlots,
    setAvailableSlots,
    addAppointment,
  } = useBookingStore();

  const [selectedSlot, setSelectedSlot] = useState(null);
  const [step, setStep] = useState(1); // 1: Select Slot, 2: Personal Info, 3: Session Details, 4: Confirmation
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const [formData, setFormData] = useState({
    // Personal Information (pre-fill from user profile if available)
    personalInfo: {
      name: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
      email: user?.email || '',
      phone: '',
      numberOfPeople: 1,
      relationshipStatus: '',
      relationshipStatusOther: ''
    },
    // Session Content
    sessionContent: {
      topics: '',
      concerns: '',
      goals: ''
    },
    // Session Mode and Location
    sessionMode: 'online',
    location: '',
    // Terms agreement
    agreedToTerms: false
  });

  const fetchSlots = async (date) => {
    setLoading(true);
    setError(null);
    try {
      const slots = await bookingApi.getAvailableSlots(date);
      setAvailableSlots(slots);
    } catch (err) {
      setError(err.message || 'Failed to fetch slots');
      console.error('Fetch slots error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots(selectedDate);
  }, [selectedDate]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null); // Reset selected slot when date changes
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Frontend validation
    if (!selectedSlot) {
      setError('Please select a time slot');
      setLoading(false);
      return;
    }
    
    if (!formData.personalInfo.name || !formData.personalInfo.email || !formData.personalInfo.phone || !formData.personalInfo.relationshipStatus) {
      setError('Please fill in all required personal information fields');
      setLoading(false);
      return;
    }
    
    // Check if "other" relationship status requires additional input
    if (formData.personalInfo.relationshipStatus === 'other' && !formData.personalInfo.relationshipStatusOther) {
      setError('Please specify your relationship status');
      setLoading(false);
      return;
    }
    
    if (!formData.sessionContent.topics) {
      setError('Please describe what you would like to talk about');
      setLoading(false);
      return;
    }
    
    if (!formData.agreedToTerms) {
      setError('Please agree to the terms and conditions');
      setLoading(false);
      return;
    }
    
    try {
      const bookingData = {
        slotId: selectedSlot._id, // Changed from selectedSlot.id to selectedSlot._id
        personalInfo: formData.personalInfo,
        sessionContent: formData.sessionContent,
        sessionMode: formData.sessionMode,
        location: formData.sessionMode === 'offline' ? formData.location : undefined
      };

      const appointment = await bookingApi.createBooking(bookingData);
      addAppointment(appointment);
      setStep(4);
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
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${step >= s ? 'bg-primary text-white' : 'bg-white text-purple-300 border-2 border-purple-100'
              }`}
          >
            {s === 4 && step === 4 ? <CheckCircle size={20} /> : s}
          </div>
        ))}
      </div>

      <div className="glass-card p-8 md:p-12">
        {/* Step 1: Select Date and Time Slot */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h3 className="text-2xl font-bold mb-8 flex items-center gap-2">
              <Calendar className="text-secondary" />
              Select Date & Time Slot
            </h3>

            {/* Date Selection */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-3">Select Date</label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full md:w-auto px-4 py-3 rounded-xl border border-purple-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>

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
                  onClick={() => fetchSlots(selectedDate)}
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
                      key={slot._id}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-4 rounded-2xl border-2 transition-all text-center ${selectedSlot?._id === slot._id
                        ? 'border-secondary bg-secondary/5 text-secondary shadow-lg scale-105'
                        : 'border-purple-50 hover:border-purple-200'
                        }`}
                    >
                      <Clock size={16} className="mx-auto mb-2" />
                      <p className="font-bold">{slot.startTime} - {slot.endTime}</p>
                      <p className="text-xs text-gray-400">
                        {slot.availableModes?.includes('online') && slot.availableModes?.includes('offline') 
                          ? 'Online/Offline' 
                          : slot.availableModes?.[0] || 'Available'}
                      </p>
                      <p className="text-xs text-green-600 font-medium">
                        ₹{slot.pricing?.online || 1200} - ₹{slot.pricing?.offline || 1500}
                      </p>
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
              Continue to Personal Details
            </button>
          </motion.div>
        )}

        {/* Step 2: Personal Information */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h3 className="text-2xl font-bold mb-8 flex items-center gap-2">
              <User className="text-secondary" />
              Personal Information
            </h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input
                    required
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border border-purple-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    value={formData.personalInfo.name}
                    onChange={(e) => setFormData({
                      ...formData,
                      personalInfo: { ...formData.personalInfo, name: e.target.value }
                    })}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                  <input
                    required
                    type="email"
                    className="w-full px-4 py-3 rounded-xl border border-purple-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    value={formData.personalInfo.email}
                    onChange={(e) => setFormData({
                      ...formData,
                      personalInfo: { ...formData.personalInfo, email: e.target.value }
                    })}
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                  <input
                    required
                    type="tel"
                    className="w-full px-4 py-3 rounded-xl border border-purple-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    value={formData.personalInfo.phone}
                    onChange={(e) => setFormData({
                      ...formData,
                      personalInfo: { ...formData.personalInfo, phone: e.target.value }
                    })}
                    placeholder="+91 9876543210"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Number of People *</label>
                  <select
                    required
                    className="w-full px-4 py-3 rounded-xl border border-purple-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    value={formData.personalInfo.numberOfPeople}
                    onChange={(e) => setFormData({
                      ...formData,
                      personalInfo: { ...formData.personalInfo, numberOfPeople: parseInt(e.target.value) }
                    })}
                  >
                    {[1, 2, 3, 4, 5].map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'Person' : 'People'}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Relationship Status *</label>
                <select
                  required
                  className="w-full px-4 py-3 rounded-xl border border-purple-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  value={formData.personalInfo.relationshipStatus}
                  onChange={(e) => setFormData({
                    ...formData,
                    personalInfo: { ...formData.personalInfo, relationshipStatus: e.target.value }
                  })}
                >
                  <option value="">Select your relationship status</option>
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="couple">In a Relationship</option>
                  <option value="divorced">Divorced</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {formData.personalInfo.relationshipStatus === 'other' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Please specify</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border border-purple-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    value={formData.personalInfo.relationshipStatusOther}
                    onChange={(e) => setFormData({
                      ...formData,
                      personalInfo: { ...formData.personalInfo, relationshipStatusOther: e.target.value }
                    })}
                    placeholder="Please specify your relationship status"
                  />
                </div>
              )}

              <div className="flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setStep(1)} 
                  className="flex-1 py-4 text-primary font-semibold border border-primary rounded-xl hover:bg-primary/5 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!formData.personalInfo.name || !formData.personalInfo.email || !formData.personalInfo.phone || !formData.personalInfo.relationshipStatus}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to Session Details
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Session Details */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h3 className="text-2xl font-bold mb-8 flex items-center gap-2">
              <MessageSquare className="text-secondary" />
              Session Details
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">What would you like to talk about? *</label>
                <textarea
                  required
                  className="w-full px-4 py-3 rounded-xl border border-purple-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none h-32"
                  value={formData.sessionContent.topics}
                  onChange={(e) => setFormData({
                    ...formData,
                    sessionContent: { ...formData.sessionContent, topics: e.target.value }
                  })}
                  placeholder="Please describe the topics or issues you'd like to discuss during the session..."
                  maxLength={1000}
                />
                <p className="text-xs text-gray-500 mt-1">{formData.sessionContent.topics.length}/1000 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">What are you going through? (Optional)</label>
                <textarea
                  className="w-full px-4 py-3 rounded-xl border border-purple-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none h-24"
                  value={formData.sessionContent.concerns}
                  onChange={(e) => setFormData({
                    ...formData,
                    sessionContent: { ...formData.sessionContent, concerns: e.target.value }
                  })}
                  placeholder="Share any specific concerns or challenges you're facing..."
                  maxLength={1000}
                />
                <p className="text-xs text-gray-500 mt-1">{formData.sessionContent.concerns.length}/1000 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Session Goals (Optional)</label>
                <textarea
                  className="w-full px-4 py-3 rounded-xl border border-purple-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none h-20"
                  value={formData.sessionContent.goals}
                  onChange={(e) => setFormData({
                    ...formData,
                    sessionContent: { ...formData.sessionContent, goals: e.target.value }
                  })}
                  placeholder="What would you like to achieve from this session?"
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">{formData.sessionContent.goals.length}/500 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Session Mode *</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedSlot?.availableModes?.map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setFormData({ ...formData, sessionMode: mode })}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${formData.sessionMode === mode 
                        ? 'border-primary bg-primary/5 text-primary' 
                        : 'border-purple-50 hover:border-purple-200'
                      }`}
                    >
                      <div className="font-semibold capitalize mb-1">{mode} Session</div>
                      <div className="text-sm text-gray-600">
                        {mode === 'online' 
                          ? 'Video call via Google Meet' 
                          : 'In-person at MindSettler Studio'}
                      </div>
                      <div className="text-sm font-medium text-green-600 mt-2">
                        ₹{selectedSlot?.pricing?.[mode] || (mode === 'online' ? 1200 : 1500)}
                      </div>
                    </button>
                  )) || (
                    <div className="col-span-full text-center text-gray-500 py-4">
                      No session modes available for selected slot
                    </div>
                  )}
                </div>
              </div>

              {formData.sessionMode === 'offline' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Location</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border border-purple-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="MindSettler Studio, Pune (default) or specify your preference"
                  />
                </div>
              )}

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

              <div className="bg-amber-50 p-4 rounded-xl flex items-start gap-3">
                <AlertCircle className="text-amber-600 mt-1" size={20} />
                <div className="text-sm text-amber-800">
                  <p className="font-medium mb-1">Payment Information:</p>
                  <p>Payment of ₹{selectedSlot?.pricing?.[formData.sessionMode] || (formData.sessionMode === 'online' ? 1200 : 1500)} is required via UPI or Cash. Our team will contact you for payment confirmation after you submit the request.</p>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3">
                  <AlertCircle size={20} />
                  <p>{error}</p>
                </div>
              )}

              <div className="flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setStep(2)} 
                  className="flex-1 py-4 text-primary font-semibold border border-primary rounded-xl hover:bg-primary/5 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || !formData.agreedToTerms || !formData.sessionContent.topics}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : 'Request Appointment'}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Step 4: Confirmation */}
        {step === 4 && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle size={40} />
            </div>
            <h2 className="text-3xl font-bold mb-4">Request Received!</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Thank you, {formData.personalInfo.name.split(' ')[0]}. Your session request has been sent successfully.
            </p>
            
            <div className="bg-blue-50 p-6 rounded-xl mb-8 text-left max-w-md mx-auto">
              <h4 className="font-semibold text-blue-900 mb-3">Session Details:</h4>
              <div className="space-y-2 text-sm text-blue-800">
                <p><strong>Date:</strong> {new Date(selectedSlot?.date).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {selectedSlot?.startTime} - {selectedSlot?.endTime}</p>
                <p><strong>Mode:</strong> {formData.sessionMode === 'online' ? 'Online' : 'In-Person'}</p>
                <p><strong>Amount:</strong> ₹{selectedSlot?.pricing?.[formData.sessionMode] || (formData.sessionMode === 'online' ? 1200 : 1500)}</p>
              </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-xl mb-8 text-sm text-amber-800">
              <p className="font-medium mb-2">What happens next?</p>
              <ul className="text-left space-y-1">
                <li>• Our team will review your request within 24 hours</li>
                <li>• You'll receive a confirmation email with payment details</li>
                <li>• After payment, you'll get the final session confirmation</li>
                <li>• You'll receive a reminder 10 minutes before your session</li>
              </ul>
            </div>
            
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