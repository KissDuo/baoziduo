import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { config } from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import routes from './routes/index.js';

export function createApp() {
  const app = express();

  // ── Global middleware ──
  app.use(cors(config.cors));
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());

  // Rate limiting (in-memory, single server)
  app.use(
    '/api/v1/auth',
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 min
      max: 20,
      standardHeaders: true,
      legacyHeaders: false,
      message: { error: 'Too many requests, please try again later', code: 'RATE_LIMITED' },
    })
  );

  app.use(
    '/api/v1',
    rateLimit({
      windowMs: 60 * 1000, // 1 min
      max: 60,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  // ── Health check ──
  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, timestamp: new Date().toISOString() });
  });

  // ── API routes ──
  app.use('/api/v1', routes);

  // ── Error handler (must be last!) ──
  app.use(errorHandler);

  return app;
}
