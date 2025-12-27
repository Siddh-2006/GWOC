import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';

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
        videoRef.current.play().catch(() => {
          // Autoplay prevented - this is normal behavior
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isFlipped]);

  const toggleMute = (e) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
  };

  // Animation variants for gentle fade-in with upward motion
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 1.0,
        ease: "easeOut"
      }
    }
  };

  // Section component with scroll-triggered animation
  const AnimatedSection = ({ children, className = "" }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
      <motion.div
        ref={ref}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={fadeInUp}
        className={className}
      >
        {children}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-green-50/20">
      <div className="flex min-h-screen">
        {/* LEFT PANEL - Static/Sticky with Original Flip Animation */}
        <div className="hidden lg:flex lg:w-2/5 xl:w-1/3 sticky top-0 h-screen">
          <div className="relative w-full flex items-center justify-center p-12">
            {/* Soft gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100/40 via-purple-50/30 to-green-100/40" />
            
            {/* Portrait container with flip animation */}
            <div className="relative z-10 text-center">
              <div 
                className="relative mb-8" 
                ref={containerRef}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <div className="relative w-80 h-80 mx-auto" style={{ perspective: "1000px" }}>
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
                    {/* Front Face - Photo */}
                    <div 
                      className="absolute inset-0 w-full h-full rounded-full overflow-hidden shadow-2xl shadow-blue-200/30"
                      style={{ backfaceVisibility: "hidden" }}
                    >
                      <img 
                        src="/assets/pranika.jpg" 
                        alt="Parnika - Founder of MindSettler" 
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Back Face - Video */}
                    <div 
                      className="absolute inset-0 w-full h-full rounded-full overflow-hidden shadow-2xl shadow-blue-200/30"
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
              </div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.0, delay: 0.5 }}
                className="space-y-4"
              >
                <blockquote className="text-2xl font-light text-slate-700 leading-relaxed italic">
                  "Understanding is the first form of care."
                </blockquote>
                <div className="text-slate-500">
                  <p className="font-medium">Parnika</p>
                  <p className="text-sm">Founder, MindSettler</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - Scrollable Content */}
        <div className="flex-1 lg:w-3/5 xl:w-2/3" ref={containerRef}>
          <div className="max-w-4xl mx-auto px-6 lg:px-12 py-20 lg:py-32">
            
            {/* Mobile Portrait - Only shown on smaller screens */}
            <div className="lg:hidden mb-16 text-center">
              <div className="w-48 h-48 mx-auto rounded-full overflow-hidden shadow-xl shadow-blue-200/30 mb-6">
                <img 
                  src="/assets/pranika.jpg" 
                  alt="Parnika - Founder of MindSettler" 
                  className="w-full h-full object-cover"
                />
              </div>
              <blockquote className="text-xl font-light text-slate-700 leading-relaxed italic mb-4">
                "Understanding is the first form of care."
              </blockquote>
              <div className="text-slate-500">
                <p className="font-medium">Parnika</p>
                <p className="text-sm">Founder, MindSettler</p>
              </div>
            </div>

            {/* Opening Statement */}
            <AnimatedSection className="mb-20">
              <h1 className="text-4xl lg:text-5xl font-light text-slate-800 mb-8 leading-tight">
                What MindSettler Is
              </h1>
              <div className="space-y-6 text-lg leading-relaxed text-slate-600">
                <p>
                  MindSettler is a psycho-education and mental well-being platform that focuses on understanding before action.
                </p>
                <p>
                  We support awareness and human-led guidance through both online and offline sessions, creating space for reflection without pressure.
                </p>
              </div>
            </AnimatedSection>

            {/* Aim */}
            <AnimatedSection className="mb-20">
              <h2 className="text-3xl font-light text-slate-800 mb-8">Our Aim</h2>
              <div className="space-y-6 text-lg leading-relaxed text-slate-600">
                <p>
                  To make mental health understanding less intimidating.
                </p>
                <p>
                  To create space for reflection without pressure, prioritizing clarity over urgency.
                </p>
                <p className="text-xl font-medium text-slate-700 italic">
                  Understanding comes first.
                </p>
              </div>
            </AnimatedSection>

            {/* Goal */}
            <AnimatedSection className="mb-20">
              <h2 className="text-3xl font-light text-slate-800 mb-8">Our Goal</h2>
              <div className="space-y-6 text-lg leading-relaxed text-slate-600">
                <p>
                  Guide individuals toward informed, human support while normalizing the process of seeking guidance.
                </p>
                <p>
                  Provide safe, confidential pathways to sessions that honor each person's unique journey.
                </p>
                <p className="text-xl font-medium text-slate-700 italic">
                  We walk alongside, we don't push forward.
                </p>
              </div>
            </AnimatedSection>

            {/* Founder's Story */}
            <AnimatedSection className="mb-20">
              <h2 className="text-3xl font-light text-slate-800 mb-8">Parnika's Story</h2>
              <div className="space-y-6 text-lg leading-relaxed text-slate-600">
                <p>
                  MindSettler was born from observation, not crisis. Parnika recognized the lack of safe spaces for reflection and the need for calm, human-centered mental health support.
                </p>
                <p>
                  The intention was always to create a platform built with care, not speed—a place where understanding unfolds naturally.
                </p>
                <p className="text-xl font-medium text-slate-700 italic">
                  MindSettler was built with care, not speed.
                </p>
              </div>
            </AnimatedSection>

            {/* Philosophy of Care */}
            <AnimatedSection className="mb-20">
              <h2 className="text-3xl font-light text-slate-800 mb-8">Our Philosophy of Care</h2>
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div className="p-6 bg-white/60 rounded-2xl shadow-sm">
                  <h3 className="text-xl font-medium text-slate-700 mb-3">Psycho-education</h3>
                  <p className="text-slate-600">Not diagnosis</p>
                </div>
                <div className="p-6 bg-white/60 rounded-2xl shadow-sm">
                  <h3 className="text-xl font-medium text-slate-700 mb-3">Understanding</h3>
                  <p className="text-slate-600">Not fixing</p>
                </div>
                <div className="p-6 bg-white/60 rounded-2xl shadow-sm">
                  <h3 className="text-xl font-medium text-slate-700 mb-3">Reflection</h3>
                  <p className="text-slate-600">Not reaction</p>
                </div>
              </div>
            </AnimatedSection>

            {/* What MindSettler Is / Is Not */}
            <AnimatedSection className="mb-20">
              <h2 className="text-3xl font-light text-slate-800 mb-8">What We Are & What We're Not</h2>
              <div className="grid md:grid-cols-2 gap-12">
                <div>
                  <h3 className="text-2xl font-medium text-green-700 mb-6">MindSettler Is</h3>
                  <ul className="space-y-4 text-lg text-slate-600">
                    <li>• A psycho-education space</li>
                    <li>• A guided well-being platform</li>
                    <li>• A human-led support system</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-2xl font-medium text-slate-500 mb-6">MindSettler Is Not</h3>
                  <ul className="space-y-4 text-lg text-slate-600">
                    <li>• An emergency service</li>
                    <li>• An AI therapy tool</li>
                    <li>• An instant solution platform</li>
                  </ul>
                </div>
              </div>
            </AnimatedSection>

            {/* Confidentiality & Trust */}
            <AnimatedSection className="mb-20">
              <h2 className="text-3xl font-light text-slate-800 mb-8">Confidentiality & Trust</h2>
              <div className="bg-blue-50/50 p-8 rounded-2xl">
                <div className="space-y-6 text-lg leading-relaxed text-slate-600">
                  <p>
                    Privacy is central to everything we do. All sessions are completely confidential.
                  </p>
                  <p>
                    We never share individual data, and our corporate services are entirely non-reporting.
                  </p>
                  <p className="text-xl font-medium text-slate-700">
                    Your trust is the foundation of our work.
                  </p>
                </div>
              </div>
            </AnimatedSection>

            {/* Who MindSettler Is For */}
            <AnimatedSection className="mb-20">
              <h2 className="text-3xl font-light text-slate-800 mb-8">Who MindSettler Is For</h2>
              <div className="space-y-6 text-lg leading-relaxed text-slate-600">
                <p>
                  People feeling confused or overwhelmed who are exploring mental health gently.
                </p>
                <p>
                  First-time help-seekers and individuals who value calm structure over urgent solutions.
                </p>
                <p>
                  Anyone who believes that understanding themselves is worth the time it takes.
                </p>
              </div>
            </AnimatedSection>

            {/* Closing Statement */}
            <AnimatedSection className="mb-20">
              <div className="text-center py-12">
                <div className="space-y-8 text-xl leading-relaxed text-slate-600">
                  <p>No rush.</p>
                  <p>Use at your own pace.</p>
                  <p className="text-2xl font-light text-slate-700 italic">
                    Understanding unfolds differently for everyone.
                  </p>
                </div>
              </div>
            </AnimatedSection>

          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
