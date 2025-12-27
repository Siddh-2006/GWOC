import React from 'react';

/**
 * Corporate Intro Section
 * Calm headline with mountain/river continuation theme
 * Sets the tone for human-centered, ethical approach
 */
export const CorporateIntro = () => {
  return (
    <section className="min-h-[85vh] flex items-center relative overflow-hidden bg-gradient-to-br from-purple-50 via-white to-pink-50">

      <div className="max-w-7xl mx-auto px-8 z-10 relative text-center">
        <div className="inline-block mb-6 px-6 py-2 rounded-full bg-white/50 backdrop-blur-sm border border-white/60 shadow-sm opacity-0 translate-y-4 fadeInUpDelay">
          <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-bold tracking-wide text-sm uppercase">
            MindSettler Corporate Program
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-[#1a2b4b] mb-10 leading-[1.1] tracking-tight opacity-0 translate-y-8 fadeInUpDelay">
          Nurturing well-being <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400">
            in shared spaces
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-slate-600 leading-relaxed max-w-3xl mx-auto opacity-0 translate-y-8 fadeInUpDelayLong font-light">
          We partner with organizations and communities to foster
          connection through thoughtful, human-led conversations that create
          supportive environments for everyone.
        </p>
      </div>
    </section>
  );
};