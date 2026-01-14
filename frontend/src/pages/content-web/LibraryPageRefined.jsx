import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Heart, Search, MessageCircle, Lightbulb, Quote, FileText, CheckCircle, Clock, ArrowRight, Plus, Grid, List, Eye } from 'lucide-react';
import { psychoEducationApi } from '../../services/psychoEducation.api';
import useAuthStore from '../../store/useAuthStore';
import { useToast } from '../../hooks/useToast';
import ToastContainer from '../../components/ToastContainer';
import AddPsychoEducationModal from '../../components/admin/AddPsychoEducationModal';
import LibraryDetailModal from '../../features/ContentWeb/components/LibraryDetailModal';
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
  }, [searchParams]);

  useEffect(() => {
    fetchContent(1);
  }, [fetchContent, searchParams]);

  // Search Typewriter Effect
  const [placeholder, setPlaceholder] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const placeholderWords = ['anxiety tips', 'mindfulness exercises', 'stress management', 'self-care'];

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

  const handleLike = async (contentId, e) => {
    if (e) e.stopPropagation();
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
      case 'qa': return <MessageCircle size={28} />;
      case 'theory': return <FileText size={28} />;
      case 'quote': return <Quote size={28} />;
      case 'tip': return <Lightbulb size={28} />;
      case 'exercise': return <CheckCircle size={28} />;
      default: return <BookOpen size={28} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF5F7] pt-20">
      {/* Hero Header - Matches navbar on scroll */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-30 shadow-sm"
      >
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 py-4 sm:py-5">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary mb-0.5 sm:mb-1 truncate">
                Content Hub
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 hidden md:block">Explore resources and expand your knowledge</p>
            </div>
            
            {/* Tab Navigation - Responsive */}
            <div className="flex items-center gap-0.5 sm:gap-1 p-0.5 sm:p-1 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-200 shadow-sm flex-shrink-0">
              <Link
                to="/resources"
                className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-md sm:rounded-lg font-bold text-xs sm:text-sm transition-all ${
                  location.pathname === '/resources'
                    ? 'text-white bg-primary shadow-md'
                    : 'text-gray-600 hover:bg-white'
                }`}
              >
                Resources
              </Link>
              <Link
                to="/library"
                className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-md sm:rounded-lg font-bold text-xs sm:text-sm transition-all ${
                  location.pathname === '/library'
                    ? 'text-white bg-primary shadow-md'
                    : 'text-gray-600 hover:bg-white'
                }`}
              >
                Library
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Layout - Clean spacing */}
      <div className="flex max-w-[1920px] mx-auto">

        {/* Sidebar - Clean */}
        <aside className="hidden lg:block w-72 shrink-0 bg-white border-r border-gray-100">
          <div className="sticky top-[88px] p-6">
            <ResourceSidebar mode="library" />
          </div>
        </aside>

        {/* Main Content - Clean & Responsive */}
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-12 py-6 sm:py-8 lg:py-10">
          
          {/* Toolbar - Clean & Responsive */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-3 sm:p-5 mb-6 sm:mb-8 border border-gray-100"
          >
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              
              {/* Search - Thinner and more intuitive */}
              <div className="relative flex-1">
                <Search className="absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                <input
                  type="text"
                  placeholder={`Search ${placeholder}...`}
                  value={localSearch}
                  onChange={handleSearchChange}
                  className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2 sm:py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg sm:rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all font-medium text-xs sm:text-sm placeholder:text-gray-400"
                />
              </div>

              {/* Actions - Responsive */}
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="lg:hidden flex-shrink-0">
                  <ResourceMobileDropdown mode="library" />
                </div>
                
                <div className="flex items-center gap-1 sm:gap-1.5 p-0.5 sm:p-1 bg-purple-50/50 rounded-lg sm:rounded-xl border border-purple-100 flex-shrink-0">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 sm:p-2.5 rounded-md sm:rounded-lg transition-all ${
                      viewMode === 'grid'
                        ? 'bg-white text-primary shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Grid className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 sm:p-2.5 rounded-md sm:rounded-lg transition-all ${
                      viewMode === 'list'
                        ? 'bg-white text-primary shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <List className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                  </button>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-3 bg-primary text-white rounded-lg sm:rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all font-bold text-xs sm:text-sm flex-shrink-0"
                  >
                    <Plus className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                    <span className="hidden sm:inline">Add Article</span>
                    <span className="sm:hidden">Add</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Error */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl mb-8 flex justify-between items-center"
            >
              <span className="font-medium">{error}</span>
              <button onClick={() => fetchContent(1)} className="font-bold underline hover:no-underline">
                Retry
              </button>
            </motion.div>
          )}

          {/* Content - Responsive Grid */}
          {loading && content.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white/50 animate-pulse rounded-2xl sm:rounded-[2rem] h-72 sm:h-80 shadow-xl" />
              ))}
            </div>
          ) : content.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 sm:py-20 bg-white rounded-2xl sm:rounded-[2rem] shadow-2xl mx-2 sm:mx-0"
            >
              <div className="w-16 sm:w-20 h-16 sm:h-20 bg-purple-50 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <BookOpen size={28} className="sm:w-8 sm:h-8 text-primary" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-primary mb-2 sm:mb-3 px-4">No content found</h3>
              <p className="text-sm sm:text-base text-gray-600 px-4">Try adjusting your search or filters</p>
            </motion.div>
          ) : (
            <motion.div
              layout
              className={viewMode === 'grid'
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
                : "flex flex-col gap-4 sm:gap-6"
              }
            >
              <AnimatePresence mode="popLayout">
                {content.map((item) => (
                  <motion.div
                    key={item._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`group bg-white rounded-[2rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 flex ${viewMode === 'grid' ? 'flex-col h-full' : 'flex-row items-center p-6 gap-6'} border border-purple-50`}
                  >
                    {/* Thumbnail/Icon Area - matching Resources */}
                    <div 
                      className={`relative overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50 cursor-pointer ${viewMode === 'grid' ? 'aspect-video' : 'w-48 h-32 rounded-2xl shrink-0'}`}
                      onClick={() => handleOpenDetail(item)}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-2xl bg-white/95 backdrop-blur-sm flex items-center justify-center text-primary shadow-xl">
                          {getContentIcon(item.contentType)}
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="w-16 h-16 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center text-primary transform scale-90 group-hover:scale-100 transition-transform duration-300 shadow-xl">
                          <Eye size={28} />
                        </div>
                      </div>
                      {item.contentType && (
                        <div className="absolute top-4 left-4">
                          <span className="px-4 py-2 bg-white/95 backdrop-blur-md rounded-full text-xs font-bold text-primary uppercase tracking-wide shadow-lg">
                            {item.contentType === 'qa' ? 'Q&A' : item.contentType}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content Area - matching Resources */}
                    <div className={`p-6 flex flex-col grow ${viewMode === 'list' && 'py-2'}`}>
                      <h3 
                        className={`${viewMode === 'grid' ? 'text-xl' : 'text-2xl'} font-bold text-primary mb-3 line-clamp-2 leading-tight group-hover:text-secondary transition-colors cursor-pointer`}
                        onClick={() => handleOpenDetail(item)}
                      >
                        {item.title}
                      </h3>
                      {viewMode === 'grid' && (
                        <p className="text-gray-600 text-sm line-clamp-3 mb-6 leading-relaxed">
                          {item.description}
                        </p>
                      )}

                      <div className="mt-auto flex items-center justify-between pt-4 border-t border-purple-50">
                        <div className="flex items-center gap-5">
                          {isAuthenticated && (
                            <button
                              onClick={(e) => handleLike(item._id, e)}
                              className={`flex items-center gap-2 transition-colors touch-manipulation p-2 -m-2 font-medium ${item.hasLiked ? 'text-rose-500' : 'text-gray-500 hover:text-rose-500'}`}
                            >
                              <Heart size={18} className={item.hasLiked ? 'fill-rose-500' : ''} />
                              <span className="text-sm">{item.likesCount || 0}</span>
                            </button>
                          )}
                          {item.estimatedReadTime && (
                            <div className="flex items-center gap-2 text-gray-500">
                              <Clock size={16} />
                              <span className="text-sm font-medium">{item.estimatedReadTime}m</span>
                            </div>
                          )}
                        </div>
                        
                        {/* READ button - matching Resources */}
                        <div 
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDetail(item);
                          }}
                          className="flex items-center gap-2 text-xs font-bold text-white bg-primary px-5 py-2.5 rounded-xl hover:bg-secondary transition-all tracking-wide uppercase cursor-pointer touch-manipulation select-none relative z-10 shadow-lg shadow-primary/20"
                          style={{ 
                            WebkitTapHighlightColor: 'rgba(63, 41, 101, 0.1)',
                            minHeight: '44px',
                            minWidth: '44px'
                          }}
                        >
                          READ
                          <ArrowRight size={16} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Pagination - Responsive */}
          {totalPages > 1 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-8 sm:mt-12 flex justify-center pb-4 sm:pb-8"
            >
              <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-white rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl p-1.5 sm:p-2 border border-purple-50">
                {[...Array(totalPages)].map((_, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => fetchContent(i + 1)}
                    className={`min-w-[36px] sm:min-w-[44px] h-9 sm:h-11 px-3 sm:px-5 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-all ${
                      currentPage === i + 1
                        ? 'bg-primary text-white shadow-lg sm:shadow-xl shadow-primary/20'
                        : 'text-gray-600 hover:bg-purple-50'
                    }`}
                  >
                    {i + 1}
                  </motion.button>
                ))}
              </div>
            </motion.div>
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
