import axios from 'axios';

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor to attach JWT
api.interceptors.request.use((config) => {
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    const { token } = JSON.parse(userInfo);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password) => api.post('/auth/register', { name, email, password }),
};

// Subjects
export const subjectsAPI = {
  getAll: () => api.get('/subjects'),
  create: (data) => api.post('/subjects', data),
  update: (id, data) => api.put(`/subjects/${id}`, data),
  delete: (id) => api.delete(`/subjects/${id}`),
};

export const aiAPI = {
  getPredictions: () => api.get('/ai/predict'),
  getRecommendations: () => api.get('/ai/recommend'),
  getInsights: () => api.get('/ai/insights'),
  getReport: () => api.get('/ai/report'),
  getRisk: () => api.get('/ai/risk'),
  getBunkPlan: (bunks = 1) => api.get(`/ai/bunk-plan?desiredBunks=${bunks}`),
  chat: (message, chatHistory) => api.post('/ai/chat', { message, chatHistory }),
  simulate: (data) => api.post('/ai/simulate', data),
  logAttendance: (subjectId, action) => api.post('/ai/log-attendance', { subjectId, action }),
};

// Admin User Management
export const adminAPI = {
  getAllUsers: () => api.get('/auth/users'),
  toggleAdmin: (id) => api.put(`/auth/users/${id}/toggle-admin`),
  deleteUser: (id) => api.delete(`/auth/users/${id}`),
};

export default api;
