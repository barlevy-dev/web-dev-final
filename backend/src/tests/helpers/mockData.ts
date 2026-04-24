/**
 * Mock data for testing validation schemas and API endpoints
 */

// Valid test data
export const validUser = {
  email: 'valid@example.com',
  username: 'validuser123',
  password: 'Valid123',
  yearOfStudy: '3rd Year',
  degree: 'Computer Science',
};

export const validLoginCredentials = {
  email: 'test@example.com',
  password: 'Test123456',
};

export const validPost = {
  title: 'Introduction to TypeScript',
  content: 'TypeScript is a strongly typed programming language that builds on JavaScript.',
  courseTag: 'Computer Science',
  difficultyLevel: 'medium' as 'easy' | 'medium' | 'hard',
};

export const validComment = {
  content: 'Great post! Very helpful.',
};

export const validAIStudyTips = {
  topic: 'Data Structures',
  context: 'Preparing for final exam',
};

export const validAIEnhanceContent = {
  content: 'This is a basic explanation of algorithms.',
};

export const validAISuggestTags = {
  title: 'Introduction to Machine Learning',
  content: 'Machine learning is a subset of artificial intelligence...',
};

// Invalid test data - Email validation
export const invalidEmails = [
  { email: 'notanemail', description: 'missing @ symbol' },
  { email: 'test@', description: 'missing domain' },
  { email: '@example.com', description: 'missing local part' },
  { email: 'test @example.com', description: 'contains space' },
  { email: '', description: 'empty string' },
];

// Invalid test data - Username validation
export const invalidUsernames = [
  { username: 'ab', description: 'too short (2 chars)' },
  { username: 'a'.repeat(31), description: 'too long (31 chars)' },
  { username: 'user name', description: 'contains space' },
  { username: 'user-name', description: 'contains hyphen' },
  { username: 'user@name', description: 'contains @ symbol' },
  { username: 'user!name', description: 'contains special char' },
  { username: '', description: 'empty string' },
];

// Invalid test data - Password validation
export const invalidPasswords = [
  { password: 'short', description: 'too short (5 chars)' },
  { password: 'NoDigits', description: 'no digit' },
  { password: '123456', description: 'only digits' },
  { password: '', description: 'empty string' },
];

// Invalid test data - Post title validation
export const invalidPostTitles = [
  { title: 'ab', description: 'too short (2 chars)' },
  { title: 'a'.repeat(201), description: 'too long (201 chars)' },
  { title: '', description: 'empty string' },
];

// Invalid test data - Post content validation
export const invalidPostContents = [
  { content: 'short', description: 'too short (5 chars)' },
  { content: '', description: 'empty string' },
];

// Invalid test data - Comment content validation
export const invalidCommentContents = [
  { content: '', description: 'empty string' },
  { content: 'a'.repeat(501), description: 'too long (501 chars)' },
];

// Invalid test data - Difficulty level
export const invalidDifficultyLevels = [
  { difficultyLevel: 'super-easy', description: 'invalid enum value' },
  { difficultyLevel: 'very-hard', description: 'invalid enum value' },
  { difficultyLevel: '', description: 'empty string' },
  { difficultyLevel: 'EASY', description: 'wrong case' },
];

// Valid boundary test data - Username
export const boundaryUsernames = {
  minValid: 'abc', // exactly 3 chars
  maxValid: 'a'.repeat(30), // exactly 30 chars
  minInvalid: 'ab', // 2 chars
  maxInvalid: 'a'.repeat(31), // 31 chars
};

// Valid boundary test data - Post title
export const boundaryPostTitles = {
  minValid: 'abc', // exactly 3 chars
  maxValid: 'a'.repeat(200), // exactly 200 chars
  minInvalid: 'ab', // 2 chars
  maxInvalid: 'a'.repeat(201), // 201 chars
};

// Valid boundary test data - Post content
export const boundaryPostContents = {
  minValid: 'a'.repeat(10), // exactly 10 chars
  minInvalid: 'a'.repeat(9), // 9 chars
};

// Valid boundary test data - Comment content
export const boundaryCommentContents = {
  minValid: 'a', // exactly 1 char
  maxValid: 'a'.repeat(500), // exactly 500 chars
  minInvalid: '', // 0 chars
  maxInvalid: 'a'.repeat(501), // 501 chars
};

// Sample posts for testing
export const samplePosts = [
  {
    title: 'Introduction to Algorithms',
    content: 'Algorithms are step-by-step procedures for solving problems.',
    courseTag: 'Computer Science',
    difficultyLevel: 'easy' as const,
  },
  {
    title: 'Advanced Data Structures',
    content: 'Deep dive into trees, graphs, and hash tables with implementation examples.',
    courseTag: 'Computer Science',
    difficultyLevel: 'hard' as const,
  },
  {
    title: 'Calculus Study Guide',
    content: 'Key concepts in differential and integral calculus explained simply.',
    courseTag: 'Mathematics',
    difficultyLevel: 'medium' as const,
  },
];

// Sample comments for testing
export const sampleComments = [
  'This is very helpful, thank you!',
  'Could you explain this part in more detail?',
  'Great explanation!',
  'I found this confusing at first but it makes sense now.',
];

// Sample AI requests
export const sampleAIRequests = {
  studyTips: [
    { topic: 'Linear Algebra', context: 'Preparing for midterm' },
    { topic: 'Organic Chemistry', context: 'Lab exam next week' },
    { topic: 'World History' }, // No context
  ],
  enhanceContent: [
    { content: 'This is about recursion.' },
    {
      content:
        'Binary search is an algorithm that finds the position of a target value within a sorted array.',
    },
  ],
  suggestTags: [
    { title: 'JavaScript Basics', content: 'Learn the fundamentals of JavaScript programming.' },
    { title: 'Physics 101', content: 'Introduction to mechanics and thermodynamics.' },
  ],
};

// OAuth provider data
export const oauthProfiles = {
  google: {
    id: 'google_12345',
    emails: [{ value: 'google@example.com', verified: true }],
    displayName: 'Google User',
    photos: [{ value: 'https://example.com/photo.jpg' }],
  },
  facebook: {
    id: 'facebook_67890',
    emails: [{ value: 'facebook@example.com' }],
    displayName: 'Facebook User',
    photos: [{ value: 'https://example.com/photo.jpg' }],
  },
};

// File upload test data
export const mockFiles = {
  validImage: {
    fieldname: 'image',
    originalname: 'test-image.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    size: 1024 * 1024, // 1MB
    buffer: Buffer.from('fake-image-data'),
  },
  invalidMimeType: {
    fieldname: 'file',
    originalname: 'document.pdf',
    encoding: '7bit',
    mimetype: 'application/pdf',
    size: 1024 * 500, // 500KB
    buffer: Buffer.from('fake-pdf-data'),
  },
  oversizedImage: {
    fieldname: 'image',
    originalname: 'large-image.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    size: 1024 * 1024 * 15, // 15MB (exceeds 10MB limit)
    buffer: Buffer.from('fake-large-image-data'),
  },
};
