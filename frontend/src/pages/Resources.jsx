import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Download, Heart, Eye, Search, Filter, Grid, List, Clock, Tag, Plus, Settings, MessageCircle, Share } from 'lucide-react';
import { mediaApi } from '../services/media.api';
import useAuthStore from '../store/useAuthStore';
import AddMediaModal from '../components/admin/AddMediaModal';

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
    } catch (err) {
      console.error('Like media error:', err);
    }
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
    <div className="min-h-screen bg-bg py-20 pt-30">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex justify-between items-center mb-4">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
                Resources & Media
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Explore our collection of educational videos, articles, and resources to support your mental health journey.
              </p>
            </div>
            {isAdmin && (
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary flex items-center gap-2 ml-4"
              >
                <Plus size={20} />
                Add Media
              </button>
            )}
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-4 items-center">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {mediaTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>

              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white shadow text-primary' : 'text-gray-500'}`}
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white shadow text-primary' : 'text-gray-500'}`}
                >
                  <List size={20} />
                </button>
              </div>
            </div>
          </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {media.map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all group cursor-pointer"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                    {item.thumbnailUrl ? (
                      <img
                        src={item.thumbnailUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-primary">
                        {getMediaIcon(item.type)}
                      </div>
                    )}

                    {/* Duration overlay for videos */}
                    {item.duration && (
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                        {formatDuration(item.duration)}
                      </div>
                    )}

                    {/* Play overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                      <div className="w-12 h-12 bg-white bg-opacity-0 group-hover:bg-opacity-90 rounded-full flex items-center justify-center transition-all">
                        {getMediaIcon(item.type)}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs px-2 py-1 bg-purple-100 text-purple-600 rounded-full capitalize">
                        {item.type}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Eye size={12} />
                        {item.views}
                      </span>
                    </div>

                    <h3 className="font-bold text-gray-800 mb-2 line-clamp-2">
                      {item.title}
                    </h3>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {item.description}
                    </p>

                    {/* Tags */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {item.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(item._id);
                        }}
                        className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors"
                      >
                        <Heart size={16} />
                        <span className="text-sm">{Array.isArray(item.likes) ? item.likes.length : item.likes}</span>
                      </button>

                      <button className="flex items-center gap-1 text-gray-500 hover:text-blue-500 transition-colors">
                        <MessageCircle size={16} />
                        <span className="text-sm">{item.comments?.length || 0}</span>
                      </button>
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
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all group cursor-pointer"
                >
                  <div className="flex gap-4">
                    {/* Thumbnail */}
                    <div className="w-32 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      {item.thumbnailUrl ? (
                        <img
                          src={item.thumbnailUrl}
                          alt={item.title}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <div className="text-primary">
                          {getMediaIcon(item.type)}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-1 bg-purple-100 text-purple-600 rounded-full capitalize">
                            {item.type}
                          </span>
                          {item.duration && (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock size={12} />
                              {formatDuration(item.duration)}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Eye size={12} />
                          {item.views}
                        </span>
                      </div>

                      <h3 className="font-bold text-gray-800 mb-2">
                        {item.title}
                      </h3>

                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {item.description}
                      </p>

                      <div className="flex items-center justify-between">
                        {/* Tags */}
                        <div className="flex items-center gap-2">
                          {item.tags && item.tags.length > 0 && (
                            <div className="flex gap-1">
                              <Tag size={12} className="text-gray-400" />
                              {item.tags.slice(0, 2).map(tag => (
                                <span key={tag} className="text-xs text-gray-500">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLike(item._id);
                            }}
                            className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors"
                          >
                            <Heart size={16} />
                            <span className="text-sm">{Array.isArray(item.likes) ? item.likes.length : item.likes}</span>
                          </button>

                          <button className="flex items-center gap-1 text-gray-500 hover:text-blue-500 transition-colors">
                            <MessageCircle size={16} />
                            <span className="text-sm">{item.comments?.length || 0}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && media.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={32} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No resources found</h3>
              <p className="text-gray-500">Try adjusting your search or filters to find what you're looking for.</p>
            </div>
          )}

          {/* Load More */}
          {hasMore && !loading && media.length > 0 && (
            <div className="text-center mt-8">
              <button
                onClick={loadMore}
                className="btn-primary px-8 py-3"
              >
                Load More
              </button>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading resources...</p>
            </div>
          )}
        </motion.div>

        {/* Add Media Modal */}
        <AddMediaModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onMediaAdded={handleMediaAdded}
        />
      </div>
    </div>
  );
};

export default Resources;