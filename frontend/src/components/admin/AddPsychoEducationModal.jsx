import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, BookOpen, Loader2, Plus, MessageCircle, FileText, Quote, Lightbulb, CheckCircle } from 'lucide-react';
import { psychoEducationApi } from '../../services/psychoEducation.api';
import { uploadApi } from '../../services/upload.api';

const AddPsychoEducationModal = ({ isOpen, onClose, onContentAdded }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    contentType: 'qa',
    category: 'general',
    tags: '',
    imageUrl: '', // Cover image
    content: {
      question: '',
      answer: '',
      body: '',
      quote: '',
      author: '',
      steps: []
    }
  });

  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragging(true);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      // Create a fake event object
      await handleFileUpload({ target: { files: [file] } });
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit for cover images
      setError('Image size should be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      // Use generic upload route
      const res = await uploadApi.uploadFile(file, 'resources');

      setFormData(prev => ({ ...prev, imageUrl: res.data.url }));
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const contentTypes = [
    { value: 'qa', label: 'Q&A', icon: MessageCircle },
    { value: 'theory', label: 'Theory', icon: FileText },
    { value: 'quote', label: 'Quote', icon: Quote },
    { value: 'article', label: 'Article', icon: FileText },
    { value: 'tip', label: 'Tip', icon: Lightbulb },
    { value: 'exercise', label: 'Exercise', icon: CheckCircle },
    { value: 'life-area', label: 'Life Area', icon: BookOpen }
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
        isPublished: true,
        publishedAt: new Date()
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
          imageUrl: '',
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
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

          {/* Cover Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cover Image (Optional)
            </label>
            <div
              className={`relative border-2 border-dashed rounded-xl p-4 transition-colors text-center cursor-pointer ${isDragging
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-purple-300'
                }`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => document.getElementById('cover-upload').click()}
            >
              <input
                type="file"
                id="cover-upload"
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
              />

              {formData.imageUrl ? (
                <div className="relative h-48 w-full rounded-lg overflow-hidden group">
                  <img
                    src={formData.imageUrl}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white font-medium flex items-center gap-2">
                      <Upload size={20} /> Change Image
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-8 flex flex-col items-center gap-3 text-gray-400">
                  {uploading ? (
                    <Loader2 className="animate-spin text-purple-600" size={32} />
                  ) : (
                    <>
                      <div className="p-3 bg-gray-50 rounded-full">
                        <Upload size={24} className="text-gray-400" />
                      </div>
                      <div className="text-sm">
                        <span className="font-semibold text-purple-600">Click to upload</span> or drag and drop
                      </div>
                      <p className="text-xs text-gray-400">SVG, PNG, JPG or GIF (max. 5MB)</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

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

          {/* Tags */}
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