import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const heroVisual = '/assets/psycho_ed_hero_visual.png';

const Hero = () => {
  return (
    <section className="relative bg-bg overflow-hidden py-28">
      {/* Soft background accents */}
      <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-pink-100/25 rounded-full blur-[120px] -mr-44 -mt-44" />
      <div className="absolute bottom-0 left-0 w-[420px] h-[420px] bg-purple-100/25 rounded-full blur-[120px] -ml-44 -mb-44" />

      <div className="container mx-auto px-6 lg:px-20 flex flex-col md:flex-row items-center gap-20 relative z-10">
        {/* LEFT CONTENT */}
        <div className="w-full md:w-1/2 space-y-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="flex items-center gap-4"
          >
            <div className="w-10 h-[2px] bg-pink-500" />
            <span className="text-secondary font-semibold tracking-[0.35em] uppercase text-xs">
              Psycho-Education Hub
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-primary"
          >
            Psycho-Education <br />
            <span className="text-secondary">Hub</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.7 }}
            className="text-lg md:text-xl text-primary/80 leading-relaxed max-w-xl border-l border-primary/20 pl-6"
          >
            Understand mental health through evidence-based insights, practical tools, and compassionate guidance.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            <button
              onClick={() => document.getElementById('start-here').scrollIntoView({ behavior: 'smooth' })}
              className="px-9 py-4 bg-[#1a1831] text-white font-bold rounded-2xl shadow-xl shadow-pink-100 hover:bg-primary transition-all flex items-center gap-4 group text-[10px] tracking-[0.3em] uppercase"
            >
              BEGIN YOUR EXPLORATION
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </button>
          </motion.div>
        </div>

        {/* RIGHT VISUAL */}
        <div className="flex-1 relative w-full max-w-[480px] hidden md:block">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative"
          >
            {/* Visual Glow */}
            <div className="absolute inset-0 bg-secondary/5 blur-[80px] rounded-full scale-75" />

            {/* The Visual with Edge Merge */}
            <div className="relative p-2 text-center">
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
    </section>
  );
};

export default Hero;
