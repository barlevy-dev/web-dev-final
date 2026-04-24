import {
  registerSchema,
  loginSchema,
  updateUserSchema,
  createPostSchema,
  updatePostSchema,
  createCommentSchema,
  aiStudyTipsSchema,
  aiEnhanceContentSchema,
  aiSuggestTagsSchema,
} from '../../utils/validators';
import {
  validUser,
  validLoginCredentials,
  validPost,
  validComment,
  validAIStudyTips,
  validAIEnhanceContent,
  validAISuggestTags,
  invalidEmails,
  invalidUsernames,
  invalidDifficultyLevels,
  boundaryUsernames,
  boundaryPostTitles,
  boundaryPostContents,
  boundaryCommentContents,
} from '../helpers/mockData';

describe('Validation Schemas', () => {
  describe('registerSchema', () => {
    it('should validate valid registration data', () => {
      const result = registerSchema.safeParse(validUser);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email formats', () => {
      invalidEmails.forEach(({ email }) => {
        const result = registerSchema.safeParse({ ...validUser, email });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                path: ['email'],
              }),
            ])
          );
        }
      });
    });

    it('should reject invalid usernames', () => {
      invalidUsernames.forEach(({ username }) => {
        const result = registerSchema.safeParse({ ...validUser, username });
        expect(result.success).toBe(false);
      });
    });

    it('should accept username with exactly 3 characters', () => {
      const result = registerSchema.safeParse({
        ...validUser,
        username: boundaryUsernames.minValid,
      });
      expect(result.success).toBe(true);
    });

    it('should accept username with exactly 30 characters', () => {
      const result = registerSchema.safeParse({
        ...validUser,
        username: boundaryUsernames.maxValid,
      });
      expect(result.success).toBe(true);
    });

    it('should reject username with 2 characters', () => {
      const result = registerSchema.safeParse({
        ...validUser,
        username: boundaryUsernames.minInvalid,
      });
      expect(result.success).toBe(false);
    });

    it('should reject username with 31 characters', () => {
      const result = registerSchema.safeParse({
        ...validUser,
        username: boundaryUsernames.maxInvalid,
      });
      expect(result.success).toBe(false);
    });

    it('should reject passwords without digits', () => {
      const result = registerSchema.safeParse({
        ...validUser,
        password: 'NoDigitsHere',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least one number');
      }
    });

    it('should reject passwords shorter than 6 characters', () => {
      const result = registerSchema.safeParse({
        ...validUser,
        password: 'Sh0rt',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 6 characters');
      }
    });

    it('should reject missing required fields', () => {
      const missingEmail = registerSchema.safeParse({
        username: 'testuser',
        password: 'Test123',
      });
      expect(missingEmail.success).toBe(false);

      const missingUsername = registerSchema.safeParse({
        email: 'test@example.com',
        password: 'Test123',
      });
      expect(missingUsername.success).toBe(false);

      const missingPassword = registerSchema.safeParse({
        email: 'test@example.com',
        username: 'testuser',
      });
      expect(missingPassword.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('should validate valid login credentials', () => {
      const result = loginSchema.safeParse(validLoginCredentials);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email format', () => {
      const result = loginSchema.safeParse({
        email: 'not-an-email',
        password: 'Test123',
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty password', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: '',
      });
      expect(result.success).toBe(false);
    });

    it('should accept any non-empty password (no minimum length for login)', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: '1',
      });
      expect(result.success).toBe(true);
    });

    it('should reject missing email', () => {
      const result = loginSchema.safeParse({
        password: 'Test123',
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing password', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('updateUserSchema', () => {
    it('should allow all fields to be optional', () => {
      const result = updateUserSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should validate username when provided', () => {
      const result = updateUserSchema.safeParse({
        username: boundaryUsernames.minValid,
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid username when provided', () => {
      const result = updateUserSchema.safeParse({
        username: boundaryUsernames.minInvalid,
      });
      expect(result.success).toBe(false);
    });

    it('should allow partial updates with yearOfStudy only', () => {
      const result = updateUserSchema.safeParse({
        yearOfStudy: '4th Year',
      });
      expect(result.success).toBe(true);
    });

    it('should allow partial updates with degree only', () => {
      const result = updateUserSchema.safeParse({
        degree: 'Software Engineering',
      });
      expect(result.success).toBe(true);
    });

    it('should allow updating multiple fields', () => {
      const result = updateUserSchema.safeParse({
        username: 'newusername',
        yearOfStudy: '2nd Year',
        degree: 'Data Science',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('createPostSchema', () => {
    it('should validate valid post data', () => {
      const result = createPostSchema.safeParse(validPost);
      expect(result.success).toBe(true);
    });

    it('should reject title with 2 characters', () => {
      const result = createPostSchema.safeParse({
        ...validPost,
        title: boundaryPostTitles.minInvalid,
      });
      expect(result.success).toBe(false);
    });

    it('should accept title with exactly 3 characters', () => {
      const result = createPostSchema.safeParse({
        ...validPost,
        title: boundaryPostTitles.minValid,
      });
      expect(result.success).toBe(true);
    });

    it('should accept title with exactly 200 characters', () => {
      const result = createPostSchema.safeParse({
        ...validPost,
        title: boundaryPostTitles.maxValid,
      });
      expect(result.success).toBe(true);
    });

    it('should reject title with 201 characters', () => {
      const result = createPostSchema.safeParse({
        ...validPost,
        title: boundaryPostTitles.maxInvalid,
      });
      expect(result.success).toBe(false);
    });

    it('should reject content with less than 10 characters', () => {
      const result = createPostSchema.safeParse({
        ...validPost,
        content: boundaryPostContents.minInvalid,
      });
      expect(result.success).toBe(false);
    });

    it('should accept content with exactly 10 characters', () => {
      const result = createPostSchema.safeParse({
        ...validPost,
        content: boundaryPostContents.minValid,
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty courseTag', () => {
      const result = createPostSchema.safeParse({
        ...validPost,
        courseTag: '',
      });
      expect(result.success).toBe(false);
    });

    it('should only accept easy, medium, or hard difficulty levels', () => {
      const validLevels = ['easy', 'medium', 'hard'];
      validLevels.forEach((level) => {
        const result = createPostSchema.safeParse({
          ...validPost,
          difficultyLevel: level,
        });
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid difficulty levels', () => {
      invalidDifficultyLevels.forEach(({ difficultyLevel }) => {
        const result = createPostSchema.safeParse({
          ...validPost,
          difficultyLevel,
        });
        expect(result.success).toBe(false);
      });
    });

    it('should reject missing required fields', () => {
      const missingTitle = createPostSchema.safeParse({
        content: validPost.content,
        courseTag: validPost.courseTag,
        difficultyLevel: validPost.difficultyLevel,
      });
      expect(missingTitle.success).toBe(false);

      const missingContent = createPostSchema.safeParse({
        title: validPost.title,
        courseTag: validPost.courseTag,
        difficultyLevel: validPost.difficultyLevel,
      });
      expect(missingContent.success).toBe(false);
    });
  });

  describe('updatePostSchema', () => {
    it('should allow all fields to be optional', () => {
      const result = updatePostSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should validate title when provided', () => {
      const result = updatePostSchema.safeParse({
        title: boundaryPostTitles.minValid,
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid title when provided', () => {
      const result = updatePostSchema.safeParse({
        title: boundaryPostTitles.minInvalid,
      });
      expect(result.success).toBe(false);
    });

    it('should validate content when provided', () => {
      const result = updatePostSchema.safeParse({
        content: boundaryPostContents.minValid,
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid content when provided', () => {
      const result = updatePostSchema.safeParse({
        content: boundaryPostContents.minInvalid,
      });
      expect(result.success).toBe(false);
    });

    it('should allow partial updates with only difficultyLevel', () => {
      const result = updatePostSchema.safeParse({
        difficultyLevel: 'hard',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('createCommentSchema', () => {
    it('should validate valid comment', () => {
      const result = createCommentSchema.safeParse(validComment);
      expect(result.success).toBe(true);
    });

    it('should reject empty content', () => {
      const result = createCommentSchema.safeParse({
        content: boundaryCommentContents.minInvalid,
      });
      expect(result.success).toBe(false);
    });

    it('should accept content with exactly 1 character', () => {
      const result = createCommentSchema.safeParse({
        content: boundaryCommentContents.minValid,
      });
      expect(result.success).toBe(true);
    });

    it('should accept content with exactly 500 characters', () => {
      const result = createCommentSchema.safeParse({
        content: boundaryCommentContents.maxValid,
      });
      expect(result.success).toBe(true);
    });

    it('should reject content with 501 characters', () => {
      const result = createCommentSchema.safeParse({
        content: boundaryCommentContents.maxInvalid,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('aiStudyTipsSchema', () => {
    it('should validate valid study tips request', () => {
      const result = aiStudyTipsSchema.safeParse(validAIStudyTips);
      expect(result.success).toBe(true);
    });

    it('should reject empty topic', () => {
      const result = aiStudyTipsSchema.safeParse({
        topic: '',
        context: 'Some context',
      });
      expect(result.success).toBe(false);
    });

    it('should allow missing context (optional)', () => {
      const result = aiStudyTipsSchema.safeParse({
        topic: 'Data Structures',
      });
      expect(result.success).toBe(true);
    });

    it('should accept topic with context', () => {
      const result = aiStudyTipsSchema.safeParse({
        topic: 'Machine Learning',
        context: 'For final project',
      });
      expect(result.success).toBe(true);
    });

    it('should reject missing topic', () => {
      const result = aiStudyTipsSchema.safeParse({
        context: 'Some context',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('aiEnhanceContentSchema', () => {
    it('should validate valid enhance content request', () => {
      const result = aiEnhanceContentSchema.safeParse(validAIEnhanceContent);
      expect(result.success).toBe(true);
    });

    it('should reject empty content', () => {
      const result = aiEnhanceContentSchema.safeParse({
        content: '',
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing content', () => {
      const result = aiEnhanceContentSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('should accept any non-empty string', () => {
      const result = aiEnhanceContentSchema.safeParse({
        content: 'Short text.',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('aiSuggestTagsSchema', () => {
    it('should validate valid suggest tags request', () => {
      const result = aiSuggestTagsSchema.safeParse(validAISuggestTags);
      expect(result.success).toBe(true);
    });

    it('should reject empty title', () => {
      const result = aiSuggestTagsSchema.safeParse({
        title: '',
        content: 'Some content',
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty content', () => {
      const result = aiSuggestTagsSchema.safeParse({
        title: 'Some title',
        content: '',
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing title', () => {
      const result = aiSuggestTagsSchema.safeParse({
        content: 'Some content',
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing content', () => {
      const result = aiSuggestTagsSchema.safeParse({
        title: 'Some title',
      });
      expect(result.success).toBe(false);
    });

    it('should require both title and content', () => {
      const result = aiSuggestTagsSchema.safeParse({
        title: 'Complete Title',
        content: 'Complete content description',
      });
      expect(result.success).toBe(true);
    });
  });
});
