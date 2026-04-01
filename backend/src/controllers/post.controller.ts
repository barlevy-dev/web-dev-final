import { Request, Response } from 'express';
import * as postService from '../services/post.service';
import { asyncHandler, AppError } from '../middleware/error.middleware';
import { getAuthUser } from '../middleware/auth.middleware';

export const createPost = asyncHandler(async (req: Request, res: Response) => {
  const authUser = getAuthUser(req);
  if (!authUser) {
    throw new AppError('Not authenticated', 401);
  }

  const post = await postService.createPost(authUser.userId, req.body);

  res.status(201).json({
    status: 'success',
    data: { post },
  });
});

export const getPosts = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const filters = {
    courseTag: req.query.courseTag as string | undefined,
    difficultyLevel: req.query.difficultyLevel as string | undefined,
    search: req.query.search as string | undefined,
  };

  const result = await postService.getPosts(filters, page, limit);

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

export const getPostById = asyncHandler(async (req: Request, res: Response) => {
  const postId = req.params.postId as string;
  const post = await postService.getPostById(postId);

  res.status(200).json({
    status: 'success',
    data: { post },
  });
});

export const updatePost = asyncHandler(async (req: Request, res: Response) => {
  const authUser = getAuthUser(req);
  if (!authUser) {
    throw new AppError('Not authenticated', 401);
  }

  const postId = req.params.postId as string;
  const post = await postService.updatePost(postId, authUser.userId, req.body);

  res.status(200).json({
    status: 'success',
    data: { post },
  });
});

export const deletePost = asyncHandler(async (req: Request, res: Response) => {
  const authUser = getAuthUser(req);
  if (!authUser) {
    throw new AppError('Not authenticated', 401);
  }

  const postId = req.params.postId as string;
  await postService.deletePost(postId, authUser.userId);

  res.status(200).json({
    status: 'success',
    message: 'Post deleted successfully',
  });
});

export const likePost = asyncHandler(async (req: Request, res: Response) => {
  const authUser = getAuthUser(req);
  if (!authUser) {
    throw new AppError('Not authenticated', 401);
  }

  const postId = req.params.postId as string;
  const post = await postService.likePost(postId, authUser.userId);

  res.status(200).json({
    status: 'success',
    data: { post },
  });
});

export const unlikePost = asyncHandler(async (req: Request, res: Response) => {
  const authUser = getAuthUser(req);
  if (!authUser) {
    throw new AppError('Not authenticated', 401);
  }

  const postId = req.params.postId as string;
  const post = await postService.unlikePost(postId, authUser.userId);

  res.status(200).json({
    status: 'success',
    data: { post },
  });
});
