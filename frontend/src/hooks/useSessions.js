import { useState, useEffect } from 'react';
import { sessionsApi } from '../services/sessions.api';
import useAuthStore from '../store/useAuthStore';

export const useSessions = () => {
  const { isAuthenticated } = useAuthStore();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSessions = async (params = {}) => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await sessionsApi.getUserSessions(params);
      if (response.success) {
        setSessions(response.data);
      } else {
        setError(response.message || 'Failed to fetch sessions');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch sessions');
      console.error('Fetch sessions error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateSessionNotes = async (sessionId, notesData) => {
    try {
      const response = await sessionsApi.updateSessionNotes(sessionId, notesData);
      if (response.success) {
        // Refresh sessions to get updated data
        await fetchSessions();
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update notes');
      }
    } catch (err) {
      console.error('Update session notes error:', err);
      throw err;
    }
  };

  const addGoal = async (sessionId, goal) => {
    try {
      const response = await sessionsApi.addSessionGoal(sessionId, goal);
      if (response.success) {
        await fetchSessions();
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to add goal');
      }
    } catch (err) {
      console.error('Add goal error:', err);
      throw err;
    }
  };

  const toggleGoal = async (sessionId, goalId) => {
    try {
      const response = await sessionsApi.toggleGoalCompletion(sessionId, goalId);
      if (response.success) {
        await fetchSessions();
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to toggle goal');
      }
    } catch (err) {
      console.error('Toggle goal error:', err);
      throw err;
    }
  };

  // Categorize sessions
  const categorizedSessions = {
    upcoming: sessions.filter(s => s.category === 'upcoming'),
    ongoing: sessions.filter(s => s.category === 'ongoing'),
    past: sessions.filter(s => s.category === 'past')
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchSessions();
    } else {
      setSessions([]);
    }
  }, [isAuthenticated]);

  return {
    sessions,
    categorizedSessions,
    loading,
    error,
    fetchSessions,
    updateSessionNotes,
    addGoal,
    toggleGoal
  };
};