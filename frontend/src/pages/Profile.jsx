import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { User, Calendar, BookOpen, Heart, Settings, Shield, Eye, EyeOff, Edit3, Save, X } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { bookingApi } from '../features/booking/booking.api';
import { authApi } from '../features/auth/auth.api';

const Profile = () => {
  const { user, isAuthenticated, isInitialized, updateUser } = useAuthStore();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    avatar: '',
    bio: '',
    location: '',
    interests: ''
  });
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Animation refs
  const welcomeRef = useRef(null);
  const journeyRef = useRef(null);
  const sessionsRef = useRef(null);
  const resourcesRef = useRef(null);

  const welcomeInView = useInView(welcomeRef, { once: true });
  const journeyInView = useInView(journeyRef, { once: true, margin: "-100px" });
  const sessionsInView = useInView(sessionsRef, { once: true, margin: "-100px" });
  const resourcesInView = useInView(resourcesRef, { once: true, margin: "-100px" });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (user) {
          const userBookings = await bookingApi.getUserBookings();
          setBookings(userBookings || []);
          
          // Initialize profile data from user
          setProfileData({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            avatar: user.avatar || '😊',
            bio: user.bio || '',
            location: user.location || '',
            interests: user.interests || ''
          });
        }
      } catch (error) {
        console.error('Profile data fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveMessage('');
    
    try {
      const response = await authApi.updateProfile(profileData);
      
      if (response.success) {
        // Update the user in the auth store
        updateUser(response.data.user);
        setSaveMessage('Profile updated successfully!');
        setIsEditing(false);
        
        // Clear success message after 3 seconds
        setTimeout(() => setSaveMessage(''), 3000);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setSaveMessage('Failed to update profile. Please try again.');
      
      // Clear error message after 5 seconds
      setTimeout(() => setSaveMessage(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset to original user data
    setProfileData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      avatar: user.avatar || '😊',
      bio: user.bio || '',
      location: user.location || '',
      interests: user.interests || ''
    });
    setIsEditing(false);
    setSaveMessage('');
  };

  // Calculate journey stages
  const getJourneyStages = () => {
    const stages = [
      {
        id: 'discovered',
        title: 'Discovered MindSettler',
        description: 'You found this space for understanding.',
        completed: true,
        icon: '🌱'
      },
      {
        id: 'explored',
        title: 'Explored Psycho-Education',
        description: 'You began learning about yourself.',
        completed: true,
        icon: '📚'
      }
    ];

    const hasBookedSession = bookings.length > 0;
    const hasAttendedSession = bookings.some(b => b.status === 'confirmed' || b.status === 'completed');

    if (hasBookedSession) {
      stages.push({
        id: 'booked',
        title: 'Booked First Session',
        description: 'You took a step toward understanding.',
        completed: true,
        icon: '🤝'
      });
    }

    if (hasAttendedSession) {
      stages.push({
        id: 'attended',
        title: 'Attended Sessions',
        description: 'This space was yours.',
        completed: true,
        icon: '💫'
      });
    }

    stages.push({
      id: 'ongoing',
      title: 'Ongoing Reflection',
      description: 'Your journey continues at your own pace.',
      completed: false,
      icon: '🌸'
    });

    return stages;
  };

  const journeyStages = getJourneyStages();
  const attendedSessions = bookings.filter(b => b.status === 'confirmed' || b.status === 'completed').length;
  const upcomingSession = bookings.find(b => b.status === 'confirmed');

  // Gentle fade-in animation
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  if (!isInitialized || loading) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your space...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Please log in to view your profile.</p>
          <a href="/login" className="px-6 py-3 bg-purple-600 text-white rounded-full font-medium hover:bg-purple-700 transition-colors">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pink-50 pt-28">
      <div className="max-w-4xl mx-auto px-6 py-12">

        {/* Debug Info */}
        <div className="mb-8 p-4 bg-white rounded-lg">
          <h3 className="font-bold mb-2">Debug Info:</h3>
          <p>User: {user ? `${user.firstName} ${user.lastName}` : 'No user'}</p>
          <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
          <p>Initialized: {isInitialized ? 'Yes' : 'No'}</p>
          <p>Bookings: {bookings.length}</p>
        </div>

        {/* Welcome / Orientation Section */}
        <motion.div
          ref={welcomeRef}
          initial="hidden"
          animate={welcomeInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="mb-16"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold text-slate-800 mb-4">
              Welcome back, {user?.firstName || 'Friend'}
            </h1>
            <p className="text-xl text-slate-600 font-light">
              You're here. That's enough for now.
            </p>
          </div>
        </motion.div>

        {/* Your Journey Section */}
        <motion.div
          ref={journeyRef}
          initial="hidden"
          animate={journeyInView ? "visible" : "hidden"}
          variants={staggerChildren}
          className="mb-16"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-2xl font-semibold text-slate-800 mb-8 text-center"
          >
            Your Journey So Far
          </motion.h2>

          <div className="space-y-6">
            {journeyStages.map((stage, index) => (
              <motion.div
                key={stage.id}
                variants={fadeInUp}
                className="flex items-start gap-6 p-6 bg-purple-50 rounded-2xl"
              >
                <div className="text-2xl mt-1">
                  {stage.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-slate-800 mb-2">
                    {stage.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {stage.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Sessions Overview */}
        <motion.div
          ref={sessionsRef}
          initial="hidden"
          animate={sessionsInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="mb-16"
        >
          <div className="bg-purple-50 rounded-2xl p-8">
            <h2 className="text-2xl font-semibold text-slate-800 mb-6">Sessions</h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Attended:</span>
                <span className="text-slate-800 font-medium">{attendedSessions}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-600">Upcoming:</span>
                <span className="text-slate-800 font-medium">
                  {upcomingSession ? 'Session scheduled' : 'None scheduled'}
                </span>
              </div>
            </div>

            {!upcomingSession && (
              <div className="text-center">
                <a
                  href="/booking"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium"
                >
                  <Calendar size={18} />
                  Book a session
                </a>
              </div>
            )}
          </div>
        </motion.div>

        {/* Resources Explored */}
        <motion.div
          ref={resourcesRef}
          initial="hidden"
          animate={resourcesInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="mb-16"
        >
          <div className="bg-purple-50 rounded-2xl p-8">
            <h2 className="text-2xl font-semibold text-slate-800 mb-6">Resources You've Explored</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-4 p-4 bg-blue-50/50 rounded-xl">
                <BookOpen className="text-blue-600" size={24} />
                <div>
                  <h3 className="font-medium text-slate-800">Psycho-Education</h3>
                  <p className="text-sm text-slate-600">Understanding concepts</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-green-50/50 rounded-xl">
                <Heart className="text-green-600" size={24} />
                <div>
                  <h3 className="font-medium text-slate-800">Resources</h3>
                  <p className="text-sm text-slate-600">Gentle exploration</p>
                </div>
              </div>
            </div>

            <p className="text-slate-600 mt-6 text-center italic">
              You explored these topics recently.
            </p>
          </div>
        </motion.div>

        {/* Profile Settings & Privacy */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="space-y-6"
        >
          {/* Settings Toggle */}
          <div className="text-center">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="inline-flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
            >
              <Settings size={18} />
              Profile Settings
              {showSettings ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-purple-50 rounded-2xl p-8"
            >
              <h3 className="text-xl font-semibold text-slate-800 mb-6">Personal Details</h3>

              <div className="space-y-4 mb-8">
                {/* First Name */}
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-600">First Name:</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="px-3 py-1 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="First name"
                    />
                  ) : (
                    <span className="text-slate-800">{profileData.firstName}</span>
                  )}
                </div>

                {/* Last Name */}
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-600">Last Name:</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="px-3 py-1 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Last name"
                    />
                  ) : (
                    <span className="text-slate-800">{profileData.lastName}</span>
                  )}
                </div>

                {/* Avatar */}
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-600">Avatar:</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.avatar}
                      onChange={(e) => handleInputChange('avatar', e.target.value)}
                      className="px-3 py-1 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-center"
                      placeholder="😊"
                      maxLength="10"
                    />
                  ) : (
                    <span className="text-2xl">{profileData.avatar}</span>
                  )}
                </div>

                {/* Bio */}
                <div className="py-2">
                  <span className="text-slate-600 block mb-2">Bio:</span>
                  {isEditing ? (
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      placeholder="Tell us a bit about yourself..."
                      rows="3"
                      maxLength="500"
                    />
                  ) : (
                    <span className="text-slate-800">{profileData.bio || 'No bio added yet'}</span>
                  )}
                </div>

                {/* Location */}
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-600">Location:</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="px-3 py-1 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Your location"
                      maxLength="100"
                    />
                  ) : (
                    <span className="text-slate-800">{profileData.location || 'Not specified'}</span>
                  )}
                </div>

                {/* Interests */}
                <div className="py-2">
                  <span className="text-slate-600 block mb-2">Interests:</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.interests}
                      onChange={(e) => handleInputChange('interests', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Your interests..."
                      maxLength="200"
                    />
                  ) : (
                    <span className="text-slate-800">{profileData.interests || 'No interests added yet'}</span>
                  )}
                </div>

                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-600">Email:</span>
                  <span className="text-slate-800">{user?.email}</span>
                </div>
              </div>

              {/* Edit Actions */}
              {isEditing && (
                <div className="flex justify-center gap-4 mb-8">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    <Save size={16} />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="inline-flex items-center gap-2 px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                  >
                    <X size={16} />
                    Cancel
                  </button>
                </div>
              )}

              {/* Privacy & Trust Section */}
              <div className="border-t border-slate-200 pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="text-green-600" size={20} />
                  <h4 className="font-medium text-slate-800">Privacy & Trust</h4>
                </div>

                <div className="space-y-3 text-sm text-slate-600">
                  <p>You remain in control of your data.</p>
                  <p>All sessions are completely confidential.</p>
                  <p>We never share individual information.</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200">
                  <p className="text-xs text-slate-500 text-center">
                    Your privacy is central to everything we do.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Bottom Spacing */}
        <div className="h-16"></div>
      </div>
    </div>
  );
};

export default Profile;