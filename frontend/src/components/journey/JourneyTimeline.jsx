import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Target, 
  Trophy, 
  CheckCircle, 
  Circle,
  TrendingUp,
  Star,
  MapPin,
  Clock,
  ChevronDown,
  ChevronUp,
  Award,
  BookOpen,
  Heart,
  Lightbulb,
  Flag
} from 'lucide-react';
import { useJourney } from '../../hooks/useJourney';

const JourneyTimeline = () => {
  const { journeyData, loading, error, completeGoal } = useJourney();
  const [expandedEntry, setExpandedEntry] = useState(null);
  const [completingGoal, setCompletingGoal] = useState(null);

  const getEntryIcon = (type) => {
    switch (type) {
      case 'milestone': return <Trophy className="text-yellow-500" size={20} />;
      case 'session_summary': return <BookOpen className="text-blue-500" size={20} />;
      case 'achievement': return <Award className="text-purple-500" size={20} />;
      case 'reflection': return <Heart className="text-pink-500" size={20} />;
      case 'goal_set': return <Target className="text-green-500" size={20} />;
      case 'goal_completed': return <CheckCircle className="text-emerald-500" size={20} />;
      case 'admin_note': return <Lightbulb className="text-orange-500" size={20} />;
      default: return <Flag className="text-gray-500" size={20} />;
    }
  };

  const getEntryColor = (type) => {
    switch (type) {
      case 'milestone': return 'border-yellow-200 bg-yellow-50';
      case 'session_summary': return 'border-blue-200 bg-blue-50';
      case 'achievement': return 'border-purple-200 bg-purple-50';
      case 'reflection': return 'border-pink-200 bg-pink-50';
      case 'goal_set': return 'border-green-200 bg-green-50';
      case 'goal_completed': return 'border-emerald-200 bg-emerald-50';
      case 'admin_note': return 'border-orange-200 bg-orange-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const handleCompleteGoal = async (entryId, goalId) => {
    setCompletingGoal(`${entryId}-${goalId}`);
    try {
      await completeGoal(entryId, goalId);
    } catch (error) {
      console.error('Failed to complete goal:', error);
    } finally {
      setCompletingGoal(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatType = (type) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">⚠️</div>
        <p className="text-red-600 mb-2">Failed to load journey</p>
        <p className="text-sm text-gray-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Your Journey Progress</h3>
          <div className="flex items-center gap-2">
            <TrendingUp size={20} />
            <span className="text-2xl font-bold">{journeyData.stats.overallProgress}%</span>
          </div>
        </div>
        
        <div className="w-full bg-white/20 rounded-full h-3 mb-4">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${journeyData.stats.overallProgress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="bg-white rounded-full h-3"
          />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">{journeyData.stats.totalSessions}</div>
            <div className="text-sm opacity-90">Sessions</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{journeyData.stats.totalMilestones}</div>
            <div className="text-sm opacity-90">Milestones</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{journeyData.stats.totalGoalsCompleted}</div>
            <div className="text-sm opacity-90">Goals Completed</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{journeyData.stats.totalEntries}</div>
            <div className="text-sm opacity-90">Total Entries</div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      {journeyData.entries.length === 0 ? (
        <div className="text-center py-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <MapPin size={64} className="mx-auto text-gray-300 mb-6" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Your Journey Starts Here</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Your mental health journey will be documented here. Each session and milestone will create a meaningful timeline of your progress.
            </p>
          </motion.div>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-200 via-pink-200 to-purple-200"></div>
          
          <div className="space-y-6">
            {journeyData.entries.map((entry, index) => (
              <motion.div
                key={entry._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                {/* Timeline Dot */}
                <div className="absolute left-6 w-4 h-4 bg-white border-4 border-purple-400 rounded-full shadow-lg z-10"></div>
                
                {/* Entry Card */}
                <div className={`ml-16 rounded-2xl border-2 ${getEntryColor(entry.type)} p-6 shadow-sm hover:shadow-md transition-all`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        {getEntryIcon(entry.type)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">{entry.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {formatDate(entry.entryDate)}
                          </span>
                          <span className="px-2 py-1 bg-white rounded-full text-xs font-medium">
                            {formatType(entry.type)}
                          </span>
                          {entry.progressMetrics?.sessionNumber && (
                            <span className="flex items-center gap-1">
                              <Clock size={14} />
                              Session #{entry.progressMetrics.sessionNumber}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {entry.progressMetrics?.overallProgress !== undefined && (
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-600">
                          {entry.progressMetrics.overallProgress}%
                        </div>
                        <div className="text-xs text-gray-500">Progress</div>
                      </div>
                    )}
                  </div>

                  {entry.description && (
                    <p className="text-gray-700 mb-4">{entry.description}</p>
                  )}

                  {/* Content Preview */}
                  {entry.content && (
                    <div className="space-y-3">
                      {entry.content.summary && (
                        <div className="bg-white/50 rounded-lg p-3">
                          <p className="text-sm text-gray-700">{entry.content.summary}</p>
                        </div>
                      )}

                      {/* Mood Indicators */}
                      {(entry.content.moodBefore || entry.content.moodAfter) && (
                        <div className="flex items-center gap-4 text-sm">
                          {entry.content.moodBefore && (
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600">Mood Before:</span>
                              <div className="flex items-center gap-1">
                                {[...Array(10)].map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-2 h-2 rounded-full ${
                                      i < entry.content.moodBefore ? 'bg-blue-400' : 'bg-gray-200'
                                    }`}
                                  />
                                ))}
                                <span className="ml-1 font-medium">{entry.content.moodBefore}/10</span>
                              </div>
                            </div>
                          )}
                          {entry.content.moodAfter && (
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600">Mood After:</span>
                              <div className="flex items-center gap-1">
                                {[...Array(10)].map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-2 h-2 rounded-full ${
                                      i < entry.content.moodAfter ? 'bg-green-400' : 'bg-gray-200'
                                    }`}
                                  />
                                ))}
                                <span className="ml-1 font-medium">{entry.content.moodAfter}/10</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Goals */}
                      {entry.content.goalsSet && entry.content.goalsSet.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="font-medium text-gray-800 flex items-center gap-2">
                            <Target size={16} />
                            Goals ({entry.content.goalsSet.filter(g => g.completed).length}/{entry.content.goalsSet.length} completed)
                          </h5>
                          <div className="space-y-2">
                            {entry.content.goalsSet.slice(0, expandedEntry === entry._id ? undefined : 3).map((goal, goalIndex) => (
                              <div key={goalIndex} className="flex items-center gap-3 bg-white/50 rounded-lg p-3">
                                <button
                                  onClick={() => handleCompleteGoal(entry._id, goal._id)}
                                  disabled={completingGoal === `${entry._id}-${goal._id}`}
                                  className="flex-shrink-0 text-green-600 hover:text-green-700 disabled:opacity-50"
                                >
                                  {goal.completed ? <CheckCircle size={18} /> : <Circle size={18} />}
                                </button>
                                <span className={`flex-1 text-sm ${goal.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                                  {goal.goal}
                                </span>
                                {goal.targetDate && (
                                  <span className="text-xs text-gray-500">
                                    Due: {formatDate(goal.targetDate)}
                                  </span>
                                )}
                              </div>
                            ))}
                            {entry.content.goalsSet.length > 3 && (
                              <button
                                onClick={() => setExpandedEntry(expandedEntry === entry._id ? null : entry._id)}
                                className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700"
                              >
                                {expandedEntry === entry._id ? (
                                  <>
                                    <ChevronUp size={16} />
                                    Show Less
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown size={16} />
                                    Show {entry.content.goalsSet.length - 3} More Goals
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Expand/Collapse for more content */}
                      {(entry.content.insights?.length > 0 || entry.content.achievements?.length > 0 || entry.content.nextSteps?.length > 0) && (
                        <button
                          onClick={() => setExpandedEntry(expandedEntry === entry._id ? null : entry._id)}
                          className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
                        >
                          {expandedEntry === entry._id ? (
                            <>
                              <ChevronUp size={16} />
                              Show Less Details
                            </>
                          ) : (
                            <>
                              <ChevronDown size={16} />
                              Show More Details
                            </>
                          )}
                        </button>
                      )}

                      {/* Expanded Content */}
                      <AnimatePresence>
                        {expandedEntry === entry._id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-3 overflow-hidden"
                          >
                            {entry.content.insights && entry.content.insights.length > 0 && (
                              <div>
                                <h6 className="font-medium text-gray-800 mb-2">Key Insights</h6>
                                <ul className="space-y-1">
                                  {entry.content.insights.map((insight, i) => (
                                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                      <Lightbulb size={14} className="text-yellow-500 mt-0.5 flex-shrink-0" />
                                      {insight}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {entry.content.achievements && entry.content.achievements.length > 0 && (
                              <div>
                                <h6 className="font-medium text-gray-800 mb-2">Achievements</h6>
                                <ul className="space-y-1">
                                  {entry.content.achievements.map((achievement, i) => (
                                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                      <Star size={14} className="text-yellow-500 mt-0.5 flex-shrink-0" />
                                      {achievement}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {entry.content.nextSteps && entry.content.nextSteps.length > 0 && (
                              <div>
                                <h6 className="font-medium text-gray-800 mb-2">Next Steps</h6>
                                <ul className="space-y-1">
                                  {entry.content.nextSteps.map((step, i) => (
                                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                      <Flag size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
                                      {step}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default JourneyTimeline;