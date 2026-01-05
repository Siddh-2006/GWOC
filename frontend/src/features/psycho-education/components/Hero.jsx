import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
const heroVisual = '/assets/psycho_ed_hero_visual.png';
import { motion } from 'framer-motion';

const Hero = () => {
  return (
    <section className="relative pt-20 pb-16 px-6 md:pt-24 md:pb-28 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-lavender/30 rounded-full blur-[100px] -mr-48 -mt-24" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-pink-soft/15 rounded-full blur-[100px] -ml-48 -mb-24" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
          {/* Left Column: Content */}
          <div className="flex-1 text-center md:text-left">
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl lg:text-7xl font-bold text-primary mb-6 tracking-tight leading-[1.1]"
            >
              Psycho-Education <span className="text-secondary">Hub</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg md:text-xl text-gray-500 max-w-xl leading-relaxed mb-8"
            >
              Understand mental health through evidence-based insights, practical tools, and compassionate guidance.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center md:justify-start justify-center gap-4"
            >
              <div className="relative group">
                <div className="absolute inset-0 bg-primary/15 blur-lg group-hover:bg-primary/25 transition-all rounded-full" />
                <a href="#start-here" className="relative btn-primary px-8 py-4 text-base flex items-center gap-2 shadow-lg shadow-primary/15">
                  Begin Your Exploration <ArrowRight size={18} />
                </a>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Premium Visual */}
          <div className="flex-1 relative w-full max-w-[480px]">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative"
            >
              {/* Visual Glow */}
              <div className="absolute inset-0 bg-secondary/5 blur-[80px] rounded-full scale-75" />

              {/* The Visual with Edge Merge */}
              <div className="relative p-2">
                <motion.img
                  src={heroVisual}
                  alt="Psycho-Education Visual"
                  className="w-full h-auto drop-shadow-xl"
                  style={{
                    maskImage: 'radial-gradient(circle, black 50%, transparent 100%)',
                    WebkitMaskImage: 'radial-gradient(circle, black 50%, transparent 100%)'
                  }}
                  animate={{
                    y: [0, -12, 0],
                    rotate: [0, 0.5, 0, -0.5, 0]
                  }}
                  transition={{
                    duration: 8,
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
