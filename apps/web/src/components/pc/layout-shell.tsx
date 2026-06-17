'use client';

import Link from 'next/link';
import { useLang } from '@/lib/i18n';

interface LayoutUser {
  id: number;
  email?: string;
}

export function PCLayoutShell({ children, user }: { children: React.ReactNode; user?: LayoutUser | null }) {
  const { lang, setLang, t } = useLang();

  return (
    <div className="pc-layout">
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-primary-600">
              EnglishHub
            </Link>
            <nav className="flex items-center gap-6">
              <Link href="/articles" className="text-slate-600 hover:text-slate-900 transition-colors">
                {t('nav.articles')}
              </Link>
              <Link href="/vocabulary" className="text-slate-600 hover:text-slate-900 transition-colors">
                {t('nav.vocabulary')}
              </Link>
              <Link href="/ielts" className="text-slate-600 hover:text-slate-900 transition-colors">
                {t('nav.ielts')}
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {/* Language toggle */}
            <button
              onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
              className="text-xs text-slate-400 hover:text-slate-600 border border-slate-200 rounded px-2 py-1 transition-colors"
            >
              {t('nav.lang_tip')}
            </button>

            {user ? (
              <div className="relative group">
                <button className="text-sm text-slate-600 hover:text-slate-900 py-2 flex items-center gap-1">
                  {user.email || `User #${user.id}`}
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <Link
                    href="/vocabulary"
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 rounded-t-lg"
                  >
                    <span>📖</span>
                    {t('nav.my_vocab')}
                  </Link>
                  <a
                    href="/login"
                    className="block px-4 py-2.5 text-sm text-slate-500 hover:bg-slate-50 rounded-b-lg border-t"
                    onClick={async (e) => {
                      e.preventDefault();
                      try { await fetch('http://localhost:3001/api/v1/auth/logout', { method: 'POST', credentials: 'include' }); } catch {}
                      window.location.href = '/login';
                    }}
                  >
                    {t('nav.logout')}
                  </a>
                </div>
              </div>
            ) : (
              <>
                <Link href="/login" className="text-slate-600 hover:text-slate-900">
                  {t('nav.login')}
                </Link>
                <Link
                  href="/register"
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  {t('nav.register')}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        {children}
      </main>

      <footer className="border-t py-8 text-center text-sm text-slate-500">
        <p>&copy; {new Date().getFullYear()} EnglishHub. All rights reserved.</p>
      </footer>
    </div>
  );
}
