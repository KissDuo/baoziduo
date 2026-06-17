import { Request, Response, NextFunction } from 'express';
import { articleService } from '../services/article.service.js';

export class ArticleController {
  async listArticles(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, pageSize, difficultyLevel } = req.query as any;
      const result = await articleService.listArticles(
        page,
        pageSize,
        difficultyLevel,
        req.user?.id,
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const slug = req.params.slug as string;
      const result = await articleService.getArticleBySlug(slug, req.user?.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getWordAnnotation(req: Request, res: Response, next: NextFunction) {
    try {
      const slug = req.params.slug as string;
      const word = req.params.word as string;
      const ip = req.ip || req.socket.remoteAddress || undefined;
      const result = await articleService.getWordAnnotation(slug, word, req.user?.id, ip);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const slug = req.params.slug as string;
      const result = await articleService.getArticleProgress(slug, req.user!.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async updateProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const slug = req.params.slug as string;
      const result = await articleService.updateArticleProgress(slug, req.user!.id, req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async translateParagraph(req: Request, res: Response, next: NextFunction) {
    try {
      const slug = req.params.slug as string;
      const paragraphId = Number(req.params.paragraphId);
      const ip = req.ip || req.socket.remoteAddress || undefined;
      const result = await articleService.translateParagraph(
        slug,
        paragraphId,
        req.user?.id,
        ip,
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

export const articleController = new ArticleController();
