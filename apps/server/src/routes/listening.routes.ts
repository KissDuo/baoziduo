import { Router } from 'express';
import { optionalAuth } from '../middleware/auth.js';
import * as listeningController from '../controllers/listening.controller.js';

const router = Router();

// List all transcripts
router.get('/', listeningController.listTranscripts);

// Get transcript detail with sentences
router.get('/:id', listeningController.getTranscript);

// Check sentence dictation
router.post('/:id/check', listeningController.checkSentence);

// Transcribe (admin)
router.post('/transcribe', listeningController.transcribe);

export default router;
