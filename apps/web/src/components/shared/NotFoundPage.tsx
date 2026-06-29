'use client';

import { useLang } from '@/lib/i18n';

export function NotFoundPage() {
  const { t } = useLang();

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {/* Cute astronaut image */}
      <div className="text-8xl mb-6 animate-bounce select-none">
        🚀
      </div>
      <h1 className="text-4xl font-bold text-slate-800 mb-3">404</h1>
      <p className="text-lg text-slate-500">{t('notfound.message')}</p>
    </div>
  );
}
