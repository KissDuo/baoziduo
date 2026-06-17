'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { useLang } from '@/lib/i18n';

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useLang();
  const [mode, setMode] = useState<'email' | 'sms'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleEmailRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/register/email', { email, password, nickname: nickname || undefined });
      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleSendCode() {
    setError('');
    try { await api.post('/auth/sms/send', { phone }); } catch (err: any) { setError(err.message || 'Failed'); }
  }

  async function handleSmsRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/register/sms', { phone, code, nickname: nickname || undefined });
      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-6">{t('register.title')}</h1>

      <div className="flex border rounded-lg mb-6">
        <button onClick={() => setMode('email')}
          className={`flex-1 py-2 text-sm rounded-l-lg transition-colors ${mode === 'email' ? 'bg-primary-600 text-white' : 'text-slate-600'}`}>
          {t('register.email_tab')}
        </button>
        <button onClick={() => setMode('sms')}
          className={`flex-1 py-2 text-sm rounded-r-lg transition-colors ${mode === 'sms' ? 'bg-primary-600 text-white' : 'text-slate-600'}`}>
          {t('register.sms_tab')}
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}

      <form onSubmit={mode === 'email' ? handleEmailRegister : handleSmsRegister} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('register.nickname')}</label>
          <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Optional" />
        </div>

        {mode === 'email' ? (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('register.email_label')}</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" required placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('register.password_label')}</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" required placeholder="8+ chars" />
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('register.phone_label')}</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" required placeholder="13800138000" />
            </div>
            <div className="flex gap-2">
              <input type="text" value={code} onChange={(e) => setCode(e.target.value)}
                className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" required placeholder="6 digits" maxLength={6} />
              <button type="button" onClick={handleSendCode}
                className="px-4 py-2 border rounded-lg text-sm text-slate-600 hover:bg-slate-50 whitespace-nowrap">
                {t('register.send_code')}
              </button>
            </div>
          </>
        )}

        <button type="submit" disabled={loading}
          className="w-full bg-primary-600 text-white py-2 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors">
          {loading ? t('register.submitting') : t('register.submit')}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-6">
        {t('register.has_account')}{' '}
        <Link href="/login" className="text-primary-600 hover:underline">{t('register.login')}</Link>
      </p>
    </div>
  );
}
