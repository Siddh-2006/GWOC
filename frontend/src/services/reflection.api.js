import apiClient from '../api/apiClient';

export const reflectionApi = {
  // Start new reflection session
  startReflection: async () => {
    try {
      console.log('Making API call to start reflection...');
      const response = await apiClient.post('/reflection/start');
      console.log('API response received:', response.data);
      return response.data;
    } catch (error) {
      console.error('Start reflection API error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw error.response?.data || { success: false, message: 'Network error' };
    }
  },

  // Submit answer to current question
  submitAnswer: async (sessionId, answerData) => {
    try {
      const response = await apiClient.post(`/reflection/${sessionId}/answer`, answerData);
      return response.data;
    } catch (error) {
      console.error('Submit answer API error:', error);
      throw error.response?.data || { success: false, message: 'Network error' };
    }
  },

  // Complete reflection session
  completeReflection: async (sessionId) => {
    try {
      const response = await apiClient.post(`/reflection/${sessionId}/complete`);
      return response.data;
    } catch (error) {
      console.error('Complete reflection API error:', error);
      throw error.response?.data || { success: false, message: 'Network error' };
    }
  },

  // Get reflection session data
  getReflectionSession: async (sessionId) => {
    try {
      const response = await apiClient.get(`/reflection/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Get reflection session API error:', error);
      throw error.response?.data || { success: false, message: 'Network error' };
    }
  },

  // Abandon reflection session
  abandonReflection: async (sessionId) => {
    try {
      const response = await apiClient.delete(`/reflection/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Abandon reflection API error:', error);
      throw error.response?.data || { success: false, message: 'Network error' };
    }
  },

  // Get user's reflection sessions
  getUserReflectionSessions: async (params = {}) => {
    try {
      const response = await apiClient.get('/reflection/user/sessions', { params });
      return response.data;
    } catch (error) {
      console.error('Get user reflection sessions API error:', error);
      throw error.response?.data || { success: false, message: 'Network error' };
    }
  },

  // Admin: Get all reflection sessions
  admin: {
    getAllReflectionSessions: async (params = {}) => {
      try {
        const response = await apiClient.get('/reflection/admin/all', { params });
        return response.data;
      } catch (error) {
        console.error('Get all reflection sessions API error:', error);
        throw error.response?.data || { success: false, message: 'Network error' };
      }
    },

    // Get reflection summary for admin
    getReflectionSummary: async (sessionId) => {
      try {
        const response = await apiClient.get(`/reflection/admin/summary/${sessionId}`);
        return response.data;
      } catch (error) {
        console.error('Get reflection summary API error:', error);
        throw error.response?.data || { success: false, message: 'Network error' };
      }
    },

    // Delete reflection session
    deleteReflectionSession: async (sessionId) => {
      try {
        const response = await apiClient.delete(`/reflection/admin/${sessionId}`);
        return response.data;
      } catch (error) {
        console.error('Delete reflection session API error:', error);
        throw error.response?.data || { success: false, message: 'Network error' };
      }
    },

    // Question Management
    getQuestions: async () => {
      try {
        const response = await apiClient.get('/reflection/admin/questions');
        return response.data;
      } catch (error) {
        console.error('Get admin questions API error:', error);
        throw error.response?.data || { success: false, message: 'Network error' };
      }
    },

    addQuestion: async (questionData) => {
      try {
        const response = await apiClient.post('/reflection/admin/questions', questionData);
        return response.data;
      } catch (error) {
        console.error('Add question API error:', error);
        throw error.response?.data || { success: false, message: 'Network error' };
      }
    },

    updateQuestion: async (questionId, questionData) => {
      try {
        const response = await apiClient.put(`/reflection/admin/questions/${questionId}`, questionData);
        return response.data;
      } catch (error) {
        console.error('Update question API error:', error);
        throw error.response?.data || { success: false, message: 'Network error' };
      }
    },

    deleteQuestion: async (questionId) => {
      try {
        const response = await apiClient.delete(`/reflection/admin/questions/${questionId}`);
        return response.data;
      } catch (error) {
        console.error('Delete question API error:', error);
        throw error.response?.data || { success: false, message: 'Network error' };
      }
    }
  }
};