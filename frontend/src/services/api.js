import axios from 'axios';
import config from '../config';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: config.API_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// API Methods
const apiService = {
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
    return `${config.API_URL}/files/download/${id}`;
  },

  // Get file preview URL
  getFileUrl: (filename) => {
    return `http://localhost:5000/uploads/${filename}`;
  },
};

export default apiService;