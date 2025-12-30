import { useState, useEffect } from 'react';
import { mediaApi } from '../services/media.api';
import useAuthStore from '../store/useAuthStore';

export const useLikedMedia = () => {
  const { isAuthenticated } = useAuthStore();
  const [likedMedia, setLikedMedia] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  const fetchLikedMedia = async (params = {}) => {
    if (!isAuthenticated) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await mediaApi.getUserLikedMedia(params);
      if (response.success) {
        setLikedMedia(response.data);
        setPagination(response.pagination);
      } else {
        setError(response.message || 'Failed to fetch liked media');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch liked media');
      console.error('❌ Fetch liked media error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (mediaId) => {
    try {
      const response = await mediaApi.likeMedia(mediaId);
      
      if (response.success) {
        // If media was unliked, remove it from the liked list
        if (!response.data.hasLiked) {
          setLikedMedia(prev => prev.filter(media => media._id !== mediaId));
        }
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to toggle like');
      }
    } catch (err) {
      console.error('❌ Toggle like error:', err.message);
      
      // Handle specific error types
      if (err.response?.status === 503) {
        throw new Error('Database connection issue. Please try again in a moment.');
      } else if (err.response?.status === 401) {
        throw new Error('Please log in to like content.');
      } else if (err.response?.status === 404) {
        throw new Error('Content not found.');
      } else {
        throw new Error(err.response?.data?.message || err.message || 'Failed to update like status');
      }
    }
  };

  const refreshLikedMedia = () => {
    fetchLikedMedia();
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchLikedMedia();
    } else {
      setLikedMedia([]);
      setPagination(null);
    }
  }, [isAuthenticated]);

  return {
    likedMedia,
    loading,
    error,
    pagination,
    fetchLikedMedia,
    toggleLike,
    refreshLikedMedia
  };
};