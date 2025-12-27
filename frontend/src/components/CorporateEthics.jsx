import React from 'react';
import { Shield, Lock, HandHeart, HeartHandshake } from 'lucide-react';

/**
 * Corporate Ethics Section
 * Explicit statements about confidentiality and ethical boundaries
 * Visually calm and prominent as required
 */
export const CorporateEthics = () => {
  const ethicsPoints = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'No diagnosis',
      description: 'We provide education and facilitation, never clinical assessment or diagnosis of any kind.'
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: 'No individual reporting',
      description: 'Individual participation and sharing remain confidential. No personal information is reported to organizations.'
    },
    {
      icon: <HandHeart className="w-8 h-8" />,
      title: 'No forced participation',
      description: 'All engagement is voluntary. Participants can choose their level of involvement in discussions and activities.'
    },
    {
      icon: <HeartHandshake className="w-8 h-8" />,
      title: 'Respectful environment',
      description: 'We create safe, non-judgmental spaces where everyone can learn and share at their own comfort level.'
    }
  ];

  return (
    <section className="py-24 px-8 max-w-7xl mx-auto">
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 md:p-16 my-16 text-center shadow-inner">
        <h2 className="text-3xl font-bold text-primary mb-8 relative inline-block">
          Ethics & Confidentiality
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-24 h-1.5 bg-gradient-to-r from-pink-200 to-pink-400 rounded-full"></div>
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
          Our approach is grounded in respect, confidentiality, and ethical practice.
          We believe in creating supportive environments while maintaining clear boundaries.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ethicsPoints.map((point, index) => (
            <div key={index} className="bg-white/60 backdrop-blur-md rounded-[2rem] p-8 border border-white/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-50 rounded-2xl flex items-center justify-center mb-6 text-purple-600 shadow-inner mx-auto md:mx-0">
                {point.icon}
              </div>
              <h3 className="text-xl font-bold text-[#1a2b4b] mb-3 text-center md:text-left">
                {point.title}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed text-center md:text-left">
                {point.description}
              </p>
            </div>
          ))}
        </div>

        {/* <div className="mt-12 p-8 bg-white/60 rounded-xl border border-purple-100 max-w-4xl mx-auto">
          <p className="text-primary italic font-medium">
            "We are facilitators and educators, not therapists or clinicians.
            Our role is to create supportive learning environments, not to provide treatment or clinical services."
          </p>
        </div> */}
      </div>
    </section>
  );
};