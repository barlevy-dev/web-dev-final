import jwt, { SignOptions } from 'jsonwebtoken';
import { IUser } from '../models/user.model';

interface TokenPayload {
  userId: string;
  email: string;
  username: string;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN || '15m') as jwt.SignOptions['expiresIn'],
  };
  return jwt.sign(payload, process.env.JWT_SECRET || 'default_jwt_secret', options);
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  const options: SignOptions = {
    expiresIn: (process.env.REFRESH_TOKEN_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'],
  };
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET || 'default_refresh_secret', options);
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, process.env.JWT_SECRET || 'default_jwt_secret') as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(
    token,
    process.env.REFRESH_TOKEN_SECRET || 'default_refresh_secret'
  ) as TokenPayload;
};

export const generateTokenPair = (
  user: IUser
): { accessToken: string; refreshToken: string } => {
  const payload: TokenPayload = {
    userId: String(user._id),
    email: user.email,
    username: user.username,
  };

  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};
