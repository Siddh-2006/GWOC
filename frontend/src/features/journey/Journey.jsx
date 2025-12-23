import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Flag } from 'lucide-react';

const Journey = () => {
  const steps = [
    {
      title: "Awareness",
      desc: "Recognizing the need for support and exploring mental health concepts in simple language.",
      status: "completed"
    },
    {
      title: "Taking the First Step",
      desc: "Booking your 60-minute introductory session to discuss your path ahead.",
      status: "current"
    },
    {
      title: "Guided Sessions",
      desc: "Participating in structured online or offline sessions tailored to your needs.",
      status: "upcoming"
    },
    {
      title: "Ongoing Support",
      desc: "Continuous guidance and resources to maintain your mental well-being.",
      status: "upcoming"
    },
    {
      title: "Clarity & Growth",
      desc: "Reaching a state of better understanding and navigated life challenges.",
      status: "upcoming"
    }
  ];

  return (
    <section className="py-24 bg-purple-50/50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-primary mb-6">Your Wellness Journey</h2>
          <p className="text-gray-600 text-lg">We move step-by-step through a structured path toward clarity.</p>
        </div>

        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-purple-200 rounded-full" />

          <div className="space-y-12">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`relative flex items-center justify-between ${index % 2 === 0 ? 'flex-row-reverse' : ''}`}
              >
                {/* Content */}
                <div className="w-[45%]">
                  <div className={`p-6 rounded-3xl bg-white shadow-xl border border-purple-100 ${step.status === 'current' ? 'ring-2 ring-secondary' : ''}`}>
                    <h4 className="text-xl font-bold text-primary mb-2">{step.title}</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </div>

                {/* Dot / Icon */}
                <div className="absolute left-1/2 transform -translate-x-1/2 z-10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${step.status === 'completed' ? 'bg-primary text-white' :
                      step.status === 'current' ? 'bg-secondary text-white' :
                        'bg-white text-purple-300'
                    }`}>
                    {step.status === 'completed' ? <CheckCircle2 size={20} /> :
                      step.status === 'current' ? <Circle size={18} className="animate-pulse fill-current" /> :
                        <Flag size={18} />}
                  </div>
                </div>

                {/* Empty space for balance */}
                <div className="w-[45%]" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Journey;
