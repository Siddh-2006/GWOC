import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Trophy, 
  BookOpen, 
  Heart, 
  Target, 
  MessageSquare,
  Star,
  Seedling,
  Shield,
  MapPin
} from 'lucide-react';

// Default Foundation Milestones - Phase 1
const DEFAULT_FOUNDATION = [
  {
    id: 'foundation-1',
    step: 1,
    title: "Taking the First Step",
    insight: "The most significant part of any journey is the decision to begin. You are here because you've chosen to prioritize your mental well-being.",
    type: 'foundation',
    phase: 'The Arrival'
  },
  {
    id: 'foundation-2', 
    step: 2,
    title: "Defining Your Path",
    insight: "Awareness is the beginning of healing. This phase is about observing your thoughts without judgment.",
    type: 'foundation',
    phase: 'The Intent'
  },
  {
    id: 'foundation-3',
    step: 3, 
    title: "Our Commitment",
    insight: "Your journey here is private and protected. We move at your pace, in your time.",
    type: 'foundation',
    phase: 'The Safe Space'
  }
];

const FoundationCard = ({ entry, index, isLast, hasAdminEntries }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.2 }}
      className="relative"
    >
      {/* Pebble Node */}
      <div className={`absolute -left-6 top-8 w-12 h-12 rounded-lg border-4 border-white shadow-lg z-20 flex items-center justify-center ${
        isLast && !hasAdminEntries 
          ? 'bg-gradient-to-br from-[#3F2965] to-[#3F2965]/80 animate-pulse' 
          : 'bg-gradient-to-br from-[#3F2965]/90 to-[#3F2965]/70'
      }`}>
        <Seedling className="w-5 h-5 text-white" />
      </div>

      {/* Foundation Card */}
      <div className="bg-gradient-to-br from-[#3F2965]/8 to-[#3F2965]/12 border-2 border-[#3F2965]/20 rounded-lg p-8 ml-8 shadow-lg backdrop-blur-sm relative overflow-hidden">
        {/* Subtle Foundation Pattern */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#3F2965]/5 to-transparent rounded-full -translate-y-10 translate-x-10"></div>
        
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/80 rounded-lg shadow-sm border border-[#3F2965]/15">
                <Shield className="w-6 h-6 text-[#3F2965]" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-[#3F2965]/15 rounded-full text-xs font-bold text-[#3F2965] border border-[#3F2965]/25">
                    Step {entry.step}
                  </span>
                  <span className="text-sm text-[#3F2965]/60 font-medium">{entry.phase}</span>
                </div>
                <h3 className="font-bold text-gray-800 text-xl">{entry.title}</h3>
              </div>
            </div>
          </div>

          {/* Insight */}
          <div className="bg-white/70 p-6 rounded-lg border border-[#3F2965]/10 shadow-inner">
            <p className="text-gray-700 leading-relaxed font-medium italic">"{entry.insight}"</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const AdminEntryCard = ({ entry, sessionNumber, isLast }) => {
  const safeEntry = {
    _id: entry._id || '',
    title: entry.title || 'Untitled Entry',
    description: entry.description || '',
    type: entry.type || 'session_summary',
    entryDate: entry.entryDate || new Date().toISOString(),
    content: {
      summary: entry.content?.summary || ''
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'milestone': return <Trophy className="w-5 h-5 text-[#3F2965]" />;
      case 'session_summary': return <BookOpen className="w-5 h-5 text-[#3F2965]" />;
      case 'achievement': return <Star className="w-5 h-5 text-[#3F2965]" />;
      case 'reflection': return <Heart className="w-5 h-5 text-[#Dd1764]" />;
      case 'goal_set': return <Target className="w-5 h-5 text-[#3F2965]" />;
      case 'admin_note': return <MessageSquare className="w-5 h-5 text-[#3F2965]" />;
      default: return <BookOpen className="w-5 h-5 text-[#3F2965]/60" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'reflection': return 'bg-gradient-to-br from-[#Dd1764]/5 to-[#Dd1764]/10 border-[#Dd1764]/20';
      default: return 'bg-gradient-to-br from-[#3F2965]/5 to-[#3F2965]/10 border-[#3F2965]/20';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="relative"
    >
      {/* Pebble Node */}
      <div className={`absolute -left-6 top-8 w-12 h-12 rounded-lg border-4 border-white shadow-lg z-20 flex items-center justify-center ${
        isLast 
          ? 'bg-gradient-to-br from-[#3F2965] to-[#3F2965]/80 animate-pulse' 
          : 'bg-gradient-to-br from-[#3F2965]/90 to-[#3F2965]/70'
      }`}>
        {getTypeIcon(safeEntry.type)}
      </div>

      {/* Admin Entry Card */}
      <div className={`border-2 rounded-lg p-8 ml-8 ${getTypeColor(safeEntry.type)} hover:shadow-xl hover:shadow-[#3F2965]/10 transition-all duration-300 backdrop-blur-sm shadow-lg`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/80 rounded-lg shadow-sm border border-[#3F2965]/15">
              {getTypeIcon(safeEntry.type)}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-[#3F2965]/15 rounded-full text-xs font-bold text-[#3F2965] border border-[#3F2965]/25">
                  Session {sessionNumber}
                </span>
                <span className="text-sm text-[#3F2965]/60 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(safeEntry.entryDate)}
                </span>
              </div>
              <h3 className="font-bold text-gray-800 text-xl">{safeEntry.title}</h3>
            </div>
          </div>
        </div>

        {/* Description */}
        {safeEntry.description && (
          <p className="text-gray-700 mb-6 leading-relaxed">{safeEntry.description}</p>
        )}

        {/* Summary */}
        {safeEntry.content.summary && (
          <div className="bg-white/70 p-6 rounded-lg border border-[#3F2965]/10 shadow-inner">
            <p className="text-gray-700 leading-relaxed">{safeEntry.content.summary}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const JourneyTimeline = ({ journeyData, loading }) => {
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
      hasAdminEntries
    };
  }, [safeJourneyData.entries]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500">Loading your journey...</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Continuous S-Curve Path */}
      <svg 
        className="absolute left-0 top-0 w-full h-full pointer-events-none z-10" 
        style={{ minHeight: '100%' }}
      >
        <defs>
          <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3F2965" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#3F2965" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#3F2965" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        
        {/* Winding Path */}
        <path
          d={`M 24 50 
              Q 60 100, 24 150
              Q -20 200, 24 250
              Q 60 300, 24 350
              Q -20 400, 24 450
              Q 60 500, 24 550
              Q -20 600, 24 650
              Q 60 700, 24 750
              Q -20 800, 24 850
              Q 60 900, 24 950
              Q -20 1000, 24 1050`}
          stroke="url(#pathGradient)"
          strokeWidth="3"
          fill="none"
          strokeDasharray="5,5"
          className="animate-pulse"
        />
      </svg>

      <div className="space-y-12 relative z-20">
        {/* Phase 1: Foundation Milestones */}
        <div className="space-y-8">
          {combinedTimeline.foundation.map((entry, index) => (
            <FoundationCard 
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
          <div className="space-y-8">
            {combinedTimeline.adminEntries.map((entry, index) => (
              <AdminEntryCard 
                key={entry._id}
                entry={entry}
                sessionNumber={entry.sessionNumber}
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
            className="relative ml-8"
          >
            {/* Dotted continuation line */}
            <div className="absolute -left-6 top-0 w-0.5 h-20 border-l-2 border-dashed border-[#3F2965]/30"></div>
            
            <div className="bg-gradient-to-br from-[#3F2965]/5 to-[#3F2965]/10 border-2 border-dashed border-[#3F2965]/20 rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#3F2965]/20 to-[#3F2965]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-[#3F2965]/60" />
              </div>
              <h3 className="font-bold text-gray-700 text-lg mb-2">Future Growth</h3>
              <p className="text-[#3F2965]/70 leading-relaxed">
                Your personalized journey entries will appear here as you progress through sessions with your therapist.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default JourneyTimeline;