import { Comment, IComment } from '../models/comment.model';
import { Post } from '../models/post.model';
import { User } from '../models/user.model';
import { AppError } from '../middleware/error.middleware';

export const createComment = async (
  postId: string,
  userId: string,
  content: string
): Promise<IComment> => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new AppError('Post not found', 404);
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const comment = await Comment.create({
    postId,
    userId,
    authorName: user.username,
    authorImageUrl: user.profileImageUrl,
    content,
  });

  post.commentsCount += 1;
  await post.save();

  return comment;
};

export const getCommentsByPost = async (postId: string, page: number = 1, limit: number = 10) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new AppError('Post not found', 404);
  }

  const skip = (page - 1) * limit;

  const [comments, total] = await Promise.all([
    Comment.find({ postId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Comment.countDocuments({ postId }),
  ]);

  return {
    comments,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

export const deleteComment = async (commentId: string, userId: string): Promise<void> => {
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new AppError('Comment not found', 404);
  }
  if (comment.userId.toString() !== userId) {
    throw new AppError('Not authorized to delete this comment', 403);
  }

  await Comment.findByIdAndDelete(commentId);

  await Post.findByIdAndUpdate(comment.postId, { $inc: { commentsCount: -1 } });
};
