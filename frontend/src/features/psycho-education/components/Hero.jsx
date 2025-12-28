import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
const heroVisual = '/assets/psycho_ed_hero_visual.png';
import { motion } from 'framer-motion';

const Hero = () => {
  return (
    <section className="relative pt-32 pb-24 px-6 md:pt-48 md:pb-40 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-lavender/40 rounded-full blur-[120px] -mr-64 -mt-32" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-pink-soft/20 rounded-full blur-[120px] -ml-64 -mb-32" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
          {/* Left Column: Content */}
          <div className="flex-1 text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-purple-50 shadow-sm mb-8"
            >
              <Sparkles size={16} className="text-secondary" />
              <span className="text-sm font-bold text-primary tracking-wide uppercase">Learning is the first step toward clarity and care</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl lg:text-8xl font-bold text-primary mb-8 tracking-tight"
            >
              Psycho-Education <span className="text-secondary">Hub</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl md:text-2xl text-gray-500 max-w-2xl leading-relaxed mb-12"
            >
              Understand mental health through evidence-based insights, practical tools, and compassionate guidance.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center md:justify-start justify-center gap-6"
            >
              <div className="relative group">
                <div className="absolute inset-0 bg-primary/20 blur-xl group-hover:bg-primary/30 transition-all rounded-full" />
                <a href="#start-here" className="relative btn-primary px-10 py-5 text-lg flex items-center gap-2 shadow-xl shadow-primary/20">
                  Begin Your Exploration <ArrowRight size={20} />
                </a>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Premium Visual */}
          <div className="flex-1 relative w-full max-w-[600px]">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative"
            >
              {/* Visual Glow */}
              <div className="absolute inset-0 bg-secondary/10 blur-[100px] rounded-full scale-75 animate-pulse" />

              {/* The Visual with Edge Merge */}
              <div className="relative p-4">
                <motion.img
                  src={heroVisual}
                  alt="Psycho-Education Visual"
                  className="w-full h-auto drop-shadow-2xl"
                  style={{
                    maskImage: 'radial-gradient(circle, black 50%, transparent 100%)',
                    WebkitMaskImage: 'radial-gradient(circle, black 50%, transparent 100%)'
                  }}
                  animate={{
                    y: [0, -20, 0],
                    rotate: [0, 1, 0, -1, 0]
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
