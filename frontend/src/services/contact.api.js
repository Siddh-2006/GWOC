const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class ContactAPI {
  async submitContactForm(formData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/contact/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.message || 'Failed to submit contact form');
        error.details = data.errors; // Capture validation errors array
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Contact form submission error:', error);
      throw error;
    }
  }

  async getContactMessages(params = {}) {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.status) queryParams.append('status', params.status);
      if (params.search) queryParams.append('search', params.search);

      const response = await fetch(`${API_BASE_URL}/api/contact/messages?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch contact messages');
      }

      return data;
    } catch (error) {
      console.error('Error fetching contact messages:', error);
      throw error;
    }
  }

  async getContactMessage(id) {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/api/contact/messages/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch contact message');
      }

      return data;
    } catch (error) {
      console.error('Error fetching contact message:', error);
      throw error;
    }
  }

  async updateContactStatus(id, updates) {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/api/contact/messages/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update contact message');
      }

      return data;
    } catch (error) {
      console.error('Error updating contact message:', error);
      throw error;
    }
  }

  async deleteContactMessage(id) {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/api/contact/messages/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete contact message');
      }

      return data;
    } catch (error) {
      console.error('Error deleting contact message:', error);
      throw error;
    }
  }

  async getContactStats() {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/api/contact/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch contact statistics');
      }

      return data;
    } catch (error) {
      console.error('Error fetching contact stats:', error);
      throw error;
    }
  }
}

export default new ContactAPI();