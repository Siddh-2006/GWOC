import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Edit3, 
  CheckCircle, 
  Circle,
  Smile,
  Meh,
  Frown,
  Calendar,
  Clock,
  Target,
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import { sessionsApi } from '../services/sessions.api';

const SessionNotesViewer = ({ session, isOpen, onClose, onEdit }) => {
  const [notes, setNotes] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load session notes when modal opens
  useEffect(() => {
    if (isOpen && session) {
      loadSessionNotes();
    }
  }, [isOpen, session]);

  const loadSessionNotes = async () => {
    setLoading(true);
    try {
      const response = await sessionsApi.getSessionDetails(session._id);
      if (response.success && response.data.notes) {
        setNotes(response.data.notes.notes);
      }
    } catch (error) {
      console.error('Failed to load session notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMoodEmoji = (mood) => {
    if (mood <= 3) return <Frown className="text-red-500" size={20} />;
    if (mood <= 7) return <Meh className="text-yellow-500" size={20} />;
    return <Smile className="text-green-500" size={20} />;
  };

  const getMoodLabel = (mood) => {
    if (mood <= 3) return 'Poor';
    if (mood <= 7) return 'Okay';
    return 'Great';
  };

  if (!session) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Session Notes</h2>
                <p className="text-gray-600 flex items-center gap-2">
                  <Calendar size={16} />
                  {new Date(session.slotId?.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onEdit(session)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <Edit3 size={16} />
                  Edit Notes
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 120px)' }}>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full"></div>
                </div>
              ) : notes ? (
                <div className="space-y-8">
                  {/* Mood Tracking */}
                  {(notes.mood?.before || notes.mood?.after) && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Smile size={20} className="text-purple-600" />
                        Mood Tracking
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {notes.mood.before && (
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-2">
                              {getMoodEmoji(notes.mood.before)}
                              <span className="text-2xl font-bold text-gray-800">{notes.mood.before}/10</span>
                            </div>
                            <p className="text-sm text-gray-600">Before Session</p>
                            <p className="text-xs text-gray-500">{getMoodLabel(notes.mood.before)}</p>
                          </div>
                        )}
                        {notes.mood.after && (
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-2">
                              {getMoodEmoji(notes.mood.after)}
                              <span className="text-2xl font-bold text-gray-800">{notes.mood.after}/10</span>
                            </div>
                            <p className="text-sm text-gray-600">After Session</p>
                            <p className="text-xs text-gray-500">{getMoodLabel(notes.mood.after)}</p>
                          </div>
                        )}
                      </div>
                      {notes.mood.before && notes.mood.after && (
                        <div className="mt-4 text-center">
                          <div className="flex items-center justify-center gap-2 text-sm">
                            <span className="text-gray-600">Mood Change:</span>
                            <span className={`font-semibold ${
                              notes.mood.after > notes.mood.before ? 'text-green-600' : 
                              notes.mood.after < notes.mood.before ? 'text-red-600' : 'text-gray-600'
                            }`}>
                              {notes.mood.after > notes.mood.before ? '+' : ''}
                              {notes.mood.after - notes.mood.before}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Pre-Session Notes */}
                  {notes.preSessionNotes && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Clock size={20} className="text-blue-600" />
                        Pre-Session Notes
                      </h3>
                      <div className="bg-blue-50 rounded-xl p-4">
                        <p className="text-gray-700 leading-relaxed">{notes.preSessionNotes}</p>
                      </div>
                    </div>
                  )}

                  {/* Post-Session Notes */}
                  {notes.postSessionNotes && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <CheckCircle size={20} className="text-green-600" />
                        Post-Session Notes
                      </h3>
                      <div className="bg-green-50 rounded-xl p-4">
                        <p className="text-gray-700 leading-relaxed">{notes.postSessionNotes}</p>
                      </div>
                    </div>
                  )}

                  {/* Key Takeaways */}
                  {notes.keyTakeaways && notes.keyTakeaways.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Lightbulb size={20} className="text-yellow-600" />
                        Key Takeaways
                      </h3>
                      <div className="space-y-2">
                        {notes.keyTakeaways.map((takeaway, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                            <div className="w-6 h-6 bg-yellow-200 text-yellow-800 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                              {index + 1}
                            </div>
                            <p className="text-gray-700 flex-1">{takeaway}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Goals */}
                  {notes.goals && notes.goals.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Target size={20} className="text-purple-600" />
                        Session Goals
                      </h3>
                      <div className="space-y-2">
                        {notes.goals.map((goal, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                            {goal.completed ? (
                              <CheckCircle size={20} className="text-green-600" />
                            ) : (
                              <Circle size={20} className="text-gray-400" />
                            )}
                            <p className={`flex-1 ${goal.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                              {goal.goal}
                            </p>
                            {goal.completed && (
                              <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                Completed
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Next Session Topics */}
                  {notes.nextSessionTopics && notes.nextSessionTopics.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <ArrowRight size={20} className="text-indigo-600" />
                        Topics for Next Session
                      </h3>
                      <div className="space-y-2">
                        {notes.nextSessionTopics.map((topic, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg">
                            <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                            <p className="text-gray-700">{topic}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Empty State */}
                  {!notes.preSessionNotes && !notes.postSessionNotes && 
                   (!notes.keyTakeaways || notes.keyTakeaways.length === 0) &&
                   (!notes.goals || notes.goals.length === 0) &&
                   (!notes.nextSessionTopics || notes.nextSessionTopics.length === 0) &&
                   !notes.mood?.before && !notes.mood?.after && (
                    <div className="text-center py-12">
                      <div className="text-gray-400 mb-4">📝</div>
                      <p className="text-gray-500">No notes available for this session</p>
                      <button
                        onClick={() => onEdit(session)}
                        className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Add Notes
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">📝</div>
                  <p className="text-gray-500">No notes found for this session</p>
                  <button
                    onClick={() => onEdit(session)}
                    className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Add Notes
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SessionNotesViewer;