import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Heart,
  Clock, Play,
  Shield, CheckCircle, CalendarDays, MapPin,
  TrendingUp, BookOpen, Star, FileText, Sparkles, Activity
} from 'lucide-react';
import { useParams, Navigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { authApi } from '../features/auth/auth.api';
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

const ProfileCard = ({ children, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className={`bg-white rounded-lg border border-gray-200 shadow-md p-6 ${className}`}
  >
    {children}
  </motion.div>
);

const Profile = () => {
  const { userId } = useParams();
  const { user: currentUser, isAuthenticated, isInitialized } = useAuthStore();
  const [viewedUser, setViewedUser] = useState(null);
  const [isAdminView, setIsAdminView] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  // Default to 'journey' as requested ("My Journey" (Default Active Tab))
  // But logic in original file was 'sessions'. I will follow the user request: "My Journey" (Default Active Tab)
  const [activeTab, setActiveTab] = useState('journey'); 
  
  const { likedMedia, loading: likedLoading, error: likedError, toggleLike } = useLikedMedia(userId);
  const { categorizedSessions, loading: sessionsLoading, error: sessionsError, fetchSessions } = useSessions(userId);
  const { journeyData, loading: journeyLoading, error: journeyError } = useJourney(userId);
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
      <div className="min-h-screen bg-aurora-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'journey', label: 'My Journey', icon: MapPin },
    { id: 'sessions', label: 'My Sessions', icon: CalendarDays },
    { id: 'liked', label: 'Liked Content', icon: Heart }
  ];

  if (currentUser?.role === 'admin' && user?.reflectionCompleted) {
    tabs.push({ id: 'reflection', label: 'Reflection', icon: FileText });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-pink-50/20 pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Compact Professional Header */}
        <section className="mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="bg-white rounded-lg border border-gray-200 shadow-lg p-6 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden"
          >
            {/* Subtle background */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-50/30 via-transparent to-pink-50/30 pointer-events-none" />

            {/* Left: Compact Profile */}
            <div className="flex items-center gap-4 relative z-10">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-[#3F2965] to-purple-800 rounded-lg flex items-center justify-center text-white text-xl font-bold shadow-md">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-white rounded-md p-1 shadow-sm border border-gray-200">
                   <Shield size={12} className="text-purple-700" />
                </div>
              </div>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-sm text-gray-600 mb-2">{user.email}</p>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-md text-xs font-semibold ${
                    user.role === 'admin' 
                      ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                      : 'bg-purple-100 text-purple-700 border border-purple-200'
                  }`}>
                    {user.role === 'admin' ? 'Admin' : 'Member'}
                  </span>
                  {isAdminView && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 border border-blue-200 rounded-md text-xs font-semibold">
                      Admin View
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Compact Stats */}
            <div className="flex gap-6 ml-auto relative z-10">
               <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-2 border border-purple-200">
                    <CalendarDays size={20} className="text-purple-700" />
                  </div>
                  <div className="text-2xl font-bold text-purple-700 mb-1">
                    {userStats.totalSessions}
                  </div>
                  <div className="text-xs text-gray-600 font-medium">
                    Sessions
                  </div>
               </div>

               <div className="text-center">
                  <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-2 border border-pink-200">
                    <Heart size={20} className="text-pink-700" />
                  </div>
                  <div className="text-2xl font-bold text-pink-700 mb-1">
                    {userStats.likedContent}
                  </div>
                  <div className="text-xs text-gray-600 font-medium">
                    Liked
                  </div>
               </div>

               <div className="text-center">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-2 border border-indigo-200">
                    <MapPin size={20} className="text-indigo-700" />
                  </div>
                  <div className="text-2xl font-bold text-indigo-700 mb-1">
                    {userStats.journeyEntries}
                  </div>
                  <div className="text-xs text-gray-600 font-medium">
                    Journey
                  </div>
               </div>
            </div>
          </motion.div>
        </section>

        {/* Simple Quick Actions */}
        <section className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-[#3F2965] text-white p-6 rounded-lg shadow-md cursor-pointer relative overflow-hidden"
              onClick={() => window.location.href = '/booking'}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-md">
                  <CalendarDays size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Book Session</h3>
                  <p className="text-white/80 text-sm">Schedule appointment</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-purple-700 text-white p-6 rounded-lg shadow-md cursor-pointer relative overflow-hidden"
              onClick={() => window.location.href = '/resources'}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-md">
                  <BookOpen size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Resources</h3>
                  <p className="text-white/80 text-sm">Explore content</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-[#Dd1764] text-white p-6 rounded-lg shadow-md cursor-pointer relative overflow-hidden"
              onClick={() => setActiveTab('journey')}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-md">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Progress</h3>
                  <p className="text-white/80 text-sm">View journey</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
        {/* Simple Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg border border-gray-200 shadow-md p-1 flex gap-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-6 py-3 rounded-md flex items-center gap-2 font-medium text-sm transition-all duration-300 ${
                    isActive 
                      ? 'text-white bg-[#3F2965] shadow-md' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                  }`}
                >
                  <tab.icon size={16} />
                  <span>{tab.label}</span>
                  {/* Simple count badges */}
                  {tab.id === 'sessions' && userStats.totalSessions > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : 'bg-purple-100 text-purple-700'
                    }`}>
                      {userStats.totalSessions}
                    </span>
                  )}
                  {tab.id === 'liked' && userStats.likedContent > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : 'bg-pink-100 text-pink-700'
                    }`}>
                      {userStats.likedContent}
                    </span>
                  )}
                  {tab.id === 'journey' && userStats.journeyEntries > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : 'bg-indigo-100 text-indigo-700'
                    }`}>
                      {userStats.journeyEntries}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            {activeTab === 'journey' && (
              <MyJourney journeyData={journeyData} loading={journeyLoading} />
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
              />
            )}

            {activeTab === 'liked' && (
              <LikedContentTab
                likedMedia={likedMedia}
                loading={likedLoading}
                error={likedError}
                onUnlike={handleRemoveFromLiked}
              />
            )}

            {activeTab === 'reflection' && (
               <ProfileCard>
                 <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-purple-50 text-purple-900 rounded-xl">
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
                       className="flex items-center gap-2 px-5 py-2.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl transition-colors font-semibold"
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

                  <div className="bg-purple-50/50 p-8 rounded-3xl border border-purple-100 mb-8">
                     <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
                        <Sparkles size={20} className="text-pink-500" />
                        AI Insights
                     </h3>
                     <div className="prose prose-purple max-w-none text-gray-700 leading-relaxed">
                       {user.reflectionSummary ? (
                         user.reflectionSummary.split('\n').map((line, i) => (
                           <p key={i} className={line.startsWith('**') ? 'font-bold mt-4' : ''}>{line}</p>
                         ))
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
               </ProfileCard>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Modals & Toasts */}
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