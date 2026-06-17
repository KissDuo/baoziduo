import { api } from '@/lib/api-client';
import type { UserResponse, AuthResponse } from '@english/shared';

export const authService = {
  async loginByEmail(email: string, password: string): Promise<void> {
    await api.post('/auth/login/email', { email, password });
  },

  async registerByEmail(email: string, password: string, nickname?: string): Promise<void> {
    await api.post('/auth/register/email', { email, password, nickname });
  },

  async sendSmsCode(phone: string): Promise<void> {
    await api.post('/auth/sms/send', { phone });
  },

  async loginBySms(phone: string, code: string): Promise<void> {
    await api.post('/auth/login/sms/verify', { phone, code });
  },

  async refreshToken(): Promise<void> {
    await api.post('/auth/refresh');
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async getMe(): Promise<UserResponse> {
    return api.get<UserResponse>('/users/me');
  },
};
