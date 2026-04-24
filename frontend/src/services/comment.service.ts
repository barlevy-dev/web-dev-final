import { api } from './api';
import { Comment, Pagination } from '@/types';

export interface CommentsResult {
  comments: Comment[];
  pagination: Pagination;
}

export const commentService = {
  getComments: async (postId: string, page = 1, limit = 10): Promise<CommentsResult> => {
    const { data } = await api.get(`/api/posts/${postId}/comments?page=${page}&limit=${limit}`);
    return data.data;
  },

  createComment: async (postId: string, content: string): Promise<Comment> => {
    const { data } = await api.post(`/api/posts/${postId}/comments`, { content });
    return data.data.comment;
  },

  deleteComment: async (commentId: string): Promise<void> => {
    await api.delete(`/api/comments/${commentId}`);
  },
};
