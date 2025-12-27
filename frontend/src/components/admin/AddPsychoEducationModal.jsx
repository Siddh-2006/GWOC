import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, BookOpen, Loader2, Plus, MessageCircle, FileText, Quote, Lightbulb, CheckCircle } from 'lucide-react';
import { psychoEducationApi } from '../../services/psychoEducation.api';

const AddPsychoEducationModal = ({ isOpen, onClose, onContentAdded }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    contentType: 'qa',
    category: 'general',
    tags: '',
    estimatedReadTime: '',
    content: {
      question: '',
      answer: '',
      body: '',
      quote: '',
      author: '',
      steps: []
    }
  });

  const contentTypes = [
    { value: 'qa', label: 'Q&A', icon: MessageCircle },
    { value: 'theory', label: 'Theory', icon: FileText },
    { value: 'quote', label: 'Quote', icon: Quote },
    { value: 'article', label: 'Article', icon: FileText },
    { value: 'tip', label: 'Tip', icon: Lightbulb },
    { value: 'exercise', label: 'Exercise', icon: CheckCircle }
  ];

  const categories = [
    { value: 'anxiety', label: 'Anxiety' },
    { value: 'depression', label: 'Depression' },
    { value: 'relationships', label: 'Relationships' },
    { value: 'stress', label: 'Stress Management' },
    { value: 'self-care', label: 'Self-Care' },
    { value: 'mindfulness', label: 'Mindfulness' },
    { value: 'general', label: 'General' }
  ];

  const difficulties = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate form based on content type
      if (!formData.title || !formData.description) {
        throw new Error('Please fill in title and description');
      }

      if (formData.contentType === 'qa' && (!formData.content.question || !formData.content.answer)) {
        throw new Error('Question and answer are required for Q&A content');
      }

      if ((formData.contentType === 'theory' || formData.contentType === 'article') && !formData.content.body) {
        throw new Error('Body content is required for theory/article content');
      }

      if (formData.contentType === 'quote' && !formData.content.quote) {
        throw new Error('Quote text is required for quote content');
      }

      if ((formData.contentType === 'tip' || formData.contentType === 'exercise') && formData.content.steps.length === 0) {
        throw new Error('At least one step is required for tip/exercise content');
      }

      const contentData = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
        estimatedReadTime: formData.estimatedReadTime ? parseInt(formData.estimatedReadTime) : undefined
      };

      const response = await psychoEducationApi.createContent(contentData);
      
      if (response.success) {
        onContentAdded(response.data);
        onClose();
        // Reset form
        setFormData({
          title: '',
          description: '',
          contentType: 'qa',
          category: 'general',
          tags: '',
          estimatedReadTime: '',
          content: {
            question: '',
            answer: '',
            body: '',
            quote: '',
            author: '',
            steps: []
          }
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create content');
    } finally {
      setLoading(false);
    }
  };

  const addStep = () => {
    setFormData({
      ...formData,
      content: {
        ...formData.content,
        steps: [...formData.content.steps, { title: '', description: '', order: formData.content.steps.length + 1 }]
      }
    });
  };

  const updateStep = (index, field, value) => {
    const newSteps = [...formData.content.steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setFormData({
      ...formData,
      content: { ...formData.content, steps: newSteps }
    });
  };

  const removeStep = (index) => {
    const newSteps = formData.content.steps.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      content: { ...formData.content, steps: newSteps }
    });
  };

  const renderContentFields = () => {
    switch (formData.contentType) {
      case 'qa':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question *
              </label>
              <input
                type="text"
                required
                value={formData.content.question}
                onChange={(e) => setFormData({
                  ...formData,
                  content: { ...formData.content, question: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="What question does this answer?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Answer *
              </label>
              <textarea
                required
                value={formData.content.answer}
                onChange={(e) => setFormData({
                  ...formData,
                  content: { ...formData.content, answer: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent h-32"
                placeholder="Provide a gentle, understanding answer..."
              />
            </div>
          </>
        );

      case 'theory':
      case 'article':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content Body *
            </label>
            <textarea
              required
              value={formData.content.body}
              onChange={(e) => setFormData({
                ...formData,
                content: { ...formData.content, body: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent h-40"
              placeholder="Write the main content here..."
            />
          </div>
        );

      case 'quote':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quote *
              </label>
              <textarea
                required
                value={formData.content.quote}
                onChange={(e) => setFormData({
                  ...formData,
                  content: { ...formData.content, quote: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent h-24"
                placeholder="Enter the inspirational quote..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Author
              </label>
              <input
                type="text"
                value={formData.content.author}
                onChange={(e) => setFormData({
                  ...formData,
                  content: { ...formData.content, author: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Quote author (optional)"
              />
            </div>
          </>
        );

      case 'tip':
      case 'exercise':
        return (
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Steps *
              </label>
              <button
                type="button"
                onClick={addStep}
                className="text-sm bg-primary text-white px-3 py-1 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Add Step
              </button>
            </div>
            {formData.content.steps.map((step, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 mb-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Step {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeStep(index)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={step.title}
                    onChange={(e) => updateStep(index, 'title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Step title"
                  />
                  <textarea
                    value={step.description}
                    onChange={(e) => updateStep(index, 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent h-20"
                    placeholder="Step description"
                  />
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-primary flex items-center gap-2">
              <BookOpen size={24} />
              Add Psycho-Education Content
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter content title"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent h-20"
              placeholder="Brief description of the content"
            />
          </div>

          {/* Content Type and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content Type
              </label>
              <select
                value={formData.contentType}
                onChange={(e) => setFormData({ ...formData, contentType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {contentTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>{category.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Content Fields (Dynamic based on type) */}
          {renderContentFields()}

          {/* Tags and Read Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="anxiety, mindfulness, self-care (comma separated)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Read Time (minutes)
              </label>
              <input
                type="number"
                min="1"
                value={formData.estimatedReadTime}
                onChange={(e) => setFormData({ ...formData, estimatedReadTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="5"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
              Create Content
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddPsychoEducationModal;