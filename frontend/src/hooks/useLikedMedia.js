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
      console.log('useLikedMedia: Not authenticated, skipping fetch');
      return;
    }
    
    console.log('useLikedMedia: Fetching liked media...');
    console.log('useLikedMedia: Access token:', localStorage.getItem('accessToken') ? 'Present' : 'Missing');
    setLoading(true);
    setError(null);
    
    try {
      const response = await mediaApi.getUserLikedMedia(params);
      console.log('useLikedMedia: API response:', response);
      if (response.success) {
        setLikedMedia(response.data);
        setPagination(response.pagination);
        console.log('useLikedMedia: Set liked media:', response.data);
      } else {
        setError(response.message || 'Failed to fetch liked media');
        console.log('useLikedMedia: API error:', response.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch liked media');
      console.error('useLikedMedia: Fetch error:', err);
      console.error('useLikedMedia: Error response:', err.response?.data);
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
      }
    } catch (err) {
      console.error('Toggle like error:', err);
      throw err;
    }
  };

  const refreshLikedMedia = () => {
    fetchLikedMedia();
  };

  useEffect(() => {
    console.log('useLikedMedia: useEffect triggered, isAuthenticated =', isAuthenticated);
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