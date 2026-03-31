import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/\d/, 'Password must contain at least one number'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateUserSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .optional(),
  yearOfStudy: z.string().optional(),
  degree: z.string().optional(),
});

export const createPostSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be at most 200 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  courseTag: z.string().min(1, 'Course tag is required'),
  difficultyLevel: z.enum(['easy', 'medium', 'hard'], 'Difficulty must be easy, medium, or hard'),
});

export const updatePostSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be at most 200 characters')
    .optional(),
  content: z.string().min(10, 'Content must be at least 10 characters').optional(),
  courseTag: z.string().min(1, 'Course tag is required').optional(),
  difficultyLevel: z.enum(['easy', 'medium', 'hard'], 'Difficulty must be easy, medium, or hard').optional(),
});

export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(500, 'Comment must be at most 500 characters'),
});

export const aiStudyTipsSchema = z.object({
  topic: z.string().min(1, 'Topic is required'),
  context: z.string().optional(),
});

export const aiEnhanceContentSchema = z.object({
  content: z.string().min(1, 'Content is required'),
});

export const aiSuggestTagsSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
});
