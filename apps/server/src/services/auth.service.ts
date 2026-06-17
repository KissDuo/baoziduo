import { hashPassword, verifyPassword } from '../utils/password.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';
import prisma from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

export class AuthService {
  // ── Email Registration ──
  async registerByEmail(email: string, password: string, nickname?: string) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new AppError(409, 'Email already registered', 'EMAIL_EXISTS');
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        nickname: nickname || email.split('@')[0]!,
      },
    });

    const tokens = await this.issueTokens(user.id, user.email ?? undefined);
    return { user, ...tokens };
  }

  // ── Email Login ──
  async loginByEmail(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      throw new AppError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      throw new AppError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
    }

    const tokens = await this.issueTokens(user.id, user.email ?? undefined);
    return { user, ...tokens };
  }

  // ── SMS Send Code ──
  async sendSmsCode(phone: string) {
    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in DB (in production, send via Alibaba Cloud SMS)
    await prisma.smsCode.create({
      data: {
        phone,
        code,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min
      },
    });

    // TODO: Integrate Alibaba Cloud SMS SDK here
    console.log(`[SMS] Code for ${phone}: ${code}`);

    return { ok: true };
  }

  // ── SMS Login ──
  async loginBySms(phone: string, code: string) {
    const smsCode = await prisma.smsCode.findFirst({
      where: { phone, code, used: false },
      orderBy: { createdAt: 'desc' },
    });

    if (!smsCode || smsCode.expiresAt < new Date()) {
      throw new AppError(401, 'Invalid or expired verification code', 'INVALID_CODE');
    }

    // Mark code as used
    await prisma.smsCode.update({ where: { id: smsCode.id }, data: { used: true } });

    // Find or create user
    let user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          phone,
          nickname: `User${phone.slice(-4)}`,
        },
      });
    }

    const tokens = await this.issueTokens(user.id, user.email ?? undefined);
    return { user, ...tokens };
  }

  // ── Token Refresh ──
  async refreshTokens(oldRefreshToken: string) {
    const stored = await prisma.refreshToken.findUnique({
      where: { token: oldRefreshToken },
      include: { user: true },
    });

    if (!stored || stored.expiresAt < new Date()) {
      throw new AppError(401, 'Session expired, please login again', 'REFRESH_EXPIRED');
    }

    // Rotate: delete old, issue new
    await prisma.refreshToken.delete({ where: { id: stored.id } });

    return this.issueTokens(stored.userId, stored.user.email ?? undefined);
  }

  // ── Logout ──
  async logout(refreshToken: string) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  }

  // ── Helpers ──
  async issueTokens(userId: number, email?: string) {
    const accessToken = generateAccessToken(userId, email);
    const refreshToken = generateRefreshToken();

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return { accessToken, refreshToken };
  }
}

export const authService = new AuthService();
