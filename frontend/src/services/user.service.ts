import { api } from './api';
import { User, Post, Pagination } from '@/types';

export interface UpdateUserData {
  username?: string;
  yearOfStudy?: string;
  degree?: string;
}

export interface UserPostsResult {
  posts: Post[];
  pagination: Pagination;
}

export const userService = {
  getUserById: async (userId: string): Promise<User> => {
    const { data } = await api.get(`/api/users/${userId}`);
    return data.data.user;
  },

  updateUser: async (updates: UpdateUserData): Promise<User> => {
    const { data } = await api.put('/api/users/me', updates);
    return data.data.user;
  },

  getUserPosts: async (userId: string, page = 1, limit = 10): Promise<UserPostsResult> => {
    const { data } = await api.get(`/api/users/${userId}/posts?page=${page}&limit=${limit}`);
    return data.data;
  },
};
