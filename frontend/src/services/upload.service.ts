import { api } from './api';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://localhost:5001';

export const uploadService = {
  uploadPostImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    const { data } = await api.post('/api/upload/post', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    // imageUrl is a relative path like /uploads/posts/xxx.jpg
    return data.data.imageUrl as string;
  },

  // In dev, Vite proxies /uploads through the same origin so no prefix needed.
  // In production, prepend the backend URL.
  resolve: (imageUrl: string): string => {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http')) return imageUrl;
    if (import.meta.env.DEV) return imageUrl; // Vite proxy handles it
    return `${BACKEND_URL}${imageUrl}`;
  },
};
