import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Trophy, 
  BookOpen, 
  Heart, 
  Target, 
  MessageSquare,
  Star,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';
import { journeyApi } from '../../services/journey.api';
import SimpleJourneyEntryModal from './SimpleJourneyEntryModal';

const UserJourneyEntries = ({ userId, userName }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);

  useEffect(() => {
    if (userId) {
      fetchUserJourneyEntries();
    }
  }, [userId]);

  const fetchUserJourneyEntries = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await journeyApi.getAllJourneyEntries({ userId });
      if (response.success) {
        setEntries(response.data || []);
      } else {
        setError(response.message || 'Failed to fetch journey entries');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch journey entries');
      console.error('Fetch journey entries error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditEntry = (entry) => {
    setEditingEntry(entry);
    setShowEditModal(true);
  };

  const handleDeleteEntry = async (entryId) => {
    if (!window.confirm('Are you sure you want to delete this journey entry?')) {
      return;
    }

    try {
      await journeyApi.deleteJourneyEntry(entryId);
      await fetchUserJourneyEntries(); // Refresh the list
    } catch (err) {
      console.error('Delete journey entry error:', err);
      setError('Failed to delete journey entry');
    }
  };

  const handleEntrySaved = () => {
    setShowEditModal(false);
    setEditingEntry(null);
    fetchUserJourneyEntries(); // Refresh the list
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'milestone': return <Trophy className="w-4 h-4 text-yellow-600" />;
      case 'session_summary': return <BookOpen className="w-4 h-4 text-blue-600" />;
      case 'achievement': return <Star className="w-4 h-4 text-purple-600" />;
      case 'reflection': return <Heart className="w-4 h-4 text-pink-600" />;
      case 'goal_set': return <Target className="w-4 h-4 text-green-600" />;
      case 'admin_note': return <MessageSquare className="w-4 h-4 text-gray-600" />;
      default: return <BookOpen className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'milestone': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'session_summary': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'achievement': return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'reflection': return 'bg-pink-50 border-pink-200 text-pink-800';
      case 'goal_set': return 'bg-green-50 border-green-200 text-green-800';
      case 'admin_note': return 'bg-gray-50 border-gray-200 text-gray-800';
      default: return 'bg-white border-gray-200 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="w-6 h-6 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-sm text-gray-500">Loading journey entries...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-2">⚠️</div>
        <p className="text-red-600 text-sm">{error}</p>
        <button
          onClick={fetchUserJourneyEntries}
          className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-800">
          Journey Entries for {userName}
        </h4>
        <span className="text-sm text-gray-500">
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
        </span>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <BookOpen className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No journey entries yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Add journey entries to document the client's progress
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {entries.map((entry) => (
            <motion.div
              key={entry._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`border rounded-lg p-4 ${getTypeColor(entry.type)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-1.5 bg-white rounded-full shadow-sm">
                    {getTypeIcon(entry.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-medium text-sm truncate">{entry.title}</h5>
                      {entry.progressMetrics?.sessionNumber && (
                        <span className="px-2 py-0.5 bg-white/60 rounded-full text-xs font-medium">
                          Session #{entry.progressMetrics.sessionNumber}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 flex items-center gap-1 mb-2">
                      <Calendar className="w-3 h-3" />
                      {formatDate(entry.entryDate)}
                      {entry.progressMetrics?.overallProgress && (
                        <>
                          <span className="mx-1">•</span>
                          <span>{entry.progressMetrics.overallProgress}% progress</span>
                        </>
                      )}
                    </p>
                    {entry.description && (
                      <p className="text-xs text-gray-700 line-clamp-2">
                        {entry.description}
                      </p>
                    )}
                    {entry.content?.summary && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                        {entry.content.summary}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-1 ml-2">
                  <button
                    onClick={() => handleEditEntry(entry)}
                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-white/60 rounded transition-colors"
                    title="Edit entry"
                  >
                    <Edit className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDeleteEntry(entry._id)}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-white/60 rounded transition-colors"
                    title="Delete entry"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Quick stats */}
              {(entry.content?.goalsSet?.length > 0 || entry.content?.insights?.length > 0) && (
                <div className="flex items-center gap-4 mt-3 pt-2 border-t border-white/40">
                  {entry.content.goalsSet?.length > 0 && (
                    <span className="text-xs text-gray-600 flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      {entry.content.goalsSet.length} goals
                    </span>
                  )}
                  {entry.content.insights?.length > 0 && (
                    <span className="text-xs text-gray-600 flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      {entry.content.insights.length} insights
                    </span>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <SimpleJourneyEntryModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingEntry(null);
        }}
        onSave={handleEntrySaved}
        userId={userId}
        existingEntry={editingEntry}
      />
    </div>
  );
};

export default UserJourneyEntries;