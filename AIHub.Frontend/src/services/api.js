import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:3000', // .NET Core API URL
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
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
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
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
  getMessages: (sessionId) => api.get(`/api/chat/sessions/${sessionId}/messages`),
  sendMessage: (sessionId, messageData) => api.post(`/api/chat/sessions/${sessionId}/messages`, messageData),
  broadcastMessage: (messageData) => api.post('/api/chat/broadcast', messageData),
  deleteChatSession: (sessionId) => api.delete(`/api/chat/sessions/${sessionId}`),
};

export default api;
