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
      case 'milestone': return <Trophy className="w-5 h-5 text-yellow-600" />;
      case 'session_summary': return <BookOpen className="w-5 h-5 text-blue-600" />;
      case 'achievement': return <Star className="w-5 h-5 text-purple-600" />;
      case 'reflection': return <Heart className="w-5 h-5 text-pink-600" />;
      case 'goal_set': return <Target className="w-5 h-5 text-green-600" />;
      case 'admin_note': return <MessageSquare className="w-5 h-5 text-gray-600" />;
      default: return <BookOpen className="w-5 h-5 text-gray-400" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'milestone': return 'bg-yellow-50 border-yellow-200';
      case 'session_summary': return 'bg-blue-50 border-blue-200';
      case 'achievement': return 'bg-purple-50 border-purple-200';
      case 'reflection': return 'bg-pink-50 border-pink-200';
      case 'goal_set': return 'bg-green-50 border-green-200';
      case 'admin_note': return 'bg-gray-50 border-gray-200';
      default: return 'bg-white border-gray-200';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border rounded-2xl p-6 ${getTypeColor(safeEntry.type)} hover:shadow-lg transition-all duration-300`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-full shadow-sm">
            {getTypeIcon(safeEntry.type)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-lg">{safeEntry.title}</h3>
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {formatDate(safeEntry.entryDate)}
              {safeEntry.progressMetrics.sessionNumber && (
                <span className="ml-2 px-2 py-1 bg-white/60 rounded-full text-xs font-medium">
                  Session #{safeEntry.progressMetrics.sessionNumber}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Description */}
      {safeEntry.description && (
        <p className="text-gray-700 mb-4">{safeEntry.description}</p>
      )}

      {/* Summary */}
      {safeEntry.content.summary && (
        <div className="bg-white/60 p-4 rounded-lg">
          <p className="text-gray-700">{safeEntry.content.summary}</p>
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
      <div className="text-center py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <BookOpen size={64} className="mx-auto text-gray-300 mb-6" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Your Journey Awaits</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Your mental health journey will be documented here as you progress through sessions.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Simple Cards Grid */}
      <div className="grid grid-cols-1 gap-6">
        {safeJourneyData.entries.map((entry) => (
          <JourneyEntryCard 
            key={entry._id} 
            entry={entry} 
          />
        ))}
      </div>
    </div>
  );
};

export default JourneyTimeline;