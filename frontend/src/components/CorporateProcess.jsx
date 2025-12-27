
import React, { useEffect, useRef, useState } from 'react';

/**
 * Corporate Process Section
 * sticky split-screen design
 * Left: Giant changing number
 * Right: Scrolling content cards
 */
export const CorporateProcess = () => {
  const [activeStep, setActiveStep] = useState(0);
  const sectionRef = useRef(null);
  const stepsRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Get the index from the data-index attribute
            const index = parseInt(entry.target.getAttribute('data-index'));
            setActiveStep(index);
          }
        });
      },
      {
        threshold: 0.5, // Trigger when 50% visible
        rootMargin: "-20% 0px -20% 0px" // Focus on the center area of screen
      }
    );

    stepsRef.current.forEach((step) => {
      if (step) observer.observe(step);
    });

    return () => observer.disconnect();
  }, []);

  const processSteps = [
    {
      number: '01',
      title: 'Reach out',
      description: 'Share your organization\'s context, goals, and what you hope to explore together. We listen carefully to understand your unique needs and environment.'
    },
    {
      number: '02',
      title: 'Context understanding',
      description: 'We have a thoughtful conversation about your community, existing support structures, and what kind of engagement would be most meaningful.'
    },
    {
      number: '03',
      title: 'Session design',
      description: 'Together, we design an approach that fits your setting, timeline, and participants. Every engagement is tailored to your specific context and needs.'
    },
    {
      number: '04',
      title: 'Human-led delivery',
      description: 'Our facilitators create safe, respectful spaces for learning and conversation. All sessions are interactive, educational, and grounded in ethical practice.'
    },
    {
      number: '05',
      title: 'Optional follow-up',
      description: 'If helpful, we can provide resources for continued learning or discuss how to maintain the supportive environment you\'ve begun to create.'
    }
  ];

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto min-h-screen" ref={sectionRef}>
      <h2 className="text-4xl md:text-5xl font-bold text-[#1a2b4b] text-center mb-24 md:mb-32 relative">
        How Engagement Works
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-24 h-1.5 bg-gradient-to-r from-pink-200 to-pink-400 rounded-full"></div>
      </h2>

      <div className="flex flex-col md:flex-row gap-12 md:gap-24">
        {/* LEFT COLUMN: Sticky Indicator */}
        <div className="md:w-1/3 relative">
          <div className="sticky top-40 flex flex-col items-center md:items-start transition-all duration-500">
            {/* The Giant Number */}
            <div className="relative mb-8">
              <span className="text-[8rem] md:text-[10rem] lg:text-[12rem] font-bold leading-none bg-gradient-to-br from-purple-600 to-pink-400 bg-clip-text text-transparent opacity-20 select-none absolute top-0 left-0 blur-xl transform scale-110">
                {processSteps[activeStep].number}
              </span>
              <span className="relative text-[8rem] md:text-[10rem] lg:text-[12rem] font-bold leading-none bg-gradient-to-br from-[#1a2b4b] to-[#2a4b7c] bg-clip-text text-transparent select-none transition-all duration-300">
                {processSteps[activeStep].number}
              </span>
            </div>

            {/* Progress Label */}
            <div className="hidden md:block">
              <p className="text-slate-400 font-medium tracking-[0.2em] uppercase mb-2">
                Step {activeStep + 1} of {processSteps.length}
              </p>
              <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden w-32">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ease-out"
                  style={{ width: `${((activeStep + 1) / processSteps.length) * 100}% ` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Scrolling Content */}
        <div className="md:w-2/3 space-y-32 md:space-y-48 pb-24">
          {processSteps.map((step, index) => (
            <div
              key={index}
              data-index={index}
              ref={(el) => stepsRef.current[index] = el}
              className={`transition - all duration - 700 ${activeStep === index
                ? 'opacity-100 translate-x-0 scale-100'
                : 'opacity-40 translate-x-8 scale-95'
                } `}
            >
              <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 relative overflow-hidden group hover:shadow-2xl transition-shadow duration-500">
                <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -mr-32 -mt-32 transition-colors duration-500 group-hover:bg-purple-50/50"></div>

                <h3 className="text-3xl font-bold text-[#1a2b4b] mb-6 relative z-10">
                  {step.title}
                </h3>
                <p className="text-slate-500 text-lg leading-loose relative z-10">
                  {step.description}
                </p>

                {/* Mobile-only number (in case sticky left doesn't fit well on small screens, though we handled visual hierarchy) */}
                <div className="md:hidden mt-6 pt-6 border-t border-slate-100">
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                    Step {step.number}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};