'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api-client';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  function startCountdown() {
    setCountdown(60);
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  }

  async function handleSendCode() {
    setError('');
    if (!email || !email.includes('@')) {
      setError('请先输入有效的邮箱地址');
      return;
    }
    setSending(true);
    try {
      await api.post('/auth/email/send-code', { email });
      startCountdown();
    } catch (err: any) {
      setError(err.message || '发送失败，请稍后重试');
    } finally {
      setSending(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (code.length !== 6) {
      setError('请输入6位验证码');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/register/email', { email, password, code, nickname: nickname || undefined });
      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message || '注册失败');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-6">注册</h1>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">昵称</label>
          <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" required placeholder="你的昵称" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">邮箱</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" required placeholder="you@example.com" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">验证码</label>
          <div className="flex gap-2">
            <input type="text" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" required placeholder="6位数字" maxLength={6} />
            <button type="button" onClick={handleSendCode} disabled={sending || countdown > 0}
              className="px-4 py-2 border rounded-lg text-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors">
              {countdown > 0 ? `${countdown}s 后重发` : sending ? '发送中...' : '获取验证码'}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">密码</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" required placeholder="至少8位字符" />
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-primary-600 text-white py-2 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors">
          {loading ? '注册中...' : '注册'}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-6">
        已有账号？{' '}
        <Link href="/login" className="text-primary-600 hover:underline">去登录</Link>
      </p>
    </div>
  );
}
