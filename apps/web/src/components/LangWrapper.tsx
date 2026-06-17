'use client';

import { LangProvider, type Lang } from '@/lib/i18n';

export function LangWrapper({ children, initialLang = 'zh' }: { children: React.ReactNode; initialLang?: Lang }) {
  return <LangProvider initialLang={initialLang}>{children}</LangProvider>;
}
