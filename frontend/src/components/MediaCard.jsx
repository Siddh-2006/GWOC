import { motion } from 'framer-motion';
import { Heart, Play, MessageSquare, Share2, X, Loader2 } from 'lucide-react';
import { useState } from 'react';

const MediaCard = ({
  media,
  onLike,
  onUnlike,
  onClick,
  showLikeButton = true,
  showRemoveButton = false,
  isLiked = false,
  compact = false,
  className = ""
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleLikeClick = async (e) => {
    e.stopPropagation();
    if (isProcessing || !onLike) return;

    setIsProcessing(true);
    try {
      await onLike(media._id);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveClick = async (e) => {
    e.stopPropagation();
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      if (onUnlike) {
        await onUnlike(media._id);
      } else if (onLike) {
        await onLike(media._id);
      }
    } catch (error) {
      console.error('Error in handleRemoveClick:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick(media);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`group ${compact ? 'glass-premium' : 'bg-white shadow-md'} rounded-lg border border-gray-200 hover:shadow-lg overflow-hidden transition-all cursor-pointer flex flex-col h-full ${className}`}
      onClick={handleCardClick}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {media.thumbnailUrl ? (
          <img
            src={media.thumbnailUrl}
            alt={media.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#2a1745] to-[#3F2965] flex items-center justify-center p-6 text-center relative overflow-hidden">
            {/* Abstract Decorative Circles */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12" />

            <div className="relative z-10 text-white/90">
              <div className="mb-2 opacity-80">
                {media.type === 'video' ? <Play size={32} className="mx-auto" /> :
                  media.type === 'audio' ? <MessageSquare size={32} className="mx-auto" /> :
                    media.type === 'post' ? <FileText size={32} className="mx-auto" /> : <Loader2 size={32} className="mx-auto" />}
              </div>
              <span className="font-serif italic text-lg opacity-80">MindSettler Resource</span>
            </div>
          </div>
        )}

        {/* Gradient Overlay for Text Visibility (if needed) but we are putting text below. 
            However, slight gradient at top for buttons visibility if image is light */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent opacity-60" />

        {/* Type Badge - Top Left */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-[#2a1745] text-xs font-bold uppercase tracking-wider rounded-md border border-white/50 shadow-sm">
            {media.type}
          </span>
        </div>

        {/* Like/Remove Button - Top Right */}
        {(showLikeButton || showRemoveButton) && (
          <div className="absolute top-3 right-3 z-10">
            {showRemoveButton ? (
              <motion.button
                onClick={handleRemoveClick}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                disabled={isProcessing}
                className="p-2.5 bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-md hover:bg-red-500 hover:border-red-500 transition-all shadow-lg"
                title="Remove from liked"
              >
                {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
              </motion.button>
            ) : (
              <motion.button
                onClick={handleLikeClick}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                disabled={isProcessing}
                className={`p-2.5 backdrop-blur-md border rounded-md transition-all shadow-lg ${isLiked || media.hasLiked
                  ? 'bg-red-500 border-red-500 text-white'
                  : 'bg-white/20 border-white/30 text-white hover:bg-white/40'
                  }`}
              >
                {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Heart size={16} className={isLiked || media.hasLiked ? 'fill-current' : ''} />}
              </motion.button>
            )}
          </div>
        )}

        {/* Play Button Overlay for Videos */}
        {media.type === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-white/30 backdrop-blur-md border border-white/50 text-white p-4 rounded-md shadow-2xl transform scale-75 group-hover:scale-100 transition-transform">
              <Play size={28} fill="currentColor" />
            </div>
          </div>
        )}
      </div>

      <div className={`${compact ? 'p-4' : 'p-6'} flex flex-col flex-grow`}>
        <div className="flex-grow">
          <h4 className={`font-serif ${compact ? 'text-sm font-bold mb-2' : 'text-xl font-bold mb-3'} text-gray-900 group-hover:text-[#Dd1764] transition-colors leading-tight line-clamp-2`}>
            {media.title}
          </h4>

          {media.description && (
            <p className={`${compact ? 'text-[10px]' : 'text-sm'} text-gray-500 mb-4 line-clamp-2 leading-relaxed font-sans`}>
              {media.description}
            </p>
          )}
        </div>

        <div className={`pt-3 border-t border-gray-100 flex items-center justify-between ${compact ? 'mt-2' : 'mt-auto'}`}>
          <span className={`${compact ? 'text-[8px]' : 'text-xs'} font-semibold text-gray-400 uppercase tracking-wider`}>
            {media.publishedAt
              ? new Date(media.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : 'Recently Added'
            }
          </span>

          <div className={`flex items-center gap-3 text-gray-400 ${compact ? 'text-[9px]' : ''}`}>
            {media.likesCount > 0 && (
              <span className="flex items-center gap-1 font-medium">
                <Heart size={compact ? 10 : 12} /> {media.likesCount}
              </span>
            )}
            <span className={`flex items-center gap-1 font-medium group-hover:text-[#2a1745] transition-colors ${compact ? 'text-[9px]' : 'text-xs'}`}>
              Explore <Share2 size={compact ? 10 : 12} className="rotate-[-45deg]" />
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MediaCard;