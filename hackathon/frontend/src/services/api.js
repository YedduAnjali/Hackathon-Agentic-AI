import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// JWT Interceptor - Attach token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor - Handle token expiry
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear auth and redirect to login
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_info');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const agentAPI = {
  ...api,
  
  // Execute a goal (primary method)
  execute: async (goal, userId) => {
    const response = await api.post('/agent/execute', { goal, userId });
    return response.data;
  },
  
  // Execute specific task
  executeTask: async (task, userId, goalId) => {
    const response = await api.post('/agent/task/execute', { task, userId, goalId });
    return response.data;
  },

  // Get memories
  getMemories: async (goalId, type = null, limit = 50) => {
    const params = { limit };
    if (type) params.type = type;
    const response = await api.get(`/agent/memories/${goalId}`, { params });
    return response.data;
  },

  // Get reflection
  getReflection: async (goalId, executionResults) => {
    const response = await api.post(`/agent/reflect/${goalId}`, { executionResults });
    return response.data;
  },

  // Get user patterns
  getPatterns: async (userId) => {
    const response = await api.get(`/agent/patterns/${userId}`);
    return response.data;
  }
};

export default agentAPI;
