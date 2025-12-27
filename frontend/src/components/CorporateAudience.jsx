import React, { useEffect, useRef } from 'react';
import { Building2, GraduationCap, Users } from 'lucide-react';

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
      icon: <Building2 className="w-8 h-8" />,
      title: 'Organizations',
      description: 'Workplaces seeking to create supportive environments where teams can explore well-being, stress management, and healthy communication patterns together.'
    },
    {
      icon: <GraduationCap className="w-8 h-8" />,
      title: 'Institutions',
      description: 'Educational institutions, healthcare systems, and community centers looking to integrate psycho-educational approaches into their existing support structures.'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Events & Communities',
      description: 'Conferences, retreats, and community gatherings wanting to include meaningful conversations about mental well-being as part of their programming.'
    }
  ];

  return (
    <section className="py-24 px-8 max-w-7xl mx-auto" ref={sectionRef}>
      <h2
        className="text-3xl md:text-5xl font-bold text-primary text-center mb-16 opacity-0 translate-y-5 transition-all duration-800 ease-out relative"
        ref={titleRef}
      >
        Who We Work With
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-1.5 bg-gradient-to-r from-pink-200 to-pink-400 rounded-full"></div>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
        {audiences.map((audience, index) => (
          <div
            key={index}
            className="group relative p-10 bg-white rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all duration-500 ease-out hover:-translate-y-2 border border-slate-100 overflow-hidden"
            ref={(el) => cardsRef.current[index] = el}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="relative z-10">
              <div className="w-20 h-20 bg-purple-50 rounded-2xl flex items-center justify-center mb-8 text-purple-600 group-hover:scale-110 group-hover:bg-purple-100 transition-all duration-300 shadow-sm">
                {audience.icon}
              </div>
              <h3 className="text-2xl font-bold text-[#1a2b4b] mb-4 tracking-tight">
                {audience.title}
              </h3>
              <p className="text-slate-500 leading-relaxed text-lg">
                {audience.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};