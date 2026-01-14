import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { gsap } from 'gsap';
import {
  MapPin,
  CheckCircle,
  Circle,
  ArrowDown,
  Sprout,
  Shield,
  Calendar,
  Trophy,
  BookOpen,
  Heart,
  Target,
  MessageSquare,
  Star
} from 'lucide-react';
import { format } from 'date-fns';

// Magic Bento Constants
const DEFAULT_PARTICLE_COUNT = 12;
const DEFAULT_SPOTLIGHT_RADIUS = 300;
const DEFAULT_GLOW_COLOR = '63, 41, 101'; // Brand Purple (#3F2965)
const MOBILE_BREAKPOINT = 768;

// Helper function to create particles
const createParticleElement = (x, y, color = DEFAULT_GLOW_COLOR) => {
  const el = document.createElement('div');
  el.className = 'particle';
  el.style.cssText = `
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(${color}, 1);
    box-shadow: 0 0 6px rgba(${color}, 0.6);
    pointer-events: none;
    z-index: 100;
    left: ${x}px;
    top: ${y}px;
  `;
  return el;
};

const calculateSpotlightValues = radius => ({
  proximity: radius * 0.5,
  fadeDistance: radius * 0.75
});

const updateCardGlowProperties = (card, mouseX, mouseY, glow, radius) => {
  const rect = card.getBoundingClientRect();
  const relativeX = ((mouseX - rect.left) / rect.width) * 100;
  const relativeY = ((mouseY - rect.top) / rect.height) * 100;

  card.style.setProperty('--glow-x', `${relativeX}%`);
  card.style.setProperty('--glow-y', `${relativeY}%`);
  card.style.setProperty('--glow-intensity', glow.toString());
  card.style.setProperty('--glow-radius', `${radius}px`);
};

// Internal Components for Magic Bento
const ParticleCard = ({
  children,
  className = '',
  disableAnimations = false,
  style,
  particleCount = DEFAULT_PARTICLE_COUNT,
  glowColor = DEFAULT_GLOW_COLOR,
  enableTilt = true,
  clickEffect = true,
  enableMagnetism = true
}) => {
  const cardRef = useRef(null);
  const particlesRef = useRef([]);
  const timeoutsRef = useRef([]);
  const isHoveredRef = useRef(false);
  const memoizedParticles = useRef([]);
  const particlesInitialized = useRef(false);
  const magnetismAnimationRef = useRef(null);

  const initializeParticles = useCallback(() => {
    if (particlesInitialized.current || !cardRef.current) return;

    const { width, height } = cardRef.current.getBoundingClientRect();
    memoizedParticles.current = Array.from({ length: particleCount }, () =>
      createParticleElement(Math.random() * width, Math.random() * height, glowColor)
    );
    particlesInitialized.current = true;
  }, [particleCount, glowColor]);

  const clearAllParticles = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    magnetismAnimationRef.current?.kill();

    particlesRef.current.forEach(particle => {
      gsap.to(particle, {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        ease: 'back.in(1.7)',
        onComplete: () => {
          particle.parentNode?.removeChild(particle);
        }
      });
    });
    particlesRef.current = [];
  }, []);

  const animateParticles = useCallback(() => {
    if (!cardRef.current || !isHoveredRef.current) return;

    if (!particlesInitialized.current) {
      initializeParticles();
    }

    memoizedParticles.current.forEach((particle, index) => {
      const timeoutId = setTimeout(() => {
        if (!isHoveredRef.current || !cardRef.current) return;

        const clone = particle.cloneNode(true);
        cardRef.current.appendChild(clone);
        particlesRef.current.push(clone);

        gsap.fromTo(clone, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' });

        gsap.to(clone, {
          x: (Math.random() - 0.5) * 100,
          y: (Math.random() - 0.5) * 100,
          rotation: Math.random() * 360,
          duration: 2 + Math.random() * 2,
          ease: 'none',
          repeat: -1,
          yoyo: true
        });

        gsap.to(clone, {
          opacity: 0.3,
          duration: 1.5,
          ease: 'power2.inOut',
          repeat: -1,
          yoyo: true
        });
      }, index * 100);

      timeoutsRef.current.push(timeoutId);
    });
  }, [initializeParticles]);

  useEffect(() => {
    if (disableAnimations || !cardRef.current) return;

    const element = cardRef.current;

    const handleMouseEnter = () => {
      isHoveredRef.current = true;
      animateParticles();

      if (enableTilt) {
        gsap.to(element, {
          rotateX: 5,
          rotateY: 5,
          duration: 0.3,
          ease: 'power2.out',
          transformPerspective: 1000
        });
      }
    };

    const handleMouseLeave = () => {
      isHoveredRef.current = false;
      clearAllParticles();

      if (enableTilt) {
        gsap.to(element, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.3,
          ease: 'power2.out'
        });
      }

      if (enableMagnetism) {
        gsap.to(element, {
          x: 0,
          y: 0,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    };

    const handleMouseMove = e => {
      if (!enableTilt && !enableMagnetism) return;

      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      if (enableTilt) {
        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;

        gsap.to(element, {
          rotateX,
          rotateY,
          duration: 0.1,
          ease: 'power2.out',
          transformPerspective: 1000
        });
      }

      if (enableMagnetism) {
        const magnetX = (x - centerX) * 0.05;
        const magnetY = (y - centerY) * 0.05;

        magnetismAnimationRef.current = gsap.to(element, {
          x: magnetX,
          y: magnetY,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    };

    const handleClick = e => {
      if (!clickEffect) return;

      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const maxDistance = Math.max(
        Math.hypot(x, y),
        Math.hypot(x - rect.width, y),
        Math.hypot(x, y - rect.height),
        Math.hypot(x - rect.width, y - rect.height)
      );

      const ripple = document.createElement('div');
      ripple.style.cssText = `
        position: absolute;
        width: ${maxDistance * 2}px;
        height: ${maxDistance * 2}px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(${glowColor}, 0.4) 0%, rgba(${glowColor}, 0.2) 30%, transparent 70%);
        left: ${x - maxDistance}px;
        top: ${y - maxDistance}px;
        pointer-events: none;
        z-index: 1000;
      `;

      element.appendChild(ripple);

      gsap.fromTo(
        ripple,
        {
          scale: 0,
          opacity: 1
        },
        {
          scale: 1,
          opacity: 0,
          duration: 0.8,
          ease: 'power2.out',
          onComplete: () => ripple.remove()
        }
      );
    };

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);
    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('click', handleClick);

    return () => {
      isHoveredRef.current = false;
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('click', handleClick);
      clearAllParticles();
    };
  }, [animateParticles, clearAllParticles, disableAnimations, enableTilt, enableMagnetism, clickEffect, glowColor]);

  return (
    <div
      ref={cardRef}
      className={`${className} relative overflow-hidden`}
      style={{ ...style, position: 'relative', overflow: 'hidden' }}
    >
      {children}
    </div>
  );
};

const GlobalSpotlight = ({
  gridRef,
  disableAnimations = false,
  enabled = true,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  glowColor = DEFAULT_GLOW_COLOR
}) => {
  const spotlightRef = useRef(null);
  const isInsideSection = useRef(false);

  useEffect(() => {
    if (disableAnimations || !gridRef?.current || !enabled) return;

    const spotlight = document.createElement('div');
    spotlight.className = 'global-spotlight';
    spotlight.style.cssText = `
      position: fixed;
      width: 800px;
      height: 800px;
      border-radius: 50%;
      pointer-events: none;
      background: radial-gradient(circle,
        rgba(${glowColor}, 0.15) 0%,
        rgba(${glowColor}, 0.08) 15%,
        rgba(${glowColor}, 0.04) 25%,
        rgba(${glowColor}, 0.02) 40%,
        rgba(${glowColor}, 0.01) 65%,
        transparent 70%
      );
      z-index: 200;
      opacity: 0;
      transform: translate(-50%, -50%);
      mix-blend-mode: screen;
    `;
    document.body.appendChild(spotlight);
    spotlightRef.current = spotlight;

    const handleMouseMove = e => {
      if (!spotlightRef.current || !gridRef.current) return;

      const section = gridRef.current.closest('.bento-section');
      const rect = section?.getBoundingClientRect();
      const mouseInside =
        rect && e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;

      isInsideSection.current = mouseInside || false;
      const cards = gridRef.current.querySelectorAll('.card-interactive');

      if (!mouseInside) {
        gsap.to(spotlightRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: 'power2.out'
        });
        cards.forEach(card => {
          card.style.setProperty('--glow-intensity', '0');
        });
        return;
      }

      const { proximity, fadeDistance } = calculateSpotlightValues(spotlightRadius);
      let minDistance = Infinity;

      cards.forEach(card => {
        const cardElement = card;
        const cardRect = cardElement.getBoundingClientRect();
        const centerX = cardRect.left + cardRect.width / 2;
        const centerY = cardRect.top + cardRect.height / 2;
        const distance =
          Math.hypot(e.clientX - centerX, e.clientY - centerY) - Math.max(cardRect.width, cardRect.height) / 2;
        const effectiveDistance = Math.max(0, distance);

        minDistance = Math.min(minDistance, effectiveDistance);

        let glowIntensity = 0;
        if (effectiveDistance <= proximity) {
          glowIntensity = 1;
        } else if (effectiveDistance <= fadeDistance) {
          glowIntensity = (fadeDistance - effectiveDistance) / (fadeDistance - proximity);
        }

        updateCardGlowProperties(cardElement, e.clientX, e.clientY, glowIntensity, spotlightRadius);
      });

      gsap.to(spotlightRef.current, {
        left: e.clientX,
        top: e.clientY,
        duration: 0.1,
        ease: 'power2.out'
      });

      const targetOpacity =
        minDistance <= proximity
          ? 0.8
          : minDistance <= fadeDistance
            ? ((fadeDistance - minDistance) / (fadeDistance - proximity)) * 0.8
            : 0;

      gsap.to(spotlightRef.current, {
        opacity: targetOpacity,
        duration: targetOpacity > 0 ? 0.2 : 0.5,
        ease: 'power2.out'
      });
    };

    const handleMouseLeave = () => {
      isInsideSection.current = false;
      gridRef.current?.querySelectorAll('.card-interactive').forEach(card => {
        card.style.setProperty('--glow-intensity', '0');
      });
      if (spotlightRef.current) {
        gsap.to(spotlightRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      spotlightRef.current?.parentNode?.removeChild(spotlightRef.current);
    };
  }, [gridRef, disableAnimations, enabled, spotlightRadius, glowColor]);

  return null;
};

// Default Foundation Milestones - Phase 1
const DEFAULT_FOUNDATION = [
  {
    id: 'foundation-1',
    step: 1,
    title: "Taking the First Step",
    insight: "The most significant part of any journey is the decision to begin. You are here because you've chosen to prioritize your mental well-being.",
    type: 'foundation',
    phase: 'The Arrival',
    timestamp: new Date().toISOString()
  },
  {
    id: 'foundation-2',
    step: 2,
    title: "Defining Your Path",
    insight: "Awareness is the beginning of healing. This phase is about observing your thoughts without judgment.",
    type: 'foundation',
    phase: 'The Intent',
    timestamp: new Date().toISOString()
  },
  {
    id: 'foundation-3',
    step: 3,
    title: "Our Commitment",
    insight: "Your journey here is private and protected. We move at your pace, in your time.",
    type: 'foundation',
    phase: 'The Safe Space',
    timestamp: new Date().toISOString()
  }
];

const FoundationNode = ({ entry, index, isLast, hasAdminEntries, shouldDisableAnimations }) => {
  const isEven = index % 2 === 0;

  return (
    <div className={`relative flex items-center justify-center mb-8 sm:mb-10 md:mb-12 w-full ${isEven ? 'flex-row' : 'flex-row-reverse'}`}>
      {/* Center Line Connection Point */}
      <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center z-10">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: index * 0.2 }}
          className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center ${isLast && !hasAdminEntries
            ? 'bg-[#Dd1764] shadow-lg'
            : 'bg-[#3F2965]'
            }`}
        >
          <Sprout className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" />
          {isLast && !hasAdminEntries && (
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 bg-[#Dd1764] rounded-full -z-10"
            />
          )}
        </motion.div>
      </div>

      {/* Foundation Card */}
      <motion.div
        initial={{ opacity: 0, x: isEven ? -30 : 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
        className={`w-full sm:w-5/12 ${isEven ? 'sm:text-right sm:pr-4 md:pr-6' : 'sm:text-left sm:pl-4 md:pl-6'}`}
      >
        <ParticleCard
          className="card-interactive bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 card--border-glow"
          disableAnimations={shouldDisableAnimations}
          glowColor={DEFAULT_GLOW_COLOR}
        >
          <div className={`flex items-center gap-2 mb-2 sm:mb-3 ${isEven ? 'sm:justify-end' : 'sm:justify-start'} justify-start relative z-10`}>
            <span className="text-xs font-bold tracking-wide text-[#3F2965] bg-[#3F2965]/10 px-2 sm:px-3 py-1 rounded-full">
              Step {entry.step}
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2 sm:mb-3 relative z-10">{entry.title}</h3>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed relative z-10">{entry.insight}</p>
        </ParticleCard>
      </motion.div>

      {/* Spacer for the other side - hidden on mobile */}
      <div className="hidden sm:block sm:w-5/12" />
    </div>
  );
};

const AdminJourneyNode = ({ entry, sessionNumber, index, isLast, shouldDisableAnimations }) => {
  const isEven = index % 2 === 0;

  const safeEntry = {
    _id: entry._id || '',
    title: entry.title || 'Untitled Entry',
    description: entry.description || '',
    type: entry.type || 'session_summary',
    entryDate: entry.entryDate || entry.timestamp || new Date().toISOString(),
    content: {
      summary: entry.content?.summary || entry.adminRemarks || ''
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'milestone': return <Trophy className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" />;
      case 'session_summary': return <BookOpen className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" />;
      case 'achievement': return <Star className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" />;
      case 'reflection': return <Heart className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" />;
      case 'goal_set': return <Target className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" />;
      case 'admin_note': return <MessageSquare className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" />;
      default: return <BookOpen className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" />;
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  return (
    <div className={`relative flex items-center justify-center mb-8 sm:mb-10 md:mb-12 w-full ${isEven ? 'flex-row' : 'flex-row-reverse'}`}>
      {/* Center Line Connection Point */}
      <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center z-10">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center ${isLast ? 'bg-[#Dd1764] shadow-lg' : 'bg-[#3F2965]'
            }`}
        >
          {getTypeIcon(safeEntry.type)}
          {isLast && (
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 bg-[#Dd1764] rounded-full -z-10"
            />
          )}
        </motion.div>
      </div>

      {/* Admin Entry Card */}
      <motion.div
        initial={{ opacity: 0, x: isEven ? -30 : 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className={`w-full sm:w-5/12 ${isEven ? 'sm:text-right sm:pr-4 md:pr-6' : 'sm:text-left sm:pl-4 md:pl-6'}`}
      >
        <ParticleCard
          className="card-interactive bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 card--border-glow"
          disableAnimations={shouldDisableAnimations}
          glowColor={DEFAULT_GLOW_COLOR}
        >
          <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-2 sm:mb-3 ${isEven ? 'sm:justify-end' : 'sm:justify-start'} justify-start relative z-10`}>
            <span className="text-xs font-bold tracking-wide text-[#3F2965] bg-[#3F2965]/10 px-2 sm:px-3 py-1 rounded-full">
              Session {sessionNumber}
            </span>
            <span className="text-xs text-gray-500 font-medium">
              {formatDate(safeEntry.entryDate)}
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2 sm:mb-3 relative z-10">{safeEntry.title}</h3>

          {safeEntry.description && (
            <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 leading-relaxed relative z-10">{safeEntry.description}</p>
          )}

          {safeEntry.content.summary && (
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed relative z-10">{safeEntry.content.summary}</p>
          )}
        </ParticleCard>
      </motion.div>

      {/* Spacer for the other side - hidden on mobile */}
      <div className="hidden sm:block sm:w-5/12" />
    </div>
  );
};

const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

const MyJourney = ({ journeyData, loading, isAdminView = false, userName = 'Client' }) => {
  const containerRef = useRef(null);
  const isMobile = useMobileDetection();
  const shouldDisableAnimations = false || isMobile; // Can toggle globally if needed

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 80%", "end 80%"] // Keeps the drawing tip at a consistent screen position
  });

  const pathLength = useSpring(scrollYProgress, {
    stiffness: 400,
    damping: 30,
    restDelta: 0.001
  });

  const safeJourneyData = journeyData || { entries: [] };

  // Combine foundation and admin entries with continuous numbering
  const combinedTimeline = useMemo(() => {
    const adminEntries = safeJourneyData.entries || [];
    const hasAdminEntries = adminEntries.length > 0;

    return {
      foundation: DEFAULT_FOUNDATION,
      adminEntries: adminEntries.map((entry, index) => ({
        ...entry,
        sessionNumber: index + 1 // Session 1, 2, 3...
      })),
      hasAdminEntries,
      totalEntries: DEFAULT_FOUNDATION.length + adminEntries.length
    };
  }, [safeJourneyData.entries]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative py-4 sm:py-6 md:py-8 px-2 sm:px-4 md:px-0 max-w-4xl mx-auto overflow-hidden bento-section">
      <style>
        {`
          .bento-section {
            --glow-x: 50%;
            --glow-y: 50%;
            --glow-intensity: 0;
            --glow-radius: 200px;
            --glow-color: ${DEFAULT_GLOW_COLOR};
            --border-color: #392e4e;
            --background-dark: #060010;
            --white: hsl(0, 0%, 100%);
            --purple-primary: rgba(63, 41, 101, 1);
            --purple-glow: rgba(63, 41, 101, 0.2);
            --purple-border: rgba(63, 41, 101, 0.8);
            
            /* Background Image Integration */
            background-image: url('/my_journey_bg_light.png');
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            border-radius: 2rem; /* Soft rounded corners for the whole section */
          }
          
          .card--border-glow::after {
            content: '';
            position: absolute;
            inset: 0;
            padding: 2px;
            background: radial-gradient(var(--glow-radius) circle at var(--glow-x) var(--glow-y),
                rgba(${DEFAULT_GLOW_COLOR}, calc(var(--glow-intensity) * 0.8)) 0%,
                rgba(${DEFAULT_GLOW_COLOR}, calc(var(--glow-intensity) * 0.4)) 30%,
                transparent 60%);
            border-radius: inherit;
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            mask-composite: exclude;
            pointer-events: none;
            opacity: 1;
            transition: opacity 0.3s ease;
            z-index: 1;
          }
          
          .card--border-glow:hover::after {
            opacity: 1;
          }
          
          .card-interactive:hover {
            box-shadow: 0 4px 20px rgba(63, 41, 101, 0.2), 0 0 30px rgba(63, 41, 101, 0.1);
          }
          
          .particle::before {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            background: rgba(${DEFAULT_GLOW_COLOR}, 0.2);
            border-radius: 50%;
            z-index: -1;
          }
          
          .card-interactive {
            position: relative;
            z-index: 10;
            overflow: hidden;
            background: rgba(255, 255, 255, 0.8) !important;
            backdrop-filter: blur(8px);
          }
        `}
      </style>

      <GlobalSpotlight
        gridRef={containerRef}
        disableAnimations={shouldDisableAnimations}
        enabled={true}
        spotlightRadius={DEFAULT_SPOTLIGHT_RADIUS}
        glowColor={DEFAULT_GLOW_COLOR}
      />

      <div className="relative z-10 pb-8 sm:pb-12 md:pb-16">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold text-primary mb-2">
            {isAdminView ? `${userName}'s Growth Journey` : 'Your Growth Journey'}
          </h2>
          {/* Decorative line to match brand style */}
          <div className="w-12 h-1 bg-gradient-to-r from-pink-500 to-pink-600 mx-auto mb-4 rounded-full shadow-sm shadow-pink-200"></div>
          <p className="text-gray-500 max-w-lg mx-auto text-sm sm:text-base">
            {isAdminView
              ? `${userName}'s path of progress through wellness.`
              : 'Every step forward is a victory. Here is your path of progress.'}
          </p>
        </div>

        {/* Journey Nodes Container with SVG Path inside to prevent overlap with title */}
        <div className="relative">
          {/* The Winding Path SVG */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none z-0">
            <svg
              width="100%"
              height="100%"
              viewBox={`0 0 100 ${Math.max(800, combinedTimeline.totalEntries * 250)}`}
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
              className="opacity-15"
            >
              <motion.path
                d={`M50,0 C50,80 40,120 40,200 C40,280 60,320 60,400 C60,480 40,520 40,600 C40,680 50,720 50,${Math.max(800, combinedTimeline.totalEntries * 250)}`}
                stroke="#3F2965" // Reverted to Brand Purple
                strokeWidth="4"   // Kept the increased width for better visibility
                fill="none"
                style={{ pathLength }}
              />
              {/* Static background path for reference */}
              <path
                d={`M50,0 C50,80 40,120 40,200 C40,280 60,320 60,400 C60,480 40,520 40,600 C40,680 50,720 50,${Math.max(800, combinedTimeline.totalEntries * 250)}`}
                stroke="#E5E7EB"
                strokeWidth="3"
                strokeDasharray="8 8"
                fill="none"
              />
            </svg>
          </div>

          <div className="relative z-10">
            {/* Phase 1: Foundation Milestones */}
            <div className="mb-8">
              {combinedTimeline.foundation.map((entry, index) => (
                <FoundationNode
                  key={entry.id}
                  entry={entry}
                  index={index}
                  isLast={index === combinedTimeline.foundation.length - 1}
                  hasAdminEntries={combinedTimeline.hasAdminEntries}
                  shouldDisableAnimations={shouldDisableAnimations}
                />
              ))}
            </div>

            {/* Phase 2: Personalized Admin Entries */}
            {combinedTimeline.hasAdminEntries && (
              <div className="mb-8">
                {combinedTimeline.adminEntries.map((entry, index) => (
                  <AdminJourneyNode
                    key={entry._id}
                    entry={entry}
                    sessionNumber={entry.sessionNumber}
                    index={index + 3} // Continue the alternating pattern after foundation
                    isLast={index === combinedTimeline.adminEntries.length - 1}
                    shouldDisableAnimations={shouldDisableAnimations}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Future Growth Indicator */}
        {!combinedTimeline.hasAdminEntries && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center mt-6 sm:mt-8"
          >
            <div className="flex justify-center mb-3 sm:mb-4">
              <div className="h-6 sm:h-8 w-0.5 bg-gradient-to-b from-[#3F2965]/30 to-transparent border-l-2 border-dashed border-[#3F2965]/30"></div>
            </div>

            <div className="bg-white border-2 border-dashed border-[#3F2965]/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 max-w-sm sm:max-w-md mx-auto shadow-lg">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#3F2965]/20 to-[#3F2965]/10 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-[#3F2965]/60" />
              </div>
              <h3 className="font-bold text-gray-700 mb-2 text-sm sm:text-base">Future Growth</h3>
              <p className="text-[#3F2965]/70 leading-relaxed text-xs sm:text-sm">
                {isAdminView
                  ? `${userName}'s personalized journey entries will appear here as they progress.`
                  : 'Your personalized journey entries will appear here as you progress through sessions.'}
              </p>
            </div>
          </motion.div>
        )}

        {/* Animated continuation indicator */}
        <div className="flex justify-center mt-4 sm:mt-6">
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-purple-300 flex flex-col items-center"
          >
            <div className="h-6 sm:h-8 w-0.5 bg-gradient-to-b from-purple-200 to-transparent mb-1 sm:mb-2"></div>
            <ArrowDown size={14} />
          </motion.div>
        </div>
      </div>
    </div >
  );
};

export default MyJourney;