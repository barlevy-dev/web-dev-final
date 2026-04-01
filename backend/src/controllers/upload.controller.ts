import { Request, Response } from 'express';
import { User } from '../models/user.model';
import { processProfileImage, processPostImage } from '../services/upload.service';
import { asyncHandler, AppError } from '../middleware/error.middleware';
import { getAuthUser } from '../middleware/auth.middleware';

export const uploadProfile = asyncHandler(async (req: Request, res: Response) => {
  const authUser = getAuthUser(req);
  if (!authUser) {
    throw new AppError('Not authenticated', 401);
  }
  if (!req.file) {
    throw new AppError('No image file provided', 400);
  }

  const imageUrl = await processProfileImage(req.file);

  await User.findByIdAndUpdate(authUser.userId, { profileImageUrl: imageUrl });

  res.status(200).json({
    status: 'success',
    data: { imageUrl },
  });
});

export const uploadPost = asyncHandler(async (req: Request, res: Response) => {
  const authUser = getAuthUser(req);
  if (!authUser) {
    throw new AppError('Not authenticated', 401);
  }
  if (!req.file) {
    throw new AppError('No image file provided', 400);
  }

  const imageUrl = await processPostImage(req.file);

  res.status(200).json({
    status: 'success',
    data: { imageUrl },
  });
});
