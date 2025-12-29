import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ImageWithFallback = ({ 
  src, 
  fallbackSrc, 
  alt, 
  className = "", 
  fallbackIcon = "📝",
  onLoad,
  onError,
  ...props 
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
    onLoad && onLoad();
  };

  const handleImageError = (e) => {
    console.log('❌ Image failed to load:', src);
    setImageError(true);
    onError && onError(e);
  };

  if (imageError || !src) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-primary/10 to-purple-100 ${className}`}>
        <motion.div 
          className="text-primary text-4xl"
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
          {fallbackIcon}
        </motion.div>
      </div>
    );
  }

  return (
    <>
      {!imageLoaded && (
        <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${imageLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        {...props}
      />
    </>
  );
};

export default ImageWithFallback;