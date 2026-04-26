import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Schemas inlined here to mirror what the form components use,
// so these tests remain independent of React.

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/\d/, 'Password must contain at least one number'),
});

const createPostSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  courseTag: z.string().min(1, 'Course tag is required'),
  difficultyLevel: z.enum(['easy', 'medium', 'hard']),
});

// ─── loginSchema ──────────────────────────────────────────────────────────────

describe('loginSchema', () => {
  it('accepts valid credentials', () => {
    expect(loginSchema.safeParse({ email: 'test@example.com', password: 'secret' }).success).toBe(true);
  });

  it('rejects invalid email', () => {
    const r = loginSchema.safeParse({ email: 'not-an-email', password: 'secret' });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.flatten().fieldErrors.email).toBeDefined();
  });

  it('rejects empty password', () => {
    const r = loginSchema.safeParse({ email: 'test@example.com', password: '' });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.flatten().fieldErrors.password).toBeDefined();
  });

  it('rejects missing fields', () => {
    expect(loginSchema.safeParse({}).success).toBe(false);
  });
});

// ─── registerSchema ───────────────────────────────────────────────────────────

describe('registerSchema', () => {
  const valid = { username: 'validuser', email: 'test@example.com', password: 'Pass123' };

  it('accepts valid registration data', () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects username shorter than 3 characters', () => {
    const r = registerSchema.safeParse({ ...valid, username: 'ab' });
    expect(r.success).toBe(false);
  });

  it('rejects username longer than 30 characters', () => {
    const r = registerSchema.safeParse({ ...valid, username: 'a'.repeat(31) });
    expect(r.success).toBe(false);
  });

  it('accepts username with exactly 3 characters', () => {
    expect(registerSchema.safeParse({ ...valid, username: 'abc' }).success).toBe(true);
  });

  it('rejects username with spaces', () => {
    const r = registerSchema.safeParse({ ...valid, username: 'bad name' });
    expect(r.success).toBe(false);
  });

  it('rejects username with special characters', () => {
    expect(registerSchema.safeParse({ ...valid, username: 'user@name' }).success).toBe(false);
  });

  it('allows underscores in username', () => {
    expect(registerSchema.safeParse({ ...valid, username: 'user_name' }).success).toBe(true);
  });

  it('rejects password without digits', () => {
    const r = registerSchema.safeParse({ ...valid, password: 'NoDigits' });
    expect(r.success).toBe(false);
    if (!r.success) {
      const msg = r.error.issues[0].message;
      expect(msg).toContain('number');
    }
  });

  it('rejects password shorter than 6 characters', () => {
    const r = registerSchema.safeParse({ ...valid, password: 'Sh0rt' });
    expect(r.success).toBe(false);
  });

  it('rejects invalid email', () => {
    expect(registerSchema.safeParse({ ...valid, email: 'bad' }).success).toBe(false);
  });
});

// ─── createPostSchema ─────────────────────────────────────────────────────────

describe('createPostSchema', () => {
  const valid = {
    title: 'Valid Title',
    content: 'This is at least ten characters long.',
    courseTag: 'Computer Science',
    difficultyLevel: 'medium' as const,
  };

  it('accepts valid post data', () => {
    expect(createPostSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects title shorter than 3 characters', () => {
    expect(createPostSchema.safeParse({ ...valid, title: 'ab' }).success).toBe(false);
  });

  it('accepts title with exactly 3 characters', () => {
    expect(createPostSchema.safeParse({ ...valid, title: 'abc' }).success).toBe(true);
  });

  it('rejects title longer than 200 characters', () => {
    expect(createPostSchema.safeParse({ ...valid, title: 'a'.repeat(201) }).success).toBe(false);
  });

  it('rejects content shorter than 10 characters', () => {
    expect(createPostSchema.safeParse({ ...valid, content: 'short' }).success).toBe(false);
  });

  it('accepts content with exactly 10 characters', () => {
    expect(createPostSchema.safeParse({ ...valid, content: '1234567890' }).success).toBe(true);
  });

  it('rejects empty courseTag', () => {
    expect(createPostSchema.safeParse({ ...valid, courseTag: '' }).success).toBe(false);
  });

  it.each(['easy', 'medium', 'hard'] as const)('accepts difficulty level "%s"', (level) => {
    expect(createPostSchema.safeParse({ ...valid, difficultyLevel: level }).success).toBe(true);
  });

  it('rejects invalid difficulty level', () => {
    expect(createPostSchema.safeParse({ ...valid, difficultyLevel: 'super-hard' }).success).toBe(false);
  });
});
