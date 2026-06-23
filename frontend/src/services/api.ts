import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('passion-streams-auth');
  if (token) {
    try {
      const parsed = JSON.parse(token);
      if (parsed.state?.token) {
        config.headers.Authorization = `Bearer ${parsed.state.token}`;
      }
    } catch (e) {
      // Invalid token format
    }
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Skip redirect for guest test mode (no real auth token)
      try {
        const stored = localStorage.getItem('passion-streams-auth');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.state?.isGuest) {
            return Promise.reject(error);
          }
        }
      } catch {
        // Invalid stored auth state
      }
      // Unauthorized - clear auth and redirect to login
      localStorage.removeItem('passion-streams-auth');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

