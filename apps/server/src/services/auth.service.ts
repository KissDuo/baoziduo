import { hashPassword, verifyPassword } from '../utils/password.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';
import { sendVerificationEmail } from '../utils/email.js';
import prisma from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

export class AuthService {
  // ── Daily email quota helpers ──
  private async checkAndIncrementQuota(type: 'register' | 'reset') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let quota = await prisma.dailyEmailQuota.findUnique({ where: { date: today } });
    if (!quota) {
      quota = await prisma.dailyEmailQuota.create({ data: { date: today } });
    }

    const total = quota.registerCount + quota.resetCount;
    if (total >= 99) {
      throw new AppError(429, 'Daily email quota exceeded', 'EMAIL_QUOTA_EXCEEDED');
    }

    // Increment
    await prisma.dailyEmailQuota.update({
      where: { id: quota.id },
      data: type === 'register'
        ? { registerCount: { increment: 1 } }
        : { resetCount: { increment: 1 } },
    });
  }

  // ── Send Email Verification Code ──
  async sendEmailCode(email: string) {
    // Check if email already registered
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new AppError(409, 'Email already registered', 'EMAIL_EXISTS');
    }

    await this.checkAndIncrementQuota('register');

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await prisma.emailCode.create({
      data: {
        email,
        code,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min
      },
    });

    await sendVerificationEmail(email, code);

    return { ok: true };
  }

  // ── Email Registration ──
  async registerByEmail(email: string, password: string, code: string, nickname?: string) {
    // Verify code first
    const emailCode = await prisma.emailCode.findFirst({
      where: { email, code, used: false },
      orderBy: { createdAt: 'desc' },
    });

    if (!emailCode || emailCode.expiresAt < new Date()) {
      throw new AppError(401, 'Invalid or expired verification code', 'INVALID_CODE');
    }

    // Mark code as used
    await prisma.emailCode.update({ where: { id: emailCode.id }, data: { used: true } });

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

  // ── Forgot Password: Send Code ──
  async sendForgotPasswordCode(email: string) {
    // Must be a registered email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AppError(404, 'No account found with this email', 'EMAIL_NOT_FOUND');
    }

    await this.checkAndIncrementQuota('reset');

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await prisma.emailCode.create({
      data: {
        email,
        code,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min
      },
    });

    await sendVerificationEmail(email, code);

    return { ok: true };
  }

  // ── Forgot Password: Reset ──
  async resetPassword(email: string, code: string, newPassword: string) {
    // Verify code
    const emailCode = await prisma.emailCode.findFirst({
      where: { email, code, used: false },
      orderBy: { createdAt: 'desc' },
    });

    if (!emailCode || emailCode.expiresAt < new Date()) {
      throw new AppError(401, 'Invalid or expired verification code', 'INVALID_CODE');
    }

    // Check 7-day cooldown
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AppError(404, 'No account found with this email', 'EMAIL_NOT_FOUND');
    }

    if (user.lastPasswordResetAt) {
      const daysSince = (Date.now() - user.lastPasswordResetAt.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) {
        const remainingDays = Math.ceil(7 - daysSince);
        throw new AppError(429,
          `Password can only be reset once every 7 days. ${remainingDays} day(s) remaining.`,
          'RESET_COOLDOWN',
          { remainingDays }
        );
      }
    }

    // Mark code as used
    await prisma.emailCode.update({ where: { id: emailCode.id }, data: { used: true } });

    // Update password
    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { email },
      data: { passwordHash, lastPasswordResetAt: new Date() },
    });

    return { ok: true };
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
