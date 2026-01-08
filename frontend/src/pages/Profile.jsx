import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User, Heart,
  Clock, Play,
  Shield, CheckCircle, CalendarDays, MapPin,
  Award, TrendingUp, Target, BookOpen,
  Star, Activity, Zap
} from 'lucide-react';
import { useParams, Navigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { authApi } from '../features/auth/auth.api';
import { reflectionApi } from '../services/reflection.api';
import { useLikedMedia } from '../hooks/useLikedMedia';
import { useSessions } from '../hooks/useSessions';
import { useJourney } from '../hooks/useJourney';
import { useToast } from '../hooks/useToast';
import EnhancedSessionCard from '../components/user/EnhancedSessionCard';
import SessionNotesModal from '../components/SessionNotesModal';
import SessionNotesViewer from '../components/SessionNotesViewer';
import SessionTasksModal from '../components/user/SessionTasksModal';
import AdminRemarksModal from '../components/user/AdminRemarksModal';
import JourneyTimeline from '../components/user/JourneyTimeline';
import MediaCard from '../components/MediaCard';
import ToastContainer from '../components/ToastContainer';

const ProfileCard = ({ children, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}
  >
    {children}
  </motion.div>
);

const SectionHeading = ({ icon: Icon, title, subtitle }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="flex items-center gap-3">
      <div className="p-3 bg-purple-50 text-primary rounded-xl">
        <Icon size={24} />
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
    </div>
  </div>
);

const Profile = () => {
  const { userId } = useParams();
  const { user: currentUser, isAuthenticated, isInitialized } = useAuthStore();
  const [viewedUser, setViewedUser] = useState(null);
  const [isAdminView, setIsAdminView] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('sessions');
  const { likedMedia, loading: likedLoading, error: likedError, toggleLike } = useLikedMedia(userId);
  const { categorizedSessions, loading: sessionsLoading, error: sessionsError, fetchSessions } = useSessions(userId);
  const { journeyData, loading: journeyLoading, error: journeyError } = useJourney(userId);
  const { toasts, success, error: showError, removeToast } = useToast();

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (userId && currentUser?.role === 'admin') {
        setProfileLoading(true);
        setIsAdminView(true);
        try {
          const res = await authApi.getUserProfile(userId);
          setViewedUser(res.data.user);
        } catch (err) {
          showError('Failed to fetch user profile');
        } finally {
          setProfileLoading(false);
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

  // Use viewedUser for rendering
  const user = viewedUser;

  // Calculate user stats
  const userStats = {
    totalSessions: (categorizedSessions.upcoming?.length || 0) + 
                   (categorizedSessions.ongoing?.length || 0) + 
                   (categorizedSessions.past?.length || 0),
    completedSessions: categorizedSessions.past?.length || 0,
    upcomingSessions: categorizedSessions.upcoming?.length || 0,
    likedContent: likedMedia?.length || 0,
    journeyEntries: journeyData?.entries?.length || 0,
    memberSince: user?.createdAt ? new Date(user.createdAt).getFullYear() : new Date().getFullYear()
  };

  // Calculate completion rate
  const completionRate = userStats.totalSessions > 0 
    ? Math.round((userStats.completedSessions / userStats.totalSessions) * 100) 
    : 0;

  // Handle removing from liked content with feedback
  const handleRemoveFromLiked = async (mediaId) => {
    try {
      await toggleLike(mediaId);
      success('Removed from liked content');
    } catch (error) {
      console.error('Error removing from liked:', error);
      showError(error.message || 'Failed to remove from liked content');
    }
  };

  // Session notes modal state
  const [selectedSession, setSelectedSession] = useState(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showNotesViewer, setShowNotesViewer] = useState(false);
  const [showTasksModal, setShowTasksModal] = useState(false);
  const [showAdminRemarksModal, setShowAdminRemarksModal] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const handleRegenerateSummary = async () => {
    try {
      setRegenerating(true);
      const res = await reflectionApi.admin.regenerateSummary(userId);
      if (res.success) {
        success('AI summary re-generated successfully');
        // Refresh profile data
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
        // Refresh profile data
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

  // Tab configuration - My Sessions, Journey, and Liked Content
  const tabs = [
    { id: 'sessions', label: 'My Sessions', icon: CalendarDays },
    { id: 'journey', label: 'My Journey', icon: MapPin },
    { id: 'liked', label: 'Liked Content', icon: Heart }
  ];

  // Add Reflection tab if user is admin and viewedUser has reflection data
  if (currentUser?.role === 'admin' && user?.reflectionCompleted) {
    tabs.splice(2, 0, { id: 'reflection', label: 'Reflection', icon: FileText });
  }

  // Loading State
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Authentication Check
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <User size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Please Sign In</h2>
          <p className="text-gray-600">You need to be signed in to view your profile.</p>
        </div>
      </div>
    );
  }

  const handleNotesClick = (session) => {
    setSelectedSession(session);
    setShowNotesModal(true);
  };

  const handleViewNotes = (session) => {
    setSelectedSession(session);
    setShowNotesViewer(true);
  };

  const handleTasksClick = (session) => {
    setSelectedSession(session);
    setShowTasksModal(true);
  };

  const handleAdminRemarksClick = (session) => {
    setSelectedSession(session);
    setShowAdminRemarksModal(true);
  };

  const handleNotesSuccess = () => {
    success('Session notes saved successfully!');
    fetchSessions(); // Refresh sessions to show updated notes
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 pt-25">
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Profile Header - Compact Horizontal Layout */}
        <section className="mb-8">
          <ProfileCard className="relative overflow-hidden">
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-gradient-to-br from-[#3F2965] via-transparent to-[#3F2965]/20"></div>
            </div>
            
            <div className="relative flex flex-col sm:flex-row items-center gap-6">
              
              {/* Profile Picture */}
              <div className="flex-shrink-0">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#3F2965]/30 to-[#3F2965]/60 rounded-full p-1">
                    <div className="w-full h-full bg-gradient-to-br from-[#3F2965] to-[#3F2965]/80 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center border border-[#3F2965]/20">
                    <Shield size={12} className="text-[#3F2965]" />
                  </div>
                </div>
              </div>

              {/* User Info */}
              <div className="flex-grow text-center sm:text-left">
                <h1 className="text-2xl font-bold text-gray-800 mb-1">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-gray-600 text-sm mb-2">{user.email}</p>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${user.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700'}`}>
                  <Shield size={12} /> {user.role === 'admin' ? 'Admin' : 'Verified'}
                </span>
                {isAdminView && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold ml-2">
                    Admin View
                  </span>
                )}
              </div>

              {/* Compact Stats */}
              <div className="flex-shrink-0">
                <div className="flex gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center w-10 h-10 bg-[#3F2965]/10 rounded-lg mb-1">
                      <CalendarDays size={16} className="text-[#3F2965]" />
                    </div>
                    <p className="text-lg font-bold text-[#3F2965]">{userStats.totalSessions}</p>
                    <p className="text-xs text-[#3F2965]/70">Sessions</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center w-10 h-10 bg-[#Dd1764]/10 rounded-lg mb-1">
                      <Heart size={16} className="text-[#Dd1764]" />
                    </div>
                    <p className="text-lg font-bold text-[#Dd1764]">{userStats.likedContent}</p>
                    <p className="text-xs text-[#Dd1764]/70">Liked</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center w-10 h-10 bg-[#3F2965]/10 rounded-lg mb-1">
                      <MapPin size={16} className="text-[#3F2965]" />
                    </div>
                    <p className="text-lg font-bold text-[#3F2965]">{userStats.journeyEntries}</p>
                    <p className="text-xs text-[#3F2965]/70">Journey</p>
                  </div>
                </div>
              </div>
            </div>
          </ProfileCard>
        </section>

        {/* Refined Quick Actions */}
        <section className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-gradient-to-br from-[#3F2965] to-[#3F2965]/90 text-white p-8 rounded-3xl shadow-xl shadow-[#3F2965]/20 cursor-pointer relative overflow-hidden"
              onClick={() => window.location.href = '/booking'}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative flex items-center gap-4">
                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <CalendarDays size={28} />
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-1">Book Session</h3>
                  <p className="text-white/80 text-sm opacity-90">Schedule your next appointment</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-gradient-to-br from-[#3F2965]/80 to-[#3F2965]/70 text-white p-8 rounded-3xl shadow-xl shadow-[#3F2965]/15 cursor-pointer relative overflow-hidden"
              onClick={() => window.location.href = '/resources'}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative flex items-center gap-4">
                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <BookOpen size={28} />
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-1">Explore Resources</h3>
                  <p className="text-white/80 text-sm">Discover helpful content</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-gradient-to-br from-[#Dd1764] to-[#Dd1764]/80 text-white p-8 rounded-3xl shadow-xl shadow-[#Dd1764]/20 cursor-pointer relative overflow-hidden"
              onClick={() => setActiveTab('journey')}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative flex items-center gap-4">
                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <TrendingUp size={28} />
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-1">View Progress</h3>
                  <p className="text-white/80 text-sm">Track your journey</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Welcome Message for New Users */}
        {userStats.totalSessions === 0 && (
          <section className="mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-[#3F2965] to-[#3F2965]/90 text-white p-10 rounded-3xl shadow-2xl shadow-[#3F2965]/20 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16"></div>
              
              <div className="relative">
                <div className="flex items-center gap-6 mb-6">
                  <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                    <Star size={36} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold mb-2">Welcome to MindSettler</h2>
                    <p className="text-white/80 text-lg">Your mental wellness journey begins here</p>
                  </div>
                </div>
                <p className="text-white/90 mb-8 leading-relaxed text-lg">
                  We're honored to support you on your path to better mental health. Take a moment to explore your profile, 
                  book your first session, and discover our carefully curated resources.
                </p>
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => window.location.href = '/booking'}
                    className="bg-white text-[#3F2965] px-8 py-4 rounded-2xl font-semibold hover:bg-white/95 transition-all duration-300 shadow-lg"
                  >
                    Book Your First Session
                  </button>
                  <button
                    onClick={() => window.location.href = '/resources'}
                    className="bg-white/20 text-white px-8 py-4 rounded-2xl font-semibold hover:bg-white/30 transition-all duration-300 backdrop-blur-sm border border-white/20"
                  >
                    Explore Resources
                  </button>
                </div>
              </div>
            </motion.div>
          </section>
        )}

        {/* Progress Motivation for Active Users */}
        {userStats.totalSessions > 0 && userStats.completedSessions < userStats.totalSessions && (
          <section className="mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-[#3F2965]/80 to-[#3F2965]/70 text-white p-8 rounded-3xl shadow-xl shadow-[#3F2965]/15 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                    <TrendingUp size={28} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-1">Keep Going Strong</h3>
                    <p className="text-white/80">You're making wonderful progress on your journey</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-bold mb-1">{userStats.upcomingSessions}</p>
                  <p className="text-white/80">upcoming sessions</p>
                </div>
              </div>
            </motion.div>
          </section>
        )}
        <section className="mb-12">
          <div className="flex justify-center">
            <div className="flex bg-white/80 backdrop-blur-sm rounded-3xl p-2 shadow-lg shadow-[#3F2965]/10 border border-[#3F2965]/10">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center gap-2 px-8 py-3 rounded-xl transition-all whitespace-nowrap font-medium ${activeTab === tab.id
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'text-gray-600 hover:text-primary hover:bg-purple-50'
                    }`}
                >
                  <tab.icon size={20} />
                  {tab.label}
                  {/* Refined count badges */}
                  {tab.id === 'sessions' && userStats.totalSessions > 0 && (
                    <span className={`ml-1 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-[#3F2965]/10 text-[#3F2965]'
                    }`}>
                      {userStats.totalSessions}
                    </span>
                  )}
                  {tab.id === 'liked' && userStats.likedContent > 0 && (
                    <span className={`ml-1 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-[#Dd1764]/10 text-[#Dd1764]'
                    }`}>
                      {userStats.likedContent}
                    </span>
                  )}
                  {tab.id === 'journey' && userStats.journeyEntries > 0 && (
                    <span className={`ml-1 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-[#3F2965]/10 text-[#3F2965]'
                    }`}>
                      {userStats.journeyEntries}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Tab Content */}
        <div className="space-y-8">

          {/* My Sessions Tab */}
          {activeTab === 'sessions' && (
            <div className="space-y-6">
              <ProfileCard>
                <SectionHeading
                  icon={CalendarDays}
                  title="My Sessions"
                  subtitle="Manage your session notes and track assigned tasks"
                />

                {sessionsLoading ? (
                  <div className="text-center py-12">
                    <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading your sessions...</p>
                  </div>
                ) : sessionsError ? (
                  <div className="text-center py-12">
                    <div className="text-red-500 mb-4">⚠️</div>
                    <p className="text-red-600 mb-2">Failed to load sessions</p>
                    <p className="text-sm text-gray-500">{sessionsError}</p>
                    <button
                      onClick={() => fetchSessions()}
                      className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  /* Check if we have any sessions at all */
                  categorizedSessions.upcoming.length === 0 &&
                    categorizedSessions.ongoing.length === 0 &&
                    categorizedSessions.past.length === 0 ? (
                    /* Complete Empty State */
                    <div className="text-center py-20">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <div className="relative mb-10">
                          <div className="w-20 h-20 bg-gradient-to-br from-[#3F2965]/20 to-[#3F2965]/10 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                            <CalendarDays size={40} className="text-[#3F2965]/60" />
                          </div>
                          <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#3F2965] rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-white text-sm font-bold">!</span>
                          </div>
                        </div>
                        <h3 className="text-3xl font-semibold text-gray-800 mb-4">Ready to Begin Your Journey?</h3>
                        <p className="text-gray-600 mb-12 max-w-lg mx-auto leading-relaxed text-lg">
                          Take the first step towards better mental health. Our personalized sessions are designed to help you grow and thrive.
                        </p>
                        
                        {/* Benefits Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
                          <div className="bg-gradient-to-br from-[#3F2965]/5 to-[#3F2965]/10 p-6 rounded-2xl border border-[#3F2965]/10">
                            <div className="w-12 h-12 bg-[#3F2965]/15 rounded-xl flex items-center justify-center mx-auto mb-4">
                              <User className="w-6 h-6 text-[#3F2965]" />
                            </div>
                            <p className="font-semibold text-[#3F2965] mb-2">Personalized Care</p>
                            <p className="text-sm text-[#3F2965]/70">Tailored to your unique needs</p>
                          </div>
                          <div className="bg-gradient-to-br from-[#3F2965]/5 to-[#3F2965]/10 p-6 rounded-2xl border border-[#3F2965]/10">
                            <div className="w-12 h-12 bg-[#3F2965]/15 rounded-xl flex items-center justify-center mx-auto mb-4">
                              <Shield className="w-6 h-6 text-[#3F2965]" />
                            </div>
                            <p className="font-semibold text-[#3F2965] mb-2">Safe Environment</p>
                            <p className="text-sm text-[#3F2965]/70">Confidential and supportive</p>
                          </div>
                          <div className="bg-gradient-to-br from-[#3F2965]/5 to-[#3F2965]/10 p-6 rounded-2xl border border-[#3F2965]/10">
                            <div className="w-12 h-12 bg-[#3F2965]/15 rounded-xl flex items-center justify-center mx-auto mb-4">
                              <TrendingUp className="w-6 h-6 text-[#3F2965]" />
                            </div>
                            <p className="font-semibold text-[#3F2965] mb-2">Track Progress</p>
                            <p className="text-sm text-[#3F2965]/70">Monitor your growth journey</p>
                          </div>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="bg-[#3F2965] text-white px-10 py-5 rounded-2xl font-semibold shadow-xl shadow-[#3F2965]/20 hover:shadow-2xl hover:shadow-[#3F2965]/30 transition-all duration-300"
                          onClick={() => window.location.href = '/booking'}
                        >
                          Book Your First Session
                        </motion.button>
                      </motion.div>
                    </div>
                  ) : (
                    /* Sessions List */
                    <div className="space-y-8">
                      {/* Upcoming Sessions */}
                      {categorizedSessions.upcoming.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Clock size={20} className="text-[#3F2965]" />
                            Upcoming Sessions ({categorizedSessions.upcoming.length})
                          </h3>
                          <div className="space-y-4">
                            {categorizedSessions.upcoming.map((session) => (
                              <EnhancedSessionCard
                                key={session._id}
                                session={session}
                                onNotesClick={handleNotesClick}
                                onViewNotes={handleViewNotes}
                                onTasksClick={handleTasksClick}
                                onAdminRemarksClick={handleAdminRemarksClick}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Ongoing Sessions */}
                      {categorizedSessions.ongoing.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Play size={20} className="text-[#3F2965]" />
                            Ongoing Sessions ({categorizedSessions.ongoing.length})
                          </h3>
                          <div className="space-y-4">
                            {categorizedSessions.ongoing.map((session) => (
                              <EnhancedSessionCard
                                key={session._id}
                                session={session}
                                onNotesClick={handleNotesClick}
                                onViewNotes={handleViewNotes}
                                onTasksClick={handleTasksClick}
                                onAdminRemarksClick={handleAdminRemarksClick}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Past Sessions */}
                      {categorizedSessions.past.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <CheckCircle size={20} className="text-[#3F2965]" />
                            Past Sessions ({categorizedSessions.past.length})
                          </h3>
                          <div className="space-y-4">
                            {categorizedSessions.past.map((session) => (
                              <EnhancedSessionCard
                                key={session._id}
                                session={session}
                                onNotesClick={handleNotesClick}
                                onViewNotes={handleViewNotes}
                                onTasksClick={handleTasksClick}
                                onAdminRemarksClick={handleAdminRemarksClick}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                )}
              </ProfileCard>
            </div>
          )}

          {/* My Journey Tab */}
          {activeTab === 'journey' && (
            <ProfileCard>
              <SectionHeading
                icon={MapPin}
                title="My Journey"
                subtitle="Track your progress and milestones"
              />

              {journeyError ? (
                <div className="text-center py-12">
                  <div className="text-red-500 mb-4">⚠️</div>
                  <p className="text-red-600 mb-2">Failed to load journey</p>
                  <p className="text-sm text-gray-500">{journeyError}</p>
                </div>
              ) : (
                <JourneyTimeline
                  journeyData={journeyData}
                  loading={journeyLoading}
                />
              )}
            </ProfileCard>
          )}

          {/* Liked Content Tab */}
          {activeTab === 'liked' && (
            <ProfileCard>
              <SectionHeading
                icon={Heart}
                title="Liked Content"
                subtitle="Your favorite resources and media"
              />

              {likedLoading ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading your liked content...</p>
                </div>
              ) : likedError ? (
                <div className="text-center py-12">
                  <div className="text-red-500 mb-4">⚠️</div>
                  <p className="text-red-600 mb-2">Failed to load liked content</p>
                  <p className="text-sm text-gray-500">{likedError}</p>
                </div>
              ) : likedMedia.length === 0 ? (
                <div className="text-center py-20">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="relative mb-10">
                      <div className="w-20 h-20 bg-gradient-to-br from-[#Dd1764]/20 to-[#Dd1764]/10 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                        <Heart size={40} className="text-[#Dd1764]/60" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#Dd1764] rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white text-sm font-bold">♡</span>
                      </div>
                    </div>
                    <h3 className="text-3xl font-semibold text-gray-800 mb-4">Discover Content You'll Love</h3>
                    <p className="text-gray-600 mb-12 max-w-lg mx-auto leading-relaxed text-lg">
                      Explore our curated collection of articles, videos, and resources designed to support your mental wellness journey.
                    </p>
                    
                    {/* Content Types */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
                      <div className="bg-gradient-to-br from-[#Dd1764]/5 to-[#Dd1764]/10 p-6 rounded-2xl border border-[#Dd1764]/10">
                        <div className="w-12 h-12 bg-[#Dd1764]/15 rounded-xl flex items-center justify-center mx-auto mb-4">
                          <BookOpen className="w-6 h-6 text-[#Dd1764]" />
                        </div>
                        <p className="font-semibold text-[#Dd1764] mb-2">Articles & Guides</p>
                        <p className="text-sm text-[#Dd1764]/70">Expert insights and advice</p>
                      </div>
                      <div className="bg-gradient-to-br from-[#Dd1764]/5 to-[#Dd1764]/10 p-6 rounded-2xl border border-[#Dd1764]/10">
                        <div className="w-12 h-12 bg-[#Dd1764]/15 rounded-xl flex items-center justify-center mx-auto mb-4">
                          <Play className="w-6 h-6 text-[#Dd1764]" />
                        </div>
                        <p className="font-semibold text-[#Dd1764] mb-2">Videos & Reels</p>
                        <p className="text-sm text-[#Dd1764]/70">Visual learning content</p>
                      </div>
                      <div className="bg-gradient-to-br from-[#Dd1764]/5 to-[#Dd1764]/10 p-6 rounded-2xl border border-[#Dd1764]/10">
                        <div className="w-12 h-12 bg-[#Dd1764]/15 rounded-xl flex items-center justify-center mx-auto mb-4">
                          <Target className="w-6 h-6 text-[#Dd1764]" />
                        </div>
                        <p className="font-semibold text-[#Dd1764] mb-2">Exercises</p>
                        <p className="text-sm text-[#Dd1764]/70">Practical wellness tools</p>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-[#Dd1764] text-white px-10 py-5 rounded-2xl font-semibold shadow-xl shadow-[#Dd1764]/20 hover:shadow-2xl hover:shadow-[#Dd1764]/30 transition-all duration-300"
                      onClick={() => window.location.href = '/resources'}
                    >
                      Explore Resources
                    </motion.button>
                  </motion.div>
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {likedMedia.map((media) => (
                      <MediaCard
                        key={media._id}
                        media={media}
                        onUnlike={handleRemoveFromLiked}
                        showLikeButton={false}
                        showRemoveButton={true}
                      />
                    ))}
                  </div>
                  
                  {/* Liked Content Stats */}
                  <div className="mt-10 p-8 bg-gradient-to-br from-[#Dd1764]/5 to-[#Dd1764]/10 rounded-3xl border border-[#Dd1764]/10 shadow-inner">
                    <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
                      <div className="p-2 bg-[#Dd1764]/15 rounded-xl">
                        <Heart size={20} className="text-[#Dd1764]" />
                      </div>
                      Your Content Collection
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center p-6 bg-white/60 rounded-2xl border border-[#Dd1764]/5">
                        <p className="text-3xl font-bold text-[#Dd1764] mb-2">{likedMedia.length}</p>
                        <p className="text-sm text-[#Dd1764]/70 font-medium">Items Saved</p>
                      </div>
                      <div className="text-center p-6 bg-white/60 rounded-2xl border border-[#Dd1764]/5">
                        <p className="text-3xl font-bold text-[#Dd1764] mb-2">
                          {likedMedia.filter(m => m.type === 'post').length}
                        </p>
                        <p className="text-sm text-[#Dd1764]/70 font-medium">Articles</p>
                      </div>
                      <div className="text-center p-6 bg-white/60 rounded-2xl border border-[#Dd1764]/5">
                        <p className="text-3xl font-bold text-[#Dd1764] mb-2">
                          {likedMedia.filter(m => m.type === 'reel').length}
                        </p>
                        <p className="text-sm text-[#Dd1764]/70 font-medium">Videos</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </ProfileCard>
          )}

          {/* Reflection Tab (Admin Only) */}
          {activeTab === 'reflection' && user?.reflectionCompleted && (
            <ProfileCard>
              <SectionHeading
                icon={FileText}
                title="Pre-Session Reflection"
                subtitle="AI-generated insights from the client's initial reflection"
              />

              {/* Admin Actions */}
              <div className="mb-6 flex justify-end gap-3">
                <button
                  onClick={handleRegenerateSummary}
                  disabled={regenerating}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-primary hover:bg-purple-100 rounded-xl transition-colors text-sm font-medium border border-purple-100 disabled:opacity-50"
                >
                  {regenerating ? (
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Sparkles size={16} />
                  )}
                  Re-generate AI Summary
                </button>
                <button
                  onClick={handleResetReflection}
                  disabled={resetting}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors text-sm font-medium border border-red-100 disabled:opacity-50"
                >
                  {resetting ? (
                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Clock size={16} className="rotate-180" />
                  )}
                  Reset & Allow Retake
                </button>
              </div>

              <div className="space-y-8">
                {/* AI Summary Section */}
                <div className="bg-purple-50/50 p-6 rounded-2xl border border-purple-100">
                  <h3 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
                    <Sparkles className="text-secondary" size={20} />
                    AI Insights Summary
                  </h3>
                  <div className="prose prose-purple max-w-none text-gray-700 leading-relaxed">
                    {user.reflectionSummary ? (
                      user.reflectionSummary.split('\n').map((line, i) => (
                        <p key={i} className={line.startsWith('**') ? 'font-bold mt-4' : ''}>
                          {line}
                        </p>
                      ))
                    ) : (
                      <p className="italic text-gray-500">No summary available.</p>
                    )}
                  </div>
                </div>

                {/* Detailed Responses Section */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4 px-2">Detailed Responses</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user.reflectionResponses && Object.entries(user.reflectionResponses).map(([key, data]) => (
                      <div key={key} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-1">{data.category}</p>
                        <p className="text-sm font-semibold text-gray-800 mb-2">{data.questionText}</p>
                        <p className="text-sm text-gray-600 bg-white p-2 rounded-lg border border-gray-100">
                          {data.selectedLabel}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ProfileCard>
          )}

        </div>

        {/* Session Notes Modal */}
        {showNotesModal && selectedSession && (
          <SessionNotesModal
            session={selectedSession}
            isOpen={showNotesModal}
            onClose={() => {
              setShowNotesModal(false);
              setSelectedSession(null);
            }}
            onSave={handleNotesSuccess}
          />
        )}

        {/* Session Notes Viewer */}
        {showNotesViewer && selectedSession && (
          <SessionNotesViewer
            session={selectedSession}
            onClose={() => {
              setShowNotesViewer(false);
              setSelectedSession(null);
            }}
            onEdit={() => {
              setShowNotesViewer(false);
              setShowNotesModal(true);
            }}
          />
        )}

        {/* Session Tasks Modal */}
        {showTasksModal && selectedSession && (
          <SessionTasksModal
            session={selectedSession}
            isOpen={showTasksModal}
            onClose={() => {
              setShowTasksModal(false);
              setSelectedSession(null);
            }}
          />
        )}

        {/* Admin Remarks Modal */}
        {showAdminRemarksModal && selectedSession && (
          <AdminRemarksModal
            session={selectedSession}
            isOpen={showAdminRemarksModal}
            onClose={() => {
              setShowAdminRemarksModal(false);
              setSelectedSession(null);
            }}
          />
        )}

        {/* Toast Notifications */}
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </div>
  );
};

export default Profile;