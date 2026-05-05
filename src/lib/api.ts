import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000, // 15 seconds timeout
});

api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('skilllink_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    console.warn('API: LocalStorage access failed', e);
  }
  return config;
});

export default api;
