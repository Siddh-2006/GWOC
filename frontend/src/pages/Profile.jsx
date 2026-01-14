import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Plus, ChevronRight, Edit3, Camera, Mail, Phone, Map, Info, Save, X,
  Heart, Clock, MapPin, TrendingUp, FileText, Sparkles, Calendar, BookOpen,
  Shield, Globe, Languages, Quote, Layout, Lock, Upload
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { authApi } from '../features/auth/auth.api';
import { uploadApi } from '../services/upload.api'; // Import upload service
import { reflectionApi } from '../services/reflection.api';
import { useLikedMedia } from '../hooks/useLikedMedia';
import { useSessions } from '../hooks/useSessions';
import { useJourney } from '../hooks/useJourney';
import { useToast } from '../hooks/useToast';

import SessionNotesModal from '../components/SessionNotesModal';
import SessionNotesViewer from '../components/SessionNotesViewer';
import SessionTasksModal from '../components/user/SessionTasksModal';
import AdminRemarksModal from '../components/user/AdminRemarksModal';
import ToastContainer from '../components/ToastContainer';

// New Components
import MyJourney from '../components/profile/MyJourney';
import SessionsTab from '../components/profile/SessionsTab';
import LikedContentTab from '../components/profile/LikedContentTab';

const EditProfileModal = ({ isOpen, onClose, user, onUpdate, showError, success }) => {
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    bio: user?.bio || '',
    address: user?.address || '',
    location: user?.location || '',
    gender: user?.gender || 'prefer_not_to_say',
    avatar: user?.avatar || '',
    interests: user?.interests || '',
    quote: user?.quote || '',
    language: user?.language || 'English',
    personality: user?.personality || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.updateProfile(formData);
      if (res.success) {
        onUpdate(res.data.user);
        success('Profile updated successfully!');
        onClose();
      } else {
        showError(res.message || 'Failed to update profile');
      }
    } catch (err) {
      showError('An error occurred during update');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      showError('Please select an image file');
      return;
    }

    // Check file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError('Image size should be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      const res = await uploadApi.uploadImage(file);
      if (res.success) {
        setFormData(prev => ({ ...prev, avatar: res.data.url }));
        // success('Image uploaded successfully!');
      } else {
        showError('Failed to upload image');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showError('Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragging(true);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileChange({ target: { files: [file] } });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm">
              <Edit3 className="text-violet-600" size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Edit Your Profile</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">First Name</label>
              <input
                name="firstName" value={formData.firstName} onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all outline-none"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Last Name</label>
              <input
                name="lastName" value={formData.lastName} onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all outline-none"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">Profile Photo</label>
            <div className="flex gap-4 items-center">
              <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md flex-shrink-0 border-2 border-violet-100 relative group">
                <img
                  src={formData.avatar}
                  alt="Avatar Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => e.target.src = 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}
                />
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <div
                className={`flex-1 border-2 border-dashed rounded-xl p-3 transition-colors text-center cursor-pointer ${isDragging
                  ? 'border-violet-500 bg-violet-50'
                  : 'border-gray-200 hover:border-violet-300'
                  }`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <div className="flex items-center justify-center gap-3">
                  <input
                    name="avatar"
                    value={formData.avatar}
                    onChange={handleChange}
                    className="hidden"
                  />
                  <input
                    type="file"
                    id="avatar-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={uploading}
                  />
                  <label
                    htmlFor="avatar-upload"
                    className={`px-3 py-1.5 rounded-lg font-bold text-white bg-violet-600 hover:bg-violet-700 transition-all cursor-pointer flex items-center gap-1.5 text-xs ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Upload size={14} />
                    <span>Upload</span>
                  </label>
                  <span className="text-xs text-gray-400">or drag and drop</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">Bio</label>
            <textarea
              name="bio" value={formData.bio} onChange={handleChange}
              rows="3"
              className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all outline-none resize-none"
              placeholder="Tell us a bit about yourself..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Gender</label>
              <select
                name="gender" value={formData.gender} onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all outline-none"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer Not to Say</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Location</label>
              <input
                name="location" value={formData.location} onChange={handleChange}
                placeholder="e.g. New York, USA"
                className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">Personal Quote</label>
            <input
              name="quote" value={formData.quote} onChange={handleChange}
              placeholder="A quote that inspires you..."
              className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Preferred Language</label>
              <input
                name="language" value={formData.language} onChange={handleChange}
                placeholder="e.g. English, Hindi"
                className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Personality Insight</label>
              <input
                name="personality" value={formData.personality} onChange={handleChange}
                placeholder="e.g. Introvert, Adventurous"
                className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">Address</label>
            <input
              name="address" value={formData.address} onChange={handleChange}
              placeholder="Your full address (private)"
              className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all outline-none"
            />
          </div>
        </form>

        <div className="p-6 border-t border-gray-100 flex gap-4">
          <button
            type="button" onClick={onClose}
            className="flex-1 py-3 px-6 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit} disabled={loading}
            className="flex-1 py-3 px-6 rounded-2xl font-bold text-white bg-violet-600 shadow-lg shadow-violet-200 hover:bg-violet-700 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={20} />}
            Save Changes
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const Profile = () => {
  const { userId } = useParams();
  const { user: currentUser, isInitialized, updateUser } = useAuthStore();
  const [viewedUser, setViewedUser] = useState(null);
  const [isAdminView, setIsAdminView] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Default to 'journey' as requested ("Journey" (Default Active Tab))
  const [activeTab, setActiveTab] = useState('journey');

  const { likedMedia, loading: likedLoading, error: likedError, toggleLike } = useLikedMedia(userId);
  const { categorizedSessions, loading: sessionsLoading, error: sessionsError, fetchSessions } = useSessions(userId);
  const { journeyData, loading: journeyLoading } = useJourney(userId);
  const { toasts, success, error: showError, removeToast } = useToast();

  // Modal States
  const [selectedSession, setSelectedSession] = useState(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showNotesViewer, setShowNotesViewer] = useState(false);
  const [showTasksModal, setShowTasksModal] = useState(false);
  const [showAdminRemarksModal, setShowAdminRemarksModal] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (userId && currentUser?.role === 'admin') {
        setIsAdminView(true);
        try {
          const res = await authApi.getUserProfile(userId);
          setViewedUser(res.data.user);
        } catch (err) {
          showError('Failed to fetch user profile');
        }
      } else {
        setViewedUser(currentUser);
        setIsAdminView(false);
      }
    };

    if (isInitialized) {
      fetchUserDetails();
    }
  }, [userId, currentUser, isInitialized]);

  const user = viewedUser;

  // Stats
  const userStats = {
    totalSessions: (categorizedSessions.upcoming?.length || 0) +
      (categorizedSessions.ongoing?.length || 0) +
      (categorizedSessions.past?.length || 0),
    likedContent: likedMedia?.length || 0,
    journeyEntries: journeyData?.entries?.length || 0,
  };

  const handleRemoveFromLiked = async (mediaId) => {
    try {
      await toggleLike(mediaId);
      success('Removed from liked content');
    } catch (error) {
      console.error('Error removing from liked:', error);
      showError(error.message || 'Failed to remove from liked content');
    }
  };

  const handleRegenerateSummary = async () => {
    try {
      setRegenerating(true);
      const res = await reflectionApi.admin.regenerateSummary(userId);
      if (res.success) {
        success('AI summary re-generated successfully');
        const profileRes = await authApi.getUserProfile(userId);
        setViewedUser(profileRes.data.user);
      } else {
        showError(res.message || 'Failed to re-generate summary');
      }
    } catch (err) {
      showError('An error occurred while re-generating summary');
    } finally {
      setRegenerating(false);
    }
  };

  const handleResetReflection = async () => {
    if (!window.confirm('Are you sure you want to reset this user\'s reflection status? This will delete all their current responses and AI summary, allowing them to retake the quiz.')) {
      return;
    }
    try {
      setResetting(true);
      const res = await reflectionApi.admin.resetUserReflection(userId);
      if (res.success) {
        success('User reflection reset successfully');
        const profileRes = await authApi.getUserProfile(userId);
        setViewedUser(profileRes.data.user);
        setActiveTab('sessions');
      } else {
        showError(res.message || 'Failed to reset reflection');
      }
    } catch (err) {
      showError('An error occurred while resetting reflection');
    } finally {
      setResetting(false);
    }
  };

  const handleProfileUpdate = (updatedUser) => {
    if (!isAdminView) {
      updateUser(updatedUser);
    }
    setViewedUser(updatedUser);
  };

  // Handlers for Modals
  const handleNotesClick = (session) => { setSelectedSession(session); setShowNotesModal(true); };
  const handleViewNotes = (session) => { setSelectedSession(session); setShowNotesViewer(true); };
  const handleTasksClick = (session) => { setSelectedSession(session); setShowTasksModal(true); };
  const handleAdminRemarksClick = (session) => { setSelectedSession(session); setShowAdminRemarksModal(true); };
  const handleNotesSuccess = async () => {
    success('Session notes saved successfully!');
    // Refresh sessions to update hasNotes property
    await fetchSessions();
  };

  // Loading State
  if (!isInitialized || !user) {
    return (
      <div className="min-h-screen pb-20 pt-4 sm:pt-8 flex items-center justify-center" style={{ backgroundColor: '#FFF5F7' }}>
        <div className="text-center px-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#3F2965] to-purple-600 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 animate-pulse">
            <User className="text-white" size={24} />
          </div>
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-[#3F2965] border-t-transparent mx-auto mb-3 sm:mb-4"></div>
          <p className="text-gray-600 font-medium text-sm sm:text-base">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    {
      id: 'journey',
      label: isAdminView ? `${user.firstName} 's Journey` : 'My Journey',
      icon: MapPin
    },
    {
      id: 'sessions',
      label: isAdminView ? `${user.firstName}'s Sessions` : 'My Sessions',
      icon: Calendar
    },
    {
      id: 'liked',
      label: isAdminView ? `${user.firstName}'s Liked Content` : 'Liked Content',
      icon: Heart
    }
  ];

  if (currentUser?.role === 'admin' && user?.reflectionCompleted) {
    tabs.push({ id: 'reflection', label: 'Reflection', icon: FileText });
  }

  return (
    <div className="min-h-screen pb-20 pt-24 sm:pt-28" style={{ backgroundColor: '#FFF5F7' }}>
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">

        {/* Hero Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative mb-6 sm:mb-8 lg:mb-10"
        >
          <div className="bg-white rounded-[2.5rem] shadow-xl p-6 sm:p-8 lg:p-10 border border-purple-50 relative">
            {!isAdminView && (
              <button
                onClick={() => setShowEditModal(true)}
                className="absolute top-6 right-6 sm:top-8 sm:right-8 px-5 py-2 sm:px-6 sm:py-2.5 bg-[#Dd1764] text-white rounded-full text-xs sm:text-sm font-bold uppercase tracking-widest shadow-lg shadow-pink-200 hover:bg-pink-700 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2 z-20"
              >
                <Edit3 size={14} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Update Profile</span>
                <span className="sm:hidden">Edit</span>
              </button>
            )}
            <div className="flex flex-col lg:flex-row gap-10 lg:gap-14">

              {/* Left Column: Avatar & Quote */}
              <div className="flex flex-col items-center shrink-0 w-full lg:w-48">
                <div className="relative group">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-[#3F2965] via-purple-600 to-[#Dd1764] flex items-center justify-center text-white text-5xl font-bold shadow-2xl relative overflow-hidden ring-8 ring-white group-hover:scale-105 transition-transform duration-500">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center">
                        <span className="text-6xl mb-1">😊</span>
                        <span className="text-[10px] opacity-60 font-medium tracking-widest uppercase">Member</span>
                      </div>
                    )}
                  </div>

                  {!isAdminView && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowEditModal(true)}
                      className="absolute bottom-2 right-2 w-10 h-10 bg-white rounded-full shadow-lg border border-pink-100 flex items-center justify-center text-[#Dd1764] hover:text-pink-700 transition-all opacity-0 group-hover:opacity-100 z-10"
                    >
                      <Camera size={18} />
                    </motion.button>
                  )}
                </div>

                {/* User Quote */}
                <div className="mt-6 text-center w-full">
                  {user?.quote ? (
                    <div className="flex flex-col items-center gap-1">
                      <Quote size={12} className="text-[#Dd1764] opacity-40" />
                      <p className="text-xs sm:text-sm font-serif italic text-gray-500 leading-relaxed max-w-[200px]">
                        {user.quote}
                      </p>
                    </div>
                  ) : !isAdminView && (
                    <button onClick={() => setShowEditModal(true)} className="text-[10px] font-bold text-[#Dd1764] hover:text-pink-600 uppercase tracking-tighter transition-colors">
                      + Add Inspiration
                    </button>
                  )}
                </div>
              </div>

              {/* Main Content Column */}
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div className="flex flex-col sm:flex-col items-center sm:items-baseline gap-2 sm:gap-4 mb-6">
                    <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight leading-none uppercase">
                      {user?.firstName} {user?.lastName}
                    </h1>
                    <span className="text-sm sm:text-base font-medium text-gray-400 lowercase tracking-tight">
                      {user?.email}
                    </span>
                  </div>

                  {/* Profile Metadata Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div className="space-y-1">
                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <User size={12} /> Identity
                      </h4>
                      <p className="text-sm font-semibold capitalize text-gray-700">{user?.gender?.replace(/_/g, ' ') || 'Not specified'}</p>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Languages size={12} /> Language
                      </h4>
                      <p className="text-sm font-semibold text-gray-700">{user?.language || 'English'}</p>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Sparkles size={12} /> Personality
                      </h4>
                      <p className="text-sm font-semibold text-gray-700">{user?.personality || 'Discovering...'}</p>
                    </div>
                  </div>

                  {/* Bio Section */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <BookOpen size={12} /> About Me
                    </h4>
                    {user?.bio ? (
                      <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-medium bg-gray-50/30 p-4 rounded-2xl border border-gray-100">
                        {user.bio}
                      </p>
                    ) : !isAdminView && (
                      <div className="p-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50/30 text-center">
                        <p className="text-gray-400 text-xs italic mb-2">Share your story with the community...</p>
                        <button onClick={() => setShowEditModal(true)} className="text-[#Dd1764] text-xs font-bold hover:underline">Write Bio</button>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </motion.div>


        {/* Enhanced Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex justify-center mb-6 sm:mb-8"
        >
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-1.5 sm:p-2 flex gap-1 sm:gap-2 w-full max-w-2xl overflow-x-auto">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative px-3 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl flex items-center gap-1 sm:gap-2 font-semibold text-xs sm:text-sm transition-all duration-300 whitespace-nowrap flex-1 justify-center ${isActive
                    ? 'text-white bg-[#Dd1764] shadow-lg shadow-pink-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                    }`}
                >
                  <tab.icon size={14} className="flex-shrink-0" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                  {/* Enhanced count badges */}
                  {tab.id === 'sessions' && userStats.totalSessions > 0 && (
                    <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-bold ${isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-violet-100 text-violet-700'
                      }`}>
                      {userStats.totalSessions}
                    </span>
                  )}
                  {tab.id === 'liked' && userStats.likedContent > 0 && (
                    <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-bold ${isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-pink-100 text-pink-700'
                      }`}>
                      {userStats.likedContent}
                    </span>
                  )}
                  {tab.id === 'journey' && userStats.journeyEntries > 0 && (
                    <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-bold ${isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-indigo-100 text-indigo-700'
                      }`}>
                      {userStats.journeyEntries}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Main Content Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="min-h-[400px] sm:min-h-[600px]"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              {activeTab === 'journey' && (
                <MyJourney
                  journeyData={journeyData}
                  loading={journeyLoading}
                  isAdminView={isAdminView}
                  userName={user.firstName}
                />
              )}

              {activeTab === 'sessions' && (
                <SessionsTab
                  categorizedSessions={categorizedSessions}
                  loading={sessionsLoading}
                  error={sessionsError}
                  onRetry={fetchSessions}
                  onNotesClick={handleNotesClick}
                  onViewNotes={handleViewNotes}
                  onTasksClick={handleTasksClick}
                  onAdminRemarksClick={handleAdminRemarksClick}
                  isAdminView={isAdminView}
                  userName={user.firstName}
                />
              )}

              {activeTab === 'liked' && (
                <LikedContentTab
                  likedMedia={likedMedia}
                  loading={likedLoading}
                  error={likedError}
                  onUnlike={handleRemoveFromLiked}
                  isAdminView={isAdminView}
                  userName={user.firstName}
                />
              )}

              {activeTab === 'reflection' && (
                <div className="space-y-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-violet-50 text-violet-900 rounded-xl">
                      <FileText size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">Pre-Session Reflection</h2>
                      <p className="text-sm text-gray-500">Admin controls & AI Insights</p>
                    </div>
                  </div>

                  <div className="mb-8 flex flex-wrap gap-4">
                    <button
                      onClick={handleRegenerateSummary}
                      disabled={regenerating}
                      className="flex items-center gap-2 px-5 py-2.5 bg-violet-50 text-violet-700 hover:bg-violet-100 rounded-xl transition-colors font-semibold"
                    >
                      {regenerating ? <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" /> : <Sparkles size={18} />}
                      Regenerate Summary
                    </button>
                    <button
                      onClick={handleResetReflection}
                      disabled={resetting}
                      className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors font-semibold"
                    >
                      {resetting ? <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" /> : <Clock size={18} />}
                      Reset Reflection
                    </button>
                  </div>

                  <div className="bg-violet-50/50 p-8 rounded-3xl border border-violet-100 mb-8">
                    <h3 className="text-lg font-bold text-violet-900 mb-4 flex items-center gap-2">
                      <Sparkles size={20} className="text-pink-500" />
                      AI Insights
                    </h3>
                    <div className="prose prose-violet max-w-none text-gray-700 leading-relaxed">
                      {user.reflectionSummary ? (
                        user.reflectionSummary.split('\n').map((line, i) => {
                          // Check if line is a header (all caps, ends with colon)
                          const isHeader = line.trim().endsWith(':') && line === line.toUpperCase() && line.length > 3;
                          // Check if line is a labeled list item (starts with - and has colon)
                          const isLabelLine = line.trim().startsWith('- ') && line.includes(':');

                          if (isHeader) {
                            return <p key={i} className="font-black text-gray-900 mt-6 mb-2 tracking-tight uppercase text-sm border-b border-violet-100 pb-1">{line}</p>;
                          }

                          if (isLabelLine) {
                            const [label, ...rest] = line.split(':');
                            return (
                              <p key={i} className="mb-2">
                                <span className="font-bold text-gray-900">{label}:</span>
                                {rest.join(':')}
                              </p>
                            );
                          }

                          // Handle standard markdown bolding **text**
                          if (line.includes('**')) {
                            const parts = line.split(/(\*\*.*?\*\*)/g);
                            return (
                              <p key={i} className="mb-2">
                                {parts.map((part, j) =>
                                  part.startsWith('**') && part.endsWith('**')
                                    ? <strong key={j} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>
                                    : part
                                )}
                              </p>
                            );
                          }

                          return <p key={i} className="mb-2">{line}</p>;
                        })
                      ) : <p className="italic text-gray-500">No summary available.</p>}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {user.reflectionResponses && Object.entries(user.reflectionResponses).map(([key, data]) => (
                      <div key={key} className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <p className="text-xs font-bold text-pink-500 uppercase tracking-wider mb-2">{data.category}</p>
                        <h4 className="font-serif font-bold text-gray-900 text-lg mb-2">{data.questionText}</h4>
                        <div className="bg-gray-50 p-3 rounded-lg text-gray-700 font-medium inline-block">
                          {data.selectedLabel}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Modals & Toasts */}
        <EditProfileModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          user={user}
          onUpdate={handleProfileUpdate}
          showError={showError}
          success={success}
        />
        {showNotesModal && selectedSession && (
          <SessionNotesModal
            session={selectedSession}
            isOpen={showNotesModal}
            onClose={() => { setShowNotesModal(false); setSelectedSession(null); }}
            onSave={handleNotesSuccess}
          />
        )}
        {showNotesViewer && selectedSession && (
          <SessionNotesViewer
            session={selectedSession}
            isOpen={showNotesViewer}
            onClose={() => { setShowNotesViewer(false); setSelectedSession(null); }}
            onEdit={() => { setShowNotesViewer(false); setShowNotesModal(true); }}
          />
        )}
        {showTasksModal && selectedSession && (
          <SessionTasksModal
            session={selectedSession}
            isOpen={showTasksModal}
            onClose={() => { setShowTasksModal(false); setSelectedSession(null); }}
          />
        )}
        {showAdminRemarksModal && selectedSession && (
          <AdminRemarksModal
            session={selectedSession}
            isOpen={showAdminRemarksModal}
            onClose={() => { setShowAdminRemarksModal(false); setSelectedSession(null); }}
          />
        )}
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </div>
  );
};

export default Profile;