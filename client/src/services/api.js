import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Authorization header automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('inari_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Global response interceptor for easy error formatting
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    
    // Create a normalized error object
    const normalizedError = new Error(message);
    normalizedError.status = error.response?.status;
    normalizedError.originalError = error;
    
    return Promise.reject(normalizedError);
  }
);

export default api;
