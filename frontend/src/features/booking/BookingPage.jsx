import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, CheckCircle, AlertCircle, Loader2, User, MessageSquare, Heart, ChevronsDown, ChevronsUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { useBookingStore } from '../../store/useBookingStore';
import { bookingApi } from './booking.api';
import useAuthStore from '../../store/useAuthStore';
import ReflectionFlow from '../../components/reflection/ReflectionFlow';
import { reflectionApi } from '../../services/reflection.api';

const BookingPage = () => {
  const { user } = useAuthStore();
  const {
    availableSlots,
    setAvailableSlots,
    addAppointment,
  } = useBookingStore();

  const [selectedSlot, setSelectedSlot] = useState(null);
  const [step, setStep] = useState(null); // null: Checking eligibility, 0: Reflection (optional), 1: Select Slot, 2: Personal Info, 3: Session Details, 4: Confirmation
  const [showReflection, setShowReflection] = useState(false);
  const [reflectionSessionId, setReflectionSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEligibleLoading, setIsEligibleLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [showAllSlots, setShowAllSlots] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const locationDropdownRef = useRef(null);
  const calendarRef = useRef(null);

  // Surat location suggestions
  const suratLocations = [
    'MindSettler Studio, Surat, Gujarat',
    'Adajan, Surat, Gujarat',
    'Vesu, Surat, Gujarat',
    'Citylight, Surat, Gujarat',
    'Piplod, Surat, Gujarat',
    'Althan, Surat, Gujarat',
    'Ghod Dod Road, Surat, Gujarat',
    'Ring Road, Surat, Gujarat',
    'Udhna, Surat, Gujarat',
    'Katargam, Surat, Gujarat'
  ];

  // Location validation function
  const validateLocation = (location) => {
    const normalizedLocation = location.toLowerCase();
    const isSuratLocation = normalizedLocation.includes('surat') ||
      normalizedLocation.includes('gujarat') ||
      suratLocations.some(loc =>
        normalizedLocation.includes(loc.toLowerCase().split(',')[0])
      );
    return isSuratLocation;
  };

  // Filter location suggestions based on input
  const filterLocationSuggestions = (input) => {
    if (!input.trim()) return suratLocations.slice(0, 5);

    const filtered = suratLocations.filter(location =>
      location.toLowerCase().includes(input.toLowerCase())
    );
    return filtered.length > 0 ? filtered : suratLocations.slice(0, 3);
  };

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

  // Check reflection eligibility on component mount
  useEffect(() => {
    const checkReflectionEligibility = async () => {
      try {
        setIsEligibleLoading(true);
        const response = await reflectionApi.checkEligibility();
        console.log('📡 Reflection Eligibility Response:', response);

        if (response.success) {
          console.log(`   - isEligible: ${response.data.isEligible}`);
          if (response.data.isEligible) {
            // First-time client - show reflection option
            setStep(0);
          } else {
            // Returning client - skip directly to slot selection
            setStep(1);
          }
        } else {
          // Default to slot selection if check fails
          setStep(1);
        }
      } catch (error) {
        console.error('Failed to check reflection eligibility:', error);
        // Default to slot selection if check fails
        setStep(1);
      } finally {
        setIsEligibleLoading(false);
      }
    };

    if (user) {
      checkReflectionEligibility();
    } else {
      // If not logged in, we'll likely be redirected, but default to slot selection
      setStep(1);
      setIsEligibleLoading(false);
    }
  }, [user]);

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  // Handle click outside to close location dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target)) {
        setShowLocationSuggestions(false);
        setSelectedSuggestionIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null); // Reset selected slot when date changes
    setShowAllSlots(false); // Reset showAllSlots when date changes
    setShowCalendar(false); // Close calendar on date selection
  };

  // Calendar helper functions
  const daysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const calendarDays = [];
  const totalDays = daysInMonth(currentMonth);
  const startDay = firstDayOfMonth(currentMonth);

  // Add empty days for the previous month's alignment
  for (let i = 0; i < startDay; i++) {
    calendarDays.push(null);
  }

  // Add actual days
  for (let i = 1; i <= totalDays; i++) {
    calendarDays.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));
  }

  // Handle click outside to close calendar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle reflection completion
  const handleReflectionComplete = (sessionId) => {
    setReflectionSessionId(sessionId);
    setShowReflection(false);
    setStep(1); // Move to slot selection
  };

  // Handle reflection skip
  const handleReflectionSkip = () => {
    setShowReflection(false);
    setStep(1); // Move to slot selection
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

    // Validate location for offline sessions
    if (formData.sessionMode === 'offline') {
      if (!formData.location.trim()) {
        setError('Please specify a location for offline session');
        setLoading(false);
        return;
      }

      // Validate that location is in Surat area
      if (!validateLocation(formData.location)) {
        setError('Please provide a location in Surat, Gujarat area. MindSettler operates in Surat only.');
        setLoading(false);
        return;
      }
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
        location: formData.sessionMode === 'offline' ? formData.location : undefined,
        reflectionSessionId: reflectionSessionId // Include reflection session ID if available
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
    <div className="max-w-4xl mx-auto px-4 py-12 pt-30">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-primary mb-4">Book Your Session</h1>
        <p className="text-gray-600">60-minute personalized psycho-education and guidance session.</p>
      </div>

      {isEligibleLoading && step === null ? (
        <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
          <Loader2 className="animate-spin text-primary mb-4" size={48} />
          <p className="text-gray-500 font-medium animate-pulse">Preparing your session experience...</p>
        </div>
      ) : (
        <>
          {/* Progress Bar - Only show if not on step 0 (Reflection) and not finished */}
          {step !== null && step > 0 && step < 4 && (
            <div className="flex justify-between mb-12 relative px-4 sm:px-10">
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
          )}

          <div className="glass-card p-8 md:p-12">
            {/* Step 0: Optional Reflection */}
            {step === 0 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-linear-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Heart className="text-primary" size={32} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Take a Moment to Reflect</h3>
                  <p className="text-gray-600 max-w-2xl mx-auto mb-8">
                    Before we begin, would you like to take a few minutes to reflect on what brings you here today?
                    This optional step helps us understand how to better support you during your session.
                  </p>

                  <div className="bg-blue-50 p-6 rounded-2xl mb-8 text-left max-w-2xl mx-auto">
                    <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                      <MessageSquare size={20} />
                      How it works:
                    </h4>
                    <ul className="space-y-2 text-sm text-blue-800">
                      <li>• Answer a few gentle questions about your thoughts and feelings</li>
                      <li>• Skip any question that doesn't feel right</li>
                      <li>• Your responses help us prepare for a more meaningful conversation</li>
                      <li>• Everything is confidential and secure</li>
                    </ul>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                    <button
                      onClick={() => setShowReflection(true)}
                      className="btn-primary flex items-center justify-center gap-2 flex-1"
                    >
                      <Heart size={20} />
                      Start Reflection
                    </button>
                    <button
                      onClick={handleReflectionSkip}
                      className="py-3 px-6 text-gray-600 font-medium border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex-1"
                    >
                      Skip for Now
                    </button>
                  </div>

                  <p className="text-xs text-gray-500 mt-4">
                    This reflection is completed only once. Your privacy is our priority. Responses help us tailor your first session to your needs.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Reflection Flow Modal */}
            {showReflection && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-[2.5rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-purple-50">
                  <div className="relative">
                    {/* Close button */}
                    <button
                      onClick={handleReflectionSkip}
                      className="absolute top-4 right-4 z-10 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      ×
                    </button>
                    <ReflectionFlow
                      onComplete={handleReflectionComplete}
                      onSkip={handleReflectionSkip}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Select Date and Time Slot */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h3 className="text-2xl font-bold mb-8 flex items-center gap-2">
                  <Calendar className="text-secondary" />
                  Select Date & Time Slot
                </h3>

                {/* Custom Date Picker */}
                <div className="mb-8 relative" ref={calendarRef}>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Select Date</label>
                  <button
                    type="button"
                    onClick={() => setShowCalendar(!showCalendar)}
                    className="w-full md:w-64 px-4 py-3 rounded-xl border border-purple-100 flex items-center justify-between text-left hover:border-primary transition-colors bg-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  >
                    <span className="text-gray-700">
                      {new Date(selectedDate).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                    <Calendar size={20} className="text-primary" />
                  </button>

                  {showCalendar && (
                    <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-2xl shadow-2xl border border-purple-100 p-4 w-72">
                      {/* Calendar Header */}
                      <div className="flex items-center justify-between mb-4">
                        <button
                          type="button"
                          disabled={currentMonth.getMonth() === new Date().getMonth() && currentMonth.getFullYear() === new Date().getFullYear()}
                          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                          className="p-1 hover:bg-purple-50 rounded-lg disabled:opacity-0 transition-colors"
                        >
                          <ChevronLeft size={20} />
                        </button>
                        <div className="font-bold text-gray-800">
                          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </div>
                        <button
                          type="button"
                          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                          className="p-1 hover:bg-purple-50 rounded-lg transition-colors"
                        >
                          <ChevronRight size={20} />
                        </button>
                      </div>

                      {/* Calendar Grid */}
                      <div className="grid grid-cols-7 text-center mb-2">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d) => (
                          <div key={d} className="text-[10px] font-bold text-gray-400 uppercase">{d}</div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((date, idx) => {
                          if (!date) return <div key={`empty-${idx}`} />;

                          const dateString = date.toLocaleDateString('en-CA');
                          const isPast = date < new Date().setHours(0, 0, 0, 0);
                          const isSelected = selectedDate === dateString;
                          const isToday = dateString === new Date().toLocaleDateString('en-CA');

                          return (
                            <button
                              key={dateString}
                              type="button"
                              disabled={isPast}
                              onClick={() => handleDateChange(dateString)}
                              className={`h-8 w-8 rounded-lg text-xs font-medium flex items-center justify-center transition-all ${isSelected
                                ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110'
                                : isPast
                                  ? 'text-gray-200 cursor-not-allowed'
                                  : isToday
                                    ? 'text-primary border border-primary/20'
                                    : 'text-gray-600 hover:bg-purple-50'
                                }`}
                            >
                              {date.getDate()}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
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
                  <div className="space-y-6 mb-10">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {availableSlots.length > 0 ? (
                        (showAllSlots ? availableSlots : availableSlots.slice(0, 6)).map((slot) => (
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

                    {availableSlots.length > 6 && (
                      <div className="flex justify-center">
                        <button
                          onClick={() => setShowAllSlots(!showAllSlots)}
                          className="flex items-center gap-2 text-primary font-semibold hover:text-primary/80 transition-colors py-2 px-4 rounded-xl border border-primary/20 hover:bg-primary/5"
                        >
                          {showAllSlots ? (
                            <>
                              <ChevronsUp size={20} />
                              Show Less
                            </>
                          ) : (
                            <>
                              <ChevronsDown size={20} />
                              Show All Slots ({availableSlots.length})
                            </>
                          )}
                        </button>
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
                          onClick={() => {
                            const newFormData = { ...formData, sessionMode: mode };
                            // Set default location for offline sessions
                            if (mode === 'offline' && !formData.location) {
                              newFormData.location = 'MindSettler Studio, Surat, Gujarat';
                            }
                            setFormData(newFormData);
                          }}
                          className={`p-4 rounded-xl border-2 transition-all text-left ${formData.sessionMode === mode
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-purple-50 hover:border-purple-200'
                            }`}
                        >
                          <div className="font-semibold capitalize mb-1">{mode} Session</div>
                          <div className="text-sm text-gray-600">
                            {mode === 'online'
                              ? 'Video call via Google Meet'
                              : 'In-person at MindSettler Studio, Surat'}
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
                    <div className="relative" ref={locationDropdownRef}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Location in Surat *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-purple-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        value={formData.location}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData({ ...formData, location: value });
                          setLocationSuggestions(filterLocationSuggestions(value));
                          setShowLocationSuggestions(true);
                          setSelectedSuggestionIndex(-1);
                        }}
                        onFocus={() => {
                          setLocationSuggestions(filterLocationSuggestions(formData.location));
                          setShowLocationSuggestions(true);
                          setSelectedSuggestionIndex(-1);
                        }}
                        onBlur={(e) => {
                          // Only hide if not clicking on a suggestion
                          if (!e.relatedTarget || !e.relatedTarget.closest('.location-suggestions')) {
                            setTimeout(() => {
                              setShowLocationSuggestions(false);
                              setSelectedSuggestionIndex(-1);
                            }, 150);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (!showLocationSuggestions || locationSuggestions.length === 0) return;

                          if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            setSelectedSuggestionIndex(prev =>
                              prev < locationSuggestions.length - 1 ? prev + 1 : 0
                            );
                          } else if (e.key === 'ArrowUp') {
                            e.preventDefault();
                            setSelectedSuggestionIndex(prev =>
                              prev > 0 ? prev - 1 : locationSuggestions.length - 1
                            );
                          } else if (e.key === 'Enter' && selectedSuggestionIndex >= 0) {
                            e.preventDefault();
                            setFormData({ ...formData, location: locationSuggestions[selectedSuggestionIndex] });
                            setShowLocationSuggestions(false);
                            setSelectedSuggestionIndex(-1);
                          } else if (e.key === 'Escape') {
                            setShowLocationSuggestions(false);
                            setSelectedSuggestionIndex(-1);
                          }
                        }}
                        placeholder="MindSettler Studio, Surat"
                      />

                      {/* Location Suggestions Dropdown */}
                      {showLocationSuggestions && (
                        <div className="location-suggestions absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                          {locationSuggestions.length > 0 ? (
                            locationSuggestions.map((suggestion, index) => (
                              <button
                                key={index}
                                type="button"
                                className={`w-full px-4 py-3 text-left hover:bg-purple-50 active:bg-purple-100 focus:bg-purple-50 focus:outline-none text-sm border-none bg-transparent cursor-pointer transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg ${index === selectedSuggestionIndex ? 'bg-purple-100' : ''
                                  }`}
                                onMouseDown={(e) => {
                                  // Prevent input blur when clicking suggestion
                                  e.preventDefault();
                                }}
                                onMouseEnter={() => setSelectedSuggestionIndex(index)}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setFormData({ ...formData, location: suggestion });
                                  setShowLocationSuggestions(false);
                                  setSelectedSuggestionIndex(-1);
                                }}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-purple-500">📍</span>
                                  <span>{suggestion}</span>
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className="px-4 py-3 text-sm text-gray-500 text-center">
                              No Surat locations found. Try "Surat" or area names like "Adajan", "Vesu"
                            </div>
                          )}
                        </div>
                      )}

                      <p className="text-xs text-gray-500 mt-1">
                        Default: MindSettler Studio, Surat. Please specify a location within Surat, Gujarat area.
                      </p>

                      {/* Location validation indicator */}
                      {formData.location && (
                        <p className={`text-xs mt-1 ${validateLocation(formData.location) ? 'text-green-600' : 'text-red-600'}`}>
                          {validateLocation(formData.location)
                            ? '✓ Valid Surat location'
                            : '⚠ Please provide a location in Surat, Gujarat'}
                        </p>
                      )}
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
                      disabled={loading || !formData.agreedToTerms || !formData.sessionContent.topics ||
                        (formData.sessionMode === 'offline' && (!formData.location.trim() || !validateLocation(formData.location)))}
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
        </>
      )}
    </div>
  );
};

export default BookingPage;