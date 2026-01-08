import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { MapPin, CheckCircle, Circle, ArrowDown } from 'lucide-react';
import { format } from 'date-fns';

const JourneyNode = ({ entry, index, isLast, isFirst }) => {
  const isEven = index % 2 === 0;
  
  return (
    <div className={`relative flex items-center justify-center mb-24 w-full ${isEven ? 'flex-row' : 'flex-row-reverse'}`}>
      {/* Center Line Connection Point */}
      <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center z-10">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          style={{ 
            borderRadius: isEven ? '60% 40% 30% 70% / 60% 30% 70% 40%' : '30% 70% 70% 40% / 30% 30% 60% 40%' 
          }}
          className={`w-6 h-6 ${isLast ? 'bg-[#Dd1764] shadow-[0_0_20px_rgba(221,23,100,0.6)]' : 'bg-[#3F2965]'}`}
        >
          {isLast && (
             <motion.div 
               animate={{ scale: [1, 1.5, 1], opacity: [0.7, 0, 0.7] }}
               transition={{ repeat: Infinity, duration: 2 }}
               className="absolute inset-0 bg-[#Dd1764] rounded-full -z-10"
               style={{ borderRadius: 'inherit' }}
             />
          )}
        </motion.div>
      </div>

      {/* Content Card */}
      <motion.div
        initial={{ opacity: 0, x: isEven ? -50 : 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className={`w-5/12 ${isEven ? 'text-right pr-8' : 'text-left pl-8'}`}
      >
        <div className="glass-premium p-6 hover:translate-y-[-4px] transition-transform duration-300">
          <div className={`flex items-center gap-2 mb-2 ${isEven ? 'justify-end' : 'justify-start'}`}>
            <span className="text-xs font-bold tracking-wider text-purple-600 uppercase bg-purple-50 px-2 py-1 rounded-md">
              Step {index + 1}
            </span>
            <span className="text-xs text-gray-400">
              {format(new Date(entry.timestamp || new Date()), 'MMM d, yyyy')}
            </span>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2 font-serif">{entry.title}</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{entry.description}</p>
          {entry.adminRemarks && (
             <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-purple-600 italic">"{entry.adminRemarks}"</p>
             </div>
          )}
        </div>
      </motion.div>
      
      {/* Spacer for the other side */}
      <div className="w-5/12" />
    </div>
  );
};

const MyJourney = ({ journeyData, loading }) => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const pathLength = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  if (loading) {
    return (
       <div className="flex justify-center items-center py-20">
         <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
       </div>
    );
  }

  if (!journeyData || !journeyData.entries || journeyData.entries.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
           <MapPin className="text-purple-300" size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-400">Your journey is just beginning.</h3>
        <p className="text-gray-400 mt-2">Milestones will appear here as you progress.</p>
      </div>
    );
  }

  // Sort entries by date (newest last for a timeline flow down)
  // Assuming API might return them in varying orders, let's keep it as is or sort.
  // Generally "Journey" flows downwards, so first step at top.
  const entries = [...journeyData.entries].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  return (
    <div ref={containerRef} className="relative py-12 px-4 md:px-0 max-w-4xl mx-auto overflow-hidden">
       {/* The Winding Path SVG */}
       <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none z-0">
         <svg
           width="100%"
           height="100%"
           viewBox="0 0 100 1000" // Requires dynamic height logic for perfection, but simplified here
           fill="none"
           xmlns="http://www.w3.org/2000/svg"
           preserveAspectRatio="none"
           className="opacity-20"
         >
           <motion.path
             d="M50,0 C50,100 20,150 20,250 C20,350 80,400 80,500 C80,600 20,650 20,750 C20,850 50,900 50,1000"
             stroke="#3F2965"
             strokeWidth="4"
             fill="none"
             style={{ pathLength }}
           />
           {/* Static background path for reference */}
           <path
             d="M50,0 C50,100 20,150 20,250 C20,350 80,400 80,500 C80,600 20,650 20,750 C20,850 50,900 50,1000"
             stroke="#E5E7EB"
             strokeWidth="4"
             strokeDasharray="10 10"
             fill="none"
           />
         </svg>
       </div>

      <div className="relative z-10 pb-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-serif font-bold text-gray-800">Your Growth Journey</h2>
          <p className="text-gray-500 mt-2 max-w-lg mx-auto">Every step forward is a victory. Here is your visualized path of progress.</p>
        </div>

        {entries.map((entry, index) => (
          <JourneyNode
            key={entry._id || index}
            entry={entry}
            index={index}
            isFirst={index === 0}
            isLast={index === entries.length - 1}
          />
        ))}

        {/* Future path indicator */}
        <div className="flex justify-center mt-4">
           <motion.div 
             animate={{ y: [0, 10, 0] }}
             transition={{ repeat: Infinity, duration: 2 }}
             className="text-purple-300 flex flex-col items-center"
            >
              <div className="h-12 w-0.5 bg-gradient-to-b from-purple-200 to-transparent mb-2"></div>
              <ArrowDown size={20} />
           </motion.div>
        </div>
      </div>
    </div>
  );
};

export default MyJourney;
