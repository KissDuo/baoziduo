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
      const { page, pageSize, filter } = req.query as any;
      const result = await vocabularyService.listVocabulary(req.user!.id, page, pageSize, filter);
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

  async listBooks(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const books = await vocabularyService.listBooks(userId);
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

  async searchWord(req: Request, res: Response, next: NextFunction) {
    try {
      const { q } = req.query as any;
      const result = await vocabularyService.searchWord(q as string);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async aiSearch(req: Request, res: Response, next: NextFunction) {
    try {
      const { q } = req.body;
      const { aiSearch } = await import('../services/ai-search.service.js');
      const result = await aiSearch(q);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

export const vocabularyController = new VocabularyController();
