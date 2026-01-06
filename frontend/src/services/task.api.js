import apiClient from '../api/apiClient';

export const taskApi = {
  // User APIs
  getMyTasks: async (params = {}) => {
    const response = await apiClient.get('/tasks/my', { params });
    return response.data;
  },

  updateTaskStatus: async (taskId, data) => {
    const response = await apiClient.put(`/tasks/${taskId}/status`, data);
    return response.data;
  },

  // Admin APIs
  admin: {
    createTask: async (taskData) => {
      const response = await apiClient.post('/tasks', taskData);
      return response.data;
    },

    getAllTasks: async (params = {}) => {
      const response = await apiClient.get('/tasks/admin/all', { params });
      return response.data;
    },

    getTasksByBooking: async (bookingId) => {
      const response = await apiClient.get(`/tasks/booking/${bookingId}`);
      return response.data;
    },

    updateTask: async (taskId, taskData) => {
      const response = await apiClient.put(`/tasks/${taskId}`, taskData);
      return response.data;
    },

    deleteTask: async (taskId) => {
      const response = await apiClient.delete(`/tasks/${taskId}`);
      return response.data;
    }
  }
};