import React from 'react';
import { motion } from 'framer-motion';
import { FileText, PlayCircle, CheckCircle2, HelpCircle } from 'lucide-react';
import { Link } from "react-router-dom";

const LearningFormats = ({ fadeInUp }) => {
  return (
    <section className="py-24 px-6 bg-primary text-white">
      <div className="max-w-7xl mx-auto">
        <motion.h2 {...fadeInUp} className="text-3xl md:text-4xl font-bold mb-16 text-center">How would you like to learn?</motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            { label: "Articles", icon: <FileText />, desc: "Read at your pace", link: "/psycho-education/library" },
            { label: "Short Videos", icon: <PlayCircle />, desc: "Easy to digest", link: "#" },
            { label: "FAQs", icon: <HelpCircle />, desc: "Quick answers", link: "#" }
          ].map((item, i) => (
            <motion.div
              key={i}
              {...fadeInUp}
              transition={{ delay: i * 0.1 }}
              className="contents"
            >
              <Link
                to={item.link}
                className="p-8 rounded-[2.5rem] bg-white/5 hover:bg-white/10 border border-white/10 text-center cursor-pointer group transition-all hover:-translate-y-2 flex flex-col h-full"
              >
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-secondary transition-colors">
                  {React.cloneElement(item.icon, { size: 28 })}
                </div>
                <h3 className="text-xl font-bold mb-2">{item.label}</h3>
                <p className="text-white/40 text-sm tracking-wide">{item.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LearningFormats;
