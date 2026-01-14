import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, Volume2, VolumeX, Maximize, Download, Heart, MessageCircle, Eye, ChevronRight, ChevronLeft, Info, ChevronDown } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const MediaPlayer = ({ media, isOpen, onClose, onLike, onComment }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [comment, setComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true); // Show sidebar by default on desktop
  const [showMobileDrawer, setShowMobileDrawer] = useState(false); // Mobile drawer state
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // For post image navigation

  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  useEffect(() => {
    if (isOpen && media) {
      // Reset state when opening new media
      setIsPlaying(false);
      setCurrentTime(0);
      setShowControls(true);
      setShowSidebar(true); // Show sidebar by default on desktop
      setShowMobileDrawer(false); // Reset mobile drawer
      setCurrentImageIndex(0); // Reset image index
    }
  }, [isOpen, media]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isOpen) return;

      // Ignore shortcuts if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (isPost && media.assets && media.assets.length > 1) {
            prevImage();
          } else {
            seekRelative(-10);
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (isPost && media.assets && media.assets.length > 1) {
            nextImage();
          } else {
            seekRelative(10);
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          adjustVolume(0.1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          adjustVolume(-0.1);
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [isOpen, isPlaying]);

  const togglePlay = () => {
    const mediaElement = videoRef.current || audioRef.current;
    if (mediaElement) {
      if (isPlaying) {
        mediaElement.pause();
      } else {
        mediaElement.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    const mediaElement = videoRef.current || audioRef.current;
    if (mediaElement) {
      mediaElement.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    const mediaElement = videoRef.current || audioRef.current;
    if (mediaElement) {
      setCurrentTime(mediaElement.currentTime);
      setDuration(mediaElement.duration || 0);
    }
  };

  const handleLoadStart = () => {
    setIsLoading(true);
    setHasError(false);
  };

  const handleCanPlay = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const handleLoadedMetadata = () => {
    const mediaElement = videoRef.current || audioRef.current;
    if (mediaElement) {
      setDuration(mediaElement.duration || 0);
      mediaElement.volume = volume;
    }
  };
  const handleSeek = (e) => {
    const mediaElement = videoRef.current || audioRef.current;
    if (mediaElement && duration) {
      const rect = e.currentTarget.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      const newTime = pos * duration;
      mediaElement.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const seekRelative = (seconds) => {
    const mediaElement = videoRef.current || audioRef.current;
    if (mediaElement && duration) {
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
      mediaElement.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const adjustVolume = (delta) => {
    const mediaElement = videoRef.current || audioRef.current;
    if (mediaElement) {
      const newVolume = Math.max(0, Math.min(1, volume + delta));
      mediaElement.volume = newVolume;
      setVolume(newVolume);
      if (newVolume === 0) {
        setIsMuted(true);
      } else if (isMuted) {
        setIsMuted(false);
      }
    }
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const handleDownload = () => {
    if (media?.fileUrl) {
      window.open(media.fileUrl, '_blank');
    }
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (comment.trim() && onComment) {
      onComment(media._id, comment.trim());
      setComment('');
    }
  };

  // Touch handlers for swipe-to-close
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isDownSwipe = distance < -50; // Swipe down threshold
    
    if (isDownSwipe) {
      setShowMobileDrawer(false);
    }
  };

  // Image navigation functions for posts
  const nextImage = () => {
    if (media.assets && media.assets.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % media.assets.length);
    }
  };

  const prevImage = () => {
    if (media.assets && media.assets.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + media.assets.length) % media.assets.length);
    }
  };

  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };

  if (!isOpen || !media) {
    return null;
  }

  const isVideo = media.type === 'video' || media.type === 'vlog';
  const isAudio = media.type === 'audio';
  const isDocument = media.type === 'document';
  const isPost = media.type === 'post' || media.type === 'image';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 backdrop-blur-md z-200 flex items-center justify-center p-0 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className={`bg-white rounded-none sm:rounded-2xl h-full sm:max-h-[95vh] lg:max-h-[90vh] overflow-hidden flex flex-col transition-all duration-300 w-full ${
            showSidebar ? 'max-w-6xl' : 'max-w-4xl'
          } mx-auto relative`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-2 sm:p-4 border-b bg-white shrink-0 z-20">
            <div className="flex-1 min-w-0">
              <h2 className="text-sm sm:text-lg lg:text-xl font-bold text-gray-800 truncate">{media.title}</h2>
              <p className="text-xs sm:text-sm text-gray-600 capitalize">{media.type}</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Desktop sidebar toggle - hidden on mobile */}
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className={`hidden lg:flex px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-all duration-200 items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium ${
                  showSidebar 
                    ? 'bg-[#3F2965] text-white shadow-md' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title={showSidebar ? 'Hide details' : 'Show details'}
              >
                <Info size={14} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">
                  {showSidebar ? 'Hide Details' : 'Show Details'}
                </span>
                <span className="sm:hidden">
                  {showSidebar ? 'Hide' : 'Info'}
                </span>
              </button>
              
              <button
                onClick={onClose}
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">
            {/* Media Content - Full screen on mobile, sidebar on desktop */}
            <div className={`flex items-center justify-center bg-black transition-all duration-300 relative ${
              showSidebar ? 'lg:w-2/3' : 'w-full'
            } w-full flex-1 lg:flex-initial`}>
              {/* Mobile info button - clean and minimal */}
              <button
                onClick={() => {
                  // Only open drawer on mobile screens
                  if (window.innerWidth < 1024) {
                    setShowMobileDrawer(true);
                  }
                }}
                className={`lg:hidden absolute bottom-6 right-6 z-10 w-14 h-14 bg-[#3F2965] hover:bg-[#3F2965]/90 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg ${
                  showMobileDrawer ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}
                title="Show details"
              >
                <Info size={20} className="text-white" />
              </button>
              {isVideo && (
                <div
                  className="relative w-full h-full flex items-center justify-center p-0"
                  onMouseMove={handleMouseMove}
                >
                  <video
                    ref={videoRef}
                    src={media.fileUrl}
                    className="w-full h-full object-contain"
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onLoadStart={handleLoadStart}
                    onCanPlay={handleCanPlay}
                    onError={handleError}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    poster={media.thumbnailUrl}
                  />

                  {/* Video Controls */}
                  <AnimatePresence>
                    {showControls && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent"
                      >
                        {/* Loading State */}
                        {isLoading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                            <div className="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full"></div>
                          </div>
                        )}

                        {/* Error State */}
                        {hasError && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                            <div className="text-center text-white">
                              <p className="text-lg mb-2">Failed to load video</p>
                              <button
                                onClick={() => window.location.reload()}
                                className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
                              >
                                Retry
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Play Button Overlay */}
                        {!isLoading && !hasError && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <button
                              onClick={togglePlay}
                              className="w-12 h-12 sm:w-16 sm:h-16 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all shadow-lg"
                            >
                              {isPlaying ? <Pause size={20} className="text-[#3F2965] sm:w-6 sm:h-6" /> : <Play size={20} className="text-[#3F2965] ml-0.5 sm:w-6 sm:h-6 sm:ml-1" />}
                            </button>
                          </div>
                        )}

                        {/* Bottom Controls */}
                        <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4">
                          {/* Progress Bar */}
                          <div
                            className="w-full h-1.5 sm:h-2 bg-white bg-opacity-30 rounded-full cursor-pointer mb-2 sm:mb-4"
                            onClick={handleSeek}
                          >
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                            />
                          </div>

                          {/* Controls */}
                          <div className="flex items-center justify-between text-white">
                            <div className="flex items-center gap-2 sm:gap-4">
                              <button onClick={togglePlay}>
                                {isPlaying ? <Pause size={16} className="sm:w-5 sm:h-5" /> : <Play size={16} className="sm:w-5 sm:h-5" />}
                              </button>
                              <button onClick={toggleMute}>
                                {isMuted ? <VolumeX size={16} className="sm:w-5 sm:h-5" /> : <Volume2 size={16} className="sm:w-5 sm:h-5" />}
                              </button>
                              <span className="text-xs sm:text-sm">
                                {formatTime(currentTime)} / {formatTime(duration)}
                              </span>
                            </div>
                            <button onClick={handleDownload}>
                              <Download size={16} className="sm:w-5 sm:h-5" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {isAudio && (
                <div className="w-full h-full flex items-center justify-center p-4 sm:p-8 bg-linear-to-br from-purple-100 to-pink-100 min-h-[300px] sm:min-h-[400px] relative">
                  <div className="w-full max-w-md">
                    <audio
                      ref={audioRef}
                      src={media.fileUrl}
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleLoadedMetadata}
                      onLoadStart={handleLoadStart}
                      onCanPlay={handleCanPlay}
                      onError={handleError}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                    />

                    <div className="text-center mb-6 sm:mb-8">
                      <div className="w-16 h-16 sm:w-24 sm:h-24 bg-primary bg-opacity-20 rounded-full flex items-center justify-center mb-3 sm:mb-4 mx-auto">
                        <Volume2 size={24} className="text-primary sm:w-8 sm:h-8" />
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800">{media.title}</h3>
                    </div>

                    {/* Audio Controls */}
                    <div className="w-full">
                      <div
                        className="w-full h-1.5 sm:h-2 bg-white bg-opacity-50 rounded-full cursor-pointer mb-3 sm:mb-4"
                        onClick={handleSeek}
                      >
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-center gap-3 sm:gap-4">
                        <button
                          onClick={togglePlay}
                          className="w-10 h-10 sm:w-12 sm:h-12 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors"
                        >
                          {isPlaying ? <Pause size={16} className="sm:w-5 sm:h-5" /> : <Play size={16} className="ml-0.5 sm:w-5 sm:h-5" />}
                        </button>
                        <button onClick={toggleMute} className="text-gray-600 hover:text-primary">
                          {isMuted ? <VolumeX size={16} className="sm:w-5 sm:h-5" /> : <Volume2 size={16} className="sm:w-5 sm:h-5" />}
                        </button>
                        <span className="text-xs sm:text-sm text-gray-600">
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {isDocument && (
                <div className="w-full h-full flex items-center justify-center p-4 sm:p-8 bg-gray-50 min-h-[300px] sm:min-h-[400px] relative">
                  <div className="text-center">
                    <div className="w-16 h-16 sm:w-24 sm:h-24 bg-blue-100 rounded-full flex items-center justify-center mb-3 sm:mb-4 mx-auto">
                      <Download size={24} className="text-blue-600 sm:w-8 sm:h-8" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">{media.title}</h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-4">{media.description}</p>
                    <button
                      onClick={handleDownload}
                      className="btn-primary flex items-center gap-2 text-sm sm:text-base px-4 py-2 sm:px-6 sm:py-3"
                    >
                      <Download size={16} className="sm:w-5 sm:h-5" />
                      Download Document
                    </button>
                  </div>
                </div>
              )}

              {isPost && (
                <div className="relative w-full h-full flex items-center justify-center bg-gray-50">
                  {/* Post Images - handle both fileUrl and assets array */}
                  {(media.fileUrl || (media.assets && media.assets.length > 0)) ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                      {/* Display current image */}
                      <img
                        src={media.assets && media.assets.length > 0 
                          ? media.assets[currentImageIndex]?.fileUrl 
                          : media.fileUrl
                        }
                        alt={`${media.title} - Image ${currentImageIndex + 1}`}
                        className="max-w-full max-h-full object-contain transition-opacity duration-300"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      
                      {/* Navigation arrows - only show if multiple images */}
                      {media.assets && media.assets.length > 1 && (
                        <>
                          {/* Previous button */}
                          <button
                            onClick={prevImage}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all duration-200 z-10"
                            title="Previous image"
                          >
                            <ChevronLeft size={24} />
                          </button>
                          
                          {/* Next button */}
                          <button
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all duration-200 z-10"
                            title="Next image"
                          >
                            <ChevronRight size={24} />
                          </button>
                        </>
                      )}
                      
                      {/* Image counter */}
                      {media.assets && media.assets.length > 1 && (
                        <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                          {currentImageIndex + 1} / {media.assets.length}
                        </div>
                      )}

                      {/* Image dots indicator */}
                      {media.assets && media.assets.length > 1 && media.assets.length <= 10 && (
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                          {media.assets.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => goToImage(index)}
                              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                                index === currentImageIndex 
                                  ? 'bg-white scale-125' 
                                  : 'bg-white/50 hover:bg-white/80'
                              }`}
                              title={`Go to image ${index + 1}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* If no image, show placeholder */
                    <div className="w-full h-full flex items-center justify-center p-8 bg-linear-to-br from-gray-100 to-gray-200">
                      <div className="text-center">
                        <div className="w-24 h-24 bg-[#3F2965] bg-opacity-20 rounded-full flex items-center justify-center mb-6 mx-auto">
                          <MessageCircle size={32} className="text-[#3F2965]" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800">{media.title}</h3>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Desktop Sidebar - only visible on lg+ screens */}
            <AnimatePresence>
              {showSidebar && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ 
                    width: '33.333333%', 
                    opacity: 1
                  }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="hidden lg:flex border-l bg-gray-50 flex-col overflow-hidden shadow-lg"
                >
                  <div className="flex-1 overflow-y-auto scrollbar-hide">
                    <div className="p-4">
                      {/* Description */}
                      <div className="mb-6">
                        <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">{media.description}</p>
                      </div>

                      {/* Post Content - only for posts */}
                      {isPost && media.content && media.content !== media.description && (
                        <div className="mb-6">
                          <h3 className="font-semibold text-gray-800 mb-2">Content</h3>
                          <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">
                            {media.content}
                          </div>
                        </div>
                      )}

                      {/* Post Images Gallery - only for posts with multiple assets */}
                      {isPost && media.assets && media.assets.length > 1 && (
                        <div className="mb-6">
                          <h3 className="font-semibold text-gray-800 mb-2">Images ({media.assets.length})</h3>
                          <div className="grid grid-cols-2 gap-2">
                            {media.assets.slice(0, 4).map((asset, index) => (
                              <img
                                key={index}
                                src={asset.fileUrl}
                                alt={`${media.title} - Image ${index + 1}`}
                                className={`w-full h-20 object-cover rounded-lg cursor-pointer transition-all ${
                                  index === currentImageIndex 
                                    ? 'ring-2 ring-[#3F2965] opacity-100' 
                                    : 'hover:opacity-80'
                                }`}
                                onClick={() => goToImage(index)}
                              />
                            ))}
                            {media.assets.length > 4 && (
                              <div className="w-full h-20 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 text-xs">
                                +{media.assets.length - 4} more
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Tags */}
                      {media.tags && media.tags.length > 0 && (
                        <div className="mb-6">
                          <h3 className="font-semibold text-gray-800 mb-2">Tags</h3>
                          <div className="flex flex-wrap gap-2">
                            {media.tags.map(tag => (
                              <span key={tag} className="px-2 py-1 bg-white text-gray-600 text-xs rounded-full border">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-between mb-4 pb-4 border-b">
                        <div className="flex items-center gap-4">
                          <motion.button
                            onClick={() => {
                              if (!isAuthenticated) {
                                navigate('/login');
                                return;
                              }
                              onLike && onLike(media._id);
                            }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`transition-colors ${media.hasLiked
                              ? 'text-red-500'
                              : 'text-gray-700 hover:text-red-500'
                              }`}
                          >
                            <Heart
                              size={24}
                              className={media.hasLiked ? "fill-red-500 text-red-500" : "text-gray-700"}
                            />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              if (!isAuthenticated) {
                                navigate('/login');
                                return;
                              }
                              setShowComments(!showComments);
                            }}
                            className="text-gray-700 hover:text-blue-500 transition-colors"
                          >
                            <MessageCircle size={24} />
                          </motion.button>
                        </div>

                        <div className="flex items-center gap-2 text-gray-500">
                          <Eye size={16} />
                          <span className="text-sm font-medium">{media.views || 0}</span>
                        </div>
                      </div>

                      {/* Likes Count */}
                      {isAuthenticated && (
                        <div className="mb-4">
                          <p className="font-semibold text-gray-800 text-sm">
                            {Array.isArray(media.likes) ? media.likes.length : media.likesCount || media.likes || 0} likes
                          </p>
                        </div>
                      )}

                      {/* Comments Section */}
                      <div className="flex flex-col flex-1">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-gray-800">Comments</h3>
                          <button
                            onClick={() => setShowComments(!showComments)}
                            className="text-sm text-primary hover:text-primary/80 transition-colors"
                          >
                            {showComments ? 'Hide' : 'Show'}
                          </button>
                        </div>

                        {showComments && (
                          <>
                            {/* Comments List */}
                            <div className="space-y-3 mb-4 flex-1 overflow-y-auto pr-2 scrollbar-hide">
                              {media.comments && media.comments.length > 0 ? (
                                media.comments.map((comment, index) => (
                                  <div key={index} className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                                    <p className="text-sm text-gray-800 leading-relaxed">{comment.content}</p>
                                    <p className="text-xs text-gray-400 mt-2 uppercase font-medium">
                                      {new Date(comment.createdAt).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                      })}
                                    </p>
                                  </div>
                                ))
                              ) : (
                                <p className="text-sm text-gray-500 text-center py-4 italic">No comments yet. Be the first to share one!</p>
                              )}
                            </div>

                            {/* Add Comment */}
                            {isAuthenticated && (
                              <div className="mt-auto pt-4 border-t border-gray-200">
                                <form onSubmit={handleCommentSubmit} className="flex gap-3">
                                  <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Add a comment..."
                                    className="flex-1 px-3 py-2 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm leading-relaxed"
                                    rows="2"
                                  />
                                  <button
                                    type="submit"
                                    disabled={!comment.trim()}
                                    className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-sm shadow-sm self-end"
                                  >
                                    Post
                                  </button>
                                </form>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Bottom Drawer - only visible on mobile */}
          <AnimatePresence>
            {showMobileDrawer && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="lg:hidden fixed inset-0 bg-black/50 z-50"
                  onClick={() => setShowMobileDrawer(false)}
                />
                
                {/* Drawer */}
                <motion.div
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  className="lg:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 max-h-[80vh] flex flex-col"
                  onClick={(e) => e.stopPropagation()}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  {/* Drawer Handle */}
                  <div className="flex justify-center py-3 border-b border-gray-100">
                    <button
                      onClick={() => setShowMobileDrawer(false)}
                      className="w-12 h-1 bg-gray-300 rounded-full hover:bg-gray-400 transition-colors"
                    />
                  </div>

                  {/* Drawer Header */}
                  <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800">Details</h3>
                    <button
                      onClick={() => setShowMobileDrawer(false)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <ChevronDown size={20} className="text-gray-600" />
                    </button>
                  </div>

                  {/* Drawer Content */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* Description */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Description</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">{media.description}</p>
                    </div>

                    {/* Post Content - only for posts */}
                    {isPost && media.content && media.content !== media.description && (
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Content</h4>
                        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 p-4 rounded-xl">
                          {media.content}
                        </div>
                      </div>
                    )}

                    {/* Post Images Gallery - only for posts with multiple assets */}
                    {isPost && media.assets && media.assets.length > 1 && (
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Images ({media.assets.length})</h4>
                        <div className="grid grid-cols-2 gap-3">
                          {media.assets.slice(0, 4).map((asset, index) => (
                            <img
                              key={index}
                              src={asset.fileUrl}
                              alt={`${media.title} - Image ${index + 1}`}
                              className={`w-full h-24 object-cover rounded-xl cursor-pointer transition-all ${
                                index === currentImageIndex 
                                  ? 'ring-2 ring-[#3F2965] opacity-100' 
                                  : 'hover:opacity-80'
                              }`}
                              onClick={() => goToImage(index)}
                            />
                          ))}
                          {media.assets.length > 4 && (
                            <div className="w-full h-24 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 text-sm">
                              +{media.assets.length - 4} more
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    {media.tags && media.tags.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                          {media.tags.map(tag => (
                            <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between py-4 border-y border-gray-100">
                      <div className="flex items-center gap-6">
                        <motion.button
                          onClick={() => {
                            if (!isAuthenticated) {
                              navigate('/login');
                              return;
                            }
                            onLike && onLike(media._id);
                          }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className={`flex items-center gap-2 transition-colors ${media.hasLiked
                            ? 'text-red-500'
                            : 'text-gray-700 hover:text-red-500'
                            }`}
                        >
                          <Heart
                            size={24}
                            className={media.hasLiked ? "fill-red-500 text-red-500" : "text-gray-700"}
                          />
                          <span className="text-sm font-medium">
                            {Array.isArray(media.likes) ? media.likes.length : media.likesCount || media.likes || 0}
                          </span>
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => {
                            if (!isAuthenticated) {
                              navigate('/login');
                              return;
                            }
                            setShowComments(!showComments);
                          }}
                          className="flex items-center gap-2 text-gray-700 hover:text-blue-500 transition-colors"
                        >
                          <MessageCircle size={24} />
                          <span className="text-sm font-medium">
                            {media.comments ? media.comments.length : 0}
                          </span>
                        </motion.button>
                      </div>

                      <div className="flex items-center gap-2 text-gray-500">
                        <Eye size={16} />
                        <span className="text-sm font-medium">{media.views || 0} views</span>
                      </div>
                    </div>

                    {/* Comments Section */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-800">Comments</h4>
                        <button
                          onClick={() => setShowComments(!showComments)}
                          className="text-sm text-[#3F2965] hover:text-[#3F2965]/80 transition-colors"
                        >
                          {showComments ? 'Hide' : 'Show'}
                        </button>
                      </div>

                      {showComments && (
                        <>
                          {/* Comments List */}
                          <div className="space-y-3 mb-4 max-h-[30vh] overflow-y-auto">
                            {media.comments && media.comments.length > 0 ? (
                              media.comments.map((comment, index) => (
                                <div key={index} className="bg-gray-50 p-3 rounded-xl">
                                  <p className="text-sm text-gray-800 leading-relaxed">{comment.content}</p>
                                  <p className="text-xs text-gray-500 mt-2">
                                    {new Date(comment.createdAt).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric'
                                    })}
                                  </p>
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-gray-500 text-center py-8 italic">
                                No comments yet. Be the first to share one!
                              </p>
                            )}
                          </div>

                          {/* Add Comment */}
                          {isAuthenticated && (
                            <div className="border-t border-gray-100 pt-4">
                              <form onSubmit={handleCommentSubmit} className="flex gap-3">
                                <textarea
                                  value={comment}
                                  onChange={(e) => setComment(e.target.value)}
                                  placeholder="Add a comment..."
                                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-[#3F2965]/20 focus:border-[#3F2965] outline-none text-sm leading-relaxed"
                                  rows="3"
                                />
                                <button
                                  type="submit"
                                  disabled={!comment.trim()}
                                  className="px-6 py-3 bg-[#3F2965] text-white rounded-xl hover:bg-[#3F2965]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-sm shadow-sm self-end"
                                >
                                  Post
                                </button>
                              </form>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MediaPlayer;