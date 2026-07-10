import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add Telegram init data to every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    // Get Telegram WebApp init data
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.initData) {
      config.headers['X-Telegram-Init-Data'] = tg.initData;
    }
  }

  // Add admin token if available
  const adminToken = typeof window !== 'undefined'
    ? localStorage.getItem('admin_token')
    : null;
  if (adminToken && config.url?.includes('/admin')) {
    config.headers['Authorization'] = `Bearer ${adminToken}`;
  }

  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If admin route, redirect to login
      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
        localStorage.removeItem('admin_token');
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
