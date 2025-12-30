import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, MessageCircle, Share, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import ImageWithFallback from './ImageWithFallback';

const PostViewer = ({ post, isOpen, onClose, onLike, onComment, onShare }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [comment, setComment] = useState('');

  if (!isOpen || !post) return null;

  const images = post.assets || [];
  const hasMultipleImages = images.length > 1;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (comment.trim() && onComment) {
      onComment(post._id, comment.trim());
      setComment('');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">MS</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">MindSettler</h4>
                <p className="text-sm text-gray-500">Mental Health • Wellness</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex flex-col lg:flex-row max-h-[calc(90vh-80px)]">
            {/* Image Section */}
            <div className="flex-1 relative bg-black">
              {images.length > 0 ? (
                <>
                  <div className="relative aspect-square bg-gray-100 flex items-center justify-center">
                    <ImageWithFallback
                      src={images[currentImageIndex]?.fileUrl}
                      alt={`${post.title} - Image ${currentImageIndex + 1}`}
                      className="w-full h-full object-contain"
                      fallbackIcon="📝"
                    />

                    {/* Image Navigation */}
                    {hasMultipleImages && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                        >
                          <ChevronLeft size={20} />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                        >
                          <ChevronRight size={20} />
                        </button>

                        {/* Image Indicators */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                          {images.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`w-2 h-2 rounded-full transition-colors ${
                                index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                              }`}
                            />
                          ))}
                        </div>

                        {/* Image Counter */}
                        <div className="absolute top-4 right-4 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
                          {currentImageIndex + 1} / {images.length}
                        </div>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <div className="aspect-square bg-gradient-to-br from-primary/10 to-purple-100 flex items-center justify-center">
                  <motion.div 
                    className="text-primary text-6xl"
                    animate={{ 
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  >
                    📝
                  </motion.div>
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="w-full lg:w-96 border-l bg-white flex flex-col">
              <div className="flex-1 overflow-y-auto p-6">
                {/* Post Actions */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <motion.button
                      onClick={() => onLike && onLike(post._id)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className={`transition-colors ${
                        post.hasLiked 
                          ? 'text-red-500' 
                          : 'text-gray-700 hover:text-red-500'
                      }`}
                    >
                      <Heart size={28} className={post.hasLiked ? "fill-red-500 text-red-500" : "text-gray-700"} />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="text-gray-700 hover:text-blue-500 transition-colors"
                    >
                      <MessageCircle size={28} />
                    </motion.button>

                    <motion.button
                      onClick={() => onShare && onShare(post._id)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="text-gray-700 hover:text-green-500 transition-colors"
                    >
                      <Share size={28} />
                    </motion.button>
                  </div>

                  <div className="flex items-center gap-2 text-gray-500">
                    <Eye size={18} />
                    <span className="font-medium">{post.views || 0}</span>
                  </div>
                </div>

                {/* Likes Count */}
                <div className="mb-4">
                  <p className="font-semibold text-gray-800">
                    {Array.isArray(post.likes) ? post.likes.length : post.likes || 0} likes
                  </p>
                </div>

                {/* Post Title & Description */}
                <div className="mb-4">
                  <h3 className="font-bold text-lg text-gray-800 mb-2">{post.title}</h3>
                  <p className="text-gray-800 leading-relaxed">
                    <span className="font-semibold">mindsettler</span>{" "}
                    <span>{post.description}</span>
                  </p>
                </div>

                {/* Hashtags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag, index) => (
                        <span
                          key={tag}
                          className="text-primary font-medium hover:text-primary/80 cursor-pointer"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Comments Section */}
                <div className="mb-4">
                  {post.comments && post.comments.length > 0 && (
                    <div className="space-y-3 mb-4">
                      <h4 className="font-semibold text-gray-800">Comments</h4>
                      {post.comments.map((comment, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-xl">
                          <p className="text-sm text-gray-800">{comment.content}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Timestamp */}
                <div className="text-xs text-gray-400 uppercase tracking-wide">
                  {new Date(post.createdAt).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
              </div>

              {/* Add Comment */}
              <div className="p-4 border-t border-gray-100">
                <form onSubmit={handleCommentSubmit} className="flex gap-3">
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!comment.trim()}
                    className="px-6 py-2 bg-primary text-white rounded-full hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    Post
                  </button>
                </form>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PostViewer;