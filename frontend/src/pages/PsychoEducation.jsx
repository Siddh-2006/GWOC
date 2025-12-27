import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Heart, Eye, Search, Filter, MessageCircle, Lightbulb, Quote, FileText, CheckCircle, ThumbsUp, Clock, Tag, Star, Plus } from 'lucide-react';
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
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
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

  const difficulties = [
    { value: 'all', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  const fetchContent = async (resetPage = false) => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm,
        contentType: selectedType !== 'all' ? selectedType : undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        difficulty: selectedDifficulty !== 'all' ? selectedDifficulty : undefined,
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
  }, [searchTerm, selectedType, selectedCategory, selectedDifficulty]);

  const handleLike = async (contentId) => {
    try {
      await psychoEducationApi.likeContent(contentId);
      setContent(prev => prev.map(item => 
        item._id === contentId 
          ? { ...item, likes: item.likes + 1 }
          : item
      ));
    } catch (err) {
      console.error('Like content error:', err);
    }
  };

  const handleMarkHelpful = async (contentId) => {
    try {
      await psychoEducationApi.markHelpful(contentId);
      setContent(prev => prev.map(item => 
        item._id === contentId 
          ? { ...item, helpful: item.helpful + 1 }
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

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-600';
      case 'intermediate': return 'bg-yellow-100 text-yellow-600';
      case 'advanced': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
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
    <div className="min-h-screen bg-bg py-20">
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
                Psycho-Education Hub
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Learn about mental health through evidence-based content, practical tips, and expert insights.
              </p>
            </div>
            {isAdmin && (
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary flex items-center gap-2 ml-4"
              >
                <Plus size={20} />
                Add Content
              </button>
            )}
          </div>
        </motion.div>

        {/* Content Type Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap justify-center gap-2 mb-8"
        >
          {contentTypes.map(type => {
            const IconComponent = type.icon;
            return (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedType === type.value
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-purple-50 hover:text-primary'
                }`}
              >
                <IconComponent size={16} />
                {type.label}
              </button>
            );
          })}
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-sm mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search topics, questions, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-4 items-center">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>{category.label}</option>
                ))}
              </select>

              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {difficulties.map(difficulty => (
                  <option key={difficulty.value} value={difficulty.value}>{difficulty.label}</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-8">
            {error}
          </div>
        )}

        {/* Content Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {content.map((item, index) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all group cursor-pointer"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-primary">
                    {getContentIcon(item.contentType)}
                  </div>
                  <span className="text-sm font-medium text-purple-600 capitalize">
                    {item.contentType === 'qa' ? 'Q&A' : item.contentType}
                  </span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(item.difficulty)}`}>
                  {item.difficulty}
                </span>
              </div>

              {/* Title */}
              <h3 className="font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                {item.title}
              </h3>

              {/* Content Preview */}
              <div className="mb-4">
                {renderContentPreview(item)}
              </div>

              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {item.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded flex items-center gap-1">
                      <Tag size={10} />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Meta Info */}
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Eye size={14} />
                    {item.views}
                  </span>
                  {item.estimatedReadTime && (
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {item.estimatedReadTime} min
                    </span>
                  )}
                </div>
                <span className="capitalize text-purple-600 font-medium">
                  {item.category}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(item._id);
                    }}
                    className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <Heart size={16} />
                    <span className="text-sm">{item.likes}</span>
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkHelpful(item._id);
                    }}
                    className="flex items-center gap-1 text-gray-500 hover:text-green-500 transition-colors"
                  >
                    <ThumbsUp size={16} />
                    <span className="text-sm">{item.helpful}</span>
                  </button>
                </div>

                <button className="text-primary hover:text-secondary transition-colors font-medium text-sm">
                  Read More →
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {!loading && content.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No content found</h3>
            <p className="text-gray-500">Try adjusting your search or filters to find what you're looking for.</p>
          </div>
        )}

        {/* Load More */}
        {hasMore && !loading && content.length > 0 && (
          <div className="text-center mt-8">
            <button
              onClick={loadMore}
              className="btn-primary px-8 py-3"
            >
              Load More Content
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading content...</p>
          </div>
        )}
      </div>

      {/* Add Content Modal */}
      <AddPsychoEducationModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onContentAdded={handleContentAdded}
      />
    </div>
  );
};

export default PsychoEducation;