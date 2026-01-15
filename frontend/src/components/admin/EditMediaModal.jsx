import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Loader2, Save, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import { mediaApi } from '../../services/media.api';
import { uploadApi } from '../../services/upload.api';

const EditMediaModal = ({ isOpen, onClose, media, onMediaUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    category: 'resource',
    fileUrl: '',
    thumbnailUrl: '',
    assets: []
  });

  useEffect(() => {
    if (media) {
      setFormData({
        title: media.title || '',
        description: media.description || '',
        tags: Array.isArray(media.tags) ? media.tags.join(', ') : '',
        category: media.category || 'resource',
        fileUrl: media.fileUrl || '',
        thumbnailUrl: media.thumbnailUrl || '',
        assets: media.assets || []
      });
    }
  }, [media]);

  const categories = [
    { value: 'resource', label: 'Resource' },
    { value: 'mental-health', label: 'Mental Health' },
    { value: 'general', label: 'General' }
  ];

  // File upload handler
  const handleFileUpload = async (e, field, assetIndex = null) => {
    const file = e.target.files[0];
    if (!file) {
      console.log('No file selected');
      return;
    }

    console.log('File selected:', file.name, 'Size:', file.size, 'Type:', file.type);

    if (file.size > 100 * 1024 * 1024) {
      setError('File size should be less than 100MB');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      
      console.log('Uploading file to:', field, 'Asset index:', assetIndex);
      const res = await uploadApi.uploadFile(file, 'resources');
      console.log('Upload response:', res);

      if (res.success) {
        if (field === 'asset' && assetIndex !== null) {
          const newAssets = [...formData.assets];
          newAssets[assetIndex] = { ...newAssets[assetIndex], fileUrl: res.data.url };
          setFormData({ ...formData, assets: newAssets });
        } else {
          setFormData({ ...formData, [field]: res.data.url });
        }
      } else {
        setError('Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || 'Error uploading file');
    } finally {
      setUploading(false);
      // Reset the input so the same file can be selected again
      e.target.value = '';
    }
  };

  // Add new asset for posts
  const addAsset = () => {
    if (formData.assets.length < 10) {
      setFormData({
        ...formData,
        assets: [...formData.assets, { fileUrl: '', assetType: 'image', mimeType: 'image/jpeg' }]
      });
    }
  };

  // Remove asset
  const removeAsset = (index) => {
    const newAssets = formData.assets.filter((_, i) => i !== index);
    setFormData({ ...formData, assets: newAssets });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const updates = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
      };

      // Add file URLs if they exist
      if (formData.fileUrl) {
        updates.fileUrl = formData.fileUrl;
      }
      if (formData.thumbnailUrl) {
        updates.thumbnailUrl = formData.thumbnailUrl;
      }
      if (formData.assets && formData.assets.length > 0) {
        updates.assets = formData.assets;
      }

      const response = await mediaApi.updateMedia(media._id, updates);
      
      if (response.success) {
        onMediaUpdated(response.data);
      } else {
        setError(response.message || 'Failed to update media');
      }
    } catch (err) {
      console.error('Update error:', err);
      setError(err.response?.data?.message || 'Failed to update media');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-linear-to-r from-blue-50 to-purple-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Edit Media</h2>
            <p className="text-sm text-gray-500 mt-1">Update media information</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/50 rounded-full transition-colors"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm">
              {error}
            </div>
          )}

          {uploading && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-2xl text-blue-600 text-sm flex items-center gap-2">
              <Loader2 className="animate-spin" size={16} />
              Uploading file...
            </div>
          )}

          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                placeholder="Enter media title"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                placeholder="Enter media description"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                placeholder="e.g. mindfulness, meditation, wellness"
              />
            </div>

            {/* Media Type Info */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-sm font-bold text-gray-700 mb-1">Media Type: {media?.type || 'N/A'}</p>
              <p className="text-xs text-gray-500">You can update the files below</p>
            </div>

            {/* File Upload Section - For Videos/Vlogs/Audio */}
            {media?.type && ['video', 'vlog', 'audio'].includes(media.type) && (
              <>
                {/* Main File */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    {media.type === 'audio' ? 'Audio File' : 'Video File'}
                  </label>
                  <div className="space-y-3">
                    {formData.fileUrl && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
                        <p className="text-xs text-green-700 font-medium truncate">
                          Current: {formData.fileUrl}
                        </p>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        accept={media.type === 'audio' ? 'audio/*' : 'video/*'}
                        onChange={(e) => handleFileUpload(e, 'fileUrl')}
                        className="hidden"
                        id="fileUrl-upload"
                        disabled={uploading}
                      />
                      <label
                        htmlFor="fileUrl-upload"
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary hover:bg-primary/5 transition-all cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <Upload size={20} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-600">
                          {uploading ? 'Uploading...' : 'Upload New File'}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Thumbnail */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Thumbnail Image
                  </label>
                  <div className="space-y-3">
                    {formData.thumbnailUrl && (
                      <div className="relative w-full h-40 rounded-xl overflow-hidden border border-gray-200">
                        <img
                          src={formData.thumbnailUrl}
                          alt="Thumbnail"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'thumbnailUrl')}
                        className="hidden"
                        id="thumbnail-upload"
                        disabled={uploading}
                      />
                      <label
                        htmlFor="thumbnail-upload"
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary hover:bg-primary/5 transition-all cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <ImageIcon size={20} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-600">
                          {uploading ? 'Uploading...' : 'Upload New Thumbnail'}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Assets Section - For Posts */}
            {media?.type === 'post' && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-bold text-gray-700">
                    Post Images ({formData.assets.length}/10)
                  </label>
                  {formData.assets.length < 10 && (
                    <button
                      type="button"
                      onClick={addAsset}
                      className="text-sm font-bold text-primary hover:text-primary/80 flex items-center gap-1"
                    >
                      <Upload size={16} />
                      Add Image
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  {formData.assets.map((asset, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-700">Image {index + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeAsset(index)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      {asset.fileUrl && (
                        <div className="relative w-full h-32 rounded-lg overflow-hidden border border-gray-200">
                          <img
                            src={asset.fileUrl}
                            alt={`Asset ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'asset', index)}
                          className="hidden"
                          id={`asset-${index}-upload`}
                          disabled={uploading}
                        />
                        <label
                          htmlFor={`asset-${index}-upload`}
                          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-all cursor-pointer text-sm ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <Upload size={16} className="text-gray-400" />
                          <span className="font-medium text-gray-600">
                            {asset.fileUrl ? 'Replace' : 'Upload'} Image
                          </span>
                        </label>
                      </div>
                    </div>
                  ))}
                  {formData.assets.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
                      <ImageIcon size={32} className="mx-auto text-gray-300 mb-2" />
                      <p className="text-sm text-gray-500">No images yet. Click "Add Image" to upload.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pt-6 mt-6 border-t border-gray-100 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-6 rounded-2xl font-bold text-gray-600 hover:bg-gray-100 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="flex-1 py-3 px-6 rounded-2xl font-bold text-white bg-primary hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Updating...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Update Media
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EditMediaModal;
