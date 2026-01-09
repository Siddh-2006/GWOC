import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, Volume2, VolumeX, Maximize, Download, Heart, MessageCircle } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const MediaPlayer = ({ media, isOpen, onClose, onLike, onComment }) => {
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

  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  useEffect(() => {
    if (isOpen && media) {
      // Reset state when opening new media
      setIsPlaying(false);
      setCurrentTime(0);
      setShowControls(true);
    }
  }, [isOpen, media]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isOpen) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seekRelative(-10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          seekRelative(10);
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

  if (!isOpen || !media) return null;

  const isVideo = media.type === 'video' || media.type === 'vlog';
  const isAudio = media.type === 'audio';
  const isDocument = media.type === 'document';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-800 truncate">{media.title}</h2>
              <p className="text-sm text-gray-600 capitalize">{media.type}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden md:block text-xs text-gray-500">
                <span className="bg-gray-100 px-2 py-1 rounded">Space</span> Play/Pause •
                <span className="bg-gray-100 px-2 py-1 rounded ml-1">←→</span> Seek •
                <span className="bg-gray-100 px-2 py-1 rounded ml-1">M</span> Mute
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row">
            {/* Media Content */}
            <div className="flex-1">
              {isVideo && (
                <div
                  className="relative bg-black aspect-video"
                  onMouseMove={handleMouseMove}
                >
                  <video
                    ref={videoRef}
                    src={media.fileUrl}
                    className="w-full h-full"
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
                        className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"
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
                              className="w-16 h-16 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all"
                            >
                              {isPlaying ? <Pause size={24} className="text-white" /> : <Play size={24} className="text-white ml-1" />}
                            </button>
                          </div>
                        )}

                        {/* Bottom Controls */}
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          {/* Progress Bar */}
                          <div
                            className="w-full h-2 bg-white bg-opacity-30 rounded-full cursor-pointer mb-4"
                            onClick={handleSeek}
                          >
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                            />
                          </div>

                          {/* Controls */}
                          <div className="flex items-center justify-between text-white">
                            <div className="flex items-center gap-4">
                              <button onClick={togglePlay}>
                                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                              </button>
                              <button onClick={toggleMute}>
                                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                              </button>
                              <span className="text-sm">
                                {formatTime(currentTime)} / {formatTime(duration)}
                              </span>
                            </div>
                            <button onClick={handleDownload}>
                              <Download size={20} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {isAudio && (
                <div className="p-8 bg-gradient-to-br from-purple-100 to-pink-100 aspect-video flex flex-col items-center justify-center">
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

                  <div className="text-center mb-8">
                    <div className="w-24 h-24 bg-primary bg-opacity-20 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <Volume2 size={32} className="text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">{media.title}</h3>
                  </div>

                  {/* Audio Controls */}
                  <div className="w-full max-w-md">
                    <div
                      className="w-full h-2 bg-white bg-opacity-50 rounded-full cursor-pointer mb-4"
                      onClick={handleSeek}
                    >
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-center gap-4">
                      <button
                        onClick={togglePlay}
                        className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors"
                      >
                        {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
                      </button>
                      <button onClick={toggleMute} className="text-gray-600 hover:text-primary">
                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                      </button>
                      <span className="text-sm text-gray-600">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {isDocument && (
                <div className="p-8 bg-gray-50 aspect-video flex flex-col items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <Download size={32} className="text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{media.title}</h3>
                    <p className="text-gray-600 mb-6">{media.description}</p>
                    <button
                      onClick={handleDownload}
                      className="btn-primary flex items-center gap-2"
                    >
                      <Download size={20} />
                      Download Document
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="w-full lg:w-80 border-l bg-gray-50">
              <div className="p-4">
                {/* Description */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
                  <p className="text-sm text-gray-600">{media.description}</p>
                </div>

                {/* Tags */}
                {media.tags && media.tags.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-800 mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {media.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-white text-gray-600 text-xs rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-4 mb-6 pb-6 border-b">
                  {isAuthenticated && (
                    <motion.button
                      onClick={() => onLike && onLike(media._id)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className={`flex items-center gap-2 transition-colors ${media.hasLiked
                        ? 'text-red-500'
                        : 'text-gray-600 hover:text-red-500'
                        }`}
                    >
                      <Heart
                        size={20}
                        className={media.hasLiked ? "fill-red-500 text-red-500" : "text-gray-600"}
                      />
                      <span>{Array.isArray(media.likes) ? media.likes.length : media.likesCount || media.likes || 0}</span>
                    </motion.button>
                  )}
                  <button
                    onClick={() => setShowComments(!showComments)}
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition-colors"
                  >
                    <MessageCircle size={20} />
                    <span>{media.comments?.length || 0}</span>
                  </button>
                </div>

                {/* Comments Section */}
                {showComments && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-4">Comments</h3>

                    {/* Add Comment */}
                    <form onSubmit={handleCommentSubmit} className="mb-4">
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="w-full p-3 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        rows="3"
                      />
                      <button
                        type="submit"
                        disabled={!comment.trim()}
                        className="mt-2 btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Post Comment
                      </button>
                    </form>

                    {/* Comments List */}
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {media.comments && media.comments.length > 0 ? (
                        media.comments.map((comment, index) => (
                          <div key={index} className="bg-white p-3 rounded-xl">
                            <p className="text-sm text-gray-800">{comment.content}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-4">No comments yet</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MediaPlayer;