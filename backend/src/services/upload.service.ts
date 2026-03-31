import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

export const processProfileImage = async (file: Express.Multer.File): Promise<string> => {
  const outputFilename = `profile-${Date.now()}.webp`;
  const outputDir = path.join(process.env.UPLOAD_DIR || './uploads', 'profiles');
  const outputPath = path.join(outputDir, outputFilename);

  await sharp(file.path).resize(200, 200, { fit: 'cover' }).webp({ quality: 80 }).toFile(outputPath);

  // Remove the original uploaded file
  if (file.path !== outputPath) {
    fs.unlinkSync(file.path);
  }

  return `/uploads/profiles/${outputFilename}`;
};

export const processPostImage = async (file: Express.Multer.File): Promise<string> => {
  const outputFilename = `post-${Date.now()}.webp`;
  const outputDir = path.join(process.env.UPLOAD_DIR || './uploads', 'posts');
  const outputPath = path.join(outputDir, outputFilename);

  await sharp(file.path).resize(800, undefined, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 80 }).toFile(outputPath);

  // Remove the original uploaded file
  if (file.path !== outputPath) {
    fs.unlinkSync(file.path);
  }

  return `/uploads/posts/${outputFilename}`;
};
