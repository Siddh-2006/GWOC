import { motion } from 'framer-motion';
import { Heart, Play, MessageSquare, Share2 } from 'lucide-react';

const MediaCard = ({ 
  media, 
  onLike, 
  onUnlike, 
  onClick,
  showLikeButton = true,
  className = ""
}) => {
  const handleLikeClick = (e) => {
    e.stopPropagation();
    if (onLike) {
      onLike(media._id);
    }
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick(media);
    }
  };

  return (
    <motion.div 
      whileHover={{ scale: 1.05 }}
      className={`group bg-white border border-gray-200 hover:border-purple-200 hover:shadow-lg rounded-2xl overflow-hidden transition-all cursor-pointer ${className}`}
      onClick={handleCardClick}
    >
      <div className="relative">
        {media.thumbnailUrl ? (
          <img 
            src={media.thumbnailUrl} 
            alt={media.title}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
            <div className="text-4xl">
              {media.type === 'video' ? '🎥' : 
               media.type === 'audio' ? '🎵' : 
               media.type === 'post' ? '📝' : '📄'}
            </div>
          </div>
        )}
        
        {/* Like Button */}
        {showLikeButton && (
          <div className="absolute top-3 right-3">
            <motion.button 
              onClick={handleLikeClick}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`p-2 rounded-full transition-colors ${
                media.hasLiked 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-white hover:bg-gray-100 text-gray-600 hover:text-red-500'
              }`}
            >
              <Heart size={16} className={media.hasLiked ? 'fill-current' : ''} />
            </motion.button>
          </div>
        )}
        
        {/* Play Button for Videos */}
        {media.type === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black bg-opacity-50 text-white p-3 rounded-full">
              <Play size={24} />
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h4 className="font-semibold text-gray-800 mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {media.title}
        </h4>
        
        {media.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {media.description}
          </p>
        )}
        
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span className="capitalize bg-purple-50 text-purple-700 px-2 py-1 rounded-full">
            {media.type}
          </span>
          <span>
            {media.publishedAt 
              ? new Date(media.publishedAt).toLocaleDateString()
              : new Date(media.createdAt).toLocaleDateString()
            }
          </span>
        </div>
        
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Heart size={12} /> {media.likesCount || media.likes?.length || 0}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare size={12} /> {media.comments?.length || 0}
          </span>
          <span className="flex items-center gap-1">
            <Share2 size={12} /> {media.shares || 0}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default MediaCard;