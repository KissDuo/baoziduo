import { Request, Response, NextFunction } from 'express';
import * as listeningService from '../services/listening.service.js';

export async function listTranscripts(req: Request, res: Response, next: NextFunction) {
  try {
    const category = req.query.category as string | undefined;
    const result = await listeningService.listTranscripts(category);
    res.json(result);
  } catch (e) { next(e); }
}

export async function getTranscript(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id!);
    const result = await listeningService.getTranscript(id);
    if (!result) { res.status(404).json({ error: 'Transcript not found' }); return; }
    res.json(result);
  } catch (e) { next(e); }
}

export async function checkSentence(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id!);
    const { sentenceIndex, userInput } = req.body;
    const result = await listeningService.checkSentence(id, sentenceIndex, userInput);
    res.json(result);
  } catch (e) { next(e); }
}

export async function transcribe(req: Request, res: Response, next: NextFunction) {
  try {
    const { audioUrl, category, sectionId } = req.body;
    const result = await listeningService.transcribe(audioUrl, category, sectionId);
    res.json(result);
  } catch (e) { next(e); }
}
