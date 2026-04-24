import { api } from './api';
import { Post, Pagination } from '@/types';

export interface PostFilters {
  courseTag?: string;
  difficultyLevel?: string;
  search?: string;
}

export interface PostsResult {
  posts: Post[];
  pagination: Pagination;
}

export interface CreatePostData {
  title: string;
  content: string;
  courseTag: string;
  difficultyLevel: 'easy' | 'medium' | 'hard';
  imageUrl?: string;
  aiEnhanced?: boolean;
}

export const postService = {
  getPosts: async (filters: PostFilters = {}, page = 1, limit = 10): Promise<PostsResult> => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));
    if (filters.courseTag) params.set('courseTag', filters.courseTag);
    if (filters.difficultyLevel) params.set('difficultyLevel', filters.difficultyLevel);
    if (filters.search) params.set('search', filters.search);
    const { data } = await api.get(`/api/posts?${params}`);
    return data.data;
  },

  getPostById: async (postId: string): Promise<Post> => {
    const { data } = await api.get(`/api/posts/${postId}`);
    return data.data.post;
  },

  createPost: async (postData: CreatePostData): Promise<Post> => {
    const { data } = await api.post('/api/posts', postData);
    return data.data.post;
  },

  updatePost: async (
    postId: string,
    updates: Partial<CreatePostData>
  ): Promise<Post> => {
    const { data } = await api.put(`/api/posts/${postId}`, updates);
    return data.data.post;
  },

  deletePost: async (postId: string): Promise<void> => {
    await api.delete(`/api/posts/${postId}`);
  },

  likePost: async (postId: string): Promise<Post> => {
    const { data } = await api.post(`/api/posts/${postId}/like`);
    return data.data.post;
  },

  unlikePost: async (postId: string): Promise<Post> => {
    const { data } = await api.delete(`/api/posts/${postId}/like`);
    return data.data.post;
  },
};
