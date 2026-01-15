import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, Loader2, Plus, Image, Video, FileText, Mic, Camera, Trash2 } from 'lucide-react';
import { mediaApi } from '../../services/media.api';
import { uploadApi } from '../../services/upload.api';

const AddMediaModal = ({ isOpen, onClose, onMediaAdded }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'post',
    category: 'resource',
    tags: '',
    // For posts
    assets: [],
    // For videos/reels
    fileUrl: '',
    thumbnailUrl: '',
    duration: '',
    fileSize: '',
    mimeType: ''
  });

  const mediaTypes = [
    { value: 'post', label: 'Post (Multiple Images)', icon: FileText },
    { value: 'video', label: 'Video', icon: Video },
    { value: 'vlog', label: 'Vlog/Reel', icon: Camera },
    { value: 'audio', label: 'Audio', icon: Mic },
    { value: 'document', label: 'Document', icon: FileText }
  ];

  const categories = [
    { value: 'resource', label: 'Resource' },
    { value: 'mental-health', label: 'Mental Health' },
    { value: 'general', label: 'General' }
  ];

  const addAsset = () => {
    if (formData.assets.length < 10) {
      setFormData({
        ...formData,
        assets: [...formData.assets, { fileUrl: '', assetType: 'image', mimeType: 'image/jpeg' }]
      });
    }
  };

  const updateAsset = (index, field, value) => {
    const newAssets = [...formData.assets];
    newAssets[index] = { ...newAssets[index], [field]: value };
    setFormData({ ...formData, assets: newAssets });
  };

  const removeAsset = (index) => {
    const newAssets = formData.assets.filter((_, i) => i !== index);
    setFormData({ ...formData, assets: newAssets });
  };

  // Generic upload handler
  const handleFileUpload = async (e, field, index = null) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) { // 100MB limit
      setError('File size should be less than 100MB');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      // Use generic search upload for all types
      const res = await uploadApi.uploadFile(file, 'resources');

      if (res.success) {
        if (field === 'asset' && index !== null) {
          updateAsset(index, 'fileUrl', res.data.url);
        } else {
          setFormData(prev => ({ ...prev, [field]: res.data.url }));
        }
      } else {
        setError('Upload failed');
      }
    } catch (err) {
      console.error(err);
      setError('Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  const [draggedField, setDraggedField] = useState(null); // 'fileUrl', 'thumbnailUrl', 'asset-INDEX'

  const handleDragEnter = (e, fieldId) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggedField(fieldId);
  };

  const handleDragLeave = (e, fieldId) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedField === fieldId) {
      setDraggedField(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
  };



  const handleDrop = async (e, field, index = null) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggedField(null);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload({ target: { files: [file] } }, field, index);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate form
      if (!formData.title || !formData.description) {
        throw new Error('Please fill in title and description');
      }

      if (formData.type === 'post') {
        if (formData.assets.length === 0) {
          throw new Error('Please add at least one image for posts');
        }
        // Check if all assets have URLs
        const emptyAssets = formData.assets.some(asset => !asset.fileUrl);
        if (emptyAssets) {
          throw new Error('Please provide URLs for all images');
        }
      } else {
        if (!formData.fileUrl) {
          throw new Error('Please provide a file URL');
        }
      }

      const mediaData = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        category: formData.category,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
        isPublished: true,
        publishedAt: new Date()
      };

      // Add type-specific fields
      if (formData.type === 'post') {
        mediaData.assets = formData.assets;
        // Set thumbnail from first asset
        mediaData.thumbnailUrl = formData.assets[0]?.fileUrl;
      } else {
        mediaData.fileUrl = formData.fileUrl;
        mediaData.thumbnailUrl = formData.thumbnailUrl;
        mediaData.mimeType = formData.mimeType;

        if (formData.duration) {
          mediaData.duration = parseInt(formData.duration);
        }
        if (formData.fileSize) {
          mediaData.fileSize = parseInt(formData.fileSize);
        }
      }

      const response = await mediaApi.createMedia(mediaData);

      if (response.success) {
        onMediaAdded(response.data);
        onClose();
        // Reset form
        setFormData({
          title: '',
          description: '',
          type: 'post',
          category: 'resource',
          tags: '',
          assets: [],
          fileUrl: '',
          thumbnailUrl: '',
          duration: '',
          fileSize: '',
          mimeType: ''
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create media');
    } finally {
      setLoading(false);
    }
  };

  const renderTypeSpecificFields = () => {
    if (formData.type === 'post') {
      return (
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Images * (Max 10)
            </label>
            <button
              type="button"
              onClick={addAsset}
              disabled={formData.assets.length >= 10}
              className="text-sm bg-primary text-white px-3 py-1 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Image
            </button>
          </div>

          {formData.assets.length === 0 && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Image size={32} className="mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">No images added yet</p>
              <button
                type="button"
                onClick={addAsset}
                className="mt-2 text-primary hover:text-primary/80 font-medium"
              >
                Add your first image
              </button>
            </div>
          )}

          {formData.assets.map((asset, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 mb-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">Image {index + 1}</span>
                <button
                  type="button"
                  onClick={() => removeAsset(index)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={asset.fileUrl}
                    onChange={(e) => updateAsset(index, 'fileUrl', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="https://..."
                    required
                  />
                  <div
                    className={`relative border border-dashed rounded-lg p-1 transition-colors ${draggedField === `asset-${index}`
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-300 hover:border-purple-400'
                      }`}
                    onDragEnter={(e) => handleDragEnter(e, `asset-${index}`)}
                    onDragLeave={(e) => handleDragLeave(e, `asset-${index}`)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, 'asset', index)}
                  >
                    <input
                      type="file"
                      id={`asset-upload-${index}`}
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'asset', index)}
                      disabled={uploading}
                      accept="image/*"
                    />
                    <label
                      htmlFor={`asset-upload-${index}`}
                      className="p-1.5 rounded-md hover:bg-gray-50 cursor-pointer flex items-center justify-center text-gray-500 hover:text-purple-600 transition-colors"
                      title="Upload or Drag & Drop"
                    >
                      {uploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                    </label>
                  </div>
                </div>
                {asset.fileUrl && (
                  <div className="mt-2">
                    <img
                      src={asset.fileUrl}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}

          <p className="text-xs text-gray-500 mt-2">
            Upload images or paste URLs. First image will be used as thumbnail.
          </p>
        </div>
      );
    } else {
      return (
        <>
          {/* File URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {formData.type === 'video' || formData.type === 'vlog' ? 'Video URL *' :
                formData.type === 'audio' ? 'Audio URL *' : 'File URL *'}
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                required
                value={formData.fileUrl}
                onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder={
                  formData.type === 'video' || formData.type === 'vlog'
                    ? "https://res.cloudinary.com/your-video.mp4"
                    : formData.type === 'audio'
                      ? "https://res.cloudinary.com/your-audio.mp3"
                      : "https://example.com/file"
                }
              />
              <div
                className={`relative border border-dashed rounded-lg p-1 transition-colors ${draggedField === 'fileUrl'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-300 hover:border-purple-400'
                  }`}
                onDragEnter={(e) => handleDragEnter(e, 'fileUrl')}
                onDragLeave={(e) => handleDragLeave(e, 'fileUrl')}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'fileUrl')}
              >
                <input
                  type="file"
                  id="main-file-upload"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 'fileUrl')}
                  disabled={uploading}
                />
                <label
                  htmlFor="main-file-upload"
                  className="p-1.5 rounded-md hover:bg-gray-50 cursor-pointer flex items-center justify-center text-gray-500 hover:text-purple-600 transition-colors"
                  title="Upload or Drag & Drop"
                >
                  {uploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                </label>
              </div>
            </div>
          </div>

          {/* Thumbnail URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thumbnail URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={formData.thumbnailUrl}
                onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="https://res.cloudinary.com/thumbnail.jpg"
              />
              <div
                className={`relative border border-dashed rounded-lg p-1 transition-colors ${draggedField === 'thumbnailUrl'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-300 hover:border-purple-400'
                  }`}
                onDragEnter={(e) => handleDragEnter(e, 'thumbnailUrl')}
                onDragLeave={(e) => handleDragLeave(e, 'thumbnailUrl')}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'thumbnailUrl')}
              >
                <input
                  type="file"
                  id="thumbnail-upload"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 'thumbnailUrl')}
                  disabled={uploading}
                  accept="image/*"
                />
                <label
                  htmlFor="thumbnail-upload"
                  className="p-1.5 rounded-md hover:bg-gray-50 cursor-pointer flex items-center justify-center text-gray-500 hover:text-purple-600 transition-colors"
                  title="Upload or Drag & Drop"
                >
                  {uploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                </label>
              </div>
            </div>
            {formData.thumbnailUrl && (
              <div className="mt-2">
                <img
                  src={formData.thumbnailUrl}
                  alt="Thumbnail preview"
                  className="w-32 h-20 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* Duration, File Size, and MIME Type */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (seconds)
              </label>
              <input
                type="number"
                min="0"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="180"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                File Size (bytes)
              </label>
              <input
                type="number"
                min="0"
                value={formData.fileSize}
                onChange={(e) => setFormData({ ...formData, fileSize: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="5242880"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                MIME Type
              </label>
              <select
                value={formData.mimeType}
                onChange={(e) => setFormData({ ...formData, mimeType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select type</option>
                {formData.type === 'video' || formData.type === 'vlog' ? (
                  <>
                    <option value="video/mp4">video/mp4</option>
                    <option value="video/webm">video/webm</option>
                    <option value="video/avi">video/avi</option>
                  </>
                ) : formData.type === 'audio' ? (
                  <>
                    <option value="audio/mp3">audio/mp3</option>
                    <option value="audio/wav">audio/wav</option>
                    <option value="audio/ogg">audio/ogg</option>
                  </>
                ) : (
                  <>
                    <option value="application/pdf">application/pdf</option>
                    <option value="application/doc">application/doc</option>
                    <option value="text/plain">text/plain</option>
                  </>
                )}
              </select>
            </div>
          </div>
        </>
      );
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
              <Upload size={24} />
              Add New Media
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
              placeholder="Enter media title"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent h-24"
              placeholder="Describe the media content"
            />
          </div>

          {/* Type and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Media Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({
                  ...formData,
                  type: e.target.value,
                  // Reset type-specific fields when changing type
                  assets: [],
                  fileUrl: '',
                  thumbnailUrl: '',
                  duration: '',
                  fileSize: '',
                  mimeType: ''
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {mediaTypes.map(type => (
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

          {/* Type-specific fields */}
          {renderTypeSpecificFields()}

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
              placeholder="mental-health, anxiety, mindfulness (comma separated)"
            />
            <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
              Create Media
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

export default AddMediaModal;