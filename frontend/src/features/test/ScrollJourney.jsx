import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

const stages = [
  {
    title: "The Beginning",
    description: "Your journey starts here. A moment of reflection and quiet understanding as we prepare for what's ahead.",
    color: "#F3E8FF", // Lavender
    accent: "#3F2965", // Primary Purple
    image: "/assets/Corporate1.png"
  },
  {
    title: "Finding Clarity",
    description: "As we move forward, the path becomes clearer. We identify the core areas that need our attention and care.",
    color: "#FFF5F8", // Soft Pink/BG
    accent: "#Dd1764", // Secondary Pink
    image: "/assets/landing-hero.jpg"
  },
  {
    title: "Building Connection",
    description: "Growth happens through shared experiences. We learn to navigate our shared spaces with empathy and respect.",
    color: "#FDF2F8", // Light Rose
    accent: "#F44A8C", // Pink Light
    image: "/assets/landing4.jpg"
  },
  {
    title: "Lasting Harmony",
    description: "The destination is just a new beginning. We've built the foundations for a sustainable and supportive environment.",
    color: "#FAFAFA", // Off White
    accent: "#1a1a1a", // Dark
    image: "/assets/Corporate1.png"
  }
];

const ScrollJourney = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Background color interpolation
  const backgroundColor = useTransform(
    smoothProgress,
    [0, 0.33, 0.66, 1],
    stages.map(s => s.color)
  );

  return (
    <div ref={containerRef} className="relative h-[400vh]">
      {/* Sticky Viewport */}
      <motion.div
        style={{ backgroundColor }}
        className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden transition-colors duration-700"
      >
        <div className="container mx-auto px-6 lg:px-20 relative h-full flex items-center">

          {/* Progress Indicator */}
          <div className="absolute left-10 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-8 z-50">
            {stages.map((_, i) => {
              const opacity = useTransform(smoothProgress, [i * 0.25, i * 0.25 + 0.1, (i + 1) * 0.25 - 0.1, (i + 1) * 0.25], [0.3, 1, 1, 0.3]);
              const scale = useTransform(smoothProgress, [i * 0.25, i * 0.25 + 0.1, (i + 1) * 0.25 - 0.1, (i + 1) * 0.25], [1, 1.2, 1.2, 1]);
              return (
                <motion.div
                  key={i}
                  style={{ opacity, scale }}
                  className="w-3 h-3 rounded-full bg-primary"
                />
              );
            })}
          </div>

          <div className="w-full h-full flex flex-col md:flex-row items-center gap-12 lg:gap-20">
            {/* CONTENT OVERLAY */}
            <div className="w-full md:w-1/2 relative z-20">
              {stages.map((stage, i) => {
                const start = i * 0.25;
                const end = (i + 1) * 0.25;
                const opacity = useTransform(smoothProgress, [start, start + 0.05, end - 0.05, end], [0, 1, 1, 0]);
                const y = useTransform(smoothProgress, [start, start + 0.05, end - 0.05, end], [40, 0, 0, -40]);

                return (
                  <motion.div
                    key={i}
                    style={{ opacity, y, position: i === 0 ? 'relative' : 'absolute', top: i === 0 ? 'auto' : 0 }}
                    className="space-y-8 pointer-events-none md:pointer-events-auto"
                  >
                    <div className="space-y-4">
                      <span
                        className="font-bold tracking-[0.4em] uppercase text-xs"
                        style={{ color: stage.accent }}
                      >
                        Stage 0{i + 1}
                      </span>
                      <h2
                        className="text-5xl md:text-7xl lg:text-8xl font-black leading-tight tracking-tighter"
                        style={{ color: stage.accent }}
                      >
                        {stage.title}
                      </h2>
                    </div>
                    <p className="text-xl md:text-2xl font-light leading-relaxed max-w-xl italic opacity-70">
                      {stage.description}
                    </p>
                    <button
                      className="px-10 py-4 rounded-full text-lg font-bold transition-all duration-500 text-white"
                      style={{ backgroundColor: stage.accent }}
                    >
                      Explore Stage
                    </button>
                  </motion.div>
                );
              })}
            </div>

            {/* IMAGE OVERLAY */}
            <div className="w-full md:w-1/2 relative h-[400px] md:h-[600px]">
              {stages.map((stage, i) => {
                const start = i * 0.25;
                const end = (i + 1) * 0.25;
                const opacity = useTransform(smoothProgress, [start, start + 0.05, end - 0.05, end], [0, 1, 1, 0]);
                const scale = useTransform(smoothProgress, [start, end], [1.1, 1]);
                const rotate = useTransform(smoothProgress, [start, end], [5, 0]);

                return (
                  <motion.div
                    key={i}
                    style={{ opacity, scale, rotate, position: 'absolute', inset: 0 }}
                    className="overflow-hidden rounded-[3rem] shadow-2xl"
                  >
                    <img
                      src={stage.image}
                      alt={stage.title}
                      className="w-full h-full object-cover"
                    />
                    <div
                      className="absolute inset-0 opacity-20"
                      style={{ backgroundColor: stage.accent }}
                    ></div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <motion.div
          style={{ scaleX: smoothProgress }}
          className="absolute bottom-0 left-0 right-0 h-1.5 bg-primary origin-left z-50"
        />
      </motion.div>
    </div>
  );
};

export default ScrollJourney;
