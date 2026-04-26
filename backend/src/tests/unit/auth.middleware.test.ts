import { Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { generateTestAccessToken } from '../helpers/testUtils';

describe('Auth Middleware (lean)', () => {
  const payload = {
    userId: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    username: 'testuser',
  };

  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    process.env.JWT_SECRET = 'test_jwt_secret';
    req = { headers: {} };
    res = {};
    next = jest.fn();
  });

  it('authenticate attaches user for a valid bearer token', () => {
    const token = generateTestAccessToken(payload);
    req.headers = { authorization: `Bearer ${token}` };

    authenticate(req as Request, res as Response, next);

    expect((req as any).user).toBeDefined();
    expect((req as any).user.userId).toBe(payload.userId);
    expect(next).toHaveBeenCalledWith();
  });

});
