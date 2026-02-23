// src/lib/axios.ts
import axios from 'axios';
import { API_URL } from './config';

// إنشاء نسخة مركزية من Axios
const api = axios.create({
  baseURL: API_URL,
  timeout: 15000, // ✅ قطع الاتصال بعد 15 ثانية لو النت ضعيف بدل ما الموقع يعلق
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ 1. مُعترض الطلبات (Request Interceptor) - حقن التوكن
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      let token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (token) {
        token = token.replace(/"/g, '').trim();
        config.headers.Authorization = `Token ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ 2. مُعترض الاستجابة (Response Interceptor) - التعامل مع الطرد
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
        
        // منع التوجيه المتكرر لو هو أصلاً في صفحة اللوجين
        if (window.location.pathname !== '/login') {
            window.location.href = '/login'; 
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;