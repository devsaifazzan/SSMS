import axios from 'axios';

const DEFAULT_RENDER_BACKEND = 'https://ssms-backend-v03k.onrender.com/api/v1';

const getBaseURL = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  // If running in browser on production host (Vercel), default to live Render backend URL
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return DEFAULT_RENDER_BACKEND;
  }
  return 'http://localhost:8000/api/v1';
};

const client = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor for attaching authorization token
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;
