import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { Sparkles, MessageCircleHeart, X, Sun, Compass, Mountain as MountainIcon } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// --- TYPES ---
export const StageId = {
  AWARENESS: 'awareness',
  UNDERSTANDING: 'understanding',
  HEALING: 'healing',
  GROWTH: 'growth'
};

// --- CONSTANTS ---
export const JOURNEY_STAGES = [
  {
    id: StageId.AWARENESS,
    title: "Self-Awareness",
    description: "Begin by understanding your emotional landscape and identifying triggers.",
    color: "bg-pink-50",
    pathPercentage: 0.15,
    icon: <Sun className="w-5 h-5 text-pink-500" />
  },
  {
    id: StageId.UNDERSTANDING,
    title: "Navigating Growth",
    description: "Identify behavioral patterns and build a structured roadmap for change.",
    color: "bg-pink-100",
    pathPercentage: 0.40,
    icon: <Compass className="w-5 h-5 text-purple-600" />
  },
  {
    id: StageId.HEALING,
    title: "Resilient Mindset",
    description: "Implement evidence-based tools to handle life's challenges with clarity.",
    color: "bg-pink-200",
    pathPercentage: 0.65,
    icon: <MountainIcon className="w-5 h-5 text-purple-400" />
  },
  {
    id: StageId.GROWTH,
    title: "Sustainable Peace",
    description: "Establish long-term habits for emotional well-being and consistent growth.",
    color: "bg-pink-300",
    pathPercentage: 0.90,
    icon: <Sparkles className="w-5 h-5 text-pink-400" />
  }
];

export const PATH_POINTS = [
  { x: 10, y: 90 }, // Start bottom-left
  { x: 30, y: 75 }, // Awareness
  { x: 45, y: 60 }, // Understanding
  { x: 65, y: 40 }, // Healing
  { x: 85, y: 20 }, // Growth (Top rightish)
];

// --- SERVICE ---
// const getAffirmation = async (stage) => {
//   const apiKey = import.meta.env.VITE_GAME_API_KEY;

//   if (!apiKey) {
//     console.warn("Gemini API Key missing");
//     return "Remember, you are doing great just by being here.";
//   }

//   try {
//     const ai = new GoogleGenAI({ apiKey });
//     const response = await ai.models.generateContent({
//       model: 'gemini-1.5-flash',
//       contents: `Generate a short, gentle, warm, and comforting 1-sentence affirmation for someone currently in the "${stage}" stage of their mental health journey. Keep it under 20 words. No quotes.`,
//     });
//     return response.response.text()?.trim() || "You are enough exactly as you are.";
//   } catch (error) {
//     console.error("Gemini API Error:", error);
//     return "You are stronger than you know.";
//   }
// };

// --- COMPONENTS ---

// 1. Character Component
const Character = ({ x, y, isMoving, progress }) => {
  // Calculate smile curve based on progress.
  // 65 is a gentle smile, 80 is a big grin.
  const smileCurve = 65 + (Math.max(0, Math.min(1, progress)) * 15);

  return (
    <motion.div
      className="absolute w-12 h-12 md:w-16 md:h-16 z-20 pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        x: '-50%', // Center anchor
        y: '-100%', // Bottom anchor (feet on path)
      }}
      animate={{
        scale: isMoving ? [1, 1.05, 1] : 1,
        rotate: isMoving ? [0, -2, 2, 0] : 0,
      }}
      transition={{
        duration: 0.8, // Slower bobbing
        repeat: isMoving ? Infinity : 0,
        ease: "easeInOut"
      }}
    >
      {/* Character Body */}
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
        <g>
          {/* Backpack - pink-400 */}
          <circle cx="30" cy="55" r="15" fill="#f472b6" />
          {/* Body */}
          <circle cx="50" cy="50" r="30" fill="#fff" stroke="#4c1d95" strokeWidth="3" />
          {/* Eyes */}
          <circle cx="45" cy="45" r="3" fill="#4c1d95" />
          <circle cx="65" cy="45" r="3" fill="#4c1d95" />
          {/* Blush - pink-200 */}
          <ellipse cx="40" cy="55" rx="3" ry="2" fill="#fbcfe8" opacity="0.6" />
          <ellipse cx="70" cy="55" rx="3" ry="2" fill="#fbcfe8" opacity="0.6" />
          {/* Smile - Dynamic based on progress */}
          <path d={`M 45 60 Q 55 ${smileCurve} 65 60`} fill="none" stroke="#4c1d95" strokeWidth="2" strokeLinecap="round" />
        </g>
      </svg>
    </motion.div>
  );
};

// 2. Mountain Component
const Cloud = ({ x, y, scale, duration, delay }) => (
  <motion.g
    initial={{ x: -20, opacity: 0 }}
    animate={{
      x: [-20, 120],
      opacity: [0, 0.8, 0.8, 0]
    }}
    transition={{
      duration: duration,
      repeat: Infinity,
      delay: delay,
      ease: "linear",
      repeatDelay: 0
    }}
    style={{ originX: 0.5, originY: 0.5 }}
  >
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      <path d="M 0 0 Q 5 -5 10 0 T 20 0 T 30 0 C 35 0 35 10 30 10 L 0 10 C -5 10 -5 0 0 0" fill="white" opacity="0.6" />
    </g>
  </motion.g>
);

const Mountain = ({ progress }) => {
  // Convert path points to SVG path string for the walking trail
  const pathData = PATH_POINTS.reduce((acc, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    // Simple smooth curve
    const prev = PATH_POINTS[index - 1];
    const cpx1 = (prev.x + point.x) / 2;
    const cpy1 = prev.y;
    const cpx2 = (prev.x + point.x) / 2;
    const cpy2 = point.y;
    return `${acc} C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${point.x} ${point.y}`;
  }, '');

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
      {/* Background Image */}
      <img
        src="/assets/mt0.png"
        alt="Mountain Background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Pink/Purple Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/30 via-pink-800/20 to-purple-900/30" />

      {/* Soft Dark Overlay for better contrast */}
      <div className="absolute inset-0 bg-black/20" />

      <svg
        className="w-full h-full absolute inset-0"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {/* Clouds - Drifting slowly */}
        <Cloud x={10} y={15} scale={0.8} duration={45} delay={0} />
        <Cloud x={40} y={8} scale={1.2} duration={60} delay={5} />
        <Cloud x={-10} y={25} scale={0.6} duration={50} delay={20} />
        <Cloud x={60} y={20} scale={0.9} duration={55} delay={10} />

        {/* The Path Trail (Dashed Line) */}
        <path
          d={pathData}
          fill="none"
          stroke="white"
          strokeWidth="0.8"
          strokeDasharray="2 2"
          opacity="0.6"
        />

        {/* Checkpoints */}
        {JOURNEY_STAGES.map((stage, idx) => {
          // Find rough position for the stage marker based on pathPercentage
          const pt = PATH_POINTS[idx + 1]; // +1 because index 0 is start
          const isActive = progress >= stage.pathPercentage - 0.05;

          return (
            <g key={stage.id} className="transition-all duration-700 ease-in-out">
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isActive ? 2.5 : 1.5}
                fill={isActive ? "#fff" : "rgba(255,255,255,0.4)"}
                className="transition-all duration-500"
              />
              {isActive && (
                <motion.circle
                  cx={pt.x}
                  cy={pt.y}
                  stroke="white"
                  strokeWidth="0.5"
                  fill="none"
                  initial={{ r: 2.5, opacity: 0.8 }}
                  animate={{ r: 8, opacity: 0 }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeOut"
                  }}
                />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// 3. StageCard Component
const StageCard = ({ stage, state }) => {
  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.9,
      height: 0,
      marginBottom: 0,
      pointerEvents: "none"
    },
    active: {
      opacity: 1,
      y: 0,
      scale: 1,
      height: 'auto',
      marginBottom: 24,
      pointerEvents: "auto",
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
        mass: 0.8,
        height: { duration: 0.4 }
      }
    },
    completed: {
      opacity: 0,
      y: 0,
      scale: 0.94,
      height: 'auto',
      marginBottom: 24,
      pointerEvents: "auto",
      filter: "grayscale(40%)",
      transition: { duration: 0.5 }
    }
  };

  // Pulse animation for active card
  const glowVariants = {
    initial: { boxShadow: "0 0 0 rgba(236, 72, 153, 0)" }, // pink-500
    animate: {
      boxShadow: "0 0 25px rgba(236, 72, 153, 0.3)",
      transition: {
        duration: 2.5,
        repeat: Infinity,
        repeatType: "reverse"
      }
    }
  };

  return (
    <motion.div
      layout
      variants={cardVariants}
      initial="hidden"
      animate={state}
      className={`relative p-4 md:p-6 rounded-2xl md:rounded-3xl border border-white/60 backdrop-blur-md overflow-hidden max-w-sm w-full ${stage.color}`}
    >
      {state === 'active' && (
        <motion.div
          className="absolute inset-0 rounded-3xl border-2 border-pink-400/30 pointer-events-none"
          variants={glowVariants}
          initial="initial"
          animate="animate"
        />
      )}

      <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
        <div className="p-1.5 md:p-2 bg-white/70 rounded-full shadow-sm">
          {stage.icon}
        </div>
        <h3 className="text-lg md:text-xl font-display font-bold text-pink-950">{stage.title}</h3>
      </div>

      <p className="text-sm md:text-base text-pink-900/80 leading-relaxed font-sans font-medium">{stage.description}</p>
    </motion.div>
  );
};

// --- MAIN JOURNEY SECTION COMPONENT ---
export const Journey = () => {
  const containerRef = useRef(null);

  // Track scroll progress within the container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Map scroll progress to character position (x, y)
  const pointsX = PATH_POINTS.map(p => p.x);
  const pointsY = PATH_POINTS.map(p => p.y);

  // Create evenly spaced input ranges for the transform based on number of points
  const inputRange = PATH_POINTS.map((_, i) => i / (PATH_POINTS.length - 1));

  const charX = useTransform(scrollYProgress, inputRange, pointsX);
  const charY = useTransform(scrollYProgress, inputRange, pointsY);

  const [currentProgress, setCurrentProgress] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setCurrentProgress(latest);
  });

  return (
    // Reduced height on mobile for better scrolling
    <div ref={containerRef} className="relative h-[500vh] md:h-[800vh] bg-gradient-to-b from-purple-50 to-pink-50">

      {/* Sticky Viewport: This stays fixed while we scroll */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col md:flex-row px-4 sm:px-6 md:px-0">

        {/* Heading - Top Center - Higher z-index and better positioning */}
        <motion.div
          className="absolute top-20 md:top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none text-center"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl lg:text-6xl font-bold text-primary drop-shadow-lg"
          >
            Your Wellness
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl md:text-2xl lg:text-4xl font-bold text-secondary mt-1 md:mt-2 drop-shadow-lg"
          >
            Journey
          </motion.p>
        </motion.div>

        {/* Background Mountain */}
        <Mountain progress={currentProgress} />

        {/* Character */}
        <Character
          x={Number(charX.get())}
          y={Number(charY.get())}
          isMoving={currentProgress > 0.005 && currentProgress < 0.995}
          progress={currentProgress}
        />

        {/* Floating Cards Layer */}
        <div className="absolute inset-0 z-30 pointer-events-none">
          {JOURNEY_STAGES.map((stage, idx) => {
            // Position relative to the checkpoint
            const pt = PATH_POINTS[idx + 1];

            // Trigger point: same as before
            const triggerPoint = stage.pathPercentage - 0.15;
            const nextStage = JOURNEY_STAGES[idx + 1];
            const endPoint = nextStage ? (nextStage.pathPercentage - 0.15) : 1.1;

            let cardState = 'hidden';

            if (currentProgress < triggerPoint) {
              cardState = 'hidden';
            } else if (currentProgress >= triggerPoint && currentProgress < endPoint) {
              cardState = 'active';
            } else {
              cardState = 'completed';
            }

            // Adjust positioning for mobile to avoid title overlap
            const isFirstCard = idx === 0;
            const isLastTwo = idx >= 2;

            return (
              <div
                key={stage.id}
                className={`absolute flex flex-col items-center pointer-events-auto ${isLastTwo ? 'justify-start' : 'justify-end'
                  }`}
                style={{
                  left: `${pt.x}%`,
                  top: `${pt.y}%`,
                  transform: isLastTwo ? 'translate(-50%, 0)' : 'translate(-50%, -100%)',
                  paddingTop: isLastTwo ? (isFirstCard ? '60px' : '50px') : '0',
                  paddingBottom: isLastTwo ? '0' : (isFirstCard ? '60px' : '50px'),
                }}
              >
                <div className="w-[200px] sm:w-[240px] md:w-[280px] lg:w-[320px] max-w-[85vw]">
                  <StageCard
                    stage={stage}
                    state={cardState}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Journey;