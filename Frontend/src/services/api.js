import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'https://localhost:7001',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    console.log('API Request:', config.url, 'Token:', token ? 'Present' : 'Missing');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.config.url, 'Status:', response.status);
    return response;
  },
  (error) => {
    console.error('API Error:', error.config?.url, 'Status:', error.response?.status, 'Message:', error.message);
    if (error.response?.status === 401) {
      // Token expired or invalid
      sessionStorage.removeItem('token');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
  googleAuth: (googleData) => api.post('/api/auth/google', googleData),
  getCurrentUser: () => api.get('/api/auth/me'),
};

// API Key API
export const apiKeyAPI = {
  getApiKeys: () => api.get('/api/apikey'),
  saveApiKey: (apiKeyData) => api.post('/api/apikey', apiKeyData),
  deleteApiKey: (serviceName) => api.delete(`/api/apikey/${serviceName}`),
  validateApiKey: (serviceName) => api.post('/api/apikey/validate', { serviceName }),
};

// Chat API
export const chatAPI = {
  getChatSessions: () => api.get('/api/chat/sessions'),
  createChatSession: (sessionData) => api.post('/api/chat/sessions', sessionData),
  updateChatSession: (sessionId, updateData) => api.put(`/api/chat/sessions/${sessionId}`, updateData),
  getMessages: (sessionId) => api.get(`/api/chat/sessions/${sessionId}/messages`),
  sendMessage: (sessionId, messageData) => api.post(`/api/chat/sessions/${sessionId}/messages`, messageData),
  deleteChatSession: (sessionId) => api.delete(`/api/chat/sessions/${sessionId}`),
};

export default api;
