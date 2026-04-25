import { Request, Response, NextFunction } from 'express';
import { AppError, asyncHandler, errorHandler } from '../../middleware/error.middleware';

describe('Error Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe('AppError class', () => {
    it('should create error with correct properties', () => {
      const error = new AppError('Test error message', 400);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Test error message');
      expect(error.statusCode).toBe(400);
      expect(error.status).toBe('fail');
      expect(error.isOperational).toBe(true);
    });

    it('should set status to "fail" for 4xx errors', () => {
      const error400 = new AppError('Bad Request', 400);
      const error404 = new AppError('Not Found', 404);
      const error403 = new AppError('Forbidden', 403);

      expect(error400.status).toBe('fail');
      expect(error404.status).toBe('fail');
      expect(error403.status).toBe('fail');
    });

    it('should set status to "error" for 5xx errors', () => {
      const error500 = new AppError('Internal Server Error', 500);
      const error503 = new AppError('Service Unavailable', 503);

      expect(error500.status).toBe('error');
      expect(error503.status).toBe('error');
    });

    it('should maintain prototype chain', () => {
      const error = new AppError('Test', 500);

      expect(error instanceof AppError).toBe(true);
      expect(error instanceof Error).toBe(true);
      expect(Object.getPrototypeOf(error)).toBe(AppError.prototype);
    });

    it('should allow error to be caught and rethrown', () => {
      const throwError = () => {
        throw new AppError('Test error', 400);
      };

      expect(throwError).toThrow(AppError);
      expect(throwError).toThrow('Test error');
    });
  });

  describe('asyncHandler', () => {
    it('should call async function and call next on success', async () => {
      const asyncFn = jest.fn().mockResolvedValue('success');
      const handler = asyncHandler(asyncFn);

      await handler(mockReq as Request, mockRes as Response, mockNext);

      expect(asyncFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should catch rejected promises and call next with error', async () => {
      const error = new Error('Async error');
      const asyncFn = jest.fn().mockRejectedValue(error);
      const handler = asyncHandler(asyncFn);

      await handler(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should catch AppError from async function', async () => {
      const appError = new AppError('Not found', 404);
      const asyncFn = jest.fn().mockRejectedValue(appError);
      const handler = asyncHandler(asyncFn);

      await handler(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(appError);
      expect((mockNext.mock.calls[0][0] as unknown as AppError).statusCode).toBe(404);
    });

    it('should preserve error object when catching', async () => {
      const originalError = new Error('Original message');
      originalError.stack = 'Original stack';
      const asyncFn = jest.fn().mockRejectedValue(originalError);
      const handler = asyncHandler(asyncFn);

      await handler(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(originalError);
      expect((mockNext.mock.calls[0][0] as unknown as Error).message).toBe('Original message');
    });

    it('should handle async functions that throw synchronously', async () => {
      const error = new Error('Sync error');
      const asyncFn = jest.fn().mockImplementation(async () => {
        throw error;
      });
      const handler = asyncHandler(asyncFn);

      await handler(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('errorHandler', () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('should handle AppError correctly', () => {
      const error = new AppError('Custom error', 403);

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'Custom error',
      });
    });

    it('should handle Mongoose ValidationError', () => {
      const error = new Error('Validation failed') as any;
      error.name = 'ValidationError';

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'Validation failed',
      });
    });

    it('should handle Mongoose duplicate key error (11000)', () => {
      const error = new Error() as any;
      error.code = 11000;
      error.keyValue = { email: 'test@example.com' };

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'email already exists',
      });
    });

    it('should handle duplicate key error without keyValue', () => {
      const error = new Error() as any;
      error.code = 11000;

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'Duplicate field value',
      });
    });

    it('should handle Mongoose CastError', () => {
      const error = new Error('Cast to ObjectId failed') as any;
      error.name = 'CastError';

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'Invalid ID format',
      });
    });

    it('should handle JsonWebTokenError', () => {
      const error = new Error('jwt malformed') as any;
      error.name = 'JsonWebTokenError';

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'Invalid token',
      });
    });

    it('should handle TokenExpiredError', () => {
      const error = new Error('jwt expired') as any;
      error.name = 'TokenExpiredError';

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'Token expired',
      });
    });

    it('should handle generic Error as 500', () => {
      const error = new Error('Something went wrong');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Internal server error',
      });
    });

    it('should include stack trace in development mode', () => {
      process.env.NODE_ENV = 'development';
      const error = new Error('Dev error');
      error.stack = 'Error stack trace';

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      const jsonCall = (mockRes.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall).toHaveProperty('stack', 'Error stack trace');
    });

    it('should not include stack trace in production mode', () => {
      process.env.NODE_ENV = 'production';
      const error = new Error('Prod error');
      error.stack = 'Error stack trace';

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      const jsonCall = (mockRes.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall).not.toHaveProperty('stack');
    });

    it('should handle ValidationError even if it is also an AppError', () => {
      const error = new AppError('App error', 403) as any;
      error.name = 'ValidationError'; // Also has ValidationError name

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      // ValidationError check comes before AppError check in implementation
      // So it will use ValidationError handling (400) not AppError (403)
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'App error',
      });
    });

    it('should handle errors with no message', () => {
      const error = new Error();

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Internal server error',
      });
    });
  });

  describe('Error handling flow', () => {
    it('should work with asyncHandler and errorHandler together', async () => {
      const appError = new AppError('Resource not found', 404);
      const asyncFn = jest.fn().mockRejectedValue(appError);
      const handler = asyncHandler(asyncFn);

      await handler(mockReq as Request, mockRes as Response, mockNext);

      // asyncHandler calls next with error
      expect(mockNext).toHaveBeenCalledWith(appError);

      // errorHandler processes it
      const error = mockNext.mock.calls[0][0] as unknown as AppError;
      mockNext.mockClear();
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'Resource not found',
      });
    });
  });
});
