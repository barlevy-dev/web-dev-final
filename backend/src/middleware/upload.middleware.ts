import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AppError } from './error.middleware';

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '10485760', 10); // 10MB

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const ensureUploadDir = (dir: string) => {
  fs.mkdirSync(dir, { recursive: true });
};

const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only JPG, PNG, and WEBP images are allowed', 400));
  }
};

const profileStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(process.env.UPLOAD_DIR || './uploads', 'profiles');
    ensureUploadDir(dir);
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `profile-${uniqueSuffix}${ext}`);
  },
});

const postStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(process.env.UPLOAD_DIR || './uploads', 'posts');
    ensureUploadDir(dir);
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `post-${uniqueSuffix}${ext}`);
  },
});

export const uploadProfileImage = multer({
  storage: profileStorage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
}).single('image');

export const uploadPostImage = multer({
  storage: postStorage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
}).single('image');
