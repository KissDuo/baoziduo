'use client';

import { useLang } from '@/lib/i18n';

export function DesktopOnlyNotice() {
  const { t } = useLang();

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center px-6">
        <div className="text-7xl mb-6">💻</div>
        <h1 className="text-2xl font-bold text-slate-800 mb-3">
          {t('desktop.title')}
        </h1>
        <p className="text-slate-500 text-base">
          {t('desktop.desc')}
        </p>
      </div>
    </div>
  );
}
