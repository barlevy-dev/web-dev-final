export interface User {
  _id: string;
  email: string;
  username: string;
  profileImageUrl?: string;
  yearOfStudy?: string;
  degree?: string;
  authProvider: 'local' | 'google' | 'facebook';
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  _id: string;
  userId: string;
  authorName: string;
  authorImageUrl?: string;
  title: string;
  content: string;
  courseTag: string;
  difficultyLevel: 'easy' | 'medium' | 'hard';
  imageUrl?: string;
  aiEnhanced?: boolean;
  likes: number;
  likedBy: string[];
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  postId: string;
  userId: string;
  authorName: string;
  authorImageUrl?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: Pagination;
}

export interface ApiError {
  status: 'fail' | 'error';
  message: string;
}
