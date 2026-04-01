import { Request, Response } from 'express';
import { User } from '../models/user.model';
import { generateTokenPair, verifyRefreshToken } from '../services/auth.service';
import { asyncHandler, AppError } from '../middleware/error.middleware';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, username, password } = req.body;

  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    throw new AppError(
      existingUser.email === email ? 'Email already registered' : 'Username already taken',
      409
    );
  }

  const user = await User.create({
    email,
    username,
    password,
    authProvider: 'local',
  });

  const { accessToken, refreshToken } = generateTokenPair(user);

  user.refreshToken = refreshToken;
  await user.save();

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(201).json({
    status: 'success',
    data: {
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
        profileImageUrl: user.profileImageUrl,
        yearOfStudy: user.yearOfStudy,
        degree: user.degree,
      },
      accessToken,
    },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || user.authProvider !== 'local') {
    throw new AppError('Invalid email or password', 401);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  const { accessToken, refreshToken } = generateTokenPair(user);

  user.refreshToken = refreshToken;
  await user.save();

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
        profileImageUrl: user.profileImageUrl,
        yearOfStudy: user.yearOfStudy,
        degree: user.degree,
      },
      accessToken,
    },
  });
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    throw new AppError('Refresh token is required', 401);
  }

  const decoded = verifyRefreshToken(token);
  const user = await User.findById(decoded.userId).select('+refreshToken');

  if (!user || user.refreshToken !== token) {
    throw new AppError('Invalid refresh token', 401);
  }

  const { accessToken, refreshToken: newRefreshToken } = generateTokenPair(user);

  user.refreshToken = newRefreshToken;
  await user.save();

  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    status: 'success',
    data: { accessToken },
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;
  if (token) {
    const user = await User.findOne({ refreshToken: token }).select('+refreshToken');
    if (user) {
      user.refreshToken = undefined;
      await user.save();
    }
  }

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
  });

  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
});

export const oauthCallback = asyncHandler(async (req: Request, res: Response) => {
  const passportUser = req.user as { userId: string; email: string; username: string } | undefined;
  if (!passportUser) {
    throw new AppError('OAuth authentication failed', 401);
  }

  // Passport sets req.user with { userId, email, username }
  const user = await User.findById(passportUser.userId).select('+refreshToken');
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const { accessToken, refreshToken } = generateTokenPair(user);

  user.refreshToken = refreshToken;
  await user.save();

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  // Redirect to frontend with access token
  const frontendUrl = process.env.FRONTEND_URL || 'https://localhost:3000';
  res.redirect(`${frontendUrl}/oauth/callback?token=${accessToken}`);
});
