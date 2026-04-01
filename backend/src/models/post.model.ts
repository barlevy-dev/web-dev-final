import mongoose, { Document, Schema } from 'mongoose';

export interface IPost extends Document {
  userId: mongoose.Types.ObjectId;
  authorName: string;
  authorImageUrl?: string;
  title: string;
  content: string;
  courseTag: string;
  difficultyLevel: 'easy' | 'medium' | 'hard';
  imageUrl?: string;
  likes: number;
  likedBy: mongoose.Types.ObjectId[];
  commentsCount: number;
  aiEnhanced: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    authorName: {
      type: String,
      required: true,
    },
    authorImageUrl: {
      type: String,
    },
    title: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
      minlength: 10,
    },
    courseTag: {
      type: String,
      required: true,
    },
    difficultyLevel: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
    imageUrl: {
      type: String,
    },
    likes: {
      type: Number,
      default: 0,
    },
    likedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    commentsCount: {
      type: Number,
      default: 0,
    },
    aiEnhanced: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

postSchema.index({ userId: 1 });
postSchema.index({ courseTag: 1 });
postSchema.index({ createdAt: -1 });

export const Post = mongoose.model<IPost>('Post', postSchema);
