import { Router } from 'express';
import { getStudyTips, enhanceContent, suggestTags } from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { aiLimiter } from '../middleware/rateLimiter.middleware';
import { aiStudyTipsSchema, aiEnhanceContentSchema, aiSuggestTagsSchema } from '../utils/validators';

const router = Router();

/**
 * @swagger
 * /api/ai/study-tips:
 *   post:
 *     summary: Generate AI study tips
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - topic
 *             properties:
 *               topic:
 *                 type: string
 *               context:
 *                 type: string
 *     responses:
 *       200:
 *         description: Study tips generated
 *       401:
 *         description: Not authenticated
 *       429:
 *         description: Rate limit exceeded
 */
router.post('/study-tips', authenticate, aiLimiter, validate(aiStudyTipsSchema), getStudyTips);

/**
 * @swagger
 * /api/ai/enhance-content:
 *   post:
 *     summary: Get AI content enhancement suggestions
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Enhancement suggestions generated
 *       401:
 *         description: Not authenticated
 *       429:
 *         description: Rate limit exceeded
 */
router.post('/enhance-content', authenticate, aiLimiter, validate(aiEnhanceContentSchema), enhanceContent);

/**
 * @swagger
 * /api/ai/suggest-tags:
 *   post:
 *     summary: Get AI tag suggestions
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tag suggestions generated
 *       401:
 *         description: Not authenticated
 *       429:
 *         description: Rate limit exceeded
 */
router.post('/suggest-tags', authenticate, aiLimiter, validate(aiSuggestTagsSchema), suggestTags);

export default router;
