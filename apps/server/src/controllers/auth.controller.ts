import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

const REFRESH_COOKIE_OPTIONS = {
  ...COOKIE_OPTIONS,
  path: '/api/v1/auth',
  sameSite: 'strict' as const,
};

function setTokenCookies(res: Response, accessToken: string, refreshToken: string) {
  res.cookie('access_token', accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: 15 * 60 * 1000, // 15 min
  });
  res.cookie('refresh_token', refreshToken, {
    ...REFRESH_COOKIE_OPTIONS,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

function clearTokenCookies(res: Response) {
  res.clearCookie('access_token', COOKIE_OPTIONS);
  res.clearCookie('refresh_token', REFRESH_COOKIE_OPTIONS);
}

function formatUserResponse(user: any) {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    nickname: user.nickname,
    avatarUrl: user.avatarUrl,
    membershipStatus: user.membershipId
      ? user.membershipExpiresAt > new Date()
        ? 'active'
        : 'expired'
      : 'none',
    membershipTier: user.membership?.slug ?? null,
    membershipExpiresAt: user.membershipExpiresAt?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),
  };
}

export class AuthController {
  async sendEmailCode(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const result = await authService.sendEmailCode(email);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async registerByEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, code, nickname } = req.body;
      const result = await authService.registerByEmail(email, password, code, nickname);
      setTokenCookies(res, result.accessToken, result.refreshToken);
      res.status(201).json({ user: formatUserResponse(result.user) });
    } catch (err) {
      next(err);
    }
  }

  async loginByEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await authService.loginByEmail(email, password);
      setTokenCookies(res, result.accessToken, result.refreshToken);
      res.json({ user: formatUserResponse(result.user) });
    } catch (err) {
      next(err);
    }
  }

  async sendSmsCode(req: Request, res: Response, next: NextFunction) {
    try {
      const { phone } = req.body;
      const result = await authService.sendSmsCode(phone);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async loginBySms(req: Request, res: Response, next: NextFunction) {
    try {
      const { phone, code } = req.body;
      const result = await authService.loginBySms(phone, code);
      setTokenCookies(res, result.accessToken, result.refreshToken);
      res.json({ user: formatUserResponse(result.user) });
    } catch (err) {
      next(err);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const oldToken = req.cookies?.refresh_token;
      if (!oldToken) {
        res.status(401).json({ error: 'No refresh token', code: 'NO_REFRESH_TOKEN' });
        return;
      }
      const result = await authService.refreshTokens(oldToken);
      setTokenCookies(res, result.accessToken, result.refreshToken);
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies?.refresh_token;
      if (token) {
        await authService.logout(token);
      }
      clearTokenCookies(res);
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
