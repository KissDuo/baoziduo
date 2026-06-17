import { Router } from 'express';
import { z } from 'zod';
import { ieltsController } from '../controllers/ielts.controller.js';
import { validate, validateParams } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { saveAnswerSchema } from '@english/shared';

const router = Router();

const examIdSchema = z.object({ id: z.coerce.number().int().positive() });
const attemptIdSchema = z.object({ attemptId: z.coerce.number().int().positive() });

// GET /api/v1/ielts/exams — List exams
router.get('/exams', (_req, res, next) => ieltsController.listExams(_req, res, next));

// GET /api/v1/ielts/exams/:id — Exam detail (no auth needed to preview)
router.get('/exams/:id', validateParams(examIdSchema), (req, res, next) =>
  ieltsController.getDetail(req, res, next));

// POST /api/v1/ielts/exams/:id/start — Start or resume attempt
router.post('/exams/:id/start', authenticate, validateParams(examIdSchema), (req, res, next) =>
  ieltsController.startAttempt(req, res, next));

// POST /api/v1/ielts/attempts/:attemptId/answer — Save a single answer
router.post('/attempts/:attemptId/answer', authenticate, validateParams(attemptIdSchema), validate(saveAnswerSchema), (req, res, next) =>
  ieltsController.saveAnswer(req, res, next));

// POST /api/v1/ielts/attempts/:attemptId/submit — Submit and score
router.post('/attempts/:attemptId/submit', authenticate, validateParams(attemptIdSchema), (req, res, next) =>
  ieltsController.submitAttempt(req, res, next));

// GET /api/v1/ielts/attempts/:attemptId/result — Get result
router.get('/attempts/:attemptId/result', authenticate, validateParams(attemptIdSchema), (req, res, next) =>
  ieltsController.getResult(req, res, next));

// GET /api/v1/ielts/attempts — List user's attempts
router.get('/attempts', authenticate, (req, res, next) =>
  ieltsController.listAttempts(req, res, next));

export default router;
