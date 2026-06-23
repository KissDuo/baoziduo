import { Router } from 'express';
import { z } from 'zod';
import { vocabularyController } from '../controllers/vocabulary.controller.js';
import { validate, validateQuery, validateParams } from '../middleware/validate.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { paginationSchema, addVocabularySchema } from '@english/shared';

const router = Router();

// ── Params schema ──
const vocabIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const bookSlugSchema = z.object({
  slug: z.string().min(1),
});

const studyProgressSchema = z.object({
  results: z.array(z.object({
    wordId: z.number().int().positive(),
    known: z.boolean(),
  })).min(1).max(200),
});

// ── User vocabulary routes (all require auth) ──

// POST /api/v1/vocabulary — Add word to vocabulary
router.post('/', authenticate, validate(addVocabularySchema), (req, res, next) =>
  vocabularyController.addWord(req, res, next),
);

// GET /api/v1/vocabulary — List user vocabulary
router.get('/', authenticate, validateQuery(paginationSchema), (req, res, next) =>
  vocabularyController.listVocabulary(req, res, next),
);

// DELETE /api/v1/vocabulary/:id — Remove word from vocabulary
router.delete('/:id', authenticate, validateParams(vocabIdSchema), (req, res, next) =>
  vocabularyController.removeWord(req, res, next),
);

// ── Study routes ──

// GET /api/v1/vocabulary/books — List vocabulary books
router.get('/books', optionalAuth, (req, res, next) =>
  vocabularyController.listBooks(req, res, next),
);

// GET /api/v1/vocabulary/books/:slug/words — Get words for study
router.get('/books/:slug/words', optionalAuth, validateParams(bookSlugSchema), (req, res, next) =>
  vocabularyController.getBookWords(req, res, next),
);

// POST /api/v1/vocabulary/books/:slug/progress — Submit study progress
router.post('/books/:slug/progress', authenticate, validateParams(bookSlugSchema), validate(studyProgressSchema), (req, res, next) =>
  vocabularyController.updateStudyProgress(req, res, next),
);

export default router;
