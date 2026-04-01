import { User, IUser } from '../models/user.model';
import { Post } from '../models/post.model';
import { AppError } from '../middleware/error.middleware';

export const getUserById = async (userId: string): Promise<IUser> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return user;
};

export const updateUser = async (
  userId: string,
  updateData: { username?: string; yearOfStudy?: string; degree?: string }
): Promise<IUser> => {
  if (updateData.username) {
    const existing = await User.findOne({ username: updateData.username, _id: { $ne: userId } });
    if (existing) {
      throw new AppError('Username already taken', 409);
    }
  }

  const user = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
};

export const getUserPosts = async (userId: string, page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    Post.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Post.countDocuments({ userId }),
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
