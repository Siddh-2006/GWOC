import React from 'react';

/**
 * Corporate Ethics Section
 * Explicit statements about confidentiality and ethical boundaries
 * Visually calm and prominent as required
 */
export const CorporateEthics = () => {
  const ethicsPoints = [
    {
      icon: '🔒',
      title: 'No diagnosis',
      description: 'We provide education and facilitation, never clinical assessment or diagnosis of any kind.'
    },
    {
      icon: '📋',
      title: 'No individual reporting',
      description: 'Individual participation and sharing remain confidential. No personal information is reported to organizations.'
    },
    {
      icon: '🤝',
      title: 'No forced participation',
      description: 'All engagement is voluntary. Participants can choose their level of involvement in discussions and activities.'
    },
    {
      icon: '🌿',
      title: 'Respectful environment',
      description: 'We create safe, non-judgmental spaces where everyone can learn and share at their own comfort level.'
    }
  ];

  return (
    <section className="py-24 px-8 max-w-6xl mx-auto">
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl p-16 my-16 text-center">
        <h2 className="text-3xl font-medium text-slate-800 mb-8">
          Ethics & Confidentiality
        </h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
          Our approach is grounded in respect, confidentiality, and ethical practice. 
          We believe in creating supportive environments while maintaining clear boundaries.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-8">
          {ethicsPoints.map((point, index) => (
            <div key={index} className="bg-white rounded-xl p-8 shadow-sm">
              <div className="text-3xl mb-4">
                {point.icon}
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                {point.title}
              </h3>
              <p className="text-slate-600 font-medium">
                {point.description}
              </p>
            </div>
          ))}
        </div>
        
        <div className="mt-12 p-8 bg-indigo-50 rounded-xl border border-indigo-200">
          <p className="text-slate-600 italic text-center">
            "We are facilitators and educators, not therapists or clinicians. 
            Our role is to create supportive learning environments, not to provide treatment or clinical services."
          </p>
        </div>
      </div>
    </section>
  );
};