import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Target, Eye, Volume2, VolumeX } from 'lucide-react';

const About = () => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const hoverTimerRef = useRef(null);
  const flipBackTimerRef = useRef(null);

  const handleMouseEnter = () => {
    if (flipBackTimerRef.current) {
      clearTimeout(flipBackTimerRef.current);
      flipBackTimerRef.current = null;
    }

    if (!isFlipped) {
      hoverTimerRef.current = setTimeout(() => {
        setIsFlipped(true);
      }, 2000);
    }
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }

    if (isFlipped) {
      flipBackTimerRef.current = setTimeout(() => {
        setIsFlipped(false);
      }, 5000);
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      if (isFlipped) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(e => console.log("Autoplay prevented", e));
      } else {
        videoRef.current.pause();
      }
    }
  }, [isFlipped]);

  const toggleMute = (e) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
  };

  return (
    <div className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-primary mb-6">About MindSettler</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A platform born from a passion for psycho-education and a commitment to mental well-being for all.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-24">
          <div 
            className="relative" 
            ref={containerRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="relative w-full aspect-square" style={{ perspective: "1000px" }}>
              <motion.div
                className="w-full h-full relative"
                style={{ transformStyle: "preserve-3d" }}
                initial={{ rotateY: 0, rotateZ: 3 }}
                animate={{ 
                  rotateY: isFlipped ? 180 : 0,
                  rotateZ: isFlipped ? 0 : 3
                }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              >
                {/* Front Face */}
                <div 
                  className="absolute inset-0 w-full h-full bg-purple-100 rounded-[4rem] overflow-hidden"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <img 
                    src="/assets/pranika.jpg" 
                    alt="Parnika - Founder of MindSettler" 
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Back Face */}
                <div 
                  className="absolute inset-0 w-full h-full bg-black rounded-[4rem] overflow-hidden group"
                  style={{ 
                    backfaceVisibility: "hidden", 
                    transform: "rotateY(180deg)" 
                  }}
                >
                  <video 
                    ref={videoRef}
                    src="/assets/pranika1.mp4" 
                    className="w-full h-full object-cover"
                    muted={isMuted}
                    playsInline
                    onEnded={() => setIsFlipped(false)}
                  />
                  
                  {/* Sound Toggle Button */}
                  <button
                    onClick={toggleMute}
                    className="absolute bottom-6 right-6 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-all transform hover:scale-110 z-10"
                    aria-label={isMuted ? "Unmute video" : "Mute video"}
                  >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>
                </div>
              </motion.div>
            </div>
            <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-secondary/10 rounded-full blur-2xl -z-10" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-primary mb-6">Our Brand</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              MindSettler is more than just a counseling service; it's a movement toward mental clarity. We believe that understanding the "why" behind our thoughts is the first step toward settling them.
            </p>
            <p className="text-gray-600 mb-10 leading-relaxed">
              Founded by Parnika, MindSettler focuses on bridging the gap between clinical psychology and everyday understanding, providing tools that are accessible, human, and effective.
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mb-4">
                  <Target className="text-primary" />
                </div>
                <h4 className="font-bold mb-2">Our Mission</h4>
                <p className="text-sm text-gray-500">To make therapy less intimidating and more educational.</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center mb-4">
                  <Eye className="text-secondary" />
                </div>
                <h4 className="font-bold mb-2">Our Vision</h4>
                <p className="text-sm text-gray-500">A world where mental wellness is a standard part of life.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
