import React, { useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

const InlineVideoPlayer = ({ src, poster, className = "", onPlay, onPause }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // Start muted for better UX
  const [showControls, setShowControls] = useState(false);
  const videoRef = useRef(null);

  const togglePlay = (e) => {
    e.stopPropagation(); // Prevent card click
    const video = videoRef.current;
    if (video) {
      if (isPlaying) {
        video.pause();
        onPause && onPause();
      } else {
        video.play();
        onPlay && onPlay();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (video) {
      video.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleMouseEnter = () => {
    setShowControls(true);
  };

  const handleMouseLeave = () => {
    setShowControls(false);
  };

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-cover"
        muted={isMuted}
        loop
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />
      
      {/* Instagram-style Controls Overlay */}
      {showControls && (
        <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/50 hover:bg-white transition-all shadow-lg"
            >
              {isPlaying ? (
                <Pause size={16} className="text-[#3F2965]" />
              ) : (
                <Play size={16} className="text-[#3F2965] ml-0.5" />
              )}
            </button>
            
            <button
              onClick={toggleMute}
              className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/50 hover:bg-white transition-all shadow-lg"
            >
              {isMuted ? (
                <VolumeX size={12} className="text-[#3F2965]" />
              ) : (
                <Volume2 size={12} className="text-[#3F2965]" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InlineVideoPlayer;