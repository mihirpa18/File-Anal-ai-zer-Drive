import axios from 'axios';
import config from '../config';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: config.API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add token to all requests
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    
    // If 401, token might be expired
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// API Methods
const apiService = {
  // ========== Authentication ==========
  
  // Register new user
  register: async (name, email, password) => {
    const response = await api.post('/auth/register', {
      name,
      email,
      password
    });
    return response.data;
  },

  // Login user
  login: async (email, password) => {
    const response = await api.post('/auth/login', {
      email,
      password
    });
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Logout user
  logout: async () => {
    try {
      const response = await api.post('/auth/logout');
      return response.data;
    } catch (error) {
      // Logout anyway even if API call fails
      return { success: true };
    }
  },

  // ========== Files ==========
  
  // Health check
  healthCheck: async () => {
    const response = await api.get('/health');
    return response.data;
  },

  // Upload file
  uploadFile: async (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    return response.data;
  },

  // Get all files
  getAllFiles: async (params = {}) => {
    const response = await api.get('/files', { params });
    return response.data;
  },

  // Get single file
  getFile: async (id) => {
    const response = await api.get(`/files/${id}`);
    return response.data;
  },

  // Delete file
  deleteFile: async (id) => {
    const response = await api.delete(`/files/${id}`);
    return response.data;
  },

  // Get all tags
  getAllTags: async () => {
    const response = await api.get('/files/search/tags');
    return response.data;
  },

  // Get statistics
  getStatistics: async () => {
    const response = await api.get('/files/stats/summary');
    return response.data;
  },

  // Get download URL
  getDownloadUrl: (id) => {
    const token = localStorage.getItem('token');
    return `${config.API_URL}/files/download/${id}?token=${token}`;
  },

  // Get file preview URL
  getFileUrl: (filename) => {
    return `http://localhost:5000/uploads/${filename}`;
  },
};

export default apiService;