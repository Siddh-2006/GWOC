import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Heart, Search, Filter, MessageCircle, Lightbulb, Quote, FileText, CheckCircle, Clock, Plus, ArrowLeft, ArrowRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { psychoEducationApi } from '../services/psychoEducation.api';
import useAuthStore from '../store/useAuthStore';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/ToastContainer';
import AddPsychoEducationModal from '../components/admin/AddPsychoEducationModal';

// Text formatting function to handle markdown-like syntax
const formatText = (text) => {
  if (!text) return text;
  
  // Handle different types of formatting
  const lines = text.split('\n');
  const formattedLines = lines.map((line, lineIndex) => {
    // Handle headings (### Heading)
    if (line.startsWith('### ')) {
      return (
        <h3 key={lineIndex} className="text-lg font-bold text-gray-800 mt-4 mb-2 border-b border-gray-200 pb-1">
          {line.substring(4)}
        </h3>
      );
    }
    
    if (line.startsWith('## ')) {
      return (
        <h2 key={lineIndex} className="text-xl font-bold text-gray-800 mt-5 mb-3 border-b-2 border-primary/20 pb-2">
          {line.substring(3)}
        </h2>
      );
    }
    
    // Handle bullet points (- item or * item)
    if (line.match(/^[\s]*[-*]\s+/)) {
      const content = line.replace(/^[\s]*[-*]\s+/, '');
      return (
        <div key={lineIndex} className="flex items-start gap-2 my-1">
          <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
          <span>{formatInlineText(content)}</span>
        </div>
      );
    }
    
    // Handle numbered lists (1. item)
    if (line.match(/^[\s]*\d+\.\s+/)) {
      const match = line.match(/^[\s]*(\d+)\.\s+(.+)/);
      if (match) {
        return (
          <div key={lineIndex} className="flex items-start gap-3 my-1">
            <span className="w-6 h-6 bg-primary text-white rounded-full text-xs flex items-center justify-center flex-shrink-0 font-bold">
              {match[1]}
            </span>
            <span>{formatInlineText(match[2])}</span>
          </div>
        );
      }
    }
    
    // Handle empty lines
    if (line.trim() === '') {
      return <div key={lineIndex} className="h-2"></div>;
    }
    
    // Regular paragraph
    return (
      <p key={lineIndex} className="leading-relaxed my-2">
        {formatInlineText(line)}
      </p>
    );
  });
  
  return <div className="space-y-1">{formattedLines}</div>;
};

// Helper function for inline formatting
const formatInlineText = (text) => {
  if (!text) return text;
  
  // Split text by formatting patterns
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|~~[^~]+~~)/g);
  
  return parts.map((part, index) => {
    // Bold text **text**
    if (part.startsWith('**') && part.endsWith('**')) {
      const boldText = part.slice(2, -2);
      return (
        <strong key={index} className="font-bold text-gray-800 bg-primary/10 px-1 rounded">
          {boldText}
        </strong>
      );
    }
    
    // Italic text *text*
    if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
      const italicText = part.slice(1, -1);
      return (
        <em key={index} className="italic text-primary font-medium">
          {italicText}
        </em>
      );
    }
    
    // Code text `code`
    if (part.startsWith('`') && part.endsWith('`')) {
      const codeText = part.slice(1, -1);
      return (
        <code key={index} className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-mono border">
          {codeText}
        </code>
      );
    }
    
    // Strikethrough text ~~text~~
    if (part.startsWith('~~') && part.endsWith('~~')) {
      const strikeText = part.slice(2, -2);
      return (
        <span key={index} className="line-through text-gray-500">
          {strikeText}
        </span>
      );
    }
    
    // Regular text
    return part;
  });
};

// Content Detail Modal Component
const ContentDetailModal = ({ content, isOpen, onClose, onLike, user, showError }) => {
  if (!isOpen || !content) return null;

  const renderContentBody = () => {
    switch (content.contentType) {
      case 'qa':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Question</h3>
              <div className="text-gray-700 leading-relaxed">{formatInlineText(content.content.question)}</div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Answer</h3>
              <div className="text-gray-700 leading-relaxed">
                {formatText(content.content.answer)}
              </div>
            </div>
          </div>
        );
      case 'theory':
      case 'article':
        return (
          <div className="prose prose-gray max-w-none">
            <div className="text-gray-700 leading-relaxed">
              {formatText(content.content.body)}
            </div>
          </div>
        );
      case 'quote':
        return (
          <div className="text-center py-8">
            <blockquote className="text-2xl italic text-gray-700 border-l-4 border-primary pl-6 mb-4">
              "{content.content.quote}"
            </blockquote>
            {content.content.author && (
              <p className="text-gray-500 font-medium">— {content.content.author}</p>
            )}
          </div>
        );
      case 'tip':
      case 'exercise':
        return (
          <div className="space-y-4">
            {content.content.steps && content.content.steps.map((step, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {step.order || index + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">{formatInlineText(step.title)}</h4>
                    <div className="text-gray-700 leading-relaxed">
                      {formatText(step.description)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      default:
        return <p className="text-gray-700">{content.description}</p>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  {content.contentType === 'qa' && <MessageCircle size={20} />}
                  {content.contentType === 'theory' && <FileText size={20} />}
                  {content.contentType === 'quote' && <Quote size={20} />}
                  {content.contentType === 'article' && <FileText size={20} />}
                  {content.contentType === 'tip' && <Lightbulb size={20} />}
                  {content.contentType === 'exercise' && <CheckCircle size={20} />}
                  {content.contentType === 'life-area' && <BookOpen size={20} />}
                </div>
                <span className="text-xs font-bold text-primary uppercase tracking-widest">
                  {content.contentType === 'qa' ? 'Q&A' : content.contentType === 'life-area' ? 'Life Area' : content.contentType}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{content.title}</h2>
              <p className="text-gray-600">{content.description}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {renderContentBody()}
        </div>

        {/* Tags */}
        {content.tags && content.tags.length > 0 && (
          <div className="px-6 pb-4">
            <div className="flex flex-wrap gap-2">
              {content.tags.map((tag, index) => (
                <span
                  key={index}
                  className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            {user && (
              <motion.button
                onClick={() => {
                  onLike(content._id);
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`flex items-center gap-1 transition-colors ${
                  content.hasLiked 
                    ? 'text-red-500' 
                    : 'text-gray-500 hover:text-red-500'
                }`}
              >
                <Heart 
                  size={16} 
                  className={
                    content.hasLiked 
                      ? 'fill-red-500 text-red-500' 
                      : 'text-gray-500'
                  } 
                />
                <span className="font-medium">{Array.isArray(content.likes) ? content.likes.length : content.likesCount || content.likes || 0}</span>
              </motion.button>
            )}
            {content.estimatedReadTime && (
              <div className="flex items-center gap-1">
                <Clock size={16} />
                <span>{content.estimatedReadTime} min read</span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const PsychoEducation = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { toasts, success, error: showError, removeToast } = useToast();
  const isAdmin = user?.role === 'admin';

  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent'); // New sorting state
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const contentTypes = [
    { value: 'all', label: 'All Types', icon: BookOpen },
    { value: 'qa', label: 'Q&A', icon: MessageCircle },
    { value: 'theory', label: 'Theory', icon: FileText },
    { value: 'quote', label: 'Quotes', icon: Quote },
    { value: 'article', label: 'Articles', icon: FileText },
    { value: 'tip', label: 'Tips', icon: Lightbulb },
    { value: 'exercise', label: 'Exercises', icon: CheckCircle },
    { value: 'life-area', label: 'Life Areas', icon: BookOpen }
  ];

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'anxiety', label: 'Anxiety' },
    { value: 'depression', label: 'Depression' },
    { value: 'relationships', label: 'Relationships' },
    { value: 'stress', label: 'Stress Management' },
    { value: 'self-care', label: 'Self-Care' },
    { value: 'mindfulness', label: 'Mindfulness' },
    { value: 'general', label: 'General' }
  ];

  const sortOptions = [
    { value: 'recent', label: 'Recently Added' },
    { value: 'likes', label: 'Most Liked' }
  ];

  const fetchContent = async (resetPage = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        search: searchTerm,
        contentType: selectedType !== 'all' ? selectedType : undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        sortBy: sortBy,
        page: resetPage ? 1 : page,
        limit: 9
      };

      const response = await psychoEducationApi.getPublishedContent(params);

      // Ensure proper data structure for each item
      const processedContent = (response.data || []).map(item => ({
        ...item,
        hasLiked: Boolean(item.hasLiked),
        likesCount: Number(item.likesCount || 0)
      }));

      if (resetPage) {
        setContent(processedContent);
        setPage(1);
      } else {
        setContent(prev => [...prev, ...processedContent]);
      }

      setHasMore(response.pagination && response.pagination.page < response.pagination.pages);
    } catch (err) {
      console.error('❌ Fetch content error:', err);
      setError('Failed to load content. Please try refreshing the page.');
      
      if (resetPage) {
        setContent([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Reset content and fetch fresh data when filters change
    setContent([]);
    setPage(1);
    setHasMore(true);
    
    // Add a small delay to ensure the component is fully mounted
    const timer = setTimeout(() => {
      fetchContent(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [searchTerm, selectedType, selectedCategory, sortBy]);

  const handleLike = async (contentId) => {
    if (!isAuthenticated) {
      showError('Please log in to like content');
      return;
    }

    try {
      const response = await psychoEducationApi.likeContent(contentId);
      setContent(prev => prev.map(item =>
        item._id === contentId
          ? { 
              ...item, 
              hasLiked: response.data.hasLiked,
              likes: response.data.likes,
              likesCount: response.data.likes
            }
          : item
      ));
      
      // Update selected content if it's the same
      if (selectedContent && selectedContent._id === contentId) {
        setSelectedContent(prev => ({
          ...prev,
          hasLiked: response.data.hasLiked,
          likes: response.data.likes,
          likesCount: response.data.likes
        }));
      }

      // Show success message
      if (response.data.hasLiked) {
        success('Added to your liked content!');
      } else {
        success('Removed from your liked content');
      }
    } catch (err) {
      console.error('Like content error:', err);
      if (err.response?.status === 401) {
        showError('Please log in to like content');
      } else {
        showError('Failed to like content. Please try again.');
      }
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    
    // Call fetchContent with the next page
    const fetchNextPage = async () => {
      try {
        setLoading(true);
        
        const params = {
          search: searchTerm,
          contentType: selectedType !== 'all' ? selectedType : undefined,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          sortBy: sortBy,
          page: nextPage,
          limit: 9
        };

        const response = await psychoEducationApi.getPublishedContent(params);

        // Ensure proper data structure for each item
        const processedContent = (response.data || []).map(item => ({
          ...item,
          hasLiked: Boolean(item.hasLiked),
          likesCount: Number(item.likesCount || 0)
        }));

        // Append new content to existing content
        setContent(prev => [...prev, ...processedContent]);
        setHasMore(response.pagination && response.pagination.page < response.pagination.pages);
      } catch (err) {
        console.error('❌ Load more content error:', err);
        showError('Failed to load more content. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchNextPage();
  };

  const handleContentAdded = (newContent) => {
    // Add new content to the beginning of the list if sorting by recent
    if (sortBy === 'recent') {
      setContent(prev => [newContent, ...prev]);
    } else {
      // For other sorts, refresh the content to maintain proper order
      fetchContent(true);
    }
  };

  const handleOpenDetail = (item) => {
    setSelectedContent(item);
    setShowDetailModal(true);
  };

  const handleCloseDetail = () => {
    setShowDetailModal(false);
    setSelectedContent(null);
  };

  const getContentIcon = (type) => {
    const typeConfig = contentTypes.find(t => t.value === type);
    const IconComponent = typeConfig?.icon || BookOpen;
    return <IconComponent size={20} />;
  };

  const renderContentPreview = (item) => {
    switch (item.contentType) {
      case 'qa':
        return (
          <div className="space-y-2">
            <p className="font-medium text-gray-800">Q: {formatInlineText(item.content.question)}</p>
            <div className="text-gray-600 line-clamp-3">
              A: {formatInlineText(item.content.answer.substring(0, 150) + (item.content.answer.length > 150 ? '...' : ''))}
            </div>
          </div>
        );
      case 'quote':
        return (
          <div className="space-y-2">
            <blockquote className="text-lg italic text-gray-700 border-l-4 border-purple-300 pl-4">
              "{formatInlineText(item.content.quote)}"
            </blockquote>
            {item.content.author && (
              <p className="text-sm text-gray-500">— {item.content.author}</p>
            )}
          </div>
        );
      case 'tip':
      case 'exercise':
        return (
          <div className="space-y-2">
            <div className="text-gray-600 line-clamp-2">{formatInlineText(item.description)}</div>
            {item.content.steps && item.content.steps.length > 0 && (
              <p className="text-sm text-purple-600 font-medium">
                {item.content.steps.length} steps included
              </p>
            )}
          </div>
        );
      case 'theory':
      case 'article':
        return (
          <div className="text-gray-600 line-clamp-3">
            {formatInlineText(item.content.body.substring(0, 200) + (item.content.body.length > 200 ? '...' : ''))}
          </div>
        );
      default:
        return (
          <div className="text-gray-600 line-clamp-3">{formatInlineText(item.description)}</div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-off-white py-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Navigation Back */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link to="/psycho-education" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary transition-colors font-bold">
            <ArrowLeft size={20} /> Back to Hub
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-2">Content Library</h1>
            <p className="text-gray-500 text-lg">Browse our complete collection of resources and insights.</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={20} />
              Add Content
            </button>
          )}
        </motion.div>

        {/* Search & Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-[2.5rem] p-8 shadow-sm mb-12 space-y-6 border border-purple-50"
        >
          {/* Error Display for User Actions */}
          {error && error.includes('log in') && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 flex items-center justify-between">
              <span>{error}</span>
              <Link to="/login" className="text-red-600 hover:text-red-800 font-medium underline">
                Login
              </Link>
            </div>
          )}

          {/* Top Row: Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search topics, questions, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-off-white border border-transparent rounded-[1.5rem] focus:bg-white focus:border-purple-200 transition-all focus:ring-0 text-lg"
            />
          </div>

          {/* Bottom Row: Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2 mr-4">
              <Filter size={18} className="text-gray-400" />
              <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Filter by</span>
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-6 py-2.5 bg-off-white border border-transparent rounded-full text-sm font-bold text-gray-600 focus:bg-white focus:border-purple-200 transition-all outline-none cursor-pointer"
            >
              {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-6 py-2.5 bg-off-white border border-transparent rounded-full text-sm font-bold text-gray-600 focus:bg-white focus:border-purple-200 transition-all outline-none cursor-pointer"
            >
              {sortOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>

            <div className="h-4 w-px bg-gray-200 mx-2 hidden md:block" />

            <div className="flex flex-wrap gap-2">
              {contentTypes.map(type => (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${selectedType === type.value
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'bg-off-white text-gray-500 hover:bg-purple-50 hover:text-primary'
                    }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Loading / Error / Empty States */}
        {loading && (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-400 font-medium">Loading content library...</p>
          </div>
        )}
        {error && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-500 text-2xl">⚠️</span>
            </div>
            <p className="text-red-500 font-medium mb-4">{error}</p>
            <button 
              onClick={() => fetchContent(true)}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
        {!loading && !error && content.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
              <Search size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-600 mb-2">No results found</h3>
            <p className="text-gray-400">Try adjusting your search or filters.</p>
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {content.map((item, index) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl transition-all cursor-pointer border border-transparent hover:border-purple-50 group flex flex-col"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  {getContentIcon(item.contentType)}
                </div>
                <div>
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">{item.category}</span>
                </div>
              </div>

              <h3 className="font-bold text-2xl text-primary mb-4 group-hover:text-secondary transition-colors leading-tight">{item.title}</h3>

              <div className="text-gray-500 mb-8 line-clamp-3 leading-relaxed">
                {renderContentPreview(item)}
              </div>

              <div className="mt-auto pt-6 border-t border-gray-50 flex justify-between items-center">
                <div className="flex gap-4">
                  {isAuthenticated && (
                    <motion.button
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        handleLike(item._id); 
                      }}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.8 }}
                      className={`flex items-center gap-2 transition-colors ${
                        item.hasLiked 
                          ? 'text-red-500' 
                          : 'text-gray-500 hover:text-red-500'
                      }`}
                    >
                      <Heart 
                        size={18} 
                        className={
                          item.hasLiked 
                            ? 'fill-red-500 text-red-500' 
                            : 'text-gray-500'
                        } 
                      />
                      <span className="text-sm font-medium">{Array.isArray(item.likes) ? item.likes.length : item.likesCount || item.likes || 0}</span>
                    </motion.button>
                  )}
                </div>
                <button
                  onClick={() => handleOpenDetail(item)}
                  className="text-secondary font-bold text-sm flex items-center gap-2 group/btn hover:text-secondary/80 transition-colors"
                >
                  Read More <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {hasMore && !loading && (
          <div className="text-center mt-16">
            <button onClick={loadMore} className="btn-secondary px-10 py-4 shadow-xl shadow-secondary/10">
              Load More Resources
            </button>
          </div>
        )}

        {/* Add Content Modal */}
        <AddPsychoEducationModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onContentAdded={handleContentAdded}
        />

        {/* Content Detail Modal */}
        <ContentDetailModal
          content={selectedContent}
          isOpen={showDetailModal}
          onClose={handleCloseDetail}
          onLike={handleLike}
          user={user}
          showError={showError}
        />

        {/* Toast Container */}
        <ToastContainer toasts={toasts} onRemove={removeToast} />

      </div>
    </div>
  );
};

export default PsychoEducation;
