import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, AccessTokenPayload } from '../utils/jwt.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email?: string;
      };
    }
  }
}

/**
 * Verifies the access token from httpOnly cookie or Authorization header.
 * Attaches `req.user` on success, returns 401 on failure.
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  // 1. Try httpOnly cookie first
  let token = req.cookies?.access_token;

  // 2. Fallback to Authorization header (for mobile or testing)
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    }
  }

  if (!token) {
    res.status(401).json({ error: 'Authentication required', code: 'AUTH_REQUIRED' });
    return;
  }

  try {
    const payload: AccessTokenPayload = verifyAccessToken(token);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token', code: 'TOKEN_INVALID' });
  }
}

/**
 * Like authenticate, but doesn't fail if no token is present.
 * Useful for endpoints that work differently for logged-in vs anonymous users.
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  let token = req.cookies?.access_token;
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    }
  }

  if (token) {
    try {
      const payload = verifyAccessToken(token);
      req.user = { id: payload.sub, email: payload.email };
    } catch {
      // Token invalid — treat as anonymous
    }
  }

  next();
}
