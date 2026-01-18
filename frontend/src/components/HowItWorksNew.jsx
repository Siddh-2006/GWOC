import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';

const stages = [
  {
    title: "Awareness & Understanding",
    subtitle: "It Starts With Awareness",
    description: "User explores MindSettler, reads psycho-education content in simple, non-judgmental language. Learns that what they’re feeling is valid—reducing fear and building trust.",
    color: "#FDF2F8",
    accent: "#ec4899",
    image: "/assets/how_it_works_1.png",
    goal: "Reduce fear, normalize mental health, build trust"
  },
  {
    title: "Reflection & Readiness",
    subtitle: "Recognizing the Need for Support",
    description: "User reflects on personal challenges, learns about confidentiality and session structure. Gains emotional readiness to take the first step in their journey.",
    color: "#F5F3FF",
    accent: "#8b5cf6",
    image: "/assets/how_it_works_2.png",
    goal: "Convert awareness into emotional readiness"
  },
  {
    title: "Booking & First Session",
    subtitle: "Taking the First Step",
    description: "A smooth transition into guided support. Select your session type, choose a slot, and attend your first 60-minute session in a low-pressure environment.",
    color: "#ECFEFF",
    accent: "#06b6d4",
    image: "/assets/how_it_works_3.png",
    goal: "Smooth, low-pressure transition into guided support"
  },
  {
    title: "Guided Growth & Continuity",
    subtitle: "Moving Forward With Clarity",
    description: "Continued sessions based on individual needs. Structured guidance in a safe environment helps you gain clarity, coping skills, and emotional balance.",
    color: "#F0F9FF",
    accent: "#0ea5e9",
    image: "/assets/how_it_works_4.png",
    goal: "Long-term well-being, not one-time interaction"
  }
];

const DesktopContent = ({ stage, i, smoothProgress, currentStep }) => {
  const stepSize = 1 / stages.length;
  const start = i * stepSize;
  const end = (i + 1) * stepSize;

  const opacity = useTransform(smoothProgress, [start, start + 0.1, end - 0.1, end], [0, 1, 1, 0]);
  const y = useTransform(smoothProgress, [start, start + 0.1], [20, 0]);

  return (
    <motion.div
      style={{ opacity, y, display: currentStep === i ? 'flex' : 'none' }}
      className="absolute inset-0 flex flex-col justify-center text-left space-y-8"
    >
      <div className="space-y-4">
        <div className="inline-flex items-center gap-4 bg-white/40 backdrop-blur-sm px-4 py-2 rounded-full border border-white/60">
          <span className="text-[#Dd1764] font-black text-xs tracking-widest uppercase">
            Stage 0{i + 1}
          </span>
        </div>
        <h3 className="text-5xl font-black text-[#3F2965] leading-[1.1]">
          {stage.title}
        </h3>
        <p className="text-2xl font-medium text-gray-500 italic">
          "{stage.subtitle}"
        </p>
      </div>

      <div className="bg-white/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/80 shadow-[0_20px_50px_rgba(0,0,0,0.05)] max-w-lg">
        <p className="text-xl text-gray-700 leading-relaxed font-medium">
          {stage.description}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-[#Dd1764] flex items-center justify-center text-white shadow-lg shadow-[#Dd1764]/20">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3F2965]/40">Primary Goal</p>
          <p className="text-lg font-bold text-[#3F2965]">{stage.goal}</p>
        </div>
      </div>
    </motion.div>
  );
};

const DesktopImage = ({ stage, i, smoothProgress }) => {
  const stepSize = 1 / stages.length;
  const start = i * stepSize;
  const end = (i + 1) * stepSize;

  const opacity = useTransform(smoothProgress, [start, start + 0.05, end - 0.05, end], [0, 1, 1, 0]);
  const scale = useTransform(smoothProgress, [start, end], [1.1, 0.9]);
  const rotate = useTransform(smoothProgress, [start, end], [5, -5]);

  return (
    <motion.div
      style={{ opacity, scale, rotate }}
      className="absolute inset-0 flex items-center justify-center"
    >
      <div className="relative w-full aspect-[4/5] rounded-[3.5rem] overflow-hidden shadow-[0_40px_100px_rgba(63,41,101,0.15)] border-[12px] border-white bg-white">
        <img
          src={stage.image}
          alt={stage.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#3F2965]/30 via-transparent to-transparent" />
      </div>
    </motion.div>
  );
};

const HowItWorks = () => {
  const containerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 70,
    damping: 40,
    restDelta: 0.001
  });

  // Track current step based on scroll
  useEffect(() => {
    return smoothProgress.onChange((v) => {
      const step = Math.min(Math.floor(v * stages.length), stages.length - 1);
      setCurrentStep(step);
    });
  }, [smoothProgress]);

  return (
    <div ref={containerRef} className="relative h-[300vh] md:h-[400vh] bg-[#FFF0F3]">
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col">

        {/* SECTION TITLE */}
        <div className="absolute top-12 md:top-24 left-0 w-full z-20 px-4 md:px-8">
          <div className="w-full max-w-7xl mx-auto flex justify-between items-center">
            <h2 className="text-2xl md:text-6xl font-black relative inline-block">
              <span className="bg-gradient-to-r from-[#3F2965] to-[#Dd1764] bg-clip-text text-transparent">
                How It Works
              </span>
              <div className="absolute -bottom-2 left-0 w-16 h-1 bg-[#Dd1764] rounded-full hidden md:block"></div>
            </h2>

            {!isMobile && (
              <div className="text-right">
                <span className="text-5xl font-black text-[#3F2965]/10 tabular-nums">
                  0{currentStep + 1}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* MOBILE VIEW LAYOUT */}
        <div className={`relative h-full flex flex-col pt-24 pb-12 px-6 ${!isMobile ? 'hidden' : ''}`}>
          <AnimatePresence mode="wait">
            {stages.map((stage, i) => (
              currentStep === i && (
                <motion.div
                  key={`mobile-step-${i}`}
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -200, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  className="flex-1 flex flex-col gap-6"
                >
                  <div className="text-center">
                    <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#Dd1764]">
                      STEP 0{i + 1} / 0{stages.length}
                    </span>
                    <h3 className="text-xl font-bold text-[#3F2965] mt-1">{stage.title}</h3>
                  </div>

                  <div className="flex-1 min-h-[40vh] relative group">
                    <div className="absolute inset-0 bg-white rounded-[2.5rem] shadow-2xl border-[10px] border-white overflow-hidden transform rotate-2">
                      <img
                        src={stage.image}
                        alt={stage.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#3F2965]/20 to-transparent" />
                    </div>
                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[#Dd1764]/10 rounded-full blur-2xl -z-1" />
                  </div>

                  <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/50 shadow-lg">
                    <p className="text-lg font-black text-[#3F2965] leading-tight mb-2">
                      {stage.subtitle}
                    </p>
                    <p className="text-sm text-gray-600 font-medium">
                      {stage.description}
                    </p>
                  </div>
                </motion.div>
              )
            ))}
          </AnimatePresence>

          <div className="mt-8 flex gap-2 justify-center">
            {stages.map((_, i) => (
              <div
                key={`dot-${i}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${currentStep === i ? 'w-8 bg-[#Dd1764]' : 'w-2 bg-[#3F2965]/20'}`}
              />
            ))}
          </div>
        </div>

        {/* DESKTOP VIEW LAYOUT */}
        <div className={`relative z-10 w-full max-w-7xl mx-auto flex-1 flex items-center pt-32 px-8 ${isMobile ? 'hidden' : ''}`}>
          <div className="w-full grid grid-cols-2 gap-20 items-center">
            <div className="relative h-[60vh] flex flex-col justify-center">
              {stages.map((stage, i) => (
                <DesktopContent
                  key={`content-${i}`}
                  stage={stage}
                  i={i}
                  smoothProgress={smoothProgress}
                  currentStep={currentStep}
                />
              ))}
            </div>

            <div className="relative h-[65vh] flex items-center justify-center">
              {stages.map((stage, i) => (
                <DesktopImage
                  key={`img-${i}`}
                  stage={stage}
                  i={i}
                  smoothProgress={smoothProgress}
                />
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HowItWorks;
