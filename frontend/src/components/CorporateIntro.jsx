import React from 'react';
import { motion } from "framer-motion";

export const CorporateIntro = () => {
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
              Partner with MindSettler
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-primary"
          >
            Nurturing well-being <br />
            <span className="text-secondary">in shared spaces</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.7 }}
            className="text-lg md:text-xl text-primary/80 leading-relaxed max-w-xl border-l border-primary/20 pl-6"
          >
            We partner with organizations and communities to foster meaningful
            connection through thoughtful, human-led conversations that support
            healthier environments.
          </motion.p>
        </div>

        {/* RIGHT IMAGE */}
        <div className="w-full md:w-1/2 relative h-[420px] md:h-[520px]">
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9 }}
            className="w-full h-full relative"
          >
            <div className="absolute inset-0 [clip-path:polygon(12%_0%,100%_0%,100%_100%,0%_100%)] overflow-hidden rounded-r-[3.5rem] shadow-2xl">
              <img
                src="/assets/Corporate1.png"
                alt="Corporate well-being"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-primary/20 via-transparent to-transparent" />
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
};
