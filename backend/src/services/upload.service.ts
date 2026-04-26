import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const removeTempFileWithRetry = async (filePath: string): Promise<void> => {
  const maxAttempts = 5;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await fs.promises.unlink(filePath);
      return;
    } catch (error: unknown) {
      const code = (error as NodeJS.ErrnoException).code;
      const retryable = code === 'EBUSY' || code === 'EPERM';
      const alreadyGone = code === 'ENOENT';

      if (alreadyGone) return;
      if (!retryable || attempt === maxAttempts) throw error;

      await sleep(60 * attempt);
    }
  }
};

export const processProfileImage = async (file: Express.Multer.File): Promise<string> => {
  const outputFilename = `profile-${Date.now()}.webp`;
  const outputDir = path.join(process.env.UPLOAD_DIR || './uploads', 'profiles');
  fs.mkdirSync(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, outputFilename);

  await sharp(file.path).resize(200, 200, { fit: 'cover' }).webp({ quality: 80 }).toFile(outputPath);

  // Remove the original uploaded file
  if (file.path !== outputPath) {
    await removeTempFileWithRetry(file.path);
  }

  return `/uploads/profiles/${outputFilename}`;
};

export const processPostImage = async (file: Express.Multer.File): Promise<string> => {
  const outputFilename = `post-${Date.now()}.webp`;
  const outputDir = path.join(process.env.UPLOAD_DIR || './uploads', 'posts');
  fs.mkdirSync(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, outputFilename);

  await sharp(file.path).resize(800, undefined, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 80 }).toFile(outputPath);

  // Remove the original uploaded file
  if (file.path !== outputPath) {
    await removeTempFileWithRetry(file.path);
  }

  return `/uploads/posts/${outputFilename}`;
};
