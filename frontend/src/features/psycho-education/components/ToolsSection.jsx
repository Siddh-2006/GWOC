import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

const ToolsSection = ({ fadeInUp, staggerContainer }) => {
  return (
    <section id="tools" className="py-24 px-6 bg-lavender/10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2 {...fadeInUp} className="text-3xl md:text-5xl font-bold text-primary mb-6">Skills & Coping Tools</motion.h2>
          <motion.p {...fadeInUp} className="text-gray-500 text-lg max-w-2xl mx-auto">Practical empowerment for everyday mental health.</motion.p>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="whileInView"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {[
            { title: "Stress Management Techniques", slug: "stress-management" },
            { title: "Emotional Regulation Basics", slug: "emotional-regulation" },
            { title: "Mindfulness & Grounding", slug: "grounding" },
            { title: "Healthy Boundaries", slug: "boundaries" },
            { title: "Building Self-Confidence", slug: "confidence" }
          ].map((tool, i) => (
            <Link to={`/psycho-education/read/${tool.slug}`} key={i}>
              <motion.div
                variants={fadeInUp}
                className="bg-white/60 backdrop-blur-sm p-8 rounded-[2rem] border border-white hover:border-purple-200 transition-all cursor-pointer flex items-center justify-between group h-full"
              >
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center text-primary">
                    <CheckCircle2 size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-primary">{tool.title}</h3>
                </div>
                <ArrowRight size={20} className="text-gray-300 group-hover:text-secondary group-hover:translate-x-2 transition-all" />
              </motion.div>
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ToolsSection;
