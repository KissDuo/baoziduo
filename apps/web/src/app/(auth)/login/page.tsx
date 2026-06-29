'use client';
import { useLang } from '@/lib/i18n';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api-client';

export default function LoginPage() {
  const { t } = useLang();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [forgotMode, setForgotMode] = useState(false);

  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot password state
  const [resetStep, setResetStep] = useState<'email' | 'code'>('email');
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetSending, setResetSending] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [cooldownDays, setCooldownDays] = useState<number | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/login/email', { email, password });
      window.location.href = redirect;
    } catch (err: any) {
      setError(err.message || t('auth.login_failed'));
    } finally {
      setLoading(false);
    }
  }

  async function handleSendResetCode() {
    if (!resetEmail) return;
    setError('');
    setResetSending(true);
    try {
      await api.post('/auth/forgot-password/send-code', { email: resetEmail });
      setResetStep('code');
    } catch (err: any) {
      if (err.code === 'EMAIL_QUOTA_EXCEEDED') {
        setError(t('email.quota_exceeded'));
      } else {
        setError(err.message || t('auth.send_failed'));
      }
    } finally {
      setResetSending(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password/reset', {
        email: resetEmail,
        code: resetCode,
        newPassword: resetNewPassword,
      });
      setResetSuccess(true);
    } catch (err: any) {
      if (err.code === 'RESET_COOLDOWN' && err.remainingDays) {
        setCooldownDays(err.remainingDays);
      }
      setError(err.message || t('auth.login_failed'));
    } finally {
      setLoading(false);
    }
  }

  function exitForgotMode() {
    setForgotMode(false);
    setResetStep('email');
    setError('');
    setResetSuccess(false);
    setResetEmail('');
    setResetCode('');
    setResetNewPassword('');
  }

  // ── Forgot Password View ──
  if (forgotMode) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-center mb-6">忘记密码</h1>

        {resetSuccess ? (
          <div className="text-center">
            <div className="text-4xl mb-4">✅</div>
            <p className="text-slate-700 mb-4">密码已重置成功</p>
            <button onClick={exitForgotMode}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors">
              返回登录
            </button>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>
            )}

            {resetStep === 'email' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('auth.login_email')}</label>
                  <input type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" required placeholder="you@example.com" />
                </div>
                <button onClick={handleSendResetCode} disabled={resetSending}
                  className="w-full bg-primary-600 text-white py-2 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors">
                  {resetSending ? t('auth.register_sending') : t('register.send_code')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('auth.login_email')}</label>
                  <input type="email" value={resetEmail} disabled
                    className="w-full border rounded-lg px-3 py-2 bg-slate-50 text-slate-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('auth.register_code')}</label>
                  <input type="text" value={resetCode} onChange={(e) => setResetCode(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" required placeholder={t('auth.register_code_ph')} maxLength={6} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">新密码</label>
                  <input type="password" value={resetNewPassword} onChange={(e) => setResetNewPassword(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" required placeholder={t('auth.register_pw_ph')} minLength={8} />
                </div>
                <p className="text-xs text-slate-400">
                  {cooldownDays && cooldownDays > 0
                    ? t('email.reset_hint_days', { n: String(cooldownDays) })
                    : t('email.reset_hint')}
                </p>
                <button type="submit" disabled={loading}
                  className="w-full bg-primary-600 text-white py-2 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors">
                  {loading ? t('auth.login_loading') : '重置密码'}
                </button>
                <button type="button" onClick={() => setResetStep('email')}
                  className="w-full text-sm text-slate-500 hover:text-primary-600">
                  ← 重新发送验证码
                </button>
              </form>
            )}

            <p className="text-center text-sm text-slate-500 mt-4">
              <button onClick={exitForgotMode} className="text-primary-600 hover:underline">← 返回登录</button>
            </p>
          </>
        )}
      </div>
    );
  }

  // ── Login View ──
  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-6">{t('auth.login_title')}</h1>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('auth.login_email')}</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" required placeholder="you@example.com" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('auth.login_password')}</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" required placeholder={t('auth.login_placeholder_pw')} />
        </div>
        <button type="submit" disabled={loading}
          className="w-full bg-primary-600 text-white py-2 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors">
          {loading ? t('auth.login_loading') : t('auth.login_submit')}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-4">
        <button onClick={() => setForgotMode(true)} className="text-primary-600 hover:underline">
          忘记密码？
        </button>
      </p>

      <p className="text-center text-sm text-slate-500 mt-2">
        还没有账号？{' '}
        <Link href="/register" className="text-primary-600 hover:underline">{t('auth.login_to_register')}</Link>
      </p>
    </div>
  );
}
