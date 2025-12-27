import React, { useEffect, useRef } from 'react';

/**
 * Corporate Offerings Section
 * What we offer vs what we don't offer
 * Clear ethical boundaries and expectations
 */
export const CorporateOfferings = () => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const offeringsRef = useRef([]);

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

    if (titleRef.current) {
      observer.observe(titleRef.current);
    }

    offeringsRef.current.forEach((offering, index) => {
      if (offering) {
        setTimeout(() => {
          observer.observe(offering);
        }, index * 300);
      }
    });

    return () => observer.disconnect();
  }, []);

  const offerings = [
    {
      icon: '💼',
      title: 'Workplace Workshops',
      what: [
        'Facilitated conversations about stress and resilience',
        'Psycho-educational sessions on mental well-being',
        'Team discussions on healthy communication',
        'Workshops on work-life balance and boundaries'
      ],
      whatNot: [
        'Individual therapy or counseling',
        'Clinical assessments or diagnoses',
        'Crisis intervention services',
        'Guaranteed productivity improvements'
      ]
    },
    {
      icon: '📚',
      title: 'Institutional Psycho-Education',
      what: [
        'Educational sessions on mental health awareness',
        'Training for staff on supportive communication',
        'Workshops on creating inclusive environments',
        'Guidance on developing well-being policies'
      ],
      whatNot: [
        'Clinical training or certification',
        'Individual treatment recommendations',
        'Legal or policy compliance advice',
        'Replacement for professional mental health services'
      ]
    },
    {
      icon: '🌟',
      title: 'Event-Based Sessions',
      what: [
        'Mindful conversation circles at conferences',
        'Well-being workshops at retreats',
        'Community discussions on mental health',
        'Educational presentations on psycho-education'
      ],
      whatNot: [
        'Entertainment or performance services',
        'Individual consultations during events',
        'Crisis support at events',
        'Medical or clinical presentations'
      ]
    }
  ];

  return (
    <section className="py-24 px-8 max-w-6xl mx-auto" ref={sectionRef}>
      <h2 
        className="text-4xl font-light text-slate-800 text-center mb-12 opacity-0 translate-y-5 transition-all duration-800 ease-out" 
        ref={titleRef}
      >
        What we offer
      </h2>
      
      <div className="grid gap-12 mt-12">
        {offerings.map((offering, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-12 shadow-lg opacity-0 translate-y-8 transition-all duration-600 ease-out"
            ref={(el) => offeringsRef.current[index] = el}
          >
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mr-4 text-xl text-white">
                {offering.icon}
              </div>
              <h3 className="text-2xl font-medium text-slate-800">
                {offering.title}
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-6 bg-emerald-50 rounded-xl border-l-4 border-emerald-500">
                <h4 className="font-semibold mb-4 text-emerald-700">What we provide</h4>
                <ul className="space-y-2">
                  {offering.what.map((item, idx) => (
                    <li key={idx} className="text-slate-600 leading-relaxed">• {item}</li>
                  ))}
                </ul>
              </div>
              
              <div className="p-6 bg-red-50 rounded-xl border-l-4 border-red-500">
                <h4 className="font-semibold mb-4 text-red-700">What we don't provide</h4>
                <ul className="space-y-2">
                  {offering.whatNot.map((item, idx) => (
                    <li key={idx} className="text-slate-600 leading-relaxed">• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};