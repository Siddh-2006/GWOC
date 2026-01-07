import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Heart, Eye, Search, Plus, Grid, List, MoveRight } from 'lucide-react';
import { mediaApi } from '../../services/media.api';
import useAuthStore from '../../store/useAuthStore';
import { useToast } from '../../hooks/useToast';
import ToastContainer from '../../components/ToastContainer';
import ContentWebLayout from '../../features/ContentWeb/components/ContentWebLayout';
import MediaPlayer from '../../components/MediaPlayer';
import PostViewer from '../../components/PostViewer';
import ImageWithFallback from '../../components/ImageWithFallback';
import AddMediaModal from '../../components/admin/AddMediaModal';
import InlineVideoPlayer from '../../components/InlineVideoPlayer';

const ResourcesPage = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { toasts, success, error: showError, removeToast } = useToast();
  const isAdmin = user?.role === 'admin';

  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get('type') || 'all';
  const searchTerm = searchParams.get('search') || '';

  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);

  const [selectedMedia, setSelectedMedia] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [showPostViewer, setShowPostViewer] = useState(false);

  const fetchMedia = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        search: searchTerm,
        type: typeParam !== 'all' ? typeParam : undefined,
        page: page,
        limit: 12
      };

      const response = await mediaApi.getPublishedMedia(params);
      if (response.success) {
        setMedia(response.data);
        setCurrentPage(response.pagination.page);
        setTotalPages(response.pagination.pages);
      }
    } catch (err) {
      setError('Failed to load media content');
      console.error('Fetch media error:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, typeParam]);

  useEffect(() => {
    fetchMedia(1);
  }, [fetchMedia, searchTerm, typeParam]);

  const handleLike = async (mediaId, e) => {
    if (e) e.stopPropagation();
    if (!isAuthenticated) {
      showError('Please log in to like content');
      return;
    }
    try {
      const response = await mediaApi.likeMedia(mediaId);
      const updatedData = {
        hasLiked: response.data.hasLiked,
        likesCount: response.data.likes,
      };

      setMedia(prev => prev.map(item =>
        item._id === mediaId ? { ...item, ...updatedData } : item
      ));

      if (selectedMedia && selectedMedia._id === mediaId) {
        setSelectedMedia(prev => ({ ...prev, ...updatedData }));
      }
      success(response.data.hasLiked ? 'Added to liked content' : 'Removed from liked content');
    } catch (err) {
      showError('Failed to update like');
    }
  };

  const handleComment = async (mediaId, content) => {
    try {
      const response = await mediaApi.addComment(mediaId, content);
      const newComment = response.data;
      setMedia(prev => prev.map(item =>
        item._id === mediaId ? { ...item, comments: [...(item.comments || []), newComment] } : item
      ));
      if (selectedMedia && selectedMedia._id === mediaId) {
        setSelectedMedia(prev => ({ ...prev, comments: [...(prev.comments || []), newComment] }));
      }
      success('Comment added!');
    } catch (err) {
      showError('Failed to add comment');
    }
  };

  const handleMediaClick = async (item) => {
    setSelectedMedia(item);
    if (item.type === 'post') {
      setShowPostViewer(true);
    } else {
      setShowPlayer(true);
    }

    try {
      const response = await mediaApi.getMedia(item._id);
      if (response.success) {
        setMedia(prev => prev.map(m => m._id === item._id ? { ...m, views: response.data.views } : m));
        setSelectedMedia(response.data);
      }
    } catch (err) {
      console.error('Error tracking view:', err);
    }
  };

  const handleMediaAdded = (newMedia) => {
    setMedia(prev => [newMedia, ...prev]);
    success('Media added successfully!');
    setShowAddModal(false);
  };

  return (
    <ContentWebLayout>
      <div className="max-w-7xl mx-auto px-6 md:px-12 pb-24">
        {/* ACTION BAR */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 pt-4 gap-6 sm:gap-0">
          <div className="flex items-center gap-4 w-full sm:w-auto overflow-x-auto scrollbar-hide pb-1 sm:pb-0">
            {isAdmin && (
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-primary/10 text-primary p-2.5 rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm flex items-center gap-2 font-bold text-sm uppercase tracking-wider"
              >
                <Plus size={20} />
                Add Content
              </button>
            )}
          </div>

          <div className="flex bg-white border border-gray-100 rounded-2xl p-1 shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-primary text-white shadow-md' : 'text-gray-400 hover:text-primary'}`}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-primary text-white shadow-md' : 'text-gray-400 hover:text-primary'}`}
            >
              <List size={18} />
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl mb-8 flex justify-between items-center">
            <p className="font-medium">{error}</p>
            <button onClick={() => fetchMedia(1)} className="text-sm font-bold underline">Retry</button>
          </div>
        )}

        {/* Content Grid/List */}
        {loading && media.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-50 animate-pulse rounded-3xl h-64" />
            ))}
          </div>
        ) : media.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[3rem] border border-gray-200 border-dashed">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
              <Search size={40} />
            </div>
            <h3 className="text-2xl font-bold text-gray-600 mb-2">No resources found</h3>
            <p className="text-gray-400">Try adjusting your search terms.</p>
          </div>
        ) : (
          <motion.div
            layout
            className={viewMode === 'grid'
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
              : "flex flex-col gap-6 max-w-4xl mx-auto"
            }
          >
            <AnimatePresence mode="popLayout">
              {media.map((item) => (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => handleMediaClick(item)}
                  className={`group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer flex ${viewMode === 'grid' ? 'flex-col h-full' : 'flex-row items-center p-4 gap-6'}`}
                >
                  <div className={`relative overflow-hidden bg-gray-50 ${viewMode === 'grid' ? 'aspect-video' : 'w-48 h-32 rounded-2xl flex-shrink-0'}`}>
                    {(item.type === 'video' || item.type === 'vlog') && item.fileUrl ? (
                      <InlineVideoPlayer
                        src={item.fileUrl}
                        poster={item.thumbnailUrl}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageWithFallback
                        src={item.thumbnailUrl || (item.type === 'post' && item.assets && item.assets[0]?.fileUrl)}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center text-primary transform scale-90 group-hover:scale-100 transition-transform duration-300">
                        {item.type === 'video' ? <Play fill="currentColor" size={24} /> : <Eye size={24} />}
                      </div>
                    </div>
                    {item.type && (
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-white/95 backdrop-blur-md rounded-full text-[10px] font-bold text-primary uppercase tracking-tighter shadow-sm border border-white/20">
                          {item.type}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className={`p-6 flex flex-col flex-grow ${viewMode === 'list' && 'py-2'}`}>
                    <h3 className={`${viewMode === 'grid' ? 'text-lg' : 'text-xl'} font-bold text-slate-800 mb-3 line-clamp-2 leading-tight group-hover:text-primary transition-colors`}>
                      {item.title}
                    </h3>
                    {viewMode === 'grid' && (
                      <p className="text-slate-500 text-sm line-clamp-3 mb-6 leading-relaxed">
                        {item.description}
                      </p>
                    )}

                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
                      <div className="flex items-center gap-4">
                        {isAuthenticated &&
                          <button
                            onClick={(e) => handleLike(item._id, e)}
                            className={`flex items-center gap-1.5 transition-colors ${item.hasLiked ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'}`}
                          >
                            <Heart size={16} className={item.hasLiked ? 'fill-rose-500' : ''} />
                            <span className="text-sm font-semibold tracking-tight">{item.likesCount || 0}</span>
                          </button>
                        }
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Eye size={16} />
                          <span className="text-sm font-semibold tracking-tight">{item.views || 0}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-primary hover:gap-2 transition-all tracking-[0.1em] uppercase">
                        {item.type === 'video' ? 'WATCH' : item.type === 'audio' ? 'LISTEN' : 'READ'}
                        <MoveRight size={14} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-20 flex justify-center gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => fetchMedia(i + 1)}
                className={`w-12 h-12 rounded-2xl font-bold transition-all ${currentPage === i + 1
                  ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-110'
                  : 'bg-white text-slate-400 hover:bg-slate-50 border border-slate-100'
                  }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {showPlayer && selectedMedia && (
        <MediaPlayer
          media={selectedMedia}
          isOpen={showPlayer}
          onClose={() => setShowPlayer(false)}
        />
      )}
      {showPostViewer && selectedMedia && (
        <PostViewer
          post={selectedMedia}
          isOpen={showPostViewer}
          onClose={() => setShowPostViewer(false)}
        />
      )}
      {showAddModal && (
        <AddMediaModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onMediaAdded={handleMediaAdded}
        />
      )}
    </ContentWebLayout>
  );
};

export default ResourcesPage;
