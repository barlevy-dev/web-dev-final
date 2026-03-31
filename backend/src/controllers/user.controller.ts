import { Request, Response } from 'express';
import * as userService from '../services/user.service';
import { asyncHandler, AppError } from '../middleware/error.middleware';
import { getAuthUser } from '../middleware/auth.middleware';

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const authUser = getAuthUser(req);
  if (!authUser) {
    throw new AppError('Not authenticated', 401);
  }

  const user = await userService.getUserById(authUser.userId);

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

export const updateMe = asyncHandler(async (req: Request, res: Response) => {
  const authUser = getAuthUser(req);
  if (!authUser) {
    throw new AppError('Not authenticated', 401);
  }

  const user = await userService.updateUser(authUser.userId, req.body);

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.params.userId as string;
  const user = await userService.getUserById(userId);

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

export const getUserPosts = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.params.userId as string;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const result = await userService.getUserPosts(userId, page, limit);

  res.status(200).json({
    status: 'success',
    data: result,
  });
});
