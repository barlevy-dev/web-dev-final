import { Request, Response } from 'express';
import * as aiService from '../services/ai.service';
import { asyncHandler, AppError } from '../middleware/error.middleware';
import { getAuthUser } from '../middleware/auth.middleware';

export const getStudyTips = asyncHandler(async (req: Request, res: Response) => {
  const authUser = getAuthUser(req);
  if (!authUser) {
    throw new AppError('Not authenticated', 401);
  }

  const { topic, context } = req.body;
  const tips = await aiService.generateStudyTips(topic, context);

  res.status(200).json({
    status: 'success',
    data: { tips },
  });
});

export const enhanceContent = asyncHandler(async (req: Request, res: Response) => {
  const authUser = getAuthUser(req);
  if (!authUser) {
    throw new AppError('Not authenticated', 401);
  }

  const { content } = req.body;
  const suggestions = await aiService.enhanceContent(content);

  res.status(200).json({
    status: 'success',
    data: { suggestions },
  });
});

export const suggestTags = asyncHandler(async (req: Request, res: Response) => {
  const authUser = getAuthUser(req);
  if (!authUser) {
    throw new AppError('Not authenticated', 401);
  }

  const { title, content } = req.body;
  const tags = await aiService.suggestTags(title, content);

  res.status(200).json({
    status: 'success',
    data: { tags },
  });
});
