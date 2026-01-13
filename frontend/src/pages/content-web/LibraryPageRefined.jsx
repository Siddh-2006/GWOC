import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Heart, Eye, Search, Plus, Grid, List, MoveRight, BookOpen, Clock, ArrowRight } from 'lucide-react';
import { psychoEducationApi } from '../../services/psychoEducation.api';
import useAuthStore from '../../store/useAuthStore';
import { useToast } from '../../hooks/useToast';
import ToastContainer from '../../components/ToastContainer';
import LibraryDetailModal from '../../features/ContentWeb/components/LibraryDetailModal';
import AddPsychoEducationModal from '../../components/admin/AddPsychoEducationModal';
import ResourceSidebar from '../../features/ContentWeb/components/ResourceSidebar';
import ResourceMobileDropdown from '../../features/ContentWeb/components/ResourceMobileDropdown';

const LibraryPage = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { toasts, success, error: showError, removeToast } = useToast();
  const location = useLocation();
  const isAdmin = user?.role === 'admin';

  const [searchParams, setSearchParams] = useSearchParams();
  const typeParam = searchParams.get('type') || 'all';
  const searchTerm = searchParams.get('search') || '';
  const [localSearch, setLocalSearch] = useState(searchTerm);

  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);

  const [selectedContent, setSelectedContent] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const fetchContent = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        search: searchTerm,
        contentType: typeParam !== 'all' ? typeParam : undefined,
        page: page,
        limit: 12
      };

      const response = await psychoEducationApi.getPublishedContent(params);
      if (response.success) {
        setContent(response.data);
        setCurrentPage(response.pagination.page);
        setTotalPages(response.pagination.pages);
      }
    } catch (err) {
      setError('Failed to load library content');
      console.error('Fetch library error:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, typeParam]);

  useEffect(() => {
    fetchContent(1);
  }, [fetchContent, searchParams]);

  // Search Typewriter Effect for Main Search Bar
  const [placeholder, setPlaceholder] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const placeholderWords = ['anxiety tips', 'meditation guides', 'mental health', 'self care'];

  useEffect(() => {
    const typeSpeed = isDeleting ? 50 : 150;
    const timeout = setTimeout(() => {
      const currentWord = placeholderWords[placeholderIndex];
      if (!isDeleting && placeholder === currentWord) {
        setTimeout(() => setIsDeleting(true), 1500);
      } else if (isDeleting && placeholder === '') {
        setIsDeleting(false);
        setPlaceholderIndex((prev) => (prev + 1) % placeholderWords.length);
      } else {
        setPlaceholder(currentWord.substring(0, placeholder.length + (isDeleting ? -1 : 1)));
      }
    }, typeSpeed);
    return () => clearTimeout(timeout);
  }, [placeholder, placeholderIndex, isDeleting]);

  // Debounce search update to URL
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentURLSearch = searchParams.get('search') || '';
      if (localSearch !== currentURLSearch) {
        const newParams = new URLSearchParams(searchParams);
        if (localSearch) newParams.set('search', localSearch);
        else newParams.delete('search');
        setSearchParams(newParams);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [localSearch, searchParams, setSearchParams]);

  const handleSearchChange = (e) => {
    setLocalSearch(e.target.value);
  };

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
      if (selectedContent && selectedContent._id === contentId) {
        setSelectedContent(prev => ({ ...prev, hasLiked: response.data.hasLiked, likesCount: response.data.likes }));
      }
      success(response.data.hasLiked ? 'Added to liked content' : 'Removed from liked content');
    } catch (err) {
      showError('Failed to update like');
    }
  };

  const handleOpenDetail = (item) => {
    setSelectedContent(item);
    setShowDetailModal(true);
  };

  return (
    <div className="min-h-screen bg-[#FFF5F7] pt-24 md:pt-28">
      <div className="max-w-7xl mx-auto px-6 md:px-12 pb-24 flex flex-col lg:flex-row gap-8">

        {/* Sidebar (Desktop Only) */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-28">
            <ResourceSidebar mode="library" />
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-grow min-w-0">

          {/* Header & Search */}
          <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
            <div className="hidden md:block">
              <div className="inline-flex items-center p-1.5 bg-purple-50/50 rounded-[2rem] border border-purple-100 mb-2">
                <Link
                  to="/resources"
                  className={`px-8 py-3 rounded-[1.5rem] text-xl font-bold transition-all duration-300 ${location.pathname === '/resources'
                    ? 'bg-primary text-white shadow-lg shadow-primary/25 scale-105'
                    : 'text-slate-400 hover:text-primary hover:bg-white/50'
                    }`}
                >
                  Resources
                </Link>
                <Link
                  to="/library"
                  className={`px-8 py-3 rounded-[1.5rem] text-xl font-bold transition-all duration-300 ${location.pathname === '/library'
                    ? 'bg-primary text-white shadow-lg shadow-primary/25 scale-105'
                    : 'text-slate-400 hover:text-primary hover:bg-white/50'
                    }`}
                >
                  Library
                </Link>
              </div>
            </div>

            <div className="w-full md:w-auto flex items-center gap-4">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder={`Search for ${placeholder}...`}
                  value={localSearch}
                  onChange={handleSearchChange}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-purple-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm z-10"
                />
              </div>

              {/* Mobile Filter */}
              <div className="flex lg:hidden items-center gap-2 flex-shrink-0">
                <ResourceMobileDropdown mode="library" />
              </div>

              {isAdmin && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-primary text-white p-3 rounded-xl hover:bg-secondary transition-all shadow-lg shadow-primary/20 flex-shrink-0"
                >
                  <Plus size={20} />
                </button>
              )}
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl mb-8 flex justify-between items-center">
              <p className="font-medium">{error}</p>
              <button onClick={() => fetchContent(1)} className="text-sm font-bold underline">Retry</button>
            </div>
          )}

          {/* Content Grid */}
          {loading && content.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-50 animate-pulse rounded-3xl h-64" />
              ))}
            </div>
          ) : content.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-[3rem] border border-gray-200 border-dashed">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                <BookOpen size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-600 mb-2">No library content found</h3>
              <p className="text-gray-400">Try adjusting your search terms.</p>
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {content.map((item) => (
                  <motion.div
                    key={item._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={() => handleOpenDetail(item)}
                    className="group bg-white rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-transparent hover:border-purple-50 flex flex-col cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                        <BookOpen size={18} />
                      </div>
                      <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest bg-purple-50/50 px-3 py-1 rounded-full">
                        {item.contentType || 'Article'}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-800 mb-3 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-slate-500 text-sm line-clamp-3 mb-6 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="mt-auto pt-4 border-t border-slate-50 flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        {isAuthenticated && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleLike(item._id); }}
                            className={`flex items-center gap-1.5 transition-colors ${item.hasLiked ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'}`}
                          >
                            <Heart size={16} className={item.hasLiked ? 'fill-rose-500' : ''} />
                            <span className="text-sm font-semibold tracking-tight">{item.likesCount || 0}</span>
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-primary hover:gap-2 transition-all tracking-[0.1em] uppercase">
                        READ <ArrowRight size={14} />
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
                  onClick={() => fetchContent(i + 1)}
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

        </main>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {showAddModal && (
        <AddPsychoEducationModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onContentAdded={() => fetchContent(1)}
        />
      )}

      {showDetailModal && (
        <LibraryDetailModal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          content={selectedContent}
          onLike={handleLike}
        />
      )}
    </div>
  );
};

export default LibraryPage;
