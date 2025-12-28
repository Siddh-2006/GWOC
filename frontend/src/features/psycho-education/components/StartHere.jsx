import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Target, HelpCircle, Shield, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const StartHere = ({ fadeInUp, staggerContainer }) => {
  return (
    <section id="start-here" className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div {...fadeInUp} className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-primary mb-6">New here? Start here.</h2>
          <p className="text-gray-500 text-lg">First steps towards understanding your mental well-being.</p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="whileInView"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {[
            { title: "What Is Mental Health?", slug: "what-is-mental-health", desc: "Dispelling complexity and understanding balance.", icon: <Brain />, color: "bg-blue-50 text-blue-500" },
            { title: "Mental Health: Myths vs Facts", slug: "myths-vs-facts", desc: "Separator truth from common misconceptions.", icon: <Target />, color: "bg-green-50 text-green-500" },
            { title: "When Should You Seek Support?", slug: "when-to-seek-support", desc: "Learning to listen to what your mind needs.", icon: <HelpCircle />, color: "bg-purple-50 text-purple-500" },
            { title: "Self-Care vs Therapy", slug: "self-care-vs-therapy", desc: "Understanding the role of daily maintenance.", icon: <Shield />, color: "bg-pink-50 text-pink-500" }
          ].map((card, i) => (
            <Link
              to={`/psycho-education/read/${card.slug}`}
              key={i}
            >
              <motion.div
                variants={fadeInUp}
                className="hub-card group cursor-pointer h-full"
              >
                <div className={`w-14 h-14 ${card.color} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                  {React.cloneElement(card.icon, { size: 28 })}
                </div>
                <h3 className="text-2xl font-bold text-primary mb-4">{card.title}</h3>
                <p className="text-gray-500 leading-relaxed mb-6">{card.desc}</p>
                <span className="text-sm font-bold text-secondary flex items-center gap-2 group-hover:gap-3 transition-all">
                  Read Path <ArrowRight size={16} />
                </span>
              </motion.div>
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default StartHere;
