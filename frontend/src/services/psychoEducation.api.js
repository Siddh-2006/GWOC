import apiClient from '../api/apiClient.js';

export const psychoEducationApi = {
  // Public endpoints
  getPublishedContent: async (params = {}) => {
    const response = await apiClient.get('/psycho-education/published', { params });
    return response.data;
  },

  getContent: async (contentId) => {
    const response = await apiClient.get(`/psycho-education/${contentId}`);
    return response.data;
  },

  likeContent: async (contentId) => {
    let retries = 3;
    let lastError;
    
    while (retries > 0) {
      try {
        const response = await apiClient.post(`/psycho-education/${contentId}/like`);
        return response.data;
      } catch (error) {
        lastError = error;
        
        // Don't retry for client errors (4xx)
        if (error.response?.status >= 400 && error.response?.status < 500) {
          throw error;
        }
        
        retries--;
        if (retries > 0) {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, (4 - retries) * 1000));
        }
      }
    }
    
    throw lastError;
  },

  // Admin endpoints
  createContent: async (contentData) => {
    const response = await apiClient.post('/psycho-education', contentData);
    return response.data;
  },

  getAllContent: async (params = {}) => {
    const response = await apiClient.get('/psycho-education/admin/all', { params });
    return response.data;
  },

  updateContent: async (contentId, updates) => {
    const response = await apiClient.put(`/psycho-education/${contentId}`, updates);
    return response.data;
  },

  deleteContent: async (contentId) => {
    const response = await apiClient.delete(`/psycho-education/${contentId}`);
    return response.data;
  }
};