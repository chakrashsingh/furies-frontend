import axios from 'axios';

const API = axios.create({
  baseURL: 'https://furies-backend-rm9k.onrender.com/api/v1',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const signup  = (data) => API.post('/auth/signup', data);
export const login   = (data) => API.post('/auth/login',  data);
export const generateLink = (data) => API.post('/links/generate', data);
export const getMyLinks   = ()     => API.get('/links/my-links');
export const getEarnings  = ()     => API.get('/links/earnings');

export default API;
