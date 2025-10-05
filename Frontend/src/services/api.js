import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 120000, // 2 minutes wait for AI services
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
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
  addApiKey: (apiKeyData) => api.post('/api/apikey', apiKeyData),
  deleteApiKey: (serviceName) => api.delete(`/api/apikey/${serviceName}`),
  validateApiKey: (serviceName) => api.post('/api/apikey/validate', { serviceName }),
};

// Helper function to create API instance with custom timeout
const createApiWithTimeout = (timeout) => {
  return axios.create({
    baseURL: 'http://localhost:3000',
    timeout,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

// Chat API
export const chatAPI = {
  getChatSessions: () => api.get('/api/chat/sessions'),
  createChatSession: (sessionData) => api.post('/api/chat/sessions', sessionData),
  getMessages: (sessionId) => api.get(`/api/chat/sessions/${sessionId}/messages`),
  sendMessage: (sessionId, messageData) => {
    const apiWithTimeout = createApiWithTimeout(120000);
    
    // Add auth token to the custom instance
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    if (token) {
      apiWithTimeout.defaults.headers.Authorization = `Bearer ${token}`;
    }
    
    return apiWithTimeout.post(`/api/chat/sessions/${sessionId}/messages`, messageData);
  },
  // broadcastMessage: (messageData) => api.post('/api/chat/broadcast', messageData),
  deleteChatSession: (sessionId) => api.delete(`/api/chat/sessions/${sessionId}`),
};

export default api;