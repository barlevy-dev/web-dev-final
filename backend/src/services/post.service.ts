import mongoose from 'mongoose';
import { Post, IPost } from '../models/post.model';
import { Comment } from '../models/comment.model';
import { User } from '../models/user.model';
import { AppError } from '../middleware/error.middleware';
import { emitPostEvent } from '../sockets/handlers';

interface PostFilters {
  courseTag?: string;
  difficultyLevel?: string;
  search?: string;
}

export const createPost = async (
  userId: string,
  postData: {
    title: string;
    content: string;
    courseTag: string;
    difficultyLevel: string;
    imageUrl?: string;
    aiEnhanced?: boolean;
  }
): Promise<IPost> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const post = await Post.create({
    ...postData,
    userId,
    authorName: user.username,
    authorImageUrl: user.profileImageUrl,
  });

  emitPostEvent('post:created', post);
  return post;
};

export const getPosts = async (filters: PostFilters, page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit;
  const query: Record<string, unknown> = {};

  if (filters.courseTag) {
    query.courseTag = filters.courseTag;
  }
  if (filters.difficultyLevel) {
    query.difficultyLevel = filters.difficultyLevel;
  }
  if (filters.search) {
    query.$or = [
      { title: { $regex: filters.search, $options: 'i' } },
      { content: { $regex: filters.search, $options: 'i' } },
    ];
  }

  const [posts, total] = await Promise.all([
    Post.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Post.countDocuments(query),
  ]);

  return {
    posts,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

export const getPostById = async (postId: string): Promise<IPost> => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new AppError('Post not found', 404);
  }
  return post;
};

export const updatePost = async (
  postId: string,
  userId: string,
  updateData: Partial<{ title: string; content: string; courseTag: string; difficultyLevel: string }>
): Promise<IPost> => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new AppError('Post not found', 404);
  }
  if (post.userId.toString() !== userId) {
    throw new AppError('Not authorized to update this post', 403);
  }

  Object.assign(post, updateData);
  await post.save();
  return post;
};

export const deletePost = async (postId: string, userId: string): Promise<void> => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new AppError('Post not found', 404);
  }
  if (post.userId.toString() !== userId) {
    throw new AppError('Not authorized to delete this post', 403);
  }

  await Comment.deleteMany({ postId });
  await Post.findByIdAndDelete(postId);
};

export const likePost = async (postId: string, userId: string): Promise<IPost> => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new AppError('Post not found', 404);
  }

  const alreadyLiked = post.likedBy.some((id) => id.toString() === userId);
  if (alreadyLiked) {
    throw new AppError('Post already liked', 400);
  }

  post.likedBy.push(new mongoose.Types.ObjectId(userId));
  post.likes = post.likedBy.length;
  await post.save();

  emitPostEvent('post:liked', post);
  return post;
};

export const unlikePost = async (postId: string, userId: string): Promise<IPost> => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new AppError('Post not found', 404);
  }

  const likeIndex = post.likedBy.findIndex((id) => id.toString() === userId);
  if (likeIndex === -1) {
    throw new AppError('Post not liked', 400);
  }

  post.likedBy.splice(likeIndex, 1);
  post.likes = post.likedBy.length;
  await post.save();

  emitPostEvent('post:liked', post);
  return post;
};
