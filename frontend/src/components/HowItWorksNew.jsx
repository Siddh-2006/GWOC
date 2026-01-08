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
    <div ref={containerRef} className="relative h-[400vh] bg-bg">
      <motion.div
        style={{ backgroundColor }}
        className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden transition-colors duration-700"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-20 relative h-full flex items-center">

          {/* Global Indicators */}
          <div className="absolute left-10 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-6 z-50">
            {stages.map((_, i) => {
              const start = i * 0.25;
              const opacity = useTransform(smoothProgress, [start - 0.1, start, start + 0.15, start + 0.25], [0.3, 1, 1, 0.3]);
              const scale = useTransform(smoothProgress, [start - 0.1, start, start + 0.15, start + 0.25], [0.8, 1.2, 1.2, 0.8]);
              return (
                <motion.div key={i} style={{ opacity, scale }} className="w-2.5 h-2.5 rounded-full bg-primary" />
              );
            })}
          </div>

          <div className="w-full grid md:grid-cols-[1.2fr,1fr] lg:grid-cols-[1fr,0.8fr] items-center gap-16 lg:gap-32 relative z-10">
            {/* CONTENT */}
            <div className="relative min-h-[450px] flex flex-col justify-center">
              {stages.map((stage, i) => {
                const start = i * 0.25;
                const end = (i + 1) * 0.25;
                const opacity = useTransform(smoothProgress, [start, start + 0.05, end - 0.05, end], [0, 1, 1, 0]);
                const y = useTransform(smoothProgress, [start, start + 0.05, end - 0.05, end], [40, 0, 0, -40]);

                return (
                  <motion.div
                    key={i}
                    style={{ opacity, y, position: 'absolute', left: 0, right: 0 }}
                    className="space-y-6 md:space-y-8"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-[2px]" style={{ backgroundColor: stage.accent }} />
                        <span className="font-bold tracking-[0.3em] uppercase text-[10px]" style={{ color: stage.accent }}>
                          Stage {i + 1}
                        </span>
                      </div>
                      <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
                        {stage.subtitle}
                      </h3>
                      <h2 className="text-2xl md:text-3xl lg:text-5xl font-bold tracking-tight text-primary leading-[1.1] max-w-[15ch]">
                        {stage.title}
                      </h2>
                    </div>

                    <div className="p-6 md:p-8 bg-white/50 backdrop-blur-sm rounded-[2rem] border border-white shadow-xl shadow-purple-900/5 max-w-lg">
                      <p className="text-sm md:text-base text-primary/70 leading-relaxed font-medium">
                        {stage.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 group cursor-help">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110" style={{ backgroundColor: stage.accent }}>
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <div>
                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400 mb-0.5">Goal</p>
                        <p className="font-bold text-xs text-primary">{stage.goal}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* IMAGES */}
            <div className="relative aspect-[4/5] md:h-[450px] lg:h-[500px] w-full max-w-[320px] lg:max-w-[380px] ml-auto">
              {stages.map((stage, i) => {
                const start = i * 0.25;
                const end = (i + 1) * 0.25;
                const opacity = useTransform(smoothProgress, [start, start + 0.1, end - 0.1, end], [0, 1, 1, 0]);
                const scale = useTransform(smoothProgress, [start, end], [1.1, 1]);
                const rotate = useTransform(smoothProgress, [start, end], [3, 0]);

                return (
                  <motion.div
                    key={i}
                    style={{ opacity, scale, rotate, position: 'absolute', inset: 0 }}
                    className="overflow-hidden rounded-[2.5rem] shadow-2xl border-4 border-white"
                  >
                    <img src={stage.image} alt={stage.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
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
