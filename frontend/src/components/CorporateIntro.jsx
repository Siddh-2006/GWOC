import React from 'react';
import { motion } from "framer-motion";

/**
 * Corporate Intro Section
 * Styled to match the HeroSlider component
 */
export const CorporateIntro = () => {
  return (
    <section className="relative h-screen w-full overflow-hidden bg-black select-none">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <motion.img 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, ease: "easeOut" }}
          src="/assets/Corporate1.png" 
          alt="Corporate Well-being" 
          className="w-full h-full object-cover"
        />
        {/* Overlay - Purple/Indigo tint */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/60 via-black/50 to-purple-900/60 backdrop-blur-[2px]"></div>
      </div>

      {/* Content Layer */}
      <div className="absolute inset-0 flex items-center justify-center px-6 md:px-20 lg:px-32 z-20">
        <div className="max-w-5xl text-center text-white space-y-8">
          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight tracking-tight drop-shadow-lg text-pink-300"
          >
            Nurturing well-being <br />
            in shared spaces
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="text-xl md:text-2xl text-white font-light leading-relaxed max-w-3xl mx-auto drop-shadow-md"
          >
            We partner with organizations and communities to foster
            connection through thoughtful, human-led conversations that create
            supportive environments for everyone.
          </motion.p>
        </div>
      </div>
    </section>
  );
};