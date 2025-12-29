import { useState, useEffect } from 'react';
import { Calendar, BookOpen, Heart, Shield, Edit2, Save, X } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { bookingApi } from '../features/booking/booking.api';
import { authApi } from '../features/auth/auth.api';

const ProfileSimple = () => {
  const { user, isAuthenticated, isInitialized, setUser } = useAuthStore();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  // Editable profile data
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    avatar: '😊',
    bio: '',
    location: '',
    interests: ''
  });

  // Positive emoji options only
  const positiveEmojis = [
    '😊', '😄', '😃', '🙂', '😌', '🤗', '🥰', '😇',
    '🤓', '🧠', '💪', '🌟', '✨', '🎯', '🚀', '🌈',
    '🌸', '🌺', '🦋', '🌻', '🍀', '🌙', '☀️', '⭐'
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (user) {
          const userBookings = await bookingApi.getUserBookings();
          setBookings(userBookings || []);

          // Initialize profile data with user data
          setProfileData({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            avatar: user.avatar || '😊',
            bio: user.bio || '',
            location: user.location || '',
            interests: user.interests || ''
          });
        }
      } catch (error) {
        // Error handled silently
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  // Handle profile update
  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      // Validate required fields
      if (!profileData.firstName || !profileData.lastName) {
        alert('First name and last name are required.');
        setSaving(false);
        return;
      }

      // Clean the data - only send non-empty fields
      const cleanData = {};

      // Always include required fields
      if (profileData.firstName) cleanData.firstName = profileData.firstName.trim();
      if (profileData.lastName) cleanData.lastName = profileData.lastName.trim();

      // Only include optional fields if they have values
      if (profileData.avatar) cleanData.avatar = profileData.avatar;
      if (profileData.bio && profileData.bio.trim()) cleanData.bio = profileData.bio.trim();
      if (profileData.location && profileData.location.trim()) cleanData.location = profileData.location.trim();
      if (profileData.interests && profileData.interests.trim()) cleanData.interests = profileData.interests.trim();

      const response = await authApi.updateProfile(cleanData);

      if (response.success) {
        setUser(response.data.user);
        setIsEditing(false);
        alert('Profile updated successfully!');
      } else {
        alert(response.message || 'Failed to update profile. Please try again.');
      }
    } catch (error) {
      let errorMessage = 'Failed to update profile. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        errorMessage = error.response.data.errors.join(', ');
      } else if (error.message) {
        errorMessage = error.message;
      }

      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setProfileData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      avatar: user.avatar || '😊',
      bio: user.bio || '',
      location: user.location || '',
      interests: user.interests || ''
    });
    setIsEditing(false);
    setShowEmojiPicker(false);
  };

  const handleEmojiSelect = (emoji) => {
    setProfileData(prev => ({ ...prev, avatar: emoji }));
    setShowEmojiPicker(false);
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
      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Panel */}
          <div className="lg:col-span-4">
            <div className="bg-purple-100 rounded-3xl p-8 shadow-lg">

              {/* Avatar Section */}
              <div className="text-center mb-8">
                <div className="relative inline-block mb-6">
                  <div className="w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center text-6xl shadow-lg mx-auto border-4 border-white">
                    {profileData.avatar}
                  </div>

                  {/* Edit Avatar Button */}
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="absolute -bottom-2 -right-2 w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors shadow-lg"
                  >
                    <Edit2 size={16} />
                  </button>

                  {/* Emoji Picker */}
                  {showEmojiPicker && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowEmojiPicker(false)}
                      ></div>

                      <div className="absolute top-full mt-4 left-1/2 transform -translate-x-1/2 bg-white rounded-2xl shadow-2xl p-6 z-50 border-2 border-purple-100 w-80">
                        <p className="text-sm text-gray-600 mb-4 text-center font-medium">Choose your avatar</p>
                        <div className="grid grid-cols-8 gap-2">
                          {positiveEmojis.map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => handleEmojiSelect(emoji)}
                              className={`w-10 h-10 text-xl hover:bg-purple-50 rounded-xl transition-all flex items-center justify-center hover:scale-110 ${profileData.avatar === emoji ? 'bg-purple-100 ring-2 ring-purple-400' : ''
                                }`}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <h1 className="text-3xl font-light text-slate-800 mb-2">
                  {profileData.firstName} {profileData.lastName}
                </h1>
                <p className="text-slate-600 mb-4">{profileData.email}</p>

                {profileData.bio && (
                  <p className="text-slate-700 italic leading-relaxed mb-4">
                    "{profileData.bio}"
                  </p>
                )}

                {profileData.location && (
                  <p className="text-slate-600 text-sm mb-2">
                    📍 {profileData.location}
                  </p>
                )}

                {profileData.interests && (
                  <p className="text-slate-600 text-sm">
                    ✨ {profileData.interests}
                  </p>
                )}
              </div>

              {/* Edit Profile Button */}
              <div className="text-center">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium mx-auto"
                  >
                    <Edit2 size={18} />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save size={18} />
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors font-medium disabled:opacity-50"
                    >
                      <X size={18} />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="lg:col-span-8 space-y-8">

            {/* Welcome Message */}
            <div className="bg-purple-100 rounded-3xl p-8 shadow-lg">
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">
                Welcome back, {profileData.firstName || 'Friend'}
              </h2>
              <p className="text-xl text-slate-600 font-light">
                You're here. That's enough for now.
              </p>
            </div>

            {/* Edit Profile Form */}
            {isEditing && (
              <div className="bg-purple-100 rounded-3xl p-8 shadow-lg">
                <h3 className="text-xl font-semibold text-slate-800 mb-6">Edit Your Details</h3>

                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-2">First Name</label>
                      <input
                        type="text"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-2">Last Name</label>
                      <input
                        type="text"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">Email</label>
                    <input
                      type="email"
                      value={profileData.email}
                      disabled
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
                  </div>

                  {/* Optional Information */}
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">Bio (Optional)</label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Tell us a little about yourself..."
                      rows={3}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">Location (Optional)</label>
                    <input
                      type="text"
                      value={profileData.location}
                      onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="e.g., Surat, Gujarat"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">Interests (Optional)</label>
                    <input
                      type="text"
                      value={profileData.interests}
                      onChange={(e) => setProfileData(prev => ({ ...prev, interests: e.target.value }))}
                      placeholder="e.g., Reading, Meditation, Art"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Journey Section */}
            <div className="bg-purple-100 rounded-3xl p-8 shadow-lg">
              <h2 className="text-2xl font-semibold text-slate-800 mb-8">Your Journey So Far</h2>

              <div className="space-y-6">
                <div className="flex items-start gap-6 p-6 bg-gradient-to-r from-purple-50/50 to-pink-50/50 rounded-2xl">
                  <div className="text-3xl mt-1">🌱</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-slate-800 mb-2">Discovered MindSettler</h3>
                    <p className="text-slate-600 leading-relaxed">You found this space for understanding.</p>
                  </div>
                </div>

                <div className="flex items-start gap-6 p-6 bg-gradient-to-r from-purple-50/50 to-pink-50/50 rounded-2xl">
                  <div className="text-3xl mt-1">📚</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-slate-800 mb-2">Explored Psycho-Education</h3>
                    <p className="text-slate-600 leading-relaxed">You began learning about yourself.</p>
                  </div>
                </div>

                {bookings.length > 0 && (
                  <div className="flex items-start gap-6 p-6 bg-gradient-to-r from-purple-50/50 to-pink-50/50 rounded-2xl">
                    <div className="text-3xl mt-1">🤝</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-slate-800 mb-2">Booked Sessions</h3>
                      <p className="text-slate-600 leading-relaxed">You took steps toward understanding.</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-6 p-6 bg-gradient-to-r from-purple-50/50 to-pink-50/50 rounded-2xl">
                  <div className="text-3xl mt-1">🌸</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-slate-800 mb-2">Ongoing Reflection</h3>
                    <p className="text-slate-600 leading-relaxed">Your journey continues at your own pace.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sessions Overview */}
            <div className="bg-purple-100 rounded-3xl p-8 shadow-lg">
              <h2 className="text-2xl font-semibold text-slate-800 mb-6">Sessions</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {bookings.filter(b => b.status === 'confirmed' || b.status === 'completed').length}
                  </div>
                  <div className="text-slate-600">Sessions Attended</div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-2xl">
                  <div className="text-lg font-medium text-slate-800 mb-2">
                    {bookings.find(b => b.status === 'confirmed') ? 'Session Scheduled' : 'No Upcoming Sessions'}
                  </div>
                  <div className="text-slate-600 text-sm">
                    {bookings.find(b => b.status === 'confirmed') ? 'You have a session coming up' : 'Ready when you are'}
                  </div>
                </div>
              </div>

              <div className="text-center">
                <a
                  href="/booking"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-pink-600 text-white rounded-2xl hover:bg-purple-700 transition-all font-medium hover:scale-105 shadow-lg"
                >
                  <Calendar size={20} />
                  Book Session
                </a>
              </div>
            </div>

            {/* Resources Explored */}
            <div className="bg-purple-100 rounded-3xl p-8 shadow-lg">
              <h2 className="text-2xl font-semibold text-slate-800 mb-6">Resources You've Explored</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-2xl">
                  <BookOpen className="text-blue-600" size={32} />
                  <div>
                    <h3 className="font-medium text-slate-800 text-lg">Psycho-Education</h3>
                    <p className="text-sm text-slate-600">Understanding concepts</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-green-50/50 to-blue-50/50 rounded-2xl">
                  <Heart className="text-green-600" size={32} />
                  <div>
                    <h3 className="font-medium text-slate-800 text-lg">Resources</h3>
                    <p className="text-sm text-slate-600">Gentle exploration</p>
                  </div>
                </div>
              </div>

              <p className="text-slate-600 mt-8 text-center italic">
                You explored these topics recently.
              </p>
            </div>

            {/* Privacy Section */}
            <div className="bg-purple-100 rounded-3xl p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="text-green-600" size={24} />
                <h3 className="text-xl font-semibold text-slate-800">Privacy & Trust</h3>
              </div>

              <div className="space-y-4 text-slate-600">
                <p>You remain in control of your data.</p>
                <p>All sessions are completely confidential.</p>
                <p>We never share individual information.</p>
                <p>Optional fields help us personalize your experience but can be left empty.</p>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200">
                <p className="text-sm text-slate-500 text-center">
                  Your privacy is central to everything we do.
                </p>
              </div>
            </div>

            {/* Bottom Spacing */}
            <div className="h-16"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSimple;