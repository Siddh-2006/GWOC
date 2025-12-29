import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Download, Heart, Eye, Search, Filter, Grid, List, Clock, Tag, Plus, Settings, MessageCircle, Share } from 'lucide-react';
import { mediaApi } from '../services/media.api';
import useAuthStore from '../store/useAuthStore';
import AddMediaModal from '../components/admin/AddMediaModal';
import MediaPlayer from '../components/MediaPlayer';
import InlineVideoPlayer from '../components/InlineVideoPlayer';

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
    setShowPlayer(true);
    
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
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                Resources
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Discover mental health content, videos, and resources curated for your wellbeing journey.
              </p>
            </div>
            {isAdmin && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddModal(true)}
                className="btn-primary flex items-center gap-2 ml-6 px-4 py-2 rounded-xl"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {media.map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer"
                  onClick={() => handleMediaClick(item)}
                >
                  {/* Instagram-style Square Thumbnail/Video Container */}
                  <div className="relative aspect-square bg-gradient-to-br from-purple-100 to-pink-100 overflow-hidden">
                    {(item.type === 'video' || item.type === 'vlog') && item.fileUrl ? (
                      <InlineVideoPlayer
                        src={item.fileUrl}
                        poster={item.thumbnailUrl}
                        className="w-full h-full"
                      />
                    ) : item.thumbnailUrl ? (
                      <img
                        src={item.thumbnailUrl}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-purple-200">
                        <div className="text-primary text-2xl">
                          {getMediaIcon(item.type)}
                        </div>
                      </div>
                    )}

                    {/* Instagram-style Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Type Badge - Instagram style */}
                    <div className="absolute top-2 left-2 bg-black/60 text-white text-xs font-medium px-2 py-1 rounded-full backdrop-blur-sm capitalize">
                      {item.type}
                    </div>

                    {/* Duration Badge - Instagram style */}
                    {item.duration && (
                      <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                        {formatDuration(item.duration)}
                      </div>
                    )}

                    {/* Play Button Overlay - Only for non-video items */}
                    {!(item.type === 'video' || item.type === 'vlog') && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/50">
                          <Play size={20} className="text-white ml-0.5" />
                        </div>
                      </div>
                    )}

                    {/* Instagram-style Action Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="flex items-center justify-between text-white">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLike(item._id);
                            }}
                            className="flex items-center gap-1 hover:scale-110 transition-transform"
                          >
                            <Heart size={16} className="fill-white" />
                            <span className="text-xs font-medium">{Array.isArray(item.likes) ? item.likes.length : item.likes || 0}</span>
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMedia(item);
                              setShowPlayer(true);
                              setShowComments(true);
                            }}
                            className="flex items-center gap-1 hover:scale-110 transition-transform"
                          >
                            <MessageCircle size={16} />
                            <span className="text-xs font-medium">{item.comments?.length || 0}</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-1 text-xs">
                          <Eye size={12} />
                          {item.views || 0}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Instagram-style Compact Content */}
                  <div className="p-3">
                    <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>

                    {/* Instagram-style Tags */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {item.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="text-xs text-primary font-medium">
                            #{tag}
                          </span>
                        ))}
                        {item.tags.length > 2 && (
                          <span className="text-xs text-gray-400">+{item.tags.length - 2}</span>
                        )}
                      </div>
                    )}

                    {/* Instagram-style Action Bar */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLike(item._id);
                          }}
                          className="text-gray-500 hover:text-red-500 transition-colors"
                        >
                          <Heart size={16} />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMedia(item);
                            setShowPlayer(true);
                            setShowComments(true);
                          }}
                          className="text-gray-500 hover:text-blue-500 transition-colors"
                        >
                          <MessageCircle size={16} />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShare(item._id);
                          }}
                          className="text-gray-500 hover:text-green-500 transition-colors"
                        >
                          <Share size={16} />
                        </button>
                      </div>

                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Eye size={12} />
                        {item.views || 0}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {media.map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-all duration-300 group cursor-pointer"
                  onClick={() => handleMediaClick(item)}
                >
                  <div className="flex gap-4">
                    {/* Instagram-style Square Thumbnail */}
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden relative group/thumb">
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
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      ) : (
                        <div className="text-primary text-xl">
                          {getMediaIcon(item.type)}
                        </div>
                      )}
                      
                      {/* Play Overlay - Only for non-video items */}
                      {!(item.type === 'video' || item.type === 'vlog') && (
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="w-8 h-8 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                            <Play size={14} className="text-white ml-0.5" />
                          </div>
                        </div>
                      )}

                      {/* Duration Badge */}
                      {item.duration && (
                        <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded-full">
                          {formatDuration(item.duration)}
                        </div>
                      )}
                    </div>

                    {/* Instagram-style Compact Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full capitalize font-medium">
                            {item.type}
                          </span>
                          {item.duration && (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock size={12} />
                              {formatDuration(item.duration)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Eye size={12} />
                          {item.views || 0}
                        </div>
                      </div>

                      <h3 className="font-semibold text-gray-800 text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>

                      <div className="flex items-center justify-between">
                        {/* Instagram-style Tags */}
                        <div className="flex items-center gap-1 flex-1">
                          {item.tags && item.tags.length > 0 && (
                            <div className="flex gap-1 flex-wrap">
                              {item.tags.slice(0, 2).map(tag => (
                                <span key={tag} className="text-xs text-primary font-medium">
                                  #{tag}
                                </span>
                              ))}
                              {item.tags.length > 2 && (
                                <span className="text-xs text-gray-400">+{item.tags.length - 2}</span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Instagram-style Action Bar */}
                        <div className="flex items-center gap-3 ml-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLike(item._id);
                            }}
                            className="text-gray-500 hover:text-red-500 transition-colors"
                          >
                            <Heart size={14} />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMedia(item);
                              setShowPlayer(true);
                              setShowComments(true);
                            }}
                            className="text-gray-500 hover:text-blue-500 transition-colors"
                          >
                            <MessageCircle size={14} />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShare(item._id);
                            }}
                            className="text-gray-500 hover:text-green-500 transition-colors"
                          >
                            <Share size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
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

        {/* Media Player Modal */}
        <MediaPlayer
          media={selectedMedia}
          isOpen={showPlayer}
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