import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const client = axios.create({ baseURL: API_BASE_URL, timeout: 15000 });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('intellistock_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401 && !error.config.url.includes('/auth/login')) {
      localStorage.removeItem('intellistock_token');
      localStorage.removeItem('intellistock_user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    const message = error.response?.data?.message || error.message || 'Something went wrong. Please try again.';
    const errors = error.response?.data?.errors || null;
    return Promise.reject({ message, errors, status: error.response?.status });
  }
);

export default client;
