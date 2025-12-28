import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Briefcase, Users, MessageCircle, Sparkles } from 'lucide-react';

const LifeAreas = ({ fadeInUp }) => {
  return (
    <section className="py-24 px-6 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto relative">
        <div className="flex flex-col md:flex-row gap-16 items-center">
          <div className="w-full md:w-1/2">
            <motion.h2 {...fadeInUp} className="text-3xl md:text-5xl font-bold text-primary mb-8 leading-tight">
              Contextual Paths for Your <span className="text-secondary italic">Life Areas</span>
            </motion.h2>
            <div className="grid gap-4">
              {[
                { title: "Student Mental Health", icon: <GraduationCap /> },
                { title: "Work & Career Stress", icon: <Briefcase /> },
                { title: "Relationships & Family", icon: <Users /> },
                { title: "Social Anxiety", icon: <MessageCircle /> },
                { title: "Digital Well-Being", icon: <Sparkles /> }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  {...fadeInUp}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center justify-between p-6 rounded-3xl bg-off-white hover:bg-purple-50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-primary/40 group-hover:text-primary transition-colors">
                      {React.cloneElement(item.icon, { size: 24 })}
                    </div>
                    <span className="text-xl font-bold text-gray-700">{item.title}</span>
                  </div>
                  <div className="px-4 py-1 text-xs font-bold bg-white text-secondary rounded-full border border-purple-50">
                    LEARN
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          <div className="w-full md:w-1/2 relative h-[500px] flex items-center justify-center">
            <div className="absolute inset-0 bg-lavender/20 rounded-[4rem] rotate-3" />
            <div className="absolute inset-4 bg-white rounded-[3.5rem] shadow-2xl flex flex-col p-12 overflow-hidden">
              <div className="w-12 h-1.5 bg-purple-100 rounded-full mb-8" />
              <h4 className="text-2xl font-bold text-primary mb-6">Curated Learning Path</h4>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-1 bg-secondary rounded-full" />
                  <div>
                    <p className="text-sm font-bold text-secondary mb-1 uppercase tracking-wider">Step 1</p>
                    <p className="text-lg text-primary font-medium">Identifying Stressors in your specific environment</p>
                  </div>
                </div>
                <div className="flex gap-4 opacity-50">
                  <div className="w-1 bg-gray-200 rounded-full" />
                  <div>
                    <p className="text-sm font-bold text-gray-300 mb-1 uppercase tracking-wider">Step 2</p>
                    <p className="text-lg text-primary font-medium">Building personalized boundary systems</p>
                  </div>
                </div>
                <div className="flex gap-4 opacity-30">
                  <div className="w-1 bg-gray-200 rounded-full" />
                  <div>
                    <p className="text-sm font-bold text-gray-200 mb-1 uppercase tracking-wider">Step 3</p>
                    <p className="text-lg text-primary font-medium">Reframing the work-life emotional balance</p>
                  </div>
                </div>
              </div>
              <div className="mt-auto pt-8 border-t border-purple-50">
                <p className="text-gray-400 text-sm italic">Complete collections tailored for where you are in life.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LifeAreas;
