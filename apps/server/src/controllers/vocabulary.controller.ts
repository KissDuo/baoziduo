import { Request, Response, NextFunction } from 'express';
import { vocabularyService } from '../services/vocabulary.service.js';

export class VocabularyController {
  async addWord(req: Request, res: Response, next: NextFunction) {
    try {
      const { word, addedFrom } = req.body;
      const result = await vocabularyService.addWord(req.user!.id, word, addedFrom);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async listVocabulary(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, pageSize } = req.query as any;
      const result = await vocabularyService.listVocabulary(req.user!.id, page, pageSize);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async removeWord(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await vocabularyService.removeWord(Number(id), req.user!.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async listBooks(_req: Request, res: Response, next: NextFunction) {
    try {
      const books = await vocabularyService.listBooks();
      res.json(books);
    } catch (err) {
      next(err);
    }
  }

  async getBookWords(req: Request, res: Response, next: NextFunction) {
    try {
      const slug = req.params.slug as string;
      const userId = req.user?.id;
      const result = await vocabularyService.getBookWords(slug, userId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async updateStudyProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const slug = req.params.slug as string;
      const { results } = req.body;
      const result = await vocabularyService.updateStudyProgress(req.user!.id, slug, results);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

export const vocabularyController = new VocabularyController();
