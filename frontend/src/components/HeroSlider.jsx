import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";

const slides = [
  {
    title: "Understand Your Mind",
    subtitle: "A Calm Space to Begin",
    desc: "MindSettler offers confidential psycho-education sessions that help you understand emotions and life patterns—without judgment.",
    image: "/assets/landing1.jpg",
    gradient: "from-indigo-900/50 via-purple-900/30 to-transparent",
  },
  {
    title: "You Are Not Alone",
    subtitle: "Empathy Comes First",
    desc: "Through structured conversations and compassionate listening, we help you feel heard, understood, and supported.",
    image: "/assets/landing2.jpg",
    gradient: "from-indigo-900/50 via-purple-900/30 to-transparent",
  },
  {
    title: "Your Journey, Your Pace",
    subtitle: "Personalized Sessions",
    desc: "Each 60-minute session is designed around your needs—offering clarity, awareness, and emotional grounding.",
    image: "/assets/landing3.jpg",
   gradient: "from-indigo-900/50 via-purple-900/30 to-transparent",
  },
  {
    title: "Start With a Conversation",
    subtitle: "No Pressure. No Judgment.",
    desc: "You don’t need to have everything figured out. We’re here to listen and guide you gently forward.",
    image: "/assets/landing4.jpg",
   gradient: "from-indigo-900/50 via-purple-900/30 to-transparent",
  },
];

const SLIDE_DURATION = 8000; // Reduced slightly for better UX

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const timerRef = useRef(null);

  // --- Logic: Navigation ---
  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  // --- Logic: Autoplay ---
  useEffect(() => {
    timerRef.current = setInterval(nextSlide, SLIDE_DURATION);
    return () => clearInterval(timerRef.current);
  }, [nextSlide]);

  const resetTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(nextSlide, SLIDE_DURATION);
  };

  // --- Interaction: Wheel/Scroll Navigation ---
  const handleWheel = (e) => {
    if (Math.abs(e.deltaX) > 50) { // Detect horizontal scroll
      if (e.deltaX > 0) nextSlide();
      else prevSlide();
      resetTimer();
    }
  };

  // --- Interaction: Drag/Swipe Navigation ---
  const onDragEnd = (event, info) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold) {
      nextSlide();
    } else if (info.offset.x > swipeThreshold) {
      prevSlide();
    }
    setTimeout(() => setIsDragging(false), 100);
    resetTimer();
  };

  return (
    <section
      className="relative h-screen w-full overflow-hidden bg-black select-none"
      onWheel={handleWheel}
      aria-roledescription="carousel"
      aria-label="MindSettler Hero Highlights"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={current}
          className="absolute inset-0 cursor-grab active:cursor-grabbing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={onDragEnd}
        >
          {/* Background Image & SEO Optimized Alt Tags */}
          <motion.img
            src={slides[current].image}
            alt={`${slides[current].title} - ${slides[current].subtitle}`}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, ease: "linear" }}
            className="h-full w-full object-cover pointer-events-none"
          />
          <div className={`absolute inset-0 bg-gradient-to-r ${slides[current].gradient}`} />
          <div className="absolute inset-0 bg-black/40" />
        </motion.div>
      </AnimatePresence>

      {/* Content Container */}
      <div className="relative z-10 flex h-full items-center px-4 sm:px-6 md:px-12 lg:px-16 xl:px-20 pointer-events-none">
        <div className="w-full max-w-xl sm:max-w-2xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl pointer-events-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
            >
              <header>
                <p className="text-white uppercase tracking-widest text-[0.625rem] sm:text-xs md:text-sm lg:text-base font-bold mb-2 sm:mb-3 md:mb-4">
                  {slides[current].subtitle}
                </p>
                <h1 className="text-pink-400 font-bold text-4xl md:text-7xl leading-tight mb-6">
                  {slides[current].title}
                </h1>
              </header>

              <p className="text-gray-200 text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl mb-6 sm:mb-7 md:mb-8 leading-relaxed">
                {slides[current].desc}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button className="group bg-white text-gray-900 px-6 py-3 sm:px-8 sm:py-4 rounded-full font-bold text-sm sm:text-base md:text-lg flex items-center justify-center gap-2 hover:bg-blue-50 transition-all active:scale-95 shadow-lg">
              Book Your First Session
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition" />
            </button>

            <button className="border-2 border-white/80 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-full font-bold text-sm sm:text-base md:text-lg hover:bg-white hover:text-gray-900 transition-all active:scale-95">
              Learn How It Works
            </button>
          </div>
        </div>
      </div>

      {/* Manual Navigation Controls */}
      <div className="absolute bottom-6 sm:bottom-8 md:bottom-10 left-0 right-0 px-4 sm:px-6 md:px-12 lg:px-16 xl:px-20 flex justify-between items-end z-20">
        <div className="flex gap-1.5 sm:gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => { setCurrent(idx); resetTimer(); }}
              className={`h-1 sm:h-1.5 transition-all duration-500 rounded-full ${
                idx === current ? "w-8 sm:w-10 md:w-12 bg-white" : "w-3 sm:w-4 bg-white/30 hover:bg-white/50"
                }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>


      </div>
    </section>
  );
};

export default HeroSlider;