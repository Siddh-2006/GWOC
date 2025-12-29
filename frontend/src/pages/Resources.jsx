import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Download, Heart, Eye, Search, Filter, Grid, List, Clock, Tag, Plus, Settings, MessageCircle, Share } from 'lucide-react';
import { mediaApi } from '../services/media.api';
import useAuthStore from '../store/useAuthStore';
import AddMediaModal from '../components/admin/AddMediaModal';
import MediaPlayer from '../components/MediaPlayer';
import PostViewer from '../components/PostViewer';
import InlineVideoPlayer from '../components/InlineVideoPlayer';
import ImageWithFallback from '../components/ImageWithFallback';

const Resources = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [showPostViewer, setShowPostViewer] = useState(false);

  const mediaTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'video', label: 'Videos' },
    { value: 'audio', label: 'Audio' },
    { value: 'document', label: 'Documents' },
    { value: 'vlog', label: 'Vlogs' },
    { value: 'post', label: 'Posts' }
  ];

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'resource', label: 'Resources' },
    { value: 'psycho-education', label: 'Psycho-Education' },
    { value: 'general', label: 'General' }
  ];

  const fetchMedia = async (resetPage = false) => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm,
        type: selectedType !== 'all' ? selectedType : undefined,
        page: resetPage ? 1 : page,
        limit: 12
      };

      const response = await mediaApi.getPublishedMedia(params);

      if (resetPage) {
        setMedia(response.data);
        setPage(1);
      } else {
        setMedia(prev => [...prev, ...response.data]);
      }

      setHasMore(response.pagination.page < response.pagination.pages);
    } catch (err) {
      setError('Failed to load media content');
      console.error('Fetch media error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia(true);
  }, [searchTerm, selectedType]);

  // Debug: Log media data to see what we're getting
  useEffect(() => {
    if (media.length > 0) {
      console.log('📊 Media data loaded:', media.length, 'items');
      const posts = media.filter(item => item.type === 'post');
      console.log('📝 Posts found:', posts.length);
      posts.forEach((post, index) => {
        console.log(`Post ${index + 1}: ${post.title}`);
        console.log(`- Thumbnail: ${post.thumbnailUrl ? '✅ Present' : '❌ Missing'}`);
        console.log(`- Assets: ${post.assets ? post.assets.length + ' items' : '❌ None'}`);
        if (post.thumbnailUrl) {
          console.log(`- URL: ${post.thumbnailUrl}`);
        }
      });
    }
  }, [media]);

  const handleLike = async (mediaId) => {
    try {
      const response = await mediaApi.likeMedia(mediaId);
      setMedia(prev => prev.map(item =>
        item._id === mediaId
          ? { ...item, likes: response.data.likes, hasLiked: response.data.hasLiked }
          : item
      ));
      
      // Update selected media if it's the same
      if (selectedMedia && selectedMedia._id === mediaId) {
        setSelectedMedia(prev => ({
          ...prev,
          likes: response.data.likes,
          hasLiked: response.data.hasLiked
        }));
      }
    } catch (err) {
      console.error('Like media error:', err);
    }
  };

  const handleComment = async (mediaId, content) => {
    try {
      const response = await mediaApi.addComment(mediaId, content);
      setMedia(prev => prev.map(item =>
        item._id === mediaId
          ? { ...item, comments: [...(item.comments || []), response.data] }
          : item
      ));
      
      // Update selected media if it's the same
      if (selectedMedia && selectedMedia._id === mediaId) {
        setSelectedMedia(prev => ({
          ...prev,
          comments: [...(prev.comments || []), response.data]
        }));
      }
    } catch (err) {
      console.error('Add comment error:', err);
    }
  };

  const handleShare = async (mediaId) => {
    try {
      await mediaApi.shareMedia(mediaId);
      setMedia(prev => prev.map(item =>
        item._id === mediaId
          ? { ...item, shares: (item.shares || 0) + 1 }
          : item
      ));
      
      // Update selected media if it's the same
      if (selectedMedia && selectedMedia._id === mediaId) {
        setSelectedMedia(prev => ({
          ...prev,
          shares: (prev.shares || 0) + 1
        }));
      }

      // Copy link to clipboard
      const shareUrl = `${window.location.origin}/resources?media=${mediaId}`;
      await navigator.clipboard.writeText(shareUrl);
      
      // You could add a toast notification here
      console.log('Link copied to clipboard!');
    } catch (err) {
      console.error('Share media error:', err);
    }
  };

  const handleMediaClick = async (mediaItem) => {
    setSelectedMedia(mediaItem);
    
    // Use PostViewer for posts, MediaPlayer for other media types
    if (mediaItem.type === 'post') {
      setShowPostViewer(true);
    } else {
      setShowPlayer(true);
    }
    
    // Track view
    try {
      await mediaApi.getMedia(mediaItem._id); // This increments views
      // Update the media item's view count locally
      setMedia(prev => prev.map(item =>
        item._id === mediaItem._id
          ? { ...item, views: (item.views || 0) + 1 }
          : item
      ));
    } catch (err) {
      console.error('Error tracking view:', err);
    }
  };

  const handleClosePlayer = () => {
    setShowPlayer(false);
    setShowPostViewer(false);
    setSelectedMedia(null);
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
    fetchMedia();
  };

  const handleMediaAdded = (newMedia) => {
    setMedia(prev => [newMedia, ...prev]);
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
      case 'vlog':
        return <Play size={20} />;
      case 'audio':
        return <Play size={20} />;
      case 'document':
        return <Download size={20} />;
      default:
        return <Eye size={20} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-20 pt-28">
      <div className="max-w-6xl mx-auto px-4">
        {/* Instagram-style Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex justify-between items-center mb-6">
            <div className="flex-1">
              <motion.h1 
                className="text-4xl md:text-5xl font-bold text-gray-800 mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Resources
              </motion.h1>
              <motion.p 
                className="text-lg text-gray-600 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Explore our curated collection of mental health resources, educational content, and wellness materials.
              </motion.p>
            </div>
            {isAdmin && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddModal(true)}
                className="btn-primary flex items-center gap-2 ml-6 px-4 py-2 rounded-xl shadow-lg"
              >
                <Plus size={20} />
                Add
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Instagram-style Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-4 shadow-sm mb-8 border border-gray-100"
        >
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {/* Compact Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            {/* Compact Filters */}
            <div className="flex gap-3 items-center">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white text-sm"
              >
                {mediaTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>

              {/* Compact View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Compact Results Count */}
          {!loading && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-gray-500 text-sm text-center">
                {media.length > 0 ? (
                  <>
                    <span className="font-medium text-gray-700">{media.length}</span> resources
                    {searchTerm && <span> for "{searchTerm}"</span>}
                  </>
                ) : (
                  searchTerm ? `No results for "${searchTerm}"` : 'No resources available'
                )}
              </p>
            </div>
          )}
        </motion.div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-8">
            {error}
          </div>
        )}

        {/* Media Grid/List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {viewMode === 'grid' ? (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.1 }}
            >
              {media.map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, scale: 0.8, y: 50 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ 
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 100,
                    damping: 15
                  }}
                  whileHover={{ 
                    y: -8,
                    transition: { type: "spring", stiffness: 300, damping: 20 }
                  }}
                  className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 group cursor-pointer"
                  onClick={() => handleMediaClick(item)}
                >
                  {/* Professional Post Card */}
                  {item.type === 'post' ? (
                    <>
                      {/* Post Thumbnail */}
                      <div className="relative aspect-[4/3] bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden">
                        <ImageWithFallback
                          src={item.thumbnailUrl || (item.assets && item.assets[0]?.fileUrl)}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          fallbackIcon="📄"
                        />
                        
                        {/* Content Type Badge */}
                        <div className="absolute top-3 left-3 bg-primary/90 text-white text-xs font-medium px-3 py-1 rounded-full backdrop-blur-sm">
                          Article
                        </div>

                        {/* Multiple Images Indicator */}
                        {item.assets && item.assets.length > 1 && (
                          <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm flex items-center gap-1">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9h-4v4h-2v-4H9V9h4V5h2v4h4v2z"/>
                            </svg>
                            {item.assets.length}
                          </div>
                        )}

                        {/* Hover Overlay */}
                        <motion.div 
                          className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                          initial={{ opacity: 0 }}
                          whileHover={{ opacity: 1 }}
                        >
                          <motion.div
                            className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Eye size={20} className="text-primary" />
                          </motion.div>
                        </motion.div>
                      </div>

                      {/* Post Content */}
                      <div className="p-5">
                        {/* Title */}
                        <motion.h3 
                          className="font-bold text-gray-800 text-lg mb-3 line-clamp-2 group-hover:text-primary transition-colors"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          {item.title}
                        </motion.h3>

                        {/* Description */}
                        <motion.p 
                          className="text-gray-600 mb-4 line-clamp-3 text-sm leading-relaxed"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          {item.description}
                        </motion.p>

                        {/* Tags */}
                        {item.tags && item.tags.length > 0 && (
                          <motion.div 
                            className="flex flex-wrap gap-2 mb-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                          >
                            {item.tags.slice(0, 3).map((tag, tagIndex) => (
                              <motion.span
                                key={tag}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 + tagIndex * 0.1 }}
                                className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-full font-medium hover:bg-primary/20 transition-colors cursor-pointer"
                              >
                                {tag}
                              </motion.span>
                            ))}
                            {item.tags.length > 3 && (
                              <span className="text-xs px-3 py-1 bg-gray-100 text-gray-500 rounded-full">
                                +{item.tags.length - 3}
                              </span>
                            )}
                          </motion.div>
                        )}

                        {/* Meta Information */}
                        <motion.div 
                          className="flex items-center justify-between pt-4 border-t border-gray-100"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                        >
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Eye size={16} />
                              <span>{item.views || 0}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Heart size={16} />
                              <span>{Array.isArray(item.likes) ? item.likes.length : item.likes || 0}</span>
                            </div>
                            {item.comments && item.comments.length > 0 && (
                              <div className="flex items-center gap-1">
                                <MessageCircle size={16} />
                                <span>{item.comments.length}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="text-xs text-gray-400">
                            {new Date(item.createdAt).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                        </motion.div>
                      </div>
                    </>
                  ) : (
                    /* Other Media Types (Video, Audio, etc.) */
                    <>
                      {/* Regular Media Card */}
                      <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-50 to-blue-50 overflow-hidden">
                        {(item.type === 'video' || item.type === 'vlog') && item.fileUrl ? (
                          <InlineVideoPlayer
                            src={item.fileUrl}
                            poster={item.thumbnailUrl}
                            className="w-full h-full"
                          />
                        ) : item.thumbnailUrl ? (
                          <motion.img
                            src={item.thumbnailUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            whileHover={{ scale: 1.1 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            onError={(e) => {
                              console.log('Image failed to load:', e.target.src);
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-blue-100">
                            <motion.div 
                              className="text-primary text-3xl"
                              animate={{ 
                                rotate: [0, 10, -10, 0],
                                scale: [1, 1.1, 1]
                              }}
                              transition={{ 
                                duration: 3,
                                repeat: Infinity,
                                repeatType: "reverse"
                              }}
                            >
                              {getMediaIcon(item.type)}
                            </motion.div>
                          </div>
                        )}

                        {/* Fallback for failed images */}
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-blue-100" style={{ display: 'none' }}>
                          <motion.div 
                            className="text-primary text-3xl"
                            animate={{ 
                              rotate: [0, 10, -10, 0],
                              scale: [1, 1.1, 1]
                            }}
                            transition={{ 
                              duration: 3,
                              repeat: Infinity,
                              repeatType: "reverse"
                            }}
                          >
                            {getMediaIcon(item.type)}
                          </motion.div>
                        </div>

                        {/* Overlay Gradient */}
                        <motion.div 
                          className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          initial={{ opacity: 0 }}
                          whileHover={{ opacity: 1 }}
                        />

                        {/* Type Badge */}
                        <motion.div 
                          className="absolute top-3 left-3 bg-primary/90 text-white text-xs font-medium px-3 py-1 rounded-full backdrop-blur-sm capitalize"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          {item.type === 'vlog' ? 'Video Blog' : item.type}
                        </motion.div>

                        {/* Duration Badge */}
                        {item.duration && (
                          <motion.div 
                            className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                          >
                            {formatDuration(item.duration)}
                          </motion.div>
                        )}

                        {/* Play Button Overlay */}
                        {!(item.type === 'video' || item.type === 'vlog') && (
                          <motion.div 
                            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                            whileHover={{ scale: 1.1 }}
                          >
                            <motion.div
                              className="w-14 h-14 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg border border-white/20"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Play size={20} className="text-primary ml-0.5" />
                            </motion.div>
                          </motion.div>
                        )}
                      </div>

                      {/* Regular Media Content */}
                      <div className="p-5">
                        <motion.h3 
                          className="font-bold text-gray-800 text-lg mb-3 line-clamp-2 group-hover:text-primary transition-colors"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          {item.title}
                        </motion.h3>

                        <motion.p 
                          className="text-gray-600 mb-4 line-clamp-3 text-sm leading-relaxed"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          {item.description}
                        </motion.p>

                        {/* Tags */}
                        {item.tags && item.tags.length > 0 && (
                          <motion.div 
                            className="flex flex-wrap gap-2 mb-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                          >
                            {item.tags.slice(0, 3).map((tag, tagIndex) => (
                              <motion.span
                                key={tag}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 + tagIndex * 0.1 }}
                                className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-full font-medium hover:bg-primary/20 transition-colors cursor-pointer"
                              >
                                {tag}
                              </motion.span>
                            ))}
                            {item.tags.length > 3 && (
                              <span className="text-xs px-3 py-1 bg-gray-100 text-gray-500 rounded-full">
                                +{item.tags.length - 3}
                              </span>
                            )}
                          </motion.div>
                        )}

                        {/* Actions */}
                        <motion.div 
                          className="flex items-center justify-between pt-4 border-t border-gray-100"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                        >
                          <div className="flex items-center gap-4">
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLike(item._id);
                              }}
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.8 }}
                              className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors"
                            >
                              <Heart size={18} />
                              <span className="text-sm font-medium">{Array.isArray(item.likes) ? item.likes.length : item.likes || 0}</span>
                            </motion.button>

                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedMedia(item);
                                if (item.type === 'post') {
                                  setShowPostViewer(true);
                                } else {
                                  setShowPlayer(true);
                                }
                              }}
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.8 }}
                              className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors"
                            >
                              <MessageCircle size={18} />
                              <span className="text-sm font-medium">{item.comments?.length || 0}</span>
                            </motion.button>
                          </div>

                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShare(item._id);
                            }}
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.8 }}
                            className="flex items-center gap-2 text-gray-500 hover:text-green-500 transition-colors"
                          >
                            <Share size={18} />
                            <span className="text-sm font-medium">{item.shares || 0}</span>
                          </motion.button>
                        </motion.div>
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="max-w-lg mx-auto space-y-8">
              {media.map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: index * 0.2,
                    type: "spring",
                    stiffness: 100,
                    damping: 15
                  }}
                  className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 group cursor-pointer"
                  onClick={() => handleMediaClick(item)}
                >
                  {/* Professional Full Post Layout */}
                  {item.type === 'post' ? (
                    <>
                      {/* Professional Post Header */}
                      <div className="p-5 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                              <span className="text-primary font-bold text-lg">📄</span>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-800">Educational Article</h4>
                              <p className="text-sm text-gray-500">Mental Health Resource</p>
                            </div>
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(item.createdAt).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Professional Post Image */}
                      <div className="relative aspect-[16/9] bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden">
                        <ImageWithFallback
                          src={item.thumbnailUrl || (item.assets && item.assets[0]?.fileUrl)}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          fallbackIcon="📄"
                        />
                        
                        {/* Multiple Images Indicator */}
                        {item.assets && item.assets.length > 1 && (
                          <div className="absolute top-4 right-4 bg-primary/90 text-white text-sm px-3 py-1 rounded-full backdrop-blur-sm flex items-center gap-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9h-4v4h-2v-4H9V9h4V5h2v4h4v2z"/>
                            </svg>
                            {item.assets.length} Images
                          </div>
                        )}
                      </div>

                      {/* Professional Post Content */}
                      <div className="p-6">
                        <h3 className="font-bold text-gray-800 text-xl mb-4 leading-tight">
                          {item.title}
                        </h3>

                        <p className="text-gray-700 mb-6 leading-relaxed">
                          {item.description}
                        </p>

                        {/* Professional Tags */}
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-6">
                            {item.tags.map((tag, tagIndex) => (
                              <span
                                key={tag}
                                className="text-sm px-3 py-1 bg-primary/10 text-primary rounded-lg font-medium hover:bg-primary/20 transition-colors cursor-pointer"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Professional Meta */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-6 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                              <Eye size={18} />
                              <span>{item.views || 0} views</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Heart size={18} />
                              <span>{Array.isArray(item.likes) ? item.likes.length : item.likes || 0} likes</span>
                            </div>
                            {item.comments && item.comments.length > 0 && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedMedia(item);
                                  setShowPostViewer(true);
                                }}
                                className="flex items-center gap-2 hover:text-primary transition-colors"
                              >
                                <MessageCircle size={18} />
                                <span>{item.comments.length} comments</span>
                              </button>
                            )}
                          </div>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMedia(item);
                              setShowPostViewer(true);
                            }}
                            className="text-primary hover:text-primary/80 font-medium text-sm"
                          >
                            Read More →
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    /* Professional Media in List View */
                    <div className="p-6">
                      <div className="flex gap-6">
                        <div className="w-32 h-24 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                          {(item.type === 'video' || item.type === 'vlog') && item.fileUrl ? (
                            <InlineVideoPlayer
                              src={item.fileUrl}
                              poster={item.thumbnailUrl}
                              className="w-full h-full rounded-xl"
                            />
                          ) : item.thumbnailUrl ? (
                            <img
                              src={item.thumbnailUrl}
                              alt={item.title}
                              className="w-full h-full object-cover rounded-xl"
                            />
                          ) : (
                            <div className="text-primary text-2xl">
                              {getMediaIcon(item.type)}
                            </div>
                          )}
                          
                          {/* Content Type Badge */}
                          <div className="absolute top-2 left-2 bg-primary/90 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm capitalize">
                            {item.type === 'vlog' ? 'Video' : item.type}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-800 text-lg mb-2 line-clamp-2">
                            {item.title}
                          </h3>
                          <p className="text-gray-600 line-clamp-3 mb-4 leading-relaxed">
                            {item.description}
                          </p>
                          
                          {/* Tags */}
                          {item.tags && item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {item.tags.slice(0, 4).map((tag) => (
                                <span
                                  key={tag}
                                  className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-md font-medium"
                                >
                                  {tag}
                                </span>
                              ))}
                              {item.tags.length > 4 && (
                                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded-md">
                                  +{item.tags.length - 4}
                                </span>
                              )}
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Eye size={16} />
                                <span>{item.views || 0}</span>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleLike(item._id);
                                }}
                                className="flex items-center gap-1 hover:text-red-500 transition-colors"
                              >
                                <Heart size={16} className={Array.isArray(item.likes) && item.likes.length > 0 ? "fill-red-500 text-red-500" : ""} />
                                <span>{Array.isArray(item.likes) ? item.likes.length : item.likes || 0}</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedMedia(item);
                                  setShowPlayer(true);
                                }}
                                className="flex items-center gap-1 hover:text-blue-500 transition-colors"
                              >
                                <MessageCircle size={16} />
                                <span>{item.comments?.length || 0}</span>
                              </button>
                            </div>
                            <div className="text-xs text-gray-400">
                              {new Date(item.createdAt).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {/* Instagram-style Empty State */}
          {!loading && media.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={32} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No posts yet</h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                Try adjusting your search or check back later for new content.
              </p>
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedType('all');
                }}
                className="mt-4 text-primary hover:text-primary/80 font-medium"
              >
                Clear filters
              </button>
            </motion.div>
          )}

          {/* Instagram-style Load More */}
          {hasMore && !loading && media.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center mt-8"
            >
              <button
                onClick={loadMore}
                className="px-8 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium text-gray-700"
              >
                Load more
              </button>
            </motion.div>
          )}

          {/* Instagram-style Loading */}
          {loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-primary rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500">Loading...</p>
            </motion.div>
          )}
        </motion.div>

        {/* Add Media Modal */}
        <AddMediaModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onMediaAdded={handleMediaAdded}
        />

        {/* Media Player Modal for Videos/Audio/Documents */}
        <MediaPlayer
          media={selectedMedia}
          isOpen={showPlayer}
          onClose={handleClosePlayer}
          onLike={handleLike}
          onComment={handleComment}
          onShare={handleShare}
        />

        {/* Post Viewer Modal for Posts */}
        <PostViewer
          post={selectedMedia}
          isOpen={showPostViewer}
          onClose={handleClosePlayer}
          onLike={handleLike}
          onComment={handleComment}
          onShare={handleShare}
        />
      </div>
    </div>
  );
};

export default Resources;