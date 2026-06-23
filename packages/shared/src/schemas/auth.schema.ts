import { z } from 'zod';

// ── Registration ──
export const registerEmailSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  code: z.string().length(6, 'Verification code must be 6 digits'),
  nickname: z.string().min(1, 'Nickname is required').max(100),
});

export const sendEmailCodeSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const registerSmsSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, 'Invalid phone number'),
  code: z.string().length(6, 'SMS code must be 6 digits'),
  nickname: z.string().min(1).max(100).optional(),
});

// ── Login ──
export const loginEmailSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

export const sendSmsCodeSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, 'Invalid phone number'),
});

export const loginSmsVerifySchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/),
  code: z.string().length(6),
});

// ── Response types ──
export const userResponseSchema = z.object({
  id: z.number(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  nickname: z.string(),
  avatarUrl: z.string().nullable(),
  membershipStatus: z.enum(['none', 'active', 'expired']).default('none'),
  membershipTier: z.string().nullable(),
  membershipExpiresAt: z.string().nullable(),
  createdAt: z.string(),
});

export const authResponseSchema = z.object({
  user: userResponseSchema,
  accessToken: z.string(), // Only included if not using httpOnly cookies
});

export type RegisterEmailInput = z.infer<typeof registerEmailSchema>;
export type RegisterSmsInput = z.infer<typeof registerSmsSchema>;
export type LoginEmailInput = z.infer<typeof loginEmailSchema>;
export type SendSmsCodeInput = z.infer<typeof sendSmsCodeSchema>;
export type LoginSmsVerifyInput = z.infer<typeof loginSmsVerifySchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
