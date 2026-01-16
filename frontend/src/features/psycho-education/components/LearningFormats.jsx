import React from 'react';
import { motion } from 'framer-motion';
import { Library, Layout } from 'lucide-react';
import { Link } from "react-router-dom";

const LearningFormats = ({ fadeInUp }) => {
  return (
    <section className="py-16 px-6 bg-primary text-white">
      <div className="max-w-4xl mx-auto">
        <motion.h2 {...fadeInUp} className="text-2xl md:text-3xl font-bold mb-10 text-center">
          Explore Library and Resources
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {[
            { label: "Library", icon: <Library />, desc: "Full mental health database", link: "/library" },
            { label: "Resources", icon: <Layout />, desc: "Access guides & tools", link: "/resources" }
          ].map((item, i) => (
            <motion.div
              key={i}
              {...fadeInUp}
              transition={{ delay: i * 0.1 }}
              className="contents"
            >
              <Link
                to={item.link}
                className="p-6 md:p-8 rounded-3xl bg-white/5 hover:bg-white/10 border border-white/10 text-center cursor-pointer group transition-all hover:-translate-y-1 flex items-center gap-6"
              >
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-secondary transition-colors text-white">
                  {React.cloneElement(item.icon, { size: 24 })}
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-bold mb-1">{item.label}</h3>
                  <p className="text-white/40 text-sm leading-tight">{item.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LearningFormats;
