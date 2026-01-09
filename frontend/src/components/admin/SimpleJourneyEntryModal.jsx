import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Save,
  BookOpen,
  Trophy,
  Heart,
  Target,
  MessageSquare,
  Star
} from 'lucide-react';
import { journeyApi } from '../../services/journey.api';

const SimpleJourneyEntryModal = ({ isOpen, onClose, onSave, session, userId, existingEntry = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'session_summary',
    content: {
      summary: ''
    },
    entryDate: new Date().toISOString().split('T')[0]
  });

  const [saving, setSaving] = useState(false);

  const entryTypes = [
    { value: 'session_summary', label: 'Session Summary', icon: BookOpen },
    { value: 'milestone', label: 'Milestone', icon: Trophy },
    { value: 'achievement', label: 'Achievement', icon: Star },
    { value: 'reflection', label: 'Reflection', icon: Heart },
    { value: 'goal_set', label: 'Goal Setting', icon: Target },
    { value: 'admin_note', label: 'Admin Note', icon: MessageSquare }
  ];

  useEffect(() => {
    if (existingEntry) {
      setFormData({
        title: existingEntry.title || '',
        description: existingEntry.description || '',
        type: existingEntry.type || 'session_summary',
        content: {
          summary: existingEntry.content?.summary || ''
        },
        entryDate: existingEntry.entryDate ? new Date(existingEntry.entryDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      });
    } else if (session) {
      // Pre-fill with session data
      setFormData(prev => ({
        ...prev,
        title: `Session Summary`,
        description: `Summary for ${session.sessionType || 'Individual'} session`,
        type: 'session_summary'
      }));
    }
  }, [existingEntry, session]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const finalUserId = userId?._id || userId;
      const entryData = {
        ...formData,
        userId: finalUserId,
        sessionId: session?._id || null
      };

      let response;
      if (existingEntry) {
        response = await journeyApi.updateJourneyEntry(existingEntry._id, entryData);
      } else {
        response = await journeyApi.createJourneyEntry(entryData);
      }

      if (response.success) {
        onSave?.(response.data);
        onClose();
      }
    } catch (error) {
      console.error('Failed to save journey entry:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {existingEntry ? 'Edit Journey Entry' : 'Create Journey Entry'}
              </h2>
              {session && (
                <p className="text-gray-600">
                  For session on {new Date(session.slotId?.date).toLocaleDateString()}
                </p>
              )}
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
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter entry title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {entryTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Brief description of this entry"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Entry Date
                </label>
                <input
                  type="date"
                  value={formData.entryDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, entryDate: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Summary */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Summary
                </label>
                <textarea
                  value={formData.content.summary}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    content: { ...prev.content, summary: e.target.value }
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  rows={6}
                  placeholder="Detailed summary of the session or entry"
                />
              </div>
            </div>
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
              disabled={saving || !formData.title.trim()}
              className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2 font-medium shadow-lg"
            >
              {saving ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <Save size={16} />
              )}
              {saving ? 'Saving...' : existingEntry ? 'Update Entry' : 'Create Entry'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SimpleJourneyEntryModal;