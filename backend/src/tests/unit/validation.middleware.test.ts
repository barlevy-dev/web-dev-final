import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../../middleware/validate.middleware';

describe('Validation Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    mockReq = {
      body: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe('validate middleware factory', () => {
    const testSchema = z.object({
      email: z.string().email(),
      age: z.number().min(18),
      username: z.string().min(3).max(20),
    });

    it('should call next() when request body is valid', () => {
      mockReq.body = {
        email: 'test@example.com',
        age: 25,
        username: 'testuser',
      };

      const middleware = validate(testSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it('should return 400 when request body is invalid', () => {
      mockReq.body = {
        email: 'invalid-email',
        age: 15,
        username: 'ab',
      };

      const middleware = validate(testSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'Validation error',
        errors: expect.any(Array),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should format Zod errors correctly', () => {
      mockReq.body = {
        email: 'invalid-email',
        age: 15,
        username: 'ab',
      };

      const middleware = validate(testSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'Validation error',
        errors: expect.arrayContaining([
          expect.objectContaining({
            field: expect.any(String),
            message: expect.any(String),
          }),
        ]),
      });
    });

    it('should return specific error messages for each field', () => {
      mockReq.body = {
        email: 'not-an-email',
        age: 10,
        username: 'u',
      };

      const middleware = validate(testSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      const jsonCall = (mockRes.json as jest.Mock).mock.calls[0][0];
      const errors = jsonCall.errors;

      expect(errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'email' }),
          expect.objectContaining({ field: 'age' }),
          expect.objectContaining({ field: 'username' }),
        ])
      );
    });

    it('should handle missing required fields', () => {
      mockReq.body = {};

      const middleware = validate(testSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      const jsonCall = (mockRes.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.errors).toHaveLength(3); // All three fields are missing
    });

    it('should handle partial validation (some fields valid, some invalid)', () => {
      mockReq.body = {
        email: 'valid@example.com',
        age: 15, // Invalid
        username: 'ab', // Invalid
      };

      const middleware = validate(testSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      const jsonCall = (mockRes.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.errors).toHaveLength(2); // Only age and username are invalid
    });

    it('should work with nested field paths', () => {
      const nestedSchema = z.object({
        user: z.object({
          profile: z.object({
            name: z.string().min(1),
          }),
        }),
      });

      mockReq.body = {
        user: {
          profile: {
            name: '',
          },
        },
      };

      const middleware = validate(nestedSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      const jsonCall = (mockRes.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.errors[0].field).toBe('user.profile.name');
    });

    it('should handle array validation', () => {
      const arraySchema = z.object({
        tags: z.array(z.string().min(1)),
      });

      mockReq.body = {
        tags: ['valid', '', 'another'],
      };

      const middleware = validate(arraySchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should pass through non-Zod errors to next middleware', () => {
      // Create a schema that throws a non-Zod error
      const errorThrowingSchema = {
        safeParse: () => {
          throw new Error('Non-Zod error');
        },
      } as any;

      const middleware = validate(errorThrowingSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should work with optional fields', () => {
      const optionalSchema = z.object({
        required: z.string(),
        optional: z.string().optional(),
      });

      mockReq.body = {
        required: 'present',
      };

      const middleware = validate(optionalSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should validate enum fields correctly', () => {
      const enumSchema = z.object({
        status: z.enum(['active', 'inactive']),
      });

      // Valid enum value
      mockReq.body = { status: 'active' };
      let middleware = validate(enumSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalledWith();

      // Reset mocks
      mockNext.mockClear();
      (mockRes.status as jest.Mock).mockClear();

      // Invalid enum value
      mockReq.body = { status: 'pending' };
      middleware = validate(enumSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe('Error message formatting', () => {
    it('should include field path and error message for each validation error', () => {
      const schema = z.object({
        email: z.string().email('Invalid email format'),
        password: z.string().min(6, 'Password must be at least 6 characters'),
      });

      mockReq.body = {
        email: 'bad-email',
        password: 'short',
      };

      const middleware = validate(schema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      const jsonCall = (mockRes.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.errors).toEqual([
        { field: 'email', message: 'Invalid email format' },
        { field: 'password', message: 'Password must be at least 6 characters' },
      ]);
    });

    it('should return consistent error response structure', () => {
      const schema = z.object({
        field: z.string(),
      });

      mockReq.body = {};

      const middleware = validate(schema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      const jsonCall = (mockRes.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall).toHaveProperty('status', 'fail');
      expect(jsonCall).toHaveProperty('message', 'Validation error');
      expect(jsonCall).toHaveProperty('errors');
      expect(Array.isArray(jsonCall.errors)).toBe(true);
    });
  });
});
