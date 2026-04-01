import { Router } from 'express';
import { uploadProfile, uploadPost } from '../controllers/upload.controller';
import { authenticate } from '../middleware/auth.middleware';
import { uploadProfileImage, uploadPostImage } from '../middleware/upload.middleware';

const router = Router();

/**
 * @swagger
 * /api/upload/profile:
 *   post:
 *     summary: Upload profile image
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *       400:
 *         description: Invalid file
 *       401:
 *         description: Not authenticated
 */
router.post('/profile', authenticate, uploadProfileImage, uploadProfile);

/**
 * @swagger
 * /api/upload/post:
 *   post:
 *     summary: Upload post image
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *       400:
 *         description: Invalid file
 *       401:
 *         description: Not authenticated
 */
router.post('/post', authenticate, uploadPostImage, uploadPost);

export default router;
