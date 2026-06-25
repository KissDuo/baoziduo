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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/login/email', { email, password });
      // Use window.location to force full reload, ensuring cookie is picked up
      window.location.href = redirect;
    } catch (err: any) {
      setError(err.message || t('auth.login_failed'));
    } finally {
      setLoading(false);
    }
  }

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

      <p className="text-center text-sm text-slate-500 mt-6">
        还没有账号？{' '}
        <Link href="/register" className="text-primary-600 hover:underline">{t('auth.login_to_register')}</Link>
      </p>
    </div>
  );
}
