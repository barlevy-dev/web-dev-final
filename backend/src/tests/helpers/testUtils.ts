import jwt from 'jsonwebtoken';
import { User, IUser } from '../../models/user.model';
import { Post } from '../../models/post.model';
import { Comment } from '../../models/comment.model';
import { Types } from 'mongoose';

/**
 * Generate a test JWT access token
 */
export const generateTestAccessToken = (payload: {
  userId: string;
  email: string;
  username: string;
}): string => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'test_jwt_secret', {
    expiresIn: '15m',
  });
};

/**
 * Generate a test JWT refresh token
 */
export const generateTestRefreshToken = (payload: {
  userId: string;
  email: string;
  username: string;
}): string => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET || 'test_refresh_secret', {
    expiresIn: '7d',
  });
};

/**
 * Create a test user in the database
 */
export const createTestUser = async (overrides?: Partial<IUser>): Promise<IUser> => {
  const defaultUser = {
    email: `test${Date.now()}@example.com`,
    username: `testuser${Date.now()}`,
    password: 'Test123456',
    authProvider: 'local' as const,
    yearOfStudy: '3rd Year',
    degree: 'Computer Science',
  };

  const user = new User({ ...defaultUser, ...overrides });
  await user.save();
  return user;
};

/**
 * Create a test post in the database
 */
export const createTestPost = async (userId: Types.ObjectId, overrides?: any) => {
  const defaultPost = {
    userId,
    authorName: 'Test User',
    title: 'Test Post Title',
    content: 'This is test post content with more than 10 characters.',
    courseTag: 'Computer Science',
    difficultyLevel: 'medium',
    likes: 0,
    likedBy: [],
    commentsCount: 0,
  };

  const post = new Post({ ...defaultPost, ...overrides });
  await post.save();
  return post;
};

/**
 * Create a test comment in the database
 */
export const createTestComment = async (
  postId: Types.ObjectId,
  userId: Types.ObjectId,
  overrides?: any
) => {
  const defaultComment = {
    postId,
    userId,
    authorName: 'Test User',
    content: 'This is a test comment.',
  };

  const comment = new Comment({ ...defaultComment, ...overrides });
  await comment.save();
  return comment;
};

/**
 * Create multiple test users
 */
export const createTestUsers = async (count: number): Promise<IUser[]> => {
  const users: IUser[] = [];
  for (let i = 0; i < count; i++) {
    const user = await createTestUser({
      email: `testuser${i}@example.com`,
      username: `testuser${i}`,
    });
    users.push(user);
  }
  return users;
};

/**
 * Create multiple test posts
 */
export const createTestPosts = async (userId: Types.ObjectId, count: number) => {
  const posts = [];
  for (let i = 0; i < count; i++) {
    const post = await createTestPost(userId, {
      title: `Test Post ${i}`,
      content: `Test post content ${i} with more than 10 characters.`,
    });
    posts.push(post);
  }
  return posts;
};

/**
 * Get authentication header with Bearer token
 */
export const getAuthHeader = (token: string): { Authorization: string } => {
  return { Authorization: `Bearer ${token}` };
};

/**
 * Extract user ID from token
 */
export const getUserIdFromToken = (token: string): string => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test_jwt_secret') as any;
  return decoded.userId;
};

/**
 * Wait for a specified number of milliseconds
 */
export const wait = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Generate a random string
 */
export const generateRandomString = (length: number): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
