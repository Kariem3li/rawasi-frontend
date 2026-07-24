import axios from 'axios';
import Cookies from 'js-cookie'; 
import { API_URL } from './config';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = Cookies.get('token') || localStorage.getItem('token') || sessionStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Token ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        Cookies.remove('token');
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('is_staff');
        
        window.dispatchEvent(new Event('force_logout'));
        
        if (window.location.pathname !== '/login') {
            window.location.href = '/login'; 
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;