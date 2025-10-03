import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  timeout: 10000, // Prevent hanging requests (10s)
});

// No Authorization header needed; httpOnly cookie will be sent automatically

export default api;
