'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { useLang } from '@/lib/i18n';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLang();
  const [mode, setMode] = useState<'email' | 'sms'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/login/email', { email, password });
      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message || t('login.submit') + ' ' + t('common.retry'));
    } finally {
      setLoading(false);
    }
  }

  async function handleSendCode() {
    setError('');
    try {
      await api.post('/auth/sms/send', { phone });
    } catch (err: any) {
      setError(err.message || 'Failed');
    }
  }

  async function handleSmsLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/login/sms/verify', { phone, code });
      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message || t('login.submit') + ' ' + t('common.retry'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-6">{t('login.title')}</h1>

      <div className="flex border rounded-lg mb-6">
        <button
          onClick={() => setMode('email')}
          className={`flex-1 py-2 text-sm rounded-l-lg transition-colors ${
            mode === 'email' ? 'bg-primary-600 text-white' : 'text-slate-600'
          }`}
        >
          {t('login.email_tab')}
        </button>
        <button
          onClick={() => setMode('sms')}
          className={`flex-1 py-2 text-sm rounded-r-lg transition-colors ${
            mode === 'sms' ? 'bg-primary-600 text-white' : 'text-slate-600'
          }`}
        >
          {t('login.sms_tab')}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>
      )}

      {mode === 'email' ? (
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('login.email_label')}</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" required placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('login.password_label')}</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" required placeholder="8+ chars" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-primary-600 text-white py-2 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors">
            {loading ? t('login.submitting') : t('login.submit')}
          </button>
        </form>
      ) : (
        <form onSubmit={handleSmsLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('login.phone_label')}</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" required placeholder="13800138000" />
          </div>
          <div className="flex gap-2">
            <input type="text" value={code} onChange={(e) => setCode(e.target.value)}
              className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" required placeholder="6 digits" maxLength={6} />
            <button type="button" onClick={handleSendCode}
              className="px-4 py-2 border rounded-lg text-sm text-slate-600 hover:bg-slate-50 whitespace-nowrap">
              {t('login.send_code')}
            </button>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-primary-600 text-white py-2 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors">
            {loading ? t('login.submitting') : t('login.submit')}
          </button>
        </form>
      )}

      <p className="text-center text-sm text-slate-500 mt-6">
        {t('login.no_account')}{' '}
        <Link href="/register" className="text-primary-600 hover:underline">{t('login.signup')}</Link>
      </p>
    </div>
  );
}
