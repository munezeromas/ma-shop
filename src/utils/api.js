import axios from 'axios';
import toast from 'react-hot-toast';


const api = axios.create({
  baseURL: 'https://dummyjson.com',
  timeout: 15000,
});

function getToken() {
  try {
    const userRaw = localStorage.getItem('user');
    if (userRaw) {
      const u = JSON.parse(userRaw);
      return u.token || localStorage.getItem('token') || null;
    }
    return localStorage.getItem('token');
  } catch {
    return localStorage.getItem('token');
  }
}

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    toast.error('Request error');
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (!error.response) {
      toast.error('Network error — check your connection');
      return Promise.reject(error);
    }

    if (status === 401) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      toast.error('Session expired. Please log in again.');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    const msg = error?.response?.data?.message || `Request failed (${status})`;
    toast.error(msg);
    return Promise.reject(error);
  }
);

export default api;
