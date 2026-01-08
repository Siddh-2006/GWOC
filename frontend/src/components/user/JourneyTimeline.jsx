import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Trophy, 
  BookOpen, 
  Heart, 
  Target, 
  MessageSquare,
  Star
} from 'lucide-react';

const JourneyEntryCard = ({ entry }) => {
  // Add safety checks for entry data
  if (!entry) {
    return null;
  }

  const safeEntry = {
    _id: entry._id || '',
    title: entry.title || 'Untitled Entry',
    description: entry.description || '',
    type: entry.type || 'session_summary',
    entryDate: entry.entryDate || new Date().toISOString(),
    content: {
      summary: entry.content?.summary || ''
    },
    progressMetrics: {
      sessionNumber: entry.progressMetrics?.sessionNumber || null
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
      case 'milestone': return 'bg-gradient-to-br from-[#3F2965]/5 to-[#3F2965]/10 border-[#3F2965]/20';
      case 'session_summary': return 'bg-gradient-to-br from-[#3F2965]/5 to-[#3F2965]/10 border-[#3F2965]/20';
      case 'achievement': return 'bg-gradient-to-br from-[#3F2965]/5 to-[#3F2965]/10 border-[#3F2965]/20';
      case 'reflection': return 'bg-gradient-to-br from-[#Dd1764]/5 to-[#Dd1764]/10 border-[#Dd1764]/20';
      case 'goal_set': return 'bg-gradient-to-br from-[#3F2965]/5 to-[#3F2965]/10 border-[#3F2965]/20';
      case 'admin_note': return 'bg-gradient-to-br from-[#3F2965]/5 to-[#3F2965]/10 border-[#3F2965]/20';
      default: return 'bg-white border-[#3F2965]/10';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border rounded-3xl p-8 ${getTypeColor(safeEntry.type)} hover:shadow-xl hover:shadow-[#3F2965]/10 transition-all duration-300 backdrop-blur-sm`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/60 rounded-2xl shadow-sm border border-[#3F2965]/10">
            {getTypeIcon(safeEntry.type)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-xl mb-1">{safeEntry.title}</h3>
            <p className="text-sm text-[#3F2965]/70 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {formatDate(safeEntry.entryDate)}
              {safeEntry.progressMetrics.sessionNumber && (
                <span className="ml-3 px-3 py-1 bg-[#3F2965]/15 rounded-full text-xs font-medium text-[#3F2965] border border-[#3F2965]/20">
                  Session #{safeEntry.progressMetrics.sessionNumber}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Description */}
      {safeEntry.description && (
        <p className="text-gray-700 mb-6 leading-relaxed">{safeEntry.description}</p>
      )}

      {/* Summary */}
      {safeEntry.content.summary && (
        <div className="bg-white/60 p-6 rounded-2xl border border-[#3F2965]/10 shadow-inner">
          <p className="text-gray-700 leading-relaxed">{safeEntry.content.summary}</p>
        </div>
      )}
    </motion.div>
  );
};

const JourneyTimeline = ({ journeyData, loading }) => {
  // Add safety checks for journeyData
  const safeJourneyData = journeyData || {
    entries: []
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500">Loading your journey...</p>
      </div>
    );
  }

  if (!safeJourneyData.entries || safeJourneyData.entries.length === 0) {
    return (
      <div className="text-center py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative mb-10">
            <div className="w-20 h-20 bg-gradient-to-br from-[#3F2965]/20 to-[#3F2965]/10 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <BookOpen size={40} className="text-[#3F2965]/60" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#3F2965] rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-sm font-bold">✨</span>
            </div>
          </div>
          <h3 className="text-3xl font-semibold text-gray-800 mb-4">Your Journey Begins Here</h3>
          <p className="text-gray-600 mb-12 max-w-lg mx-auto leading-relaxed text-lg">
            As you progress through sessions, your therapist will document key insights, milestones, and achievements in your personal journey timeline.
          </p>
          
          {/* Journey Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
            <div className="bg-gradient-to-br from-[#3F2965]/5 to-[#3F2965]/10 p-6 rounded-2xl border border-[#3F2965]/10">
              <div className="w-12 h-12 bg-[#3F2965]/15 rounded-xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-6 h-6 text-[#3F2965]" />
              </div>
              <p className="font-semibold text-[#3F2965] mb-2">Session Summaries</p>
              <p className="text-sm text-[#3F2965]/70">Key insights from each session</p>
            </div>
            <div className="bg-gradient-to-br from-[#3F2965]/5 to-[#3F2965]/10 p-6 rounded-2xl border border-[#3F2965]/10">
              <div className="w-12 h-12 bg-[#3F2965]/15 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-6 h-6 text-[#3F2965]" />
              </div>
              <p className="font-semibold text-[#3F2965] mb-2">Milestones</p>
              <p className="text-sm text-[#3F2965]/70">Important breakthroughs</p>
            </div>
            <div className="bg-gradient-to-br from-[#3F2965]/5 to-[#3F2965]/10 p-6 rounded-2xl border border-[#3F2965]/10">
              <div className="w-12 h-12 bg-[#3F2965]/15 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Star className="w-6 h-6 text-[#3F2965]" />
              </div>
              <p className="font-semibold text-[#3F2965] mb-2">Achievements</p>
              <p className="text-sm text-[#3F2965]/70">Goals you've accomplished</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#3F2965]/5 to-[#3F2965]/10 p-8 rounded-3xl border border-[#3F2965]/10 max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-[#3F2965]/20 rounded-full flex items-center justify-center">
                <span className="text-[#3F2965] text-sm">💡</span>
              </div>
              <p className="font-semibold text-[#3F2965]">How Your Journey Works</p>
            </div>
            <p className="text-[#3F2965]/80 leading-relaxed">
              Your journey entries are thoughtfully created by your therapist after each session to help you track progress, 
              reflect on your growth, and celebrate meaningful moments in your healing process.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Narrative Journey Flow */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#3F2965]/30 via-[#3F2965]/20 to-transparent"></div>
        
        <div className="space-y-8">
          {safeJourneyData.entries.map((entry, index) => (
            <div key={entry._id} className="relative">
              {/* Timeline dot */}
              <div className="absolute left-6 w-4 h-4 bg-[#3F2965] rounded-full border-4 border-white shadow-lg z-10"></div>
              
              {/* Entry card with offset */}
              <div className="ml-16">
                <JourneyEntryCard entry={entry} />
              </div>
            </div>
          ))}
        </div>
        
        {/* Timeline end */}
        <div className="absolute left-6 bottom-0 w-4 h-4 bg-[#3F2965]/30 rounded-full border-4 border-white"></div>
      </div>
    </div>
  );
};

export default JourneyTimeline;