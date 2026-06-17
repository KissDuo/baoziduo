import { Request, Response, NextFunction } from 'express';
import { ieltsService } from '../services/ielts.service.js';

export class IeltsController {
  async listExams(req: Request, res: Response, next: NextFunction) {
    try {
      const type = req.query.type as string | undefined;
      const exams = await ieltsService.listExams(type);
      res.json(exams);
    } catch (err) { next(err); }
  }

  async getDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const examId = Number(req.params.id);
      const detail = await ieltsService.getExamDetail(examId);
      res.json(detail);
    } catch (err) { next(err); }
  }

  async startAttempt(req: Request, res: Response, next: NextFunction) {
    try {
      const examId = Number(req.params.id);
      const result = await ieltsService.startAttempt(req.user!.id, examId);
      res.json(result);
    } catch (err) { next(err); }
  }

  async saveAnswer(req: Request, res: Response, next: NextFunction) {
    try {
      const attemptId = Number(req.params.attemptId);
      const { questionId, answer } = req.body;
      const result = await ieltsService.saveAnswer(req.user!.id, attemptId, questionId, answer);
      res.json(result);
    } catch (err) { next(err); }
  }

  async submitAttempt(req: Request, res: Response, next: NextFunction) {
    try {
      const attemptId = Number(req.params.attemptId);
      const result = await ieltsService.submitAttempt(req.user!.id, attemptId);
      res.json(result);
    } catch (err) { next(err); }
  }

  async getResult(req: Request, res: Response, next: NextFunction) {
    try {
      const attemptId = Number(req.params.attemptId);
      const result = await ieltsService.getResult(req.user!.id, attemptId);
      res.json(result);
    } catch (err) { next(err); }
  }

  async listAttempts(req: Request, res: Response, next: NextFunction) {
    try {
      const attempts = await ieltsService.listAttempts(req.user!.id);
      res.json(attempts);
    } catch (err) { next(err); }
  }
}

export const ieltsController = new IeltsController();
