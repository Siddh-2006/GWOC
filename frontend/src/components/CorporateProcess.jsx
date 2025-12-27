import React, { useEffect, useRef } from 'react';

/**
 * Corporate Process Section
 * Step-by-step explanation of engagement process
 * Vertical scroll storytelling approach
 */
export const CorporateProcess = () => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const stepsRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-x-0');
            entry.target.classList.remove('opacity-0', '-translate-x-8');
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -50px 0px' }
    );

    if (titleRef.current) {
      observer.observe(titleRef.current);
    }

    stepsRef.current.forEach((step, index) => {
      if (step) {
        setTimeout(() => {
          observer.observe(step);
        }, index * 200);
      }
    });

    return () => observer.disconnect();
  }, []);

  const processSteps = [
    {
      number: 1,
      title: 'Reach out',
      description: 'Share your organization\'s context, goals, and what you hope to explore together. We listen carefully to understand your unique needs and environment.'
    },
    {
      number: 2,
      title: 'Context understanding',
      description: 'We have a thoughtful conversation about your community, existing support structures, and what kind of engagement would be most meaningful.'
    },
    {
      number: 3,
      title: 'Session design',
      description: 'Together, we design an approach that fits your setting, timeline, and participants. Every engagement is tailored to your specific context and needs.'
    },
    {
      number: 4,
      title: 'Human-led delivery',
      description: 'Our facilitators create safe, respectful spaces for learning and conversation. All sessions are interactive, educational, and grounded in ethical practice.'
    },
    {
      number: 5,
      title: 'Optional follow-up',
      description: 'If helpful, we can provide resources for continued learning or discuss how to maintain the supportive environment you\'ve begun to create.'
    }
  ];

  return (
    <section className="py-24 px-8 max-w-6xl mx-auto" ref={sectionRef}>
      <h2 
        className="text-4xl font-light text-slate-800 text-center mb-12 opacity-0 translate-y-5 transition-all duration-800 ease-out" 
        ref={titleRef}
      >
        How engagement works
      </h2>
      
      <div className="grid gap-8 mt-12 relative">
        {processSteps.map((step, index) => (
          <div
            key={index}
            className="flex items-start bg-white rounded-2xl p-8 shadow-lg opacity-0 -translate-x-8 transition-all duration-600 ease-out"
            ref={(el) => stepsRef.current[index] = el}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold mr-8 flex-shrink-0">
              {step.number}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">{step.title}</h3>
              <p className="text-slate-600 leading-relaxed">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};