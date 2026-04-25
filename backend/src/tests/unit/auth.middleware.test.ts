import { Request, Response, NextFunction } from 'express';
import { authenticate, optionalAuth, getAuthUser } from '../../middleware/auth.middleware';
import { generateTestAccessToken } from '../helpers/testUtils';
import { AppError } from '../../middleware/error.middleware';

describe('Auth Middleware', () => {
  const mockPayload = {
    userId: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    username: 'testuser',
  };

  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    // Set test environment variables
    process.env.JWT_SECRET = 'test_jwt_secret';

    mockReq = {
      headers: {},
    };
    mockRes = {};
    mockNext = jest.fn();
  });

  describe('authenticate', () => {
    it('should attach user to request with valid token', () => {
      const token = generateTestAccessToken(mockPayload);
      mockReq.headers = {
        authorization: `Bearer ${token}`,
      };

      authenticate(mockReq as Request, mockRes as Response, mockNext);

      expect((mockReq as any).user).toBeDefined();
      expect((mockReq as any).user.userId).toBe(mockPayload.userId);
      expect((mockReq as any).user.email).toBe(mockPayload.email);
      expect((mockReq as any).user.username).toBe(mockPayload.username);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should call next with AppError when Authorization header is missing', () => {
      mockReq.headers = {};

      authenticate(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      const error = mockNext.mock.calls[0][0] as unknown as AppError;
      expect(error.statusCode).toBe(401);
      expect(error.message).toContain('Access token is required');
    });

    it('should call next with AppError when Authorization header does not start with Bearer', () => {
      const token = generateTestAccessToken(mockPayload);
      mockReq.headers = {
        authorization: `Token ${token}`,
      };

      authenticate(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      const error = mockNext.mock.calls[0][0] as unknown as AppError;
      expect(error.statusCode).toBe(401);
    });

    it('should call next with AppError for invalid token', () => {
      mockReq.headers = {
        authorization: 'Bearer invalid.token.here',
      };

      authenticate(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      const error = mockNext.mock.calls[0][0] as unknown as AppError;
      expect(error.statusCode).toBe(401);
      expect(error.message).toContain('Invalid or expired token');
    });

    it('should call next with AppError for expired token', () => {
      // Create an expired token by manually crafting one with exp in the past
      const jwt = require('jsonwebtoken');
      const expiredToken = jwt.sign(
        { ...mockPayload, exp: Math.floor(Date.now() / 1000) - 3600 },
        process.env.JWT_SECRET
      );

      mockReq.headers = {
        authorization: `Bearer ${expiredToken}`,
      };

      authenticate(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      const error = mockNext.mock.calls[0][0] as unknown as AppError;
      expect(error.statusCode).toBe(401);
    });

    it('should call next with AppError for token with wrong signature', () => {
      const jwt = require('jsonwebtoken');
      const wrongToken = jwt.sign(mockPayload, 'wrong_secret', { expiresIn: '15m' });

      mockReq.headers = {
        authorization: `Bearer ${wrongToken}`,
      };

      authenticate(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      const error = mockNext.mock.calls[0][0] as unknown as AppError;
      expect(error.statusCode).toBe(401);
    });

    it('should extract token after "Bearer " prefix correctly', () => {
      const token = generateTestAccessToken(mockPayload);
      mockReq.headers = {
        authorization: `Bearer ${token}`,
      };

      authenticate(mockReq as Request, mockRes as Response, mockNext);

      expect((mockReq as any).user).toBeDefined();
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should handle authorization header with extra spaces', () => {
      const token = generateTestAccessToken(mockPayload);
      mockReq.headers = {
        authorization: `Bearer  ${token}`, // Extra space
      };

      authenticate(mockReq as Request, mockRes as Response, mockNext);

      // Should still work with split(' ')[1] which gets the second element
      expect((mockReq as any).user).toBeDefined();
      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('optionalAuth', () => {
    it('should attach user to request with valid token', () => {
      const token = generateTestAccessToken(mockPayload);
      mockReq.headers = {
        authorization: `Bearer ${token}`,
      };

      optionalAuth(mockReq as Request, mockRes as Response, mockNext);

      expect((mockReq as any).user).toBeDefined();
      expect((mockReq as any).user.userId).toBe(mockPayload.userId);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should call next without error when Authorization header is missing', () => {
      mockReq.headers = {};

      optionalAuth(mockReq as Request, mockRes as Response, mockNext);

      expect((mockReq as any).user).toBeUndefined();
      expect(mockNext).toHaveBeenCalledWith();
      expect(mockNext).not.toHaveBeenCalledWith(expect.any(Error));
    });

    it('should call next without error when Authorization header does not start with Bearer', () => {
      mockReq.headers = {
        authorization: 'Token something',
      };

      optionalAuth(mockReq as Request, mockRes as Response, mockNext);

      expect((mockReq as any).user).toBeUndefined();
      expect(mockNext).toHaveBeenCalledWith();
      expect(mockNext).not.toHaveBeenCalledWith(expect.any(Error));
    });

    it('should call next without error for invalid token', () => {
      mockReq.headers = {
        authorization: 'Bearer invalid.token.here',
      };

      optionalAuth(mockReq as Request, mockRes as Response, mockNext);

      expect((mockReq as any).user).toBeUndefined();
      expect(mockNext).toHaveBeenCalledWith();
      expect(mockNext).not.toHaveBeenCalledWith(expect.any(Error));
    });

    it('should call next without error for expired token', () => {
      const expiredToken = require('jsonwebtoken').sign(
        { ...mockPayload, exp: Math.floor(Date.now() / 1000) - 3600 },
        process.env.JWT_SECRET
      );

      mockReq.headers = {
        authorization: `Bearer ${expiredToken}`,
      };

      optionalAuth(mockReq as Request, mockRes as Response, mockNext);

      expect((mockReq as any).user).toBeUndefined();
      expect(mockNext).toHaveBeenCalledWith();
      expect(mockNext).not.toHaveBeenCalledWith(expect.any(Error));
    });

    it('should gracefully handle any token verification errors', () => {
      const malformedToken = 'not-a-valid-jwt';

      mockReq.headers = {
        authorization: `Bearer ${malformedToken}`,
      };

      optionalAuth(mockReq as Request, mockRes as Response, mockNext);

      expect((mockReq as any).user).toBeUndefined();
      expect(mockNext).toHaveBeenCalledWith();
      expect(mockNext).not.toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('getAuthUser', () => {
    it('should return user when user is attached to request', () => {
      const mockUser = {
        userId: mockPayload.userId,
        email: mockPayload.email,
        username: mockPayload.username,
      };
      (mockReq as any).user = mockUser;

      const result = getAuthUser(mockReq as Request);

      expect(result).toEqual(mockUser);
    });

    it('should return undefined when user is not attached to request', () => {
      mockReq = {};

      const result = getAuthUser(mockReq as Request);

      expect(result).toBeUndefined();
    });

    it('should return undefined for request without user property', () => {
      mockReq = {
        headers: {},
      };

      const result = getAuthUser(mockReq as Request);

      expect(result).toBeUndefined();
    });

    it('should maintain type safety and return correct user shape', () => {
      const mockUser = {
        userId: '12345',
        email: 'test@test.com',
        username: 'testuser',
      };
      (mockReq as any).user = mockUser;

      const result = getAuthUser(mockReq as Request);

      expect(result).toBeDefined();
      if (result) {
        expect(result.userId).toBe('12345');
        expect(result.email).toBe('test@test.com');
        expect(result.username).toBe('testuser');
      }
    });
  });

  describe('Integration between authenticate and getAuthUser', () => {
    it('should work together in a request flow', () => {
      const token = generateTestAccessToken(mockPayload);
      mockReq.headers = {
        authorization: `Bearer ${token}`,
      };

      // Authenticate attaches user
      authenticate(mockReq as Request, mockRes as Response, mockNext);

      // getAuthUser retrieves it
      const user = getAuthUser(mockReq as Request);

      expect(user).toBeDefined();
      expect(user?.userId).toBe(mockPayload.userId);
      expect(user?.email).toBe(mockPayload.email);
      expect(user?.username).toBe(mockPayload.username);
    });

    it('should work together with optionalAuth', () => {
      const token = generateTestAccessToken(mockPayload);
      mockReq.headers = {
        authorization: `Bearer ${token}`,
      };

      // optionalAuth attaches user if token is valid
      optionalAuth(mockReq as Request, mockRes as Response, mockNext);

      // getAuthUser retrieves it
      const user = getAuthUser(mockReq as Request);

      expect(user).toBeDefined();
      expect(user?.userId).toBe(mockPayload.userId);
    });
  });
});
