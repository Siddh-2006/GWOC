import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Flag, Mountain, Waves, Sun, Compass, Sparkles } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import JourneyCanvas from './JourneyScene';

gsap.registerPlugin(ScrollTrigger);

const Journey = () => {
  const containerRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const steps = [
    {
      title: "Self-Awareness",
      desc: "Begin by understanding your emotional landscape and identifying triggers.",
      status: "completed",
      icon: <Sun className="text-pink-500" />
    },
    {
      title: "Navigating Growth",
      desc: "Identify behavioral patterns and build a structured roadmap for change.",
      status: "current",
      icon: <Compass className="text-purple-600" />
    },
    {
      title: "Resilient Mindset",
      desc: "Implement evidence-based tools to handle life's challenges with clarity.",
      status: "upcoming",
      icon: <Mountain className="text-purple-400" />
    },
    {
      title: "Sustainable Peace",
      desc: "Establish long-term habits for emotional well-being and consistent growth.",
      status: "upcoming",
      icon: <Sparkles className="text-pink-400" />
    }
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top center",
        end: "bottom center",
        scrub: true,
        onUpdate: (self) => setScrollProgress(self.progress)
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative py-32 bg-purple-50/30 overflow-hidden">
      {/* Background Section-Specific Canvas */}
      <JourneyCanvas scrollProgress={scrollProgress} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-24">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-secondary font-bold tracking-widest uppercase text-sm mb-4 block"
          >
            The Path Forward
          </motion.span>
          <h2 className="text-4xl md:text-6xl font-bold text-primary mb-6">Your Wellness Journey</h2>
          <p className="text-gray-600 text-xl max-w-2xl mx-auto">
            A step-by-step transition from confusion to clarity, guided by licensed expertise.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative group"
            >
              <div className={`p-10 h-full rounded-[2rem] border transition-all duration-500 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-xl hover:-translate-y-2 ${step.status === 'current' ? 'border-secondary ring-1 ring-secondary/20' : 'border-purple-100 hover:border-purple-200'
                }`}>
                <div className="mb-8 p-4 w-fit rounded-2xl bg-purple-50 group-hover:bg-purple-100 transition-colors">
                  {step.icon}
                </div>
                <h3 className="text-2xl font-bold text-primary mb-4">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed mb-8">
                  {step.desc}
                </p>

                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${step.status === 'completed' ? 'bg-primary' :
                      step.status === 'current' ? 'bg-secondary animate-pulse' :
                        'bg-gray-200'
                    }`} />
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                    {step.status}
                  </span>
                </div>
              </div>

              {/* Linking Line for Desktop */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-[25%] -right-4 w-8 h-px bg-purple-200" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Journey;
