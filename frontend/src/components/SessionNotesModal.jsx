import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Save,
  Plus,
  Target,
  CheckCircle,
  Circle,
  Trash2,
  Smile,
  Meh,
  Frown
} from 'lucide-react';
import { sessionsApi } from '../services/sessions.api';

const SessionNotesModal = ({ session, isOpen, onClose, onSave }) => {
  const [notes, setNotes] = useState({
    preSessionNotes: '',
    postSessionNotes: '',
    keyTakeaways: [],
    mood: { before: null, after: null },
    goals: [],
    nextSessionTopics: []
  });
  const [newGoal, setNewGoal] = useState('');
  const [newTakeaway, setNewTakeaway] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load existing notes when modal opens
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

  const handleSave = async () => {
    setSaving(true);
    try {
      await sessionsApi.updateSessionNotes(session._id, notes);
      onSave?.();
      onClose();
    } catch (error) {
      console.error('Failed to save notes:', error);
    } finally {
      setSaving(false);
    }
  };

  const addGoal = () => {
    if (newGoal.trim()) {
      setNotes(prev => ({
        ...prev,
        goals: [...prev.goals, { goal: newGoal.trim(), completed: false }]
      }));
      setNewGoal('');
    }
  };

  const toggleGoal = (index) => {
    setNotes(prev => ({
      ...prev,
      goals: prev.goals.map((goal, i) =>
        i === index ? { ...goal, completed: !goal.completed } : goal
      )
    }));
  };

  const removeGoal = (index) => {
    setNotes(prev => ({
      ...prev,
      goals: prev.goals.filter((_, i) => i !== index)
    }));
  };

  const addTakeaway = () => {
    if (newTakeaway.trim()) {
      setNotes(prev => ({
        ...prev,
        keyTakeaways: [...prev.keyTakeaways, newTakeaway.trim()]
      }));
      setNewTakeaway('');
    }
  };

  const removeTakeaway = (index) => {
    setNotes(prev => ({
      ...prev,
      keyTakeaways: prev.keyTakeaways.filter((_, i) => i !== index)
    }));
  };

  const addTopic = () => {
    if (newTopic.trim()) {
      setNotes(prev => ({
        ...prev,
        nextSessionTopics: [...prev.nextSessionTopics, newTopic.trim()]
      }));
      setNewTopic('');
    }
  };

  const removeTopic = (index) => {
    setNotes(prev => ({
      ...prev,
      nextSessionTopics: prev.nextSessionTopics.filter((_, i) => i !== index)
    }));
  };

  const MoodSelector = ({ label, value, onChange }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((mood) => (
          <button
            key={mood}
            type="button"
            onClick={() => onChange(mood)}
            className={`w-8 h-8 rounded-full border-2 text-xs font-medium transition-colors ${value === mood
                ? 'bg-purple-600 text-white border-purple-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-purple-300'
              }`}
          >
            {mood}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <Frown size={12} /> Poor
        </span>
        <span className="flex items-center gap-1">
          <Meh size={12} /> Okay
        </span>
        <span className="flex items-center gap-1">
          <Smile size={12} /> Great
        </span>
      </div>
    </div>
  );

  if (!session) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Session Notes</h2>
                <p className="text-gray-600">
                  {new Date(session.slotId?.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Mood Tracking */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <MoodSelector
                      label="Mood Before Session"
                      value={notes.mood.before}
                      onChange={(mood) => setNotes(prev => ({
                        ...prev,
                        mood: { ...prev.mood, before: mood }
                      }))}
                    />
                    <MoodSelector
                      label="Mood After Session"
                      value={notes.mood.after}
                      onChange={(mood) => setNotes(prev => ({
                        ...prev,
                        mood: { ...prev.mood, after: mood }
                      }))}
                    />
                  </div>

                  {/* Pre-Session Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pre-Session Notes
                    </label>
                    <textarea
                      value={notes.preSessionNotes}
                      onChange={(e) => setNotes(prev => ({ ...prev, preSessionNotes: e.target.value }))}
                      placeholder="What are you hoping to discuss or work on in this session?"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      rows={3}
                    />
                  </div>

                  {/* Post-Session Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Post-Session Notes
                    </label>
                    <textarea
                      value={notes.postSessionNotes}
                      onChange={(e) => setNotes(prev => ({ ...prev, postSessionNotes: e.target.value }))}
                      placeholder="How did the session go? What did you discuss?"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      rows={4}
                    />
                  </div>

                  {/* Key Takeaways */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Key Takeaways
                    </label>
                    <div className="space-y-2">
                      {notes.keyTakeaways.map((takeaway, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                          <span className="flex-1 text-sm">{takeaway}</span>
                          <button
                            onClick={() => removeTakeaway(index)}
                            className="p-1 text-red-500 hover:bg-red-100 rounded"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newTakeaway}
                          onChange={(e) => setNewTakeaway(e.target.value)}
                          placeholder="Add a key takeaway..."
                          className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          onKeyPress={(e) => e.key === 'Enter' && addTakeaway()}
                        />
                        <button
                          onClick={addTakeaway}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Goals */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session Goals
                    </label>
                    <div className="space-y-2">
                      {notes.goals.map((goal, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                          <button
                            onClick={() => toggleGoal(index)}
                            className="text-green-600 hover:text-green-700"
                          >
                            {goal.completed ? <CheckCircle size={16} /> : <Circle size={16} />}
                          </button>
                          <span className={`flex-1 text-sm ${goal.completed ? 'line-through text-gray-500' : ''}`}>
                            {goal.goal}
                          </span>
                          <button
                            onClick={() => removeGoal(index)}
                            className="p-1 text-red-500 hover:bg-red-100 rounded"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newGoal}
                          onChange={(e) => setNewGoal(e.target.value)}
                          placeholder="Add a goal for this session..."
                          className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          onKeyPress={(e) => e.key === 'Enter' && addGoal()}
                        />
                        <button
                          onClick={addGoal}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Next Session Topics */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Topics for Next Session
                    </label>
                    <div className="space-y-2">
                      {notes.nextSessionTopics.map((topic, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg">
                          <span className="flex-1 text-sm">{topic}</span>
                          <button
                            onClick={() => removeTopic(index)}
                            className="p-1 text-red-500 hover:bg-red-100 rounded"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newTopic}
                          onChange={(e) => setNewTopic(e.target.value)}
                          placeholder="Add a topic for next session..."
                          className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          onKeyPress={(e) => e.key === 'Enter' && addTopic()}
                        />
                        <button
                          onClick={addTopic}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white flex items-center justify-end gap-3 p-6 border-t border-gray-200 shadow-lg">
              <button
                onClick={onClose}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2 font-medium shadow-lg"
              >
                {saving ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <Save size={16} />
                )}
                {saving ? 'Saving...' : 'Save Notes'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SessionNotesModal;