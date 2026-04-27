import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the JWT token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unified API responses and errors
api.interceptors.response.use(
  (response) => {
    // Return just the data payload if it matches our standard ApiResponse
    if (response.data && 'success' in response.data) {
      if(response.data.success) {
        return response.data.data !== undefined ? response.data.data : response.data.message;
      } else {
        return Promise.reject(new Error(response.data.message));
      }
    }
    return response.data;
  },
  (error) => {
    // Handle specific status codes
    if (error.response?.status === 401) {
      Cookies.remove('token');
      Cookies.remove('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export default api;
