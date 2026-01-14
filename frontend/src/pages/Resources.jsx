import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Download, Heart, Eye, Search, Filter, Grid, List, Clock, Tag, Plus, Settings, MessageCircle, ChevronDown, Check } from 'lucide-react';
import { mediaApi } from '../services/media.api';
import useAuthStore from '../store/useAuthStore';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/ToastContainer';
import AddMediaModal from '../components/admin/AddMediaModal';
import MediaPlayer from '../components/MediaPlayer';
import PostViewer from '../components/PostViewer';
import InlineVideoPlayer from '../components/InlineVideoPlayer';
import ImageWithFallback from '../components/ImageWithFallback';

const Resources = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { toasts, success, error: showError, removeToast } = useToast();
  const isAdmin = user?.role === 'admin';

  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(12);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [showPostViewer, setShowPostViewer] = useState(false);
  const [placeholder, setPlaceholder] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  const placeholderWords = ['depression', 'happiness', 'imposter syndrome', 'motivation'];

  const mediaTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'video', label: 'Videos' },
    { value: 'audio', label: 'Audio' },
    { value: 'document', label: 'Docs' },
    { value: 'vlog', label: 'Vlogs' },
    { value: 'post', label: 'Posts' }
  ];

  const categories = [
    { value: 'all', label: 'All Topics' },
    { value: 'anxiety', label: 'Anxiety' },
    { value: 'depression', label: 'Depression' },
    { value: 'relationships', label: 'Relationships' },
    { value: 'self', label: 'Self Care' },
    { value: 'sleep', label: 'Sleep' },
    { value: 'stress', label: 'Stress' },
  ];

  useEffect(() => {
    const category = searchParams.get('category');
    if (category) {
      setSelectedCategory(category);
    }
  }, [searchParams]);

  const fetchMedia = async (page = 1, resetData = false) => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm,
        type: selectedType !== 'all' ? selectedType : undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        page: page,
        limit: itemsPerPage
      };

      const response = await mediaApi.getPublishedMedia(params);

      if (resetData) {
        setMedia(response.data);
      } else {
        setMedia(response.data);
      }

      setCurrentPage(response.pagination.page);
      setTotalPages(response.pagination.pages);
      setTotalItems(response.pagination.total);
    } catch (err) {
      setError('Failed to load media content');
      console.error('Fetch media error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchMedia(1, true);
  }, [searchTerm, selectedType, selectedCategory]);

  // Typing animation effect
  useEffect(() => {
    if (searchTerm) return;

    const currentWord = placeholderWords[placeholderIndex];
    const typingSpeed = isDeleting ? 50 : 150;
    const pauseDuration = 2000;

    const timeout = setTimeout(() => {
      if (!isDeleting && placeholder === currentWord) {
        setTimeout(() => setIsDeleting(true), pauseDuration);
      } else if (isDeleting && placeholder === '') {
        setIsDeleting(false);
        setPlaceholderIndex((prev) => (prev + 1) % placeholderWords.length);
      } else if (isDeleting) {
        setPlaceholder(currentWord.substring(0, placeholder.length - 1));
      } else {
        setPlaceholder(currentWord.substring(0, placeholder.length + 1));
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [placeholder, placeholderIndex, isDeleting, searchTerm]);

  const handleLike = async (mediaId) => {
    if (!isAuthenticated) {
      showError('Please log in to like content');
      return;
    }

    try {
      const response = await mediaApi.likeMedia(mediaId);
      setMedia(prev => prev.map(item =>
        item._id === mediaId
          ? {
            ...item,
            hasLiked: response.data.hasLiked,
            likes: response.data.likes,
            likesCount: response.data.likes
          }
          : item
      ));

      if (response.data.hasLiked) {
        success('Added to your liked content!');
      } else {
        success('Removed from your liked content');
      }
    } catch (err) {
      console.error('Like media error:', err);
      showError('Failed to like content.');
    }
  };

  const handleMediaClick = async (mediaItem) => {
    setSelectedMedia(mediaItem);
    if (mediaItem.type === 'post') {
      setShowPostViewer(true);
    } else {
      setShowPlayer(true);
    }

    // Track view
    try {
      const response = await mediaApi.getMedia(mediaItem._id);
      if (response.success) {
        setMedia(prev => prev.map(item =>
          item._id === mediaItem._id
            ? { ...item, views: response.data.views }
            : item
        ));
        setSelectedMedia(response.data);
      }
    } catch (err) {
      console.error('Error tracking view:', err);
    }
  };

  const handleClosePlayer = () => {
    setShowPlayer(false);
    setShowPostViewer(false);
    setSelectedMedia(null);
  };

  const handleMediaAdded = (newMedia) => {
    setMedia(prev => [newMedia, ...prev]);
    setTotalItems(prev => prev + 1);
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getMediaIcon = (type) => {
    switch (type) {
      case 'video':
      case 'vlog': return <Play size={20} />;
      case 'audio': return <Play size={20} />;
      case 'document': return <Download size={20} />;
      default: return <Eye size={20} />;
    }
  };

  return (
    <div className="min-h-screen pb-20 pt-24 bg-white relative overflow-hidden">

      {/* --- GLOBAL BACKGROUND: ANIMATED AURORA --- */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] rounded-full bg-purple-200/20 blur-[120px]"
        />
        <motion.div
          animate={{ rotate: -360, scale: [1, 1.3, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-20%] right-[-10%] w-[70vw] h-[70vw] rounded-full bg-pink-200/20 blur-[150px]"
        />
      </div>


      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 relative z-10">

        {/* --- 1. HERO SECTION: KNOWLEDGE SANCTUARY --- */}
        <div className="relative mb-24 px-4 text-center mt-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/40 backdrop-blur-md border border-white/60 shadow-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-[#Dd1764] animate-pulse"></span>
              <span className="text-xs font-bold tracking-[0.2em] text-[#3F2965] uppercase">MindSettler Library</span>
            </div>

            <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif text-[#3F2965] tracking-tight leading-[0.9] mb-8">
              <span className="block drop-shadow-sm">Inner</span>
              <span className="block italic font-light text-transparent bg-clip-text bg-gradient-to-r from-[#Dd1764] to-[#8b5cf6] pb-2">
                Growth.
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600/80 font-light max-w-2xl mx-auto leading-relaxed">
              A curated sanctuary of wisdom, tools, and guided paths for your mental wellness journey.
            </p>
          </motion.div>

          {isAdmin && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-10"
            >
              <button
                onClick={() => setShowAddModal(true)}
                className="group relative inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#3F2965] text-white font-medium overflow-hidden shadow-2xl shadow-purple-900/30 hover:scale-105 transition-all duration-300"
              >
                <span className="relative z-10 flex items-center gap-2 text-lg">
                  <Plus size={22} /> Add Resource
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </motion.div>
          )}
        </div>


        {/* --- 2. ELITE SEARCH CAPSULE: STICKY --- */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-20 sticky top-28 z-40 px-2 pointer-events-none" // pointer-events-none on wrapper to let clicks pass through sides
        >
          <div className="max-w-5xl mx-auto pointer-events-auto"> {/* pointer-events-auto on content */}
            <div className="relative group">
              {/* Glowing Aurora Backdrop for Search */}
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-blue-500/20 rounded-full blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>

              {/* The Capsule Itself */}
              <div className="relative bg-white/70 backdrop-blur-3xl rounded-full p-2.5 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] ring-1 ring-white/50 flex flex-col md:flex-row items-center gap-2 transition-all duration-300 hover:bg-white/90">

                {/* Large Search Input */}
                <div className="flex-1 w-full relative flex items-center pl-8 pr-4 h-16 md:h-20">
                  <Search className="text-gray-400 group-focus-within:text-[#Dd1764] transition-colors duration-300" size={32} />
                  <input
                    type="text"
                    placeholder={`Search for "${placeholder}"...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-full bg-transparent border-none focus:ring-0 text-gray-800 placeholder-gray-400/70 font-medium text-2xl tracking-tight ml-4 font-serif"
                  />
                </div>

                {/* Vertical Divider */}
                <div className="hidden md:block w-[1px] h-10 bg-gray-300/50 mx-2"></div>

                {/* Custom Styled Filter Pills */}
                <div className="flex items-center gap-2 w-full md:w-auto px-2 pb-2 md:pb-0 justify-center">

                  {/* Category Pill */}
                  <div className="relative group/cat">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    >
                      {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                    <div className="flex items-center gap-3 px-6 py-4 rounded-full bg-gray-50/50 hover:bg-white border border-transparent hover:border-purple-200 transition-all cursor-pointer min-w-[160px] justify-between group-hover/cat:shadow-lg group-hover/cat:-translate-y-0.5 duration-300">
                      <span className="text-sm font-bold text-gray-600 uppercase tracking-wider truncate">
                        {categories.find(c => c.value === selectedCategory)?.label || 'Category'}
                      </span>
                      <ChevronDown size={14} className="text-gray-400 group-hover/cat:text-[#Dd1764]" />
                    </div>
                  </div>

                  {/* Type Pill */}
                  <div className="relative group/type">
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    >
                      {mediaTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    <div className="flex items-center gap-3 px-6 py-4 rounded-full bg-gray-50/50 hover:bg-white border border-transparent hover:border-purple-200 transition-all cursor-pointer min-w-[140px] justify-between group-hover/type:shadow-lg group-hover/type:-translate-y-0.5 duration-300">
                      <span className="text-sm font-bold text-gray-600 uppercase tracking-wider truncate">
                        {mediaTypes.find(t => t.value === selectedType)?.label || 'Type'}
                      </span>
                      <Filter size={14} className="text-gray-400 group-hover/type:text-[#Dd1764]" />
                    </div>
                  </div>

                  {/* View Toggles */}
                  <div className="flex items-center gap-1 bg-gray-100/50 p-1.5 rounded-full border border-white/60 ml-2 hidden sm:flex">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-3 rounded-full transition-all duration-300 ${viewMode === 'grid' ? 'bg-white text-[#Dd1764] shadow-md scale-100' : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'}`}
                    >
                      <Grid size={18} />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-3 rounded-full transition-all duration-300 ${viewMode === 'list' ? 'bg-white text-[#Dd1764] shadow-md scale-100' : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'}`}
                    >
                      <List size={18} />
                    </button>
                  </div>

                </div>
              </div>
            </div>

            {/* Floating Tags */}
            {!searchTerm && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap justify-center gap-3 mt-8"
              >
                {['Anxiety', 'Sleep', 'Meditation', 'Focus', 'Growth'].map((tag, i) => (
                  <motion.button
                    key={tag}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + (i * 0.05) }}
                    onClick={() => setSearchTerm(tag)}
                    className="px-6 py-2 rounded-full border border-white/20 bg-white/20 backdrop-blur-md text-gray-600 text-sm font-semibold hover:bg-white hover:text-[#Dd1764] hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  >
                    #{tag}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>


        {/* --- 3. ERROR & LOADING STATES --- */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-8 py-6 rounded-[2rem] mb-12 flex items-center gap-4 max-w-4xl mx-auto backdrop-blur-md bg-opacity-90">
            <div className="p-3 bg-red-100 rounded-full">⚠️</div>
            <span className="font-medium text-lg">{error}</span>
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white/60 backdrop-blur-sm rounded-[2.5rem] p-6 shadow-sm border border-white/60 h-[500px] animate-pulse">
                <div className="bg-gray-200/50 h-64 rounded-[2rem] mb-6 w-full" />
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200/50 rounded-full w-3/4" />
                  <div className="h-4 bg-gray-200/50 rounded-full w-full" />
                  <div className="h-4 bg-gray-200/50 rounded-full w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- 4. MEDIA GRID --- */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="pb-24" // Extra bottom padding for scroll space
          >
            {viewMode === 'grid' ? (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.08 }}
              >
                {media.map((item, index) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, scale: 0.9, y: 50 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }} // Animate on scroll
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    whileHover={{ y: -12, transition: { duration: 0.3 } }}
                    className="bg-white/80 backdrop-blur-md rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-purple-900/10 border border-white/60 group cursor-pointer"
                    onClick={() => handleMediaClick(item)}
                  >
                    {/* Card Thumbnail Area */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                      <ImageWithFallback
                        src={item.thumbnailUrl || (item.assets && item.assets[0]?.fileUrl)}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        fallbackIcon="📄"
                      />

                      {/* Gradient Overlay for Text Readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                      {/* Floating Play/Action Button */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/50 text-white shadow-2xl">
                          {item.type === 'post' ? <Eye size={28} /> : <Play size={28} fill="currentColor" />}
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span className="px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider text-[#3F2965] shadow-lg">
                          {item.type}
                        </span>
                      </div>
                      {item.duration && (
                        <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/50 backdrop-blur-md rounded-full text-xs font-bold text-white flex items-center gap-1">
                          <Clock size={12} /> {formatDuration(item.duration)}
                        </div>
                      )}
                    </div>

                    {/* Card Content Area */}
                    <div className="p-8">
                      <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 leading-tight group-hover:text-[#Dd1764] transition-colors duration-300">
                        {item.title}
                      </h3>
                      <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-2">
                        {item.description}
                      </p>

                      <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-400">
                            <Eye size={14} /> {item.views || 0}
                          </span>
                          {isAuthenticated && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLike(item._id);
                              }}
                              className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${item.hasLiked ? 'text-[#Dd1764]' : 'text-gray-400 hover:text-[#Dd1764]'}`}
                            >
                              <Heart size={14} fill={item.hasLiked ? "currentColor" : "none"} />
                              {Array.isArray(item.likes) ? item.likes.length : item.likesCount || 0}
                            </button>
                          )}
                        </div>
                        <span className="text-xs font-semibold text-gray-300">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div className="space-y-4">
                {/* ... List View Implementation if needed (simplified for brevity) ... */}
              </motion.div>
            )}

            {/* Empty State */}
            {media.length === 0 && (
              <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-[3rem] border border-white/60">
                <div className="text-6xl mb-6 opacity-30">🔍</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">No resources found</h3>
                <p className="text-gray-500">Try adjusting your filters or search terms</p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <AddMediaModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onMediaAdded={handleMediaAdded}
      />

      {selectedMedia && showPlayer && (
        <MediaPlayer
          isOpen={showPlayer}
          onClose={handleClosePlayer}
          media={selectedMedia}
        />
      )}

      {selectedMedia && showPostViewer && (
        <PostViewer
          isOpen={showPostViewer}
          onClose={handleClosePlayer}
          post={selectedMedia}
          onLike={handleLike}
          onComment={handleComment}
        />
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default Resources;