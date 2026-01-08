import React, { useMemo, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import {
  MapPin,
  CheckCircle,
  Circle,
  ArrowDown,
  Sprout,
  Shield,
  Calendar,
  Trophy,
  BookOpen,
  Heart,
  Target,
  MessageSquare,
  Star
} from 'lucide-react';
import { format } from 'date-fns';

// Default Foundation Milestones - Phase 1
const DEFAULT_FOUNDATION = [
  {
    id: 'foundation-1',
    step: 1,
    title: "Taking the First Step",
    insight: "The most significant part of any journey is the decision to begin. You are here because you've chosen to prioritize your mental well-being.",
    type: 'foundation',
    phase: 'The Arrival',
    timestamp: new Date().toISOString()
  },
  {
    id: 'foundation-2',
    step: 2,
    title: "Defining Your Path",
    insight: "Awareness is the beginning of healing. This phase is about observing your thoughts without judgment.",
    type: 'foundation',
    phase: 'The Intent',
    timestamp: new Date().toISOString()
  },
  {
    id: 'foundation-3',
    step: 3,
    title: "Our Commitment",
    insight: "Your journey here is private and protected. We move at your pace, in your time.",
    type: 'foundation',
    phase: 'The Safe Space',
    timestamp: new Date().toISOString()
  }
];

const FoundationNode = ({ entry, index, isLast, hasAdminEntries }) => {
  const isEven = index % 2 === 0;

  return (
    <div className={`relative flex items-center justify-center mb-16 w-full ${isEven ? 'flex-row' : 'flex-row-reverse'}`}>
      {/* Center Line Connection Point */}
      <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center z-10">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: index * 0.2 }}
          className={`w-6 h-6 rounded-lg flex items-center justify-center ${isLast && !hasAdminEntries
              ? 'bg-[#Dd1764] shadow-lg'
              : 'bg-[#3F2965]'
            }`}
        >
          <Sprout className="w-3 h-3 text-white" />
          {isLast && !hasAdminEntries && (
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 bg-[#Dd1764] rounded-lg -z-10"
            />
          )}
        </motion.div>
      </div>

      {/* Foundation Card */}
      <motion.div
        initial={{ opacity: 0, x: isEven ? -30 : 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
        className={`w-5/12 ${isEven ? 'text-right pr-6' : 'text-left pl-6'}`}
      >
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-all duration-300">
          <div className={`flex items-center gap-2 mb-3 ${isEven ? 'justify-end' : 'justify-start'}`}>
            <span className="text-xs font-semibold tracking-wide text-[#3F2965] bg-[#3F2965]/10 px-3 py-1 rounded-md">
              Step {entry.step}
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">{entry.title}</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{entry.insight}</p>
        </div>
      </motion.div>

      {/* Spacer for the other side */}
      <div className="w-5/12" />
    </div>
  );
};

const AdminJourneyNode = ({ entry, sessionNumber, index, isLast }) => {
  const isEven = index % 2 === 0;

  const safeEntry = {
    _id: entry._id || '',
    title: entry.title || 'Untitled Entry',
    description: entry.description || '',
    type: entry.type || 'session_summary',
    entryDate: entry.entryDate || entry.timestamp || new Date().toISOString(),
    content: {
      summary: entry.content?.summary || entry.adminRemarks || ''
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'milestone': return <Trophy className="w-3 h-3 text-white" />;
      case 'session_summary': return <BookOpen className="w-3 h-3 text-white" />;
      case 'achievement': return <Star className="w-3 h-3 text-white" />;
      case 'reflection': return <Heart className="w-3 h-3 text-white" />;
      case 'goal_set': return <Target className="w-3 h-3 text-white" />;
      case 'admin_note': return <MessageSquare className="w-3 h-3 text-white" />;
      default: return <BookOpen className="w-3 h-3 text-white" />;
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  return (
    <div className={`relative flex items-center justify-center mb-16 w-full ${isEven ? 'flex-row' : 'flex-row-reverse'}`}>
      {/* Center Line Connection Point */}
      <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center z-10">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className={`w-6 h-6 rounded-lg flex items-center justify-center ${isLast
              ? 'bg-[#Dd1764] shadow-lg'
              : 'bg-[#3F2965]'
            }`}
        >
          {getTypeIcon(safeEntry.type)}
          {isLast && (
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 bg-[#Dd1764] rounded-lg -z-10"
            />
          )}
        </motion.div>
      </div>

      {/* Admin Entry Card */}
      <motion.div
        initial={{ opacity: 0, x: isEven ? -30 : 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className={`w-5/12 ${isEven ? 'text-right pr-6' : 'text-left pl-6'}`}
      >
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-all duration-300">
          <div className={`flex items-center gap-2 mb-3 ${isEven ? 'justify-end' : 'justify-start'}`}>
            <span className="text-xs font-semibold tracking-wide text-[#3F2965] bg-[#3F2965]/10 px-3 py-1 rounded-md">
              Session {sessionNumber}
            </span>
            <span className="text-xs text-gray-500">
              {formatDate(safeEntry.entryDate)}
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">{safeEntry.title}</h3>

          {safeEntry.description && (
            <p className="text-sm text-gray-600 mb-3 leading-relaxed">{safeEntry.description}</p>
          )}

          {safeEntry.content.summary && (
            <p className="text-sm text-gray-600 leading-relaxed">{safeEntry.content.summary}</p>
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

  const safeJourneyData = journeyData || { entries: [] };

  // Combine foundation and admin entries with continuous numbering
  const combinedTimeline = useMemo(() => {
    const adminEntries = safeJourneyData.entries || [];
    const hasAdminEntries = adminEntries.length > 0;

    return {
      foundation: DEFAULT_FOUNDATION,
      adminEntries: adminEntries.map((entry, index) => ({
        ...entry,
        sessionNumber: index + 1 // Session 1, 2, 3...
      })),
      hasAdminEntries,
      totalEntries: DEFAULT_FOUNDATION.length + adminEntries.length
    };
  }, [safeJourneyData.entries]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative py-12 px-4 md:px-0 max-w-4xl mx-auto overflow-hidden">
      {/* The Winding Path SVG */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none z-0">
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 100 ${Math.max(1000, combinedTimeline.totalEntries * 300)}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="opacity-20"
        >
          <motion.path
            d={`M50,0 C50,100 20,150 20,250 C20,350 80,400 80,500 C80,600 20,650 20,750 C20,850 50,900 50,${Math.max(1000, combinedTimeline.totalEntries * 300)}`}
            stroke="#3F2965"
            strokeWidth="4"
            fill="none"
            style={{ pathLength }}
          />
          {/* Static background path for reference */}
          <path
            d={`M50,0 C50,100 20,150 20,250 C20,350 80,400 80,500 C80,600 20,650 20,750 C20,850 50,900 50,${Math.max(1000, combinedTimeline.totalEntries * 300)}`}
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

        {/* Phase 1: Foundation Milestones */}
        <div className="mb-8">
          {combinedTimeline.foundation.map((entry, index) => (
            <FoundationNode
              key={entry.id}
              entry={entry}
              index={index}
              isLast={index === combinedTimeline.foundation.length - 1}
              hasAdminEntries={combinedTimeline.hasAdminEntries}
            />
          ))}
        </div>

        {/* Phase 2: Personalized Admin Entries */}
        {combinedTimeline.hasAdminEntries && (
          <div className="mb-8">
            {combinedTimeline.adminEntries.map((entry, index) => (
              <AdminJourneyNode
                key={entry._id}
                entry={entry}
                sessionNumber={entry.sessionNumber}
                index={index + 3} // Continue the alternating pattern after foundation
                isLast={index === combinedTimeline.adminEntries.length - 1}
              />
            ))}
          </div>
        )}

        {/* Future Growth Indicator */}
        {!combinedTimeline.hasAdminEntries && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center mt-12"
          >
            <div className="flex justify-center mb-4">
              <div className="h-12 w-0.5 bg-gradient-to-b from-[#3F2965]/30 to-transparent border-l-2 border-dashed border-[#3F2965]/30"></div>
            </div>

            <div className="bg-gradient-to-br from-[#3F2965]/5 to-[#3F2965]/10 border-2 border-dashed border-[#3F2965]/20 rounded-lg p-8 max-w-md mx-auto">
              <div className="w-16 h-16 bg-gradient-to-br from-[#3F2965]/20 to-[#3F2965]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-[#3F2965]/60" />
              </div>
              <h3 className="font-bold text-gray-700 text-lg mb-2">Future Growth</h3>
              <p className="text-[#3F2965]/70 leading-relaxed text-sm">
                Your personalized journey entries will appear here as you progress through sessions with your therapist.
              </p>
            </div>
          </motion.div>
        )}

        {/* Animated continuation indicator */}
        <div className="flex justify-center mt-8">
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