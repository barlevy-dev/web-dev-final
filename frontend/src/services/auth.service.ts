import axios from 'axios';
import { api } from './api';
import { User } from '@/types';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://localhost:5000';

export const authService = {
  register: async (
    email: string,
    username: string,
    password: string
  ): Promise<{ user: User; accessToken: string }> => {
    const { data } = await api.post('/api/auth/register', { email, username, password });
    return data.data;
  },

  login: async (
    email: string,
    password: string
  ): Promise<{ user: User; accessToken: string }> => {
    const { data } = await api.post('/api/auth/login', { email, password });
    return data.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/api/auth/logout');
  },

  // Uses a plain axios call to avoid triggering the 401 refresh interceptor
  refresh: async (): Promise<{ accessToken: string }> => {
    const { data } = await axios.post(
      `${BACKEND_URL}/api/auth/refresh`,
      {},
      { withCredentials: true }
    );
    return data.data;
  },

  getMe: async (): Promise<User> => {
    const { data } = await api.get('/api/users/me');
    return data.data.user;
  },
};
