import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import JourneyScene from './JourneyScene';

gsap.registerPlugin(ScrollTrigger);

const stages = [
  {
    id: 1,
    title: "Arrival",
    subtitle: "Above the Clouds",
    text: "Clarity begins by simply arriving. No pressure, just a moment to breathe.",
    color: "text-sky-900"
  },
  {
    id: 2,
    title: "Awareness",
    subtitle: "The Landscape Appears",
    text: "The fog lifts. Understanding your emotions shapes the mountains ahead.",
    color: "text-slate-800"
  },
  {
    id: 3,
    title: "Exploration",
    subtitle: "Following the River",
    text: "Curiosity flows like a river. Explore ideas and reflections at your own pace.",
    color: "text-teal-900"
  },
  {
    id: 4,
    title: "Connection",
    subtitle: "Crossing the Valley",
    text: "A bridge connects where you are to where you wish to be. Conversations bring clarity.",
    color: "text-amber-900"
  },
  {
    id: 5,
    title: "Support",
    subtitle: "Reaching the Ground",
    text: "A stable place to land. Confidential, gentle, and paced by you.",
    cta: "Book a Session",
    color: "text-stone-900"
  }
];

const Journey = () => {
  const containerRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top", // Start tracking when container hits top of viewport
        end: "bottom bottom",
        scrub: 0.5, // Smooth scrubbing
        onUpdate: (self) => setScrollProgress(self.progress)
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative h-[500vh] bg-stone-50 overflow-hidden">
      {/* 
        The Scene (Fixed Background) 
        It covers the viewport and animating based on scrollProgress 
      */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <JourneyScene scrollProgress={scrollProgress} />
      </div>

      {/* 
        The Content (Scrollable Overlay) 
        Stages are positioned absolutely or relatively within the tall container
        to match the visual "checkpoints" of the journey.
      */}
      <div className="absolute inset-0 w-full pointer-events-none">
        {stages.map((stage, index) => (
          <div
            key={stage.id}
            className="absolute w-full flex justify-center items-center p-6 text-center"
            style={{
              top: `${15 + (index * 20)}%`, // Distribute stages at 15%, 35%, 55%, 75%, 95%
              height: '20vh'
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ margin: "-100px", once: false, amount: 0.5 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`max-w-xl p-8 rounded-3xl backdrop-blur-md bg-white/60 border border-white/50 shadow-xl pointer-events-auto ${stage.color}`}
            >
              <span className="block text-xs font-bold tracking-[0.2em] uppercase mb-3 opacity-70">
                0{stage.id} — {stage.subtitle}
              </span>
              <h3 className="text-3xl md:text-5xl font-serif mb-4">{stage.title}</h3>
              <p className="text-lg leading-relaxed font-light opacity-90">{stage.text}</p>

              {stage.cta && (
                <button className="mt-6 px-8 py-3 bg-stone-800 text-white rounded-full text-sm font-medium tracking-wide hover:bg-stone-900 transition-transform hover:scale-105 active:scale-95">
                  {stage.cta}
                </button>
              )}
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Journey;
