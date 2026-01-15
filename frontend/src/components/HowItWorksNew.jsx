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
    stiffness: 70,
    damping: 40,
    restDelta: 0.001
  });

  return (
    <div ref={containerRef} className="relative h-[400vh] bg-white">
      {/* 
         Restored height to 400vh and larger padding/width as requested
      */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col px-4 md:px-8">

        {/* SECTION TITLE - Absolute positioning, Left Aligned */}
        <div className="absolute top-16 left-0 w-full z-20 px-8">
          <div className="w-full max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-black relative mb-4 inline-block">
              <span className="bg-gradient-to-r from-primary via-purple-light to-primary bg-clip-text text-transparent pb-2">
                How It Works
              </span>
              <div className="absolute -bottom-4 left-0 w-24 h-1.5 bg-gradient-to-r from-secondary to-pink-400 rounded-full"></div>
            </h2>
          </div>
        </div>

        {/* DYNAMIC BACKGROUND LAYER */}
        <div className="absolute inset-0 z-0">
          {stages.map((stage, i) => {
            const stepSize = 1 / stages.length;
            const start = i * stepSize;
            const end = (i + 1) * stepSize;

            // Custom Opacity Logic to prevent white space at start/end
            let outputRange = [0, 1, 1, 0];
            let inputRange = [start, start + 0.1, end - 0.1, end];

            if (i === 0) {
              // First item: Visible from the very start
              inputRange = [0, end - 0.1, end];
              outputRange = [1, 1, 0];
            } else if (i === stages.length - 1) {
              // Last item: Stays visible until the very end
              inputRange = [start, start + 0.1, 1];
              outputRange = [0, 1, 1];
            }

            const opacity = useTransform(smoothProgress, inputRange, outputRange);

            return (
              <motion.div
                key={`bg-${i}`}
                style={{ opacity }}
                className="absolute inset-0 w-full h-full"
              >
                <img
                  src={stage.image}
                  alt=""
                  className="w-full h-full object-cover blur-2xl scale-105 opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-pink-50/70 to-purple-50/80"></div>
                <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px]"></div>
              </motion.div>
            );
          })}
        </div>


        {/* CONTENT CONTAINER - Shifted down */}
        <div className="relative z-10 w-full max-w-7xl mx-auto flex-1 flex items-center justify-center pt-24">
          <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">

            {/* LEFT SIDE: CONTENT */}
            <div className="relative h-[40vh] md:h-[50vh] flex flex-col justify-center order-2 lg:order-1">
              {stages.map((stage, i) => {
                const stepSize = 1 / stages.length;
                const start = i * stepSize;
                const end = (i + 1) * stepSize;

                // Sync Content Opacity with Background Logic
                let outputRange = [0, 1, 1, 0];
                let inputRange = [start, start + 0.05, end - 0.05, end];

                if (i === 0) {
                  inputRange = [0, end - 0.05, end];
                  outputRange = [1, 1, 0];
                } else if (i === stages.length - 1) {
                  inputRange = [start, start + 0.05, 1];
                  outputRange = [0, 1, 1];
                }

                const opacity = useTransform(smoothProgress, inputRange, outputRange);
                const x = useTransform(smoothProgress, [start, start + 0.1, end - 0.1, end], [-30, 0, 0, -30]);
                const pointerEvents = useTransform(opacity, value => value > 0.5 ? 'auto' : 'none');

                return (
                  <motion.div
                    key={`content-${i}`}
                    style={{ opacity, x, pointerEvents }}
                    className="absolute inset-0 flex flex-col justify-center text-left"
                  >
                    <div className="space-y-4 max-w-xl">
                      {/* Step Indicator */}
                      <div className="flex items-center gap-3">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: 30 }}
                          transition={{ duration: 0.8 }}
                          className="h-1 rounded-full"
                          style={{ backgroundColor: stage.accent }}
                        />
                        <span className="font-bold tracking-widest uppercase text-xs md:text-sm" style={{ color: stage.accent }}>
                          Step 0{i + 1}
                        </span>
                      </div>

                      {/* Headings - Restored sizes */}
                      <div className="space-y-1">
                        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 leading-[1.1] tracking-tight">
                          {stage.title}
                        </h2>
                        <h3 className="text-lg md:text-2xl font-medium text-gray-500/90">
                          {stage.subtitle}
                        </h3>
                      </div>

                      {/* Description Box - Restored sizes */}
                      <div className="p-5 md:p-6 bg-white/50 backdrop-blur-xl rounded-[1.5rem] border border-white/60 shadow-lg shadow-purple-500/5">
                        <p className="text-base md:text-lg text-gray-700 leading-relaxed font-medium">
                          {stage.description}
                        </p>
                      </div>

                      {/* Objective Pill */}
                      <div className="inline-flex items-center gap-3 pt-2">
                        <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full text-white shadow-xl shadow-purple-900/10 transform hover:scale-110 transition-transform duration-300" style={{ backgroundColor: stage.accent }}>
                          <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Key Objective</p>
                          <p className="text-base md:text-lg font-bold text-gray-800">{stage.goal}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* RIGHT SIDE: IMAGES - Restored Sizes */}
            <div className="hidden lg:flex relative h-[35vh] md:h-[45vh] lg:h-[60vh] items-center justify-center order-1 lg:order-2">
              {stages.map((stage, i) => {
                const stepSize = 1 / stages.length;
                const start = i * stepSize;
                const end = (i + 1) * stepSize;

                // Sync Image Opacity with Background Logic
                let outputRange = [0, 1, 1, 0];
                let inputRange = [start, start + 0.05, end - 0.05, end];

                if (i === 0) {
                  inputRange = [0, end - 0.05, end];
                  outputRange = [1, 1, 0];
                } else if (i === stages.length - 1) {
                  inputRange = [start, start + 0.05, 1];
                  outputRange = [0, 1, 1];
                }

                const opacity = useTransform(smoothProgress, inputRange, outputRange);
                const scale = useTransform(smoothProgress, [start, end], [1.05, 0.95]);
                const rotate = useTransform(smoothProgress, [start, end], [2, -1]);
                const y = useTransform(smoothProgress, [start, end], [30, 0]);


                return (
                  <motion.div
                    key={`img-${i}`}
                    style={{ opacity, scale, rotate, y }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    {/* Compact Image Container */}
                    <div className="relative w-full max-w-sm md:max-w-md aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl border-[8px] border-white/80 bg-white">
                      <img
                        src={stage.image}
                        alt={stage.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                  </motion.div>
                );
              })}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
