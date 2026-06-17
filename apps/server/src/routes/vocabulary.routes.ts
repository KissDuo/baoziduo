import { Router } from 'express';
import { z } from 'zod';
import { vocabularyController } from '../controllers/vocabulary.controller.js';
import { validate, validateQuery, validateParams } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { paginationSchema, addVocabularySchema } from '@english/shared';

const router = Router();

// ── Params schema ──
const vocabIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// ── Routes (all require auth) ──

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

export default router;
