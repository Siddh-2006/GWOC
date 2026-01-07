import { useState, useEffect } from 'react';
import { journeyApi } from '../services/journey.api';
import useAuthStore from '../store/useAuthStore';

export const useJourney = (userId = null) => {
  const { isAuthenticated } = useAuthStore();
  const [journeyData, setJourneyData] = useState({
    entries: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  const fetchJourney = async (params = {}) => {
    if (!isAuthenticated) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    // Merge userId into params if provided
    const callParams = userId ? { ...params, userId } : params;
    
    try {
      const response = await journeyApi.getUserJourney(callParams);
      if (response.success) {
        setJourneyData(response.data);
        setPagination(response.pagination);
      } else {
        setError(response.message || 'Failed to fetch journey');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch journey');
      console.error('Fetch journey error:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshJourney = () => {
    fetchJourney();
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchJourney();
    } else {
      setJourneyData({
        entries: []
      });
      setPagination(null);
    }
  }, [isAuthenticated, userId]);

  return {
    journeyData,
    loading,
    error,
    pagination,
    fetchJourney,
    refreshJourney
  };
};