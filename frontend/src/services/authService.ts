import axios from 'axios';
import type { User, MaritalStatus } from '@/shared/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
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

interface LoginResponse {
  user: User;
  token: string;
}

interface SignupData {
  fullName: string;
  email: string;
  password: string;
  age: number;
  location: {
    country: string;
    city: string;
  };
  maritalStatus: MaritalStatus;
}

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/api/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  signup: async (data: SignupData): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/api/auth/signup', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/api/auth/logout');
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/api/auth/me');
    return response.data;
  },

  googleLogin: async (idToken: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/api/auth/google', {
      idToken,
    });
    return response.data;
  },

  appleLogin: async (idToken: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/api/auth/apple', {
      idToken,
    });
    return response.data;
  },

  adminLogin: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/api/auth/admin-login', {
      email,
      password,
    });
    return response.data;
  },
};

