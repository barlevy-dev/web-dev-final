import jwt from 'jsonwebtoken';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateTokenPair,
} from '../../services/auth.service';
import { User, IUser } from '../../models/user.model';

describe('Auth Service', () => {
  const mockPayload = {
    userId: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    username: 'testuser',
  };

  beforeAll(() => {
    // Set test environment variables
    process.env.JWT_SECRET = 'test_jwt_secret';
    process.env.REFRESH_TOKEN_SECRET = 'test_refresh_secret';
    process.env.JWT_EXPIRES_IN = '15m';
    process.env.REFRESH_TOKEN_EXPIRES_IN = '7d';
  });

  describe('generateAccessToken', () => {
    it('should generate a valid JWT access token', () => {
      const token = generateAccessToken(mockPayload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT format: header.payload.signature
    });

    it('should include correct payload data in token', () => {
      const token = generateAccessToken(mockPayload);
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

      expect(decoded.userId).toBe(mockPayload.userId);
      expect(decoded.email).toBe(mockPayload.email);
      expect(decoded.username).toBe(mockPayload.username);
    });

    it('should set token expiration to 15 minutes', () => {
      const token = generateAccessToken(mockPayload);
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
      // Check expiration is approximately 15 minutes from issued time
      const expiresIn = decoded.exp - decoded.iat;
      expect(expiresIn).toBe(900); // 15 minutes = 900 seconds
    });

    it('should generate different tokens for different payloads', () => {
      const token1 = generateAccessToken(mockPayload);
      const token2 = generateAccessToken({
        ...mockPayload,
        userId: 'different_user_id',
      });

      expect(token1).not.toBe(token2);
    });

    it('should use environment variable for JWT secret', () => {
      const customSecret = 'custom_test_secret';
      const originalSecret = process.env.JWT_SECRET;
      process.env.JWT_SECRET = customSecret;

      const token = generateAccessToken(mockPayload);

      // Should be verifiable with custom secret
      expect(() => jwt.verify(token, customSecret)).not.toThrow();

      // Restore original secret
      process.env.JWT_SECRET = originalSecret;
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid JWT refresh token', () => {
      const token = generateRefreshToken(mockPayload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('should include correct payload data in token', () => {
      const token = generateRefreshToken(mockPayload);
      const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!) as any;

      expect(decoded.userId).toBe(mockPayload.userId);
      expect(decoded.email).toBe(mockPayload.email);
      expect(decoded.username).toBe(mockPayload.username);
    });

    it('should set token expiration to 7 days', () => {
      const token = generateRefreshToken(mockPayload);
      const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!) as any;

      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
      // Check expiration is approximately 7 days from issued time
      const expiresIn = decoded.exp - decoded.iat;
      expect(expiresIn).toBe(604800); // 7 days = 604800 seconds
    });

    it('should generate different tokens for different payloads', () => {
      const token1 = generateRefreshToken(mockPayload);
      const token2 = generateRefreshToken({
        ...mockPayload,
        email: 'different@example.com',
      });

      expect(token1).not.toBe(token2);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify and decode a valid access token', () => {
      const token = generateAccessToken(mockPayload);
      const decoded = verifyAccessToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(mockPayload.userId);
      expect(decoded.email).toBe(mockPayload.email);
      expect(decoded.username).toBe(mockPayload.username);
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.string';

      expect(() => verifyAccessToken(invalidToken)).toThrow();
    });

    it('should throw error for token with wrong signature', () => {
      const token = jwt.sign(mockPayload, 'wrong_secret', { expiresIn: '15m' });

      expect(() => verifyAccessToken(token)).toThrow();
    });

    it('should throw error for expired token', () => {
      // Create token that expires immediately
      const expiredToken = jwt.sign(mockPayload, process.env.JWT_SECRET!, {
        expiresIn: '0s',
      });

      // Wait a tiny bit to ensure expiration
      return new Promise((resolve) => {
        setTimeout(() => {
          expect(() => verifyAccessToken(expiredToken)).toThrow();
          resolve(undefined);
        }, 100);
      });
    });

    it('should throw error for malformed token', () => {
      const malformedToken = 'not-a-jwt-token';

      expect(() => verifyAccessToken(malformedToken)).toThrow();
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify and decode a valid refresh token', () => {
      const token = generateRefreshToken(mockPayload);
      const decoded = verifyRefreshToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(mockPayload.userId);
      expect(decoded.email).toBe(mockPayload.email);
      expect(decoded.username).toBe(mockPayload.username);
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.refresh.token';

      expect(() => verifyRefreshToken(invalidToken)).toThrow();
    });

    it('should throw error for token with wrong signature', () => {
      const token = jwt.sign(mockPayload, 'wrong_secret', { expiresIn: '7d' });

      expect(() => verifyRefreshToken(token)).toThrow();
    });

    it('should throw error for access token verified as refresh token', () => {
      const accessToken = generateAccessToken(mockPayload);

      // Access token uses different secret, should fail refresh verification
      expect(() => verifyRefreshToken(accessToken)).toThrow();
    });
  });

  describe('generateTokenPair', () => {
    let testUser: IUser;

    beforeEach(async () => {
      testUser = new User({
        email: 'test@example.com',
        username: 'testuser',
        password: 'Test123456',
        authProvider: 'local',
      });
      await testUser.save();
    });

    it('should generate both access and refresh tokens', () => {
      const { accessToken, refreshToken } = generateTokenPair(testUser);

      expect(accessToken).toBeDefined();
      expect(refreshToken).toBeDefined();
      expect(typeof accessToken).toBe('string');
      expect(typeof refreshToken).toBe('string');
    });

    it('should generate tokens with correct user data', () => {
      const { accessToken, refreshToken } = generateTokenPair(testUser);

      const decodedAccess = verifyAccessToken(accessToken);
      const decodedRefresh = verifyRefreshToken(refreshToken);

      expect(decodedAccess.userId).toBe(String(testUser._id));
      expect(decodedAccess.email).toBe(testUser.email);
      expect(decodedAccess.username).toBe(testUser.username);

      expect(decodedRefresh.userId).toBe(String(testUser._id));
      expect(decodedRefresh.email).toBe(testUser.email);
      expect(decodedRefresh.username).toBe(testUser.username);
    });

    it('should generate different access and refresh tokens', () => {
      const { accessToken, refreshToken } = generateTokenPair(testUser);

      expect(accessToken).not.toBe(refreshToken);
    });

    it('should generate tokens that are independently valid', () => {
      const { accessToken, refreshToken } = generateTokenPair(testUser);

      // Both tokens should verify successfully with their respective methods
      expect(() => verifyAccessToken(accessToken)).not.toThrow();
      expect(() => verifyRefreshToken(refreshToken)).not.toThrow();
    });

    it('should generate different token pairs for the same user at different times', async () => {
      const pair1 = generateTokenPair(testUser);

      // Wait a full second to ensure different iat (issued at) timestamps
      await new Promise((resolve) => setTimeout(resolve, 1100));

      const pair2 = generateTokenPair(testUser);

      // Tokens should be different due to different timestamps
      expect(pair1.accessToken).not.toBe(pair2.accessToken);
      expect(pair1.refreshToken).not.toBe(pair2.refreshToken);
    });

    it('should handle user with ObjectId correctly', () => {
      const { accessToken } = generateTokenPair(testUser);
      const decoded = verifyAccessToken(accessToken);

      // Should convert ObjectId to string
      expect(typeof decoded.userId).toBe('string');
      expect(decoded.userId).toBe(String(testUser._id));
    });
  });

  describe('Token Security', () => {
    it('should use different secrets for access and refresh tokens', () => {
      const { accessToken, refreshToken } = generateTokenPair(
        new User({
          _id: mockPayload.userId,
          email: mockPayload.email,
          username: mockPayload.username,
          authProvider: 'local',
        })
      );

      // Access token should not verify with refresh secret
      expect(() =>
        jwt.verify(accessToken, process.env.REFRESH_TOKEN_SECRET!)
      ).toThrow();

      // Refresh token should not verify with access secret
      expect(() => jwt.verify(refreshToken, process.env.JWT_SECRET!)).toThrow();
    });

    it('should not include sensitive data in token payload', () => {
      const user = new User({
        email: 'test@example.com',
        username: 'testuser',
        password: 'Test123456',
        authProvider: 'local',
        refreshToken: 'some_refresh_token',
      });

      const { accessToken } = generateTokenPair(user);
      const decoded = jwt.decode(accessToken) as any;

      // Should not include password or refreshToken
      expect(decoded.password).toBeUndefined();
      expect(decoded.refreshToken).toBeUndefined();
    });
  });
});
