import React from 'react';
import { Briefcase, BookOpen, Calendar, CheckCircle2, XCircle } from 'lucide-react';

export const CorporateOfferings = () => {
  const offerings = [
    {
      icon: <Briefcase className="w-6 h-6" />,
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
      icon: <BookOpen className="w-6 h-6" />,
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
      icon: <Calendar className="w-6 h-6" />,
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
    <section className="bg-slate-50 py-24 px-6 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-[#1a2b4b] text-center mb-24 relative">
          What We Offer
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-24 h-1.5 bg-gradient-to-r from-pink-200 to-pink-400 rounded-full"></div>
        </h2>

        <div className="relative flex flex-col items-center pb-24">
          {offerings.map((offering, index) => (
            <div
              key={index}
              style={{
                top: `${100 + index * 30}px`,
                zIndex: (index + 1) * 10,
              }}
              className="sticky w-full mb-24 bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden transition-transform duration-500"
            >
              {/* Card Header with Gradient */}
              <div className="flex items-center p-8 md:p-10 bg-gradient-to-r from-purple-100 via-pink-50 to-pink-100 border-b border-slate-100/50">
                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center mr-6 text-purple-600 shrink-0 border border-purple-100">
                  {offering.icon}
                </div>
                <h3 className="text-2xl md:text-4xl font-bold text-slate-800 tracking-tight">
                  {offering.title}
                </h3>
              </div>

              {/* Card Content */}
              <div className="p-8 md:p-12">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
                  {/* WHAT WE PROVIDE */}
                  <div className="bg-emerald-50/30 rounded-3xl p-8 border border-emerald-100/50">
                    <h4 className="text-sm font-bold tracking-widest text-emerald-600 uppercase flex items-center gap-3 mb-6">
                      <CheckCircle2 className="w-5 h-5" />
                      What we provide
                    </h4>
                    <ul className="space-y-4">
                      {offering.what.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-slate-700 text-lg leading-relaxed font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2.5 shrink-0 opacity-60"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* WHAT WE DON'T PROVIDE */}
                  <div className="bg-rose-50/30 rounded-3xl p-8 border border-rose-100/50">
                    <h4 className="text-sm font-bold tracking-widest text-rose-500 uppercase flex items-center gap-3 mb-6">
                      <XCircle className="w-5 h-5" />
                      What we don't provide
                    </h4>
                    <ul className="space-y-4">
                      {offering.whatNot.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-slate-500 italic text-lg leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-300 mt-2.5 shrink-0 opacity-60"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};