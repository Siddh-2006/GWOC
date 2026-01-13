import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

const stages = [
  {
    title: "Awareness & Understanding",
    subtitle: "It Starts With Awareness",
    description: "User explores MindSettler, reads psycho-education content in simple, non-judgmental language. Learns that what they’re feeling is valid—reducing fear and building trust.",
    color: "#FDF2F8", // pink-50
    accent: "#ec4899", // pink-500
    image: "/assets/how_it_works_1.png",
    goal: "Reduce fear, normalize mental health, build trust"
  },
  {
    title: "Reflection & Readiness",
    subtitle: "Recognizing the Need for Support",
    description: "User reflects on personal challenges, learns about confidentiality and session structure. Gains emotional readiness to take the first step in their journey.",
    color: "#F5F3FF", // purple-50
    accent: "#8b5cf6", // purple-500
    image: "/assets/how_it_works_2.png",
    goal: "Convert awareness into emotional readiness"
  },
  {
    title: "Booking & First Session",
    subtitle: "Taking the First Step",
    description: "A smooth transition into guided support. Select your session type, choose a slot, and attend your first 60-minute session in a low-pressure environment.",
    color: "#ECFEFF", // cyan-50
    accent: "#06b6d4", // cyan-500
    image: "/assets/how_it_works_3.png",
    goal: "Smooth, low-pressure transition into guided support"
  },
  {
    title: "Guided Growth & Continuity",
    subtitle: "Moving Forward With Clarity",
    description: "Continued sessions based on individual needs. Structured guidance in a safe environment helps you gain clarity, coping skills, and emotional balance.",
    color: "#F0F9FF", // sky-50
    accent: "#0ea5e9", // sky-500
    image: "/assets/how_it_works_4.png",
    goal: "Long-term well-being, not one-time interaction"
  }
];

const HowItWorks = () => {
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

  const backgroundColor = useTransform(
    smoothProgress,
    [0, 0.33, 0.66, 1],
    stages.map(s => s.color)
  );

  return (
    <div ref={containerRef} className="relative h-[400vh]">
      <motion.div
        style={{ backgroundColor }}
        className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden transition-colors duration-700"
      >
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 h-full flex items-center justify-center">

          <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* LEFT SIDE: CONTENT */}
            <div className="relative h-[50vh] flex flex-col justify-center order-2 lg:order-1">
              {stages.map((stage, i) => {
                // strict isolation of ranges to prevent overlap
                const stepSize = 1 / stages.length; // 0.25
                const start = i * stepSize;
                const end = (i + 1) * stepSize;

                // Content fades in slightly later and fades out slightly earlier to avoid overlap
                const opacity = useTransform(
                  smoothProgress,
                  [start, start + 0.05, end - 0.05, end],
                  [0, 1, 1, 0]
                );

                const y = useTransform(
                  smoothProgress,
                  [start, start + 0.1, end - 0.1, end],
                  [50, 0, 0, -50]
                );

                // Only render if we are roughly in the window (optimization)
                // Note: pure CSS opacity handles visibility, but pointer-events control interaction
                const pointerEvents = useTransform(opacity, value => value > 0.5 ? 'auto' : 'none');

                return (
                  <motion.div
                    key={i}
                    style={{ opacity, y, pointerEvents }}
                    className="absolute inset-0 flex flex-col justify-center text-left"
                  >
                    <div className="space-y-6 max-w-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-1 rounded-full" style={{ backgroundColor: stage.accent }} />
                        <span className="font-bold tracking-widest uppercase text-xs" style={{ color: stage.accent }}>
                          Step 0{i + 1}
                        </span>
                      </div>

                      <div className="space-y-4">
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                          {stage.title}
                        </h2>
                        <h3 className="text-lg font-medium text-gray-400">
                          {stage.subtitle}
                        </h3>
                      </div>

                      <div className="p-6 bg-white/60 backdrop-blur-md rounded-2xl border border-white/50 shadow-sm">
                        <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                          {stage.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 pt-2">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full text-white shadow-lg shadow-purple-900/10" style={{ backgroundColor: stage.accent }}>
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Objective</p>
                          <p className="font-semibold text-gray-800">{stage.goal}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* RIGHT SIDE: IMAGES */}
            <div className="relative h-[50vh] lg:h-[60vh] flex items-center justify-center order-1 lg:order-2">
              {stages.map((stage, i) => {
                const stepSize = 1 / stages.length;
                const start = i * stepSize;
                const end = (i + 1) * stepSize;

                const opacity = useTransform(
                  smoothProgress,
                  [start, start + 0.05, end - 0.05, end],
                  [0, 1, 1, 0]
                );

                const scale = useTransform(smoothProgress, [start, end], [1.05, 1]);
                const rotate = useTransform(smoothProgress, [start, end], [2, 0]);

                return (
                  <motion.div
                    key={i}
                    style={{ opacity, scale, rotate }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="relative w-full max-w-md aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white bg-white">
                      <img
                        src={stage.image}
                        alt={stage.title}
                        className="w-full h-full object-cover transform transition-transform duration-700 hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-60" />
                    </div>
                  </motion.div>
                );
              })}
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default HowItWorks;
