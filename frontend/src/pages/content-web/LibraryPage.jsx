import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Heart, Search, MessageCircle, Lightbulb, Quote, FileText, CheckCircle, Clock, ArrowRight, Plus } from 'lucide-react';
import { psychoEducationApi } from '../../services/psychoEducation.api';
import useAuthStore from '../../store/useAuthStore';
import { useToast } from '../../hooks/useToast';
import ToastContainer from '../../components/ToastContainer';
import AddPsychoEducationModal from '../../components/admin/AddPsychoEducationModal';
import LibraryDetailModal from '../../features/ContentWeb/components/LibraryDetailModal';
import ContentFilterBar from '../../features/ContentWeb/components/ContentFilterBar';

const LibraryPage = () => {
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get('type') || 'all';
  const searchTerm = searchParams.get('search') || '';

  const { user, isAuthenticated } = useAuthStore();
  const { toasts, success, error: showError, removeToast } = useToast();
  const isAdmin = user?.role === 'admin';

  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const fetchContent = useCallback(async (resetPage = false) => {
    try {
      setLoading(true);
      const targetPage = resetPage ? 1 : page;
      const params = {
        search: searchTerm,
        contentType: typeParam !== 'all' ? typeParam : undefined,
        page: targetPage,
        limit: 9
      };

      const response = await psychoEducationApi.getPublishedContent(params);
      if (response.success) {
        const processedContent = response.data.map(item => ({
          ...item,
          hasLiked: Boolean(item.hasLiked)
        }));

        if (resetPage) {
          setContent(processedContent);
          setPage(1);
        } else {
          setContent(prev => [...prev, ...processedContent]);
        }
        setHasMore(response.pagination && response.pagination.page < response.pagination.pages);
      }
    } catch (err) {
      console.error('Fetch library error:', err);
      setError('Failed to load library content');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, typeParam, page]);

  // Initial fetch and fetch on filter/search change
  useEffect(() => {
    fetchContent(true);
  }, [searchTerm, typeParam]);

  // Fetch more logic
  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  // Trigger fetchContent when page changes (but not on initial reset)
  useEffect(() => {
    if (page > 1) {
      fetchContent(false);
    }
  }, [page]);

  const handleLike = async (contentId) => {
    if (!isAuthenticated) {
      showError('Please log in to like content');
      return;
    }
    try {
      const response = await psychoEducationApi.likeContent(contentId);
      setContent(prev => prev.map(item =>
        item._id === contentId
          ? { ...item, hasLiked: response.data.hasLiked, likesCount: response.data.likes }
          : item
      ));
      success(response.data.hasLiked ? 'Added to liked content' : 'Removed from liked content');

      // Update selected content if it's the one in the modal
      if (selectedContent && selectedContent._id === contentId) {
        setSelectedContent(prev => ({ ...prev, hasLiked: response.data.hasLiked, likesCount: response.data.likes }));
      }
    } catch (err) {
      showError('Failed to update like');
    }
  };

  const handleOpenDetail = (item) => {
    setSelectedContent(item);
    setShowDetailModal(true);
  };

  const getContentIcon = (type) => {
    switch (type) {
      case 'qa': return <MessageCircle size={20} />;
      case 'theory': return <FileText size={20} />;
      case 'quote': return <Quote size={20} />;
      case 'tip': return <Lightbulb size={20} />;
      case 'exercise': return <CheckCircle size={20} />;
      default: return <BookOpen size={20} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF5F7] pt-24 md:pt-28">
      <ContentFilterBar />
      <div className="max-w-7xl mx-auto px-6 md:px-12 pb-24">
        {/* ACTION BAR */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-10 pt-4 gap-6 sm:gap-0">
          <div className="flex items-center gap-4 w-full sm:w-auto overflow-x-auto scrollbar-hide pb-1 sm:pb-0">
            {isAdmin && (
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-primary/10 text-primary p-2.5 rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm flex items-center gap-2 font-bold text-sm uppercase tracking-wider w-full sm:w-auto justify-center"
              >
                <Plus size={20} />
                ADD ARTICLE
              </button>
            )}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl mb-8 flex justify-between items-center">
            <p className="font-medium">{error}</p>
            <button onClick={() => fetchContent(true)} className="text-sm font-bold underline">Retry</button>
          </div>
        )}

        {/* Library Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
          <AnimatePresence mode="popLayout">
            {content.map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className="group bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-transparent hover:border-purple-50 flex flex-col"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    {getContentIcon(item.contentType)}
                  </div>
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest bg-purple-50/50 px-3 py-1 rounded-full">
                    {item.contentType === 'qa' ? 'Q&A' : item.contentType}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-primary mb-4 group-hover:text-secondary transition-colors leading-tight">
                  {item.title}
                </h3>

                <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-8">
                  {item.description}
                </p>

                <div className="mt-auto pt-6 border-t border-gray-50 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    {isAuthenticated && <button
                      onClick={() => handleLike(item._id)}
                      className={`flex items-center gap-1.5 transition-colors ${item.hasLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                    >
                      <Heart size={18} className={item.hasLiked ? 'fill-red-500' : ''} />
                      <span className="text-sm font-medium">{item.likesCount || 0}</span>
                    </button>}
                    {item.estimatedReadTime && (
                      <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                        <Clock size={16} />
                        <span>{item.estimatedReadTime}m</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleOpenDetail(item)}
                    className="flex items-center gap-2 text-sm font-bold text-secondary hover:gap-3 transition-all"
                  >
                    READ MORE <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {!loading && content.length === 0 && (
          <div className="text-center py-24 bg-white rounded-[3rem] border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
              <BookOpen size={40} />
            </div>
            <h3 className="text-2xl font-bold text-gray-600 mb-2">Library is empty</h3>
            <p className="text-gray-400">Try adjusting your search terms or check back soon!</p>
          </div>
        )}

        {hasMore && (
          <div className="mt-16 text-center">
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="px-10 py-4 bg-primary text-white rounded-full font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-all disabled:opacity-50 uppercase tracking-widest text-xs"
            >
              {loading ? 'LOADING...' : 'LOAD MORE CONTENT'}
            </button>
          </div>
        )}
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {showAddModal && (
        <AddPsychoEducationModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onContentAdded={() => fetchContent(true)}
        />
      )}

      <LibraryDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        content={selectedContent}
        onLike={handleLike}
      />
    </div>
  );
};

export default LibraryPage;
