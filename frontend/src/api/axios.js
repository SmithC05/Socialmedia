import axios from 'axios';

const apiURL = import.meta.env.VITE_API_URL || '/api';
export const backendUrl = apiURL.endsWith('/api') ? apiURL.slice(0, -4) : apiURL;

const api = axios.create({
  baseURL: apiURL,
});

// Attach JWT token to every request if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
