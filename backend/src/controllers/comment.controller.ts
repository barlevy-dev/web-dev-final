import { Request, Response } from 'express';
import * as commentService from '../services/comment.service';
import { asyncHandler, AppError } from '../middleware/error.middleware';
import { getAuthUser } from '../middleware/auth.middleware';

export const createComment = asyncHandler(async (req: Request, res: Response) => {
  const authUser = getAuthUser(req);
  if (!authUser) {
    throw new AppError('Not authenticated', 401);
  }

  const postId = req.params.postId as string;
  const comment = await commentService.createComment(postId, authUser.userId, req.body.content);

  res.status(201).json({
    status: 'success',
    data: { comment },
  });
});

export const getComments = asyncHandler(async (req: Request, res: Response) => {
  const postId = req.params.postId as string;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const result = await commentService.getCommentsByPost(postId, page, limit);

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

export const deleteComment = asyncHandler(async (req: Request, res: Response) => {
  const authUser = getAuthUser(req);
  if (!authUser) {
    throw new AppError('Not authenticated', 401);
  }

  const commentId = req.params.commentId as string;
  await commentService.deleteComment(commentId, authUser.userId);

  res.status(200).json({
    status: 'success',
    message: 'Comment deleted successfully',
  });
});
