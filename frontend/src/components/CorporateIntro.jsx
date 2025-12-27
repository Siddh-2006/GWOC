import React from 'react';

/**
 * Corporate Intro Section
 * Calm headline with mountain/river continuation theme
 * Sets the tone for human-centered, ethical approach
 */
export const CorporateIntro = () => {
  return (
    <section className="min-h-[80vh] corporate-intro-bg flex items-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 corporate-background-pattern"></div>
      <div className="max-w-6xl mx-auto px-8 z-10">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-slate-800 mb-8 leading-tight opacity-0 translate-y-8 fadeInUpDelay">
          Nurturing well-being in shared spaces
        </h1>
        <p className="text-xl text-slate-600 leading-relaxed max-w-2xl opacity-0 translate-y-8 fadeInUpDelayLong">
          Mental well-being flourishes when we create supportive environments together. 
          We partner with organizations, institutions, and communities to foster 
          understanding, connection, and growth through thoughtful, human-led conversations.
        </p>
      </div>
    </section>
  );
};