import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Heart, Eye, Search, Filter, MessageCircle, Lightbulb, Quote, FileText, CheckCircle, ThumbsUp, Clock, Tag, Star, Plus, ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { psychoEducationApi } from '../services/psychoEducation.api';
import useAuthStore from '../store/useAuthStore';
import AddPsychoEducationModal from '../components/admin/AddPsychoEducationModal';

const PsychoEducation = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const contentTypes = [
    { value: 'all', label: 'All Types', icon: BookOpen },
    { value: 'qa', label: 'Q&A', icon: MessageCircle },
    { value: 'theory', label: 'Theory', icon: FileText },
    { value: 'quote', label: 'Quotes', icon: Quote },
    { value: 'article', label: 'Articles', icon: FileText },
    { value: 'tip', label: 'Tips', icon: Lightbulb },
    { value: 'exercise', label: 'Exercises', icon: CheckCircle }
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

  const fetchContent = async (resetPage = false) => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm,
        contentType: selectedType !== 'all' ? selectedType : undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        page: resetPage ? 1 : page,
        limit: 12
      };

      const response = await psychoEducationApi.getPublishedContent(params);

      if (resetPage) {
        setContent(response.data);
        setPage(1);
      } else {
        setContent(prev => [...prev, ...response.data]);
      }

      setHasMore(response.pagination.page < response.pagination.pages);
    } catch (err) {
      setError('Failed to load content');
      console.error('Fetch content error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent(true);
  }, [searchTerm, selectedType, selectedCategory]);

  const handleLike = async (contentId) => {
    try {
      const response = await psychoEducationApi.likeContent(contentId);
      setContent(prev => prev.map(item =>
        item._id === contentId
          ? { ...item, likes: response.data.likes, hasLiked: response.data.hasLiked }
          : item
      ));
    } catch (err) {
      console.error('Like content error:', err);
    }
  };

  const handleMarkHelpful = async (contentId) => {
    try {
      const response = await psychoEducationApi.markHelpful(contentId);
      setContent(prev => prev.map(item =>
        item._id === contentId
          ? { ...item, helpful: response.data.helpful, hasMarkedHelpful: response.data.hasMarkedHelpful }
          : item
      ));
    } catch (err) {
      console.error('Mark helpful error:', err);
    }
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
    fetchContent();
  };

  const handleContentAdded = (newContent) => {
    setContent(prev => [newContent, ...prev]);
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
            <p className="font-medium text-gray-800">Q: {item.content.question}</p>
            <p className="text-gray-600 line-clamp-3">A: {item.content.answer}</p>
          </div>
        );
      case 'quote':
        return (
          <div className="space-y-2">
            <blockquote className="text-lg italic text-gray-700 border-l-4 border-purple-300 pl-4">
              "{item.content.quote}"
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
            <p className="text-gray-600 line-clamp-2">{item.description}</p>
            {item.content.steps && item.content.steps.length > 0 && (
              <p className="text-sm text-purple-600 font-medium">
                {item.content.steps.length} steps included
              </p>
            )}
          </div>
        );
      default:
        return (
          <p className="text-gray-600 line-clamp-3">{item.description}</p>
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
        {loading && <div className="text-center py-20 text-gray-400 font-medium">Loading content library...</div>}
        {error && <div className="text-center py-20 text-red-400 font-medium">{error}</div>}
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
                  <button
                    className="flex items-center gap-1.5 text-gray-400 hover:text-red-400 transition-colors"
                    onClick={(e) => { e.stopPropagation(); handleLike(item._id); }}
                  >
                    <Heart size={18} className={item.hasLiked ? "fill-red-400 text-red-400" : ""} />
                    <span className="text-sm font-bold">{Array.isArray(item.likes) ? item.likes.length : item.likes}</span>
                  </button>
                  <button
                    className="flex items-center gap-1.5 text-gray-400 hover:text-green-500 transition-colors"
                    onClick={(e) => { e.stopPropagation(); handleMarkHelpful(item._id); }}
                  >
                    <ThumbsUp size={18} className={item.hasMarkedHelpful ? "fill-green-500 text-green-500" : ""} />
                    <span className="text-sm font-bold">{Array.isArray(item.helpful) ? item.helpful.length : item.helpful}</span>
                  </button>
                </div>
                <Link
                  to={`/psycho-education/read/${item._id}`}
                  className="text-secondary font-bold text-sm flex items-center gap-2 group/btn"
                >
                  Read Depth <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                </Link>
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

      </div>
    </div>
  );
};

export default PsychoEducation;
