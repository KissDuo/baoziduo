'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLang } from '@/lib/i18n';

interface LayoutUser {
  id: number;
  email?: string;
}

export function MobileLayoutShell({ children, user }: { children: React.ReactNode; user?: LayoutUser | null }) {
  const { lang, setLang, t } = useLang();
  const pathname = usePathname();

  const navItems = [
    { href: '/', match: '/', label: t('mobile.home'), icon: '🏠' },
    { href: '/articles', match: '/articles', label: t('nav.articles'), icon: '📰' },
    { href: '/ielts', match: '/ielts', label: t('nav.ielts'), icon: '✈️' },
    { href: '/videos', match: '/videos', label: t('nav.videos'), icon: '🎬' },
    { href: user ? '/vocabulary' : '/login', match: user ? '/vocabulary' : '/login', label: user ? t('mobile.me') : t('nav.login'), icon: '👤' },
  ];

  return (
    <div className="mobile-layout">
      <header className="border-b bg-white sticky top-0 z-50 px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-primary-600">
          宝子多EN
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
            className="text-xs text-slate-400 border border-slate-200 rounded px-2 py-0.5"
          >
            {t('nav.lang_tip')}
          </button>
          {user && (
            <span className="text-xs text-slate-500 truncate max-w-[120px]">
              {user.email || `User #${user.id}`}
            </span>
          )}
        </div>
      </header>

      <main className="flex-1 px-4 py-4">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t h-16 flex items-center justify-around z-50">
        {navItems.map((item) => {
          const isActive = pathname === item.match || (item.match !== '/' && pathname.startsWith(item.match));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 transition-colors ${
                isActive ? 'text-primary-600' : 'text-slate-500 hover:text-primary-600'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
