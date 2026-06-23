import { Router, Request, Response, NextFunction } from 'express';
import { videoService } from '../services/video.service.js';

const router = Router();

router.post('/transcript', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      res.status(400).json({ error: 'URL is required', code: 'MISSING_URL' });
      return;
    }
    const result = await videoService.getTranscript(url);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
