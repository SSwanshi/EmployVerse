import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'https://gohire-applicant.onrender.com';

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token and handle FormData uploads
api.interceptors.request.use(
  (config) => {
    // Add JWT token to Authorization header
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // If the data is FormData, remove Content-Type header
    // Axios will automatically set it with the correct boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network errors
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.error('Network Error:', error);
      window.location.href = '/error?code=503&message=Cannot connect to server';
    }

    // Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }

    // Server errors (500+)
    if (error.response?.status >= 500) {
      const msg = error.response.data?.error || 'Server error';
      window.location.href = `/error?code=${error.response.status}&message=${encodeURIComponent(msg)}`;
    }

    return Promise.reject(error);
  }
);


export default api;

