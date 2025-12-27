import React, { useEffect, useRef } from 'react';

/**
 * Corporate Audience Section
 * Three cards showing who this is for
 * Subtle scroll animations with intersection observer
 */
export const CorporateAudience = () => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0');
            entry.target.classList.remove('opacity-0', 'translate-y-8');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    // Observe title
    if (titleRef.current) {
      observer.observe(titleRef.current);
    }

    // Observe cards with staggered delay
    cardsRef.current.forEach((card, index) => {
      if (card) {
        setTimeout(() => {
          observer.observe(card);
        }, index * 200);
      }
    });

    return () => observer.disconnect();
  }, []);

  const audiences = [
    {
      icon: '🏢',
      title: 'Organizations',
      description: 'Workplaces seeking to create supportive environments where teams can explore well-being, stress management, and healthy communication patterns together.'
    },
    {
      icon: '🎓',
      title: 'Institutions',
      description: 'Educational institutions, healthcare systems, and community centers looking to integrate psycho-educational approaches into their existing support structures.'
    },
    {
      icon: '🌱',
      title: 'Events & Communities',
      description: 'Conferences, retreats, and community gatherings wanting to include meaningful conversations about mental well-being as part of their programming.'
    }
  ];

  return (
    <section className="py-24 px-8 max-w-6xl mx-auto" ref={sectionRef}>
      <h2 
        className="text-4xl font-light text-slate-800 text-center mb-12 opacity-0 translate-y-5 transition-all duration-800 ease-out" 
        ref={titleRef}
      >
        Who we work with
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
        {audiences.map((audience, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-10 shadow-lg transition-all duration-600 ease-out opacity-0 translate-y-8 border border-slate-100 hover:-translate-y-2 hover:shadow-2xl"
            ref={(el) => cardsRef.current[index] = el}
          >
            <div className="w-15 h-15 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 text-2xl text-white">
              {audience.icon}
            </div>
            <h3 className="text-2xl font-medium text-slate-800 mb-4">
              {audience.title}
            </h3>
            <p className="text-slate-600 leading-relaxed">
              {audience.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};