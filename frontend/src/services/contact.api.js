import apiClient from '../api/apiClient';

class ContactAPI {
  async submitContactForm(formData) {
    const response = await apiClient.post('/contact/submit', formData);
    return response.data;
  }

  async getContactMessages(params = {}) {
    const response = await apiClient.get('/contact/messages', { params });
    return response.data;
  }

  async getContactMessage(id) {
    const response = await apiClient.get(`/contact/messages/${id}`);
    return response.data;
  }

  async updateContactStatus(id, updates) {
    const response = await apiClient.patch(`/contact/messages/${id}`, updates);
    return response.data;
  }

  async deleteContactMessage(id) {
    const response = await apiClient.delete(`/contact/messages/${id}`);
    return response.data;
  }

  async getContactStats() {
    const response = await apiClient.get('/contact/stats');
    return response.data;
  }
}

export default new ContactAPI();