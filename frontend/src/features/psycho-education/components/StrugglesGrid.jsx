import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Compass, Moon, GraduationCap, Coffee } from 'lucide-react';
import { Link } from 'react-router-dom';

const StrugglesGrid = ({ fadeInUp, staggerContainer }) => {
  return (
    <section id="struggles" className="py-24 px-6 bg-peach-light/30">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <motion.div {...fadeInUp} className="max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-bold text-primary mb-6">Common Struggles</h2>
            <p className="text-gray-500 text-lg">We use human language, not clinical labels. Understanding why you feel this way is the first step.</p>
          </motion.div>
          <motion.div {...fadeInUp}>
            {/* Dynamic link to the Full Library */}
            <Link to="/psycho-education/library" className="text-primary font-bold border-b-2 border-primary pb-1 hover:text-secondary hover:border-secondary transition-colors">
              View All Topics
            </Link>
          </motion.div>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="whileInView"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {[
            { title: "Stress & Burnout", slug: "stress-burnout", desc: "Feeling overwhelmed by life's demands and constant 'doing'.", icon: <Zap />, bg: "bg-amber-50" },
            { title: "Anxiety & Constant Worry", slug: "anxiety", desc: "When the 'what-ifs' keep you from enjoying the present.", icon: <Compass />, bg: "bg-indigo-50" },
            { title: "Low Mood & Exhaustion", slug: "low-mood", desc: "Dealing with a heavy heart and reduced emotional energy.", icon: <Moon />, bg: "bg-blue-50" },
            { title: "Exam / Performance Pressure", slug: "performance-pressure", desc: "Managing expectations and the fear of falling short.", icon: <GraduationCap />, bg: "bg-emerald-50" },
            { title: "Sleep Difficulties", slug: "sleep-issues", desc: "When rest feels out of reach despite being tired.", icon: <Coffee />, bg: "bg-rose-50" }
          ].map((card, i) => (
            <Link
              to={`/psycho-education/read/${card.slug}`}
              key={i}
              className="contents"
            >
              <motion.div
                variants={fadeInUp}
                className="p-10 rounded-[2.5rem] border border-transparent hover:border-purple-100 transition-all hover:shadow-xl bg-white group cursor-pointer h-full"
              >
                <div className={`w-16 h-16 rounded-3xl ${card.bg} flex items-center justify-center mb-8 group-hover:rotate-12 transition-transform`}>
                  {React.cloneElement(card.icon, { size: 32, className: "text-primary/70" })}
                </div>
                <h3 className="text-2xl font-bold text-primary mb-4">{card.title}</h3>
                <p className="text-gray-500 leading-relaxed mb-8">{card.desc}</p>
                <button className="w-full py-4 border border-purple-50 rounded-2xl font-bold text-primary hover:bg-primary hover:text-white transition-all">
                  Understand This Better
                </button>
              </motion.div>
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default StrugglesGrid;
