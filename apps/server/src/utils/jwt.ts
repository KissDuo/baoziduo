import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { config } from '../config/index.js';

export interface AccessTokenPayload {
  sub: number;
  email?: string;
}

export function generateAccessToken(userId: number, email?: string): string {
  return jwt.sign(
    { sub: userId, email } satisfies AccessTokenPayload,
    config.jwt.accessSecret,
    { expiresIn: config.jwt.accessExpiresIn }
  );
}

export function generateRefreshToken(): string {
  return crypto.randomBytes(64).toString('hex');
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, config.jwt.accessSecret) as unknown as AccessTokenPayload;
}
