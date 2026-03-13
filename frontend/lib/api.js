const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get user ID from localStorage
const getUserId = () => {
  const user = localStorage.getItem('user');
  if (user) {
    try {
      const userObj = JSON.parse(user);
      if (userObj && userObj.id) {
        return userObj.id;
      }
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      // Clear corrupted data
      localStorage.removeItem('user');
      return null;
    }
  }
  return null;
};

// Get headers with user ID
const getHeaders = (includeJson = true) => {
  const headers = {};
  if (includeJson) {
    headers['Content-Type'] = 'application/json';
  }
  const userId = getUserId();
  if (userId) {
    headers['X-User-ID'] = userId;
  } else {
    console.warn('⚠️ No user ID found in localStorage - API calls may fail');
  }
  return headers;
};

export const api = {
  // Jobs
  async getJobs() {
    const response = await fetch(`${API_BASE_URL}/jobs`, {
      headers: getHeaders(false)
    });
    if (!response.ok) throw new Error('Failed to fetch jobs');
    return response.json();
  },

  async getJob(id) {
    const response = await fetch(`${API_BASE_URL}/jobs/${id}`);
    if (!response.ok) throw new Error('Failed to fetch job');
    return response.json();
  },

  async createJob(jobData) {
    const userId = getUserId();
    const response = await fetch(`${API_BASE_URL}/jobs`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ ...jobData, user_id: userId })
    });
    if (!response.ok) throw new Error('Failed to create job');
    return response.json();
  },

  async updateJob(id, jobData) {
    const userId = getUserId();
    const response = await fetch(`${API_BASE_URL}/jobs/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ ...jobData, user_id: userId })
    });
    if (!response.ok) throw new Error('Failed to update job');
    return response.json();
  },

  async deleteJob(id) {
    const response = await fetch(`${API_BASE_URL}/jobs/${id}`, {
      method: 'DELETE',
      headers: getHeaders(false)
    });
    if (!response.ok) throw new Error('Failed to delete job');
    return response.json();
  },

  // Applicants
  async getApplicants(filter, position) {
    const params = new URLSearchParams();
    if (filter) params.append('filter', filter);
    if (position) params.append('position', position);
    const response = await fetch(`${API_BASE_URL}/applicants?${params}`, {
      headers: getHeaders(false)
    });
    if (!response.ok) throw new Error('Failed to fetch applicants');
    return response.json();
  },

  async getApplicantStats() {
    const response = await fetch(`${API_BASE_URL}/applicants/stats`, {
      headers: getHeaders(false)
    });
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  },

  async getApplicant(id) {
    const response = await fetch(`${API_BASE_URL}/applicants/${id}`, {
      headers: getHeaders(false)
    });
    if (!response.ok) throw new Error('Failed to fetch applicant');
    return response.json();
  },

  async createApplicant(applicantData) {
    const response = await fetch(`${API_BASE_URL}/applicants`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(applicantData)
    });
    if (!response.ok) throw new Error('Failed to create applicant');
    return response.json();
  },

  async updateApplicant(id, applicantData) {
    const userId = getUserId();
    const response = await fetch(`${API_BASE_URL}/applicants/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ ...applicantData, user_id: userId })
    });
    if (!response.ok) throw new Error('Failed to update applicant');
    return response.json();
  },

  async deleteApplicant(id) {
    const response = await fetch(`${API_BASE_URL}/applicants/${id}`, {
      method: 'DELETE',
      headers: getHeaders(false)
    });
    if (!response.ok) throw new Error('Failed to delete applicant');
    return response.json();
  },

  // Auth
  async register(userData) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to register');
    }
    return response.json();
  },

  async login(credentials) {
    // Clear any existing user data before login
    localStorage.removeItem('user');
    
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to login');
    }
    const data = await response.json();
    
    // Store user in localStorage - CRITICAL for multi-tenancy
    if (data.user && data.user.id) {
      localStorage.setItem('user', JSON.stringify(data.user));
      console.log('✅ User logged in:', data.user.id, data.user.email);
    } else {
      throw new Error('Invalid user data received from server');
    }
    return data;
  },

  // File Upload
  async uploadResume(file) {
    const formData = new FormData();
    formData.append('resume', file);
    
    const response = await fetch(`${API_BASE_URL}/upload/resume`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload resume');
    }
    return response.json();
  },

  // Get resume URL
  getResumeUrl(filePath) {
    if (!filePath) return null;
    return `${API_BASE_URL.replace('/api', '')}/api/resume/${filePath}`;
  },

  // Settings
  async getSettings() {
    const response = await fetch(`${API_BASE_URL}/settings`, {
      headers: getHeaders(false)
    });
    if (!response.ok) throw new Error('Failed to fetch settings');
    return response.json();
  },

  async updateSettings(settingsData) {
    const response = await fetch(`${API_BASE_URL}/settings`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(settingsData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update settings');
    }
    return response.json();
  }
};

