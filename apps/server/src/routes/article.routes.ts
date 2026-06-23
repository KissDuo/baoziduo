import { Router } from 'express';
import { z } from 'zod';
import { articleController } from '../controllers/article.controller.js';
import { validate, validateQuery, validateParams } from '../middleware/validate.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { paginationSchema, updateProgressSchema } from '@english/shared';

const router = Router();

// ── Query schema for article list ──
const listArticlesQuerySchema = paginationSchema.extend({
  difficultyLevel: z.enum(['short', 'medium', 'long']).optional(),
});

// ── Params schemas ──
const slugParamsSchema = z.object({
  slug: z.string().min(1),
});

const wordParamsSchema = z.object({
  slug: z.string().min(1),
  word: z.string().min(1),
});

const translateParamsSchema = z.object({
  slug: z.string().min(1),
  paragraphId: z.coerce.number().int().positive(),
});

// ── Routes ──

// GET /api/v1/articles — List articles
router.get('/', optionalAuth, validateQuery(listArticlesQuerySchema), (req, res, next) =>
  articleController.listArticles(req, res, next),
);

// GET /api/v1/articles/:slug — Get article detail
router.get('/:slug', optionalAuth, validateParams(slugParamsSchema), (req, res, next) =>
  articleController.getDetail(req, res, next),
);

// GET /api/v1/articles/:slug/words/:word — Get word annotation
router.get('/:slug/words/:word', optionalAuth, validateParams(wordParamsSchema), (req, res, next) =>
  articleController.getWordAnnotation(req, res, next),
);

// GET /api/v1/articles/:slug/progress — Get reading progress
router.get('/:slug/progress', authenticate, validateParams(slugParamsSchema), (req, res, next) =>
  articleController.getProgress(req, res, next),
);

// PATCH /api/v1/articles/:slug/progress — Update reading progress
router.patch('/:slug/progress', authenticate, validateParams(slugParamsSchema), validate(updateProgressSchema), (req, res, next) =>
  articleController.updateProgress(req, res, next),
);

// POST /api/v1/articles/:slug/translate/:paragraphId — Translate paragraph
router.post('/:slug/translate/:paragraphId', optionalAuth, validateParams(translateParamsSchema), (req, res, next) =>
  articleController.translateParagraph(req, res, next),
);

export default router;
