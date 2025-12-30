import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Calendar, Lock, BookOpen, Heart, 
  MapPin, Clock, Edit2, Play, Plus, 
  ChevronRight, Shield, TrendingUp, Brain, 
  Lightbulb, Star, Activity, MessageSquare, 
  Download, Settings, Bell, Share2, BarChart3,
  Sun, Headphones, Camera, FileText, Award,
  CheckCircle, Target
} from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { useLikedMedia } from '../hooks/useLikedMedia';
import MediaCard from '../components/MediaCard';
import LikedMediaTest from '../components/LikedMediaTest';
import LikedMediaDebug from '../components/LikedMediaDebug';

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

const StatCard = ({ icon: Icon, title, value, trend, color = "purple" }) => (
  <motion.div 
    whileHover={{ scale: 1.02 }}
    className="bg-white rounded-xl shadow-md p-4"
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`p-2 bg-${color}-50 text-${color}-600 rounded-lg`}>
        <Icon size={24} />
      </div>
      {trend && (
        <div className={`text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700`}>
          <TrendingUp size={12} className="inline mr-1" />
          {trend}
        </div>
      )}
    </div>
    <div className="text-2xl font-bold text-gray-800 mb-1">{value}</div>
    <div className="text-sm text-gray-500">{title}</div>
  </motion.div>
);

const Profile = () => {
  const { user, isAuthenticated, isInitialized } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const { likedMedia, loading: likedLoading, error: likedError, toggleLike } = useLikedMedia();

  // Mock data for demonstration
  const [achievements] = useState([
    { id: 1, title: 'First Session', description: 'Completed your first therapy session', icon: '🎯', earned: true, date: '2024-01-15' },
    { id: 2, title: 'Week Streak', description: 'Maintained wellness routine for a week', icon: '🔥', earned: true, date: '2024-01-20' },
    { id: 3, title: 'Mindful Moments', description: 'Completed 10 meditation sessions', icon: '🧘', earned: false },
    { id: 4, title: 'Progress Tracker', description: 'Logged mood for 30 days', icon: '📊', earned: false }
  ]);

  const [moodData] = useState([
    { date: '2024-01-20', mood: 4, note: 'Feeling positive after session' },
    { date: '2024-01-19', mood: 3, note: 'Neutral day, practiced breathing' },
    { date: '2024-01-18', mood: 5, note: 'Great session today!' },
    { date: '2024-01-17', mood: 2, note: 'Challenging day, but managed well' }
  ]);

  const [goals] = useState([
    { id: 1, title: 'Practice daily meditation', progress: 75, target: 100, category: 'wellness', dueDate: '2024-01-25' },
    { id: 2, title: 'Complete anxiety management course', progress: 40, target: 100, category: 'learning', dueDate: '2024-01-30' },
    { id: 3, title: 'Attend weekly therapy sessions', progress: 90, target: 100, category: 'therapy', dueDate: '2024-01-25' }
  ]);

  // Fetch user's liked media
  useEffect(() => {
    // The useLikedMedia hook handles fetching automatically
    console.log('Profile: isAuthenticated =', isAuthenticated);
    console.log('Profile: user =', user);
    console.log('Profile: likedMedia =', likedMedia);
    console.log('Profile: likedLoading =', likedLoading);
    console.log('Profile: likedError =', likedError);
    console.log('Profile: accessToken =', localStorage.getItem('accessToken') ? 'Present' : 'Missing');
  }, [isAuthenticated, user, likedMedia, likedLoading, likedError]);

  // Handle unliking media from profile
  const handleLike = async (mediaId) => {
    try {
      await toggleLike(mediaId);
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  // Tab configuration
  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'wellness', label: 'Wellness', icon: Heart },
    { id: 'liked', label: 'Liked Content', icon: Heart },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  // Loading State
  if (!isInitialized || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Auth Guard
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-6 text-lg">Please log in to access your profile.</p>
          <a href="/login" className="btn-primary inline-block">
            Log In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Section */}
        <section className="mb-12">
          <ProfileCard className="relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full opacity-20 -translate-y-48 translate-x-48" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-100 to-purple-100 rounded-full opacity-20 translate-y-32 -translate-x-32" />

            <div className="flex flex-col lg:flex-row items-start gap-8 relative z-10">
              <div className="relative">
                <div className="w-40 h-40 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-6xl shadow-xl">
                  <div className="bg-white rounded-full w-36 h-36 flex items-center justify-center">
                    {user?.avatar || '😊'}
                  </div>
                </div>
                <button className="absolute bottom-2 right-2 p-3 bg-primary text-white rounded-full shadow-lg hover:bg-primary-dark transition-colors">
                  <Edit2 size={16} />
                </button>
                <div className="absolute -bottom-2 -right-2 p-2 bg-green-500 text-white rounded-full">
                  <CheckCircle size={16} />
                </div>
              </div>

              <div className="flex-1">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">
                  {user?.firstName} {user?.lastName}
                </h1>
                <p className="text-xl text-gray-600 mb-2">
                  Premium Member
                </p>
                
                <p className="text-lg text-gray-500 mb-6 italic">
                  "Prioritizing my peace, one step at a time."
                </p>
                
                <div className="flex flex-wrap gap-4 mb-6">
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                    <Clock size={16} /> Member since {new Date().getFullYear()}
                  </span>
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                    <Shield size={16} /> Verified Account
                  </span>
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                    <Star size={16} /> Level 1
                  </span>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-800">12</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Sessions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-800">8</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Achievements</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-800">45</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Days Active</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-800">4.2</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Avg Mood</div>
                  </div>
                </div>
              </div>
            </div>
          </ProfileCard>
        </section>

        {/* Navigation Tabs */}
        <section className="mb-8">
          <div className="flex flex-wrap gap-2">
            <div className="flex bg-white rounded-xl p-2 shadow-md">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-primary text-white shadow-md'
                      : 'text-gray-600 hover:bg-purple-50 hover:text-primary'
                  }`}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Tab Content */}
        <div className="space-y-8">
          
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <ProfileCard>
              <SectionHeading 
                icon={TrendingUp} 
                title="Your Mental Health Journey" 
                subtitle="Track your progress over time"
              />
              <div className="text-center py-12">
                <TrendingUp size={64} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Journey tracking coming soon...</p>
              </div>
            </ProfileCard>
          )}

          {/* Wellness Tab */}
          {activeTab === 'wellness' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ProfileCard>
                <SectionHeading 
                  icon={Heart} 
                  title="Mood Tracking" 
                  subtitle="Monitor your emotional wellbeing"
                />
                <div className="space-y-4">
                  {moodData.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-medium text-gray-800">{new Date(entry.date).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-500">{entry.note}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            size={16} 
                            className={`${entry.mood >= star ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ProfileCard>

              <ProfileCard>
                <SectionHeading 
                  icon={Target} 
                  title="Personal Goals" 
                  subtitle="Track your wellness objectives"
                />
                <div className="space-y-4">
                  {goals.map((goal) => (
                    <div key={goal.id} className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-800">{goal.title}</h4>
                        <span className="text-sm text-gray-500">{goal.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-500" 
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="capitalize">{goal.category}</span>
                        <span>Due: {new Date(goal.dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ProfileCard>
            </div>
          )}

          {/* Liked Content Tab */}
          {activeTab === 'liked' && (
            <ProfileCard>
              <SectionHeading 
                icon={Heart} 
                title="Liked Content" 
                subtitle="Your saved posts and reels"
              />
              
              {likedLoading ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading your liked content...</p>
                </div>
              ) : likedError ? (
                <div className="text-center py-12">
                  <div className="text-red-500 mb-4">⚠️</div>
                  <p className="text-red-600 mb-2">Failed to load liked content</p>
                  <p className="text-sm text-gray-500">{likedError}</p>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : likedMedia.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {likedMedia.map((media) => (
                    <MediaCard
                      key={media._id}
                      media={media}
                      onLike={handleLike}
                      showLikeButton={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Heart size={64} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 mb-4">No liked content yet</p>
                  <p className="text-sm text-gray-400">Start exploring and like posts that resonate with you!</p>
                  
                  {/* Debug info */}
                  <div className="mt-8 p-4 bg-gray-100 rounded-lg text-left text-sm">
                    <p><strong>Debug Info:</strong></p>
                    <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
                    <p>Loading: {likedLoading ? 'Yes' : 'No'}</p>
                    <p>Error: {likedError || 'None'}</p>
                    <p>Media Count: {likedMedia.length}</p>
                    <button 
                      onClick={() => {
                        console.log('Manual refresh triggered');
                        window.location.reload();
                      }}
                      className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-xs"
                    >
                      Refresh Page
                    </button>
                  </div>
                  
                  {/* API Test Component */}
                  <div className="mt-4">
                    <LikedMediaTest />
                  </div>
                  
                  {/* Debug Component */}
                  <div className="mt-4">
                    <LikedMediaDebug />
                  </div>
                </div>
              )}
            </ProfileCard>
          )}

          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <ProfileCard>
              <SectionHeading 
                icon={Award} 
                title="Achievements & Milestones" 
                subtitle="Celebrate your mental health journey"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {achievements.map((achievement) => (
                  <motion.div 
                    key={achievement.id}
                    whileHover={{ scale: 1.02 }}
                    className={`p-6 rounded-2xl border-2 transition-all ${
                      achievement.earned 
                        ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200' 
                        : 'bg-gray-50 border-gray-200 grayscale opacity-50'
                    }`}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`text-4xl ${achievement.earned ? '' : 'grayscale opacity-50'}`}>
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-semibold mb-2 ${achievement.earned ? 'text-gray-800' : 'text-gray-500'}`}>
                          {achievement.title}
                        </h4>
                        <p className={`text-sm mb-3 ${achievement.earned ? 'text-gray-600' : 'text-gray-400'}`}>
                          {achievement.description}
                        </p>
                        {achievement.earned ? (
                          <div className="flex items-center gap-2 text-green-700 text-sm">
                            <CheckCircle size={16} />
                            <span>Earned {new Date(achievement.date).toLocaleDateString()}</span>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">
                            <span>Progress</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ProfileCard>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <ProfileCard>
              <SectionHeading 
                icon={Settings} 
                title="Account Settings" 
                subtitle="Manage your preferences"
              />
              <div className="text-center py-12">
                <Settings size={64} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Settings panel coming soon...</p>
              </div>
            </ProfileCard>
          )}

        </div>
      </div>
    </div>
  );
};

export default Profile;