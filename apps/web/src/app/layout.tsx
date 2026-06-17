import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { PCLayoutShell } from '@/components/pc/layout-shell';
import { MobileLayoutShell } from '@/components/mobile/layout-shell';
import { LangWrapper } from '@/components/LangWrapper';
import type { Lang } from '@/lib/i18n';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'EnglishHub - Master English',
  description: 'Learn English with articles, vocabulary, and IELTS mock exams',
};

function parseJwtPayload(token: string): { sub: number; email?: string } | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(Buffer.from(base64, 'base64').toString('utf-8'));
  } catch {
    return null;
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const viewport = cookieStore.get('viewport')?.value || 'pc';
  const lang = (cookieStore.get('lang')?.value || 'zh') as Lang;

  const accessToken = cookieStore.get('access_token')?.value;
  const jwtPayload = accessToken ? parseJwtPayload(accessToken) : null;
  const user = jwtPayload ? { id: jwtPayload.sub, email: jwtPayload.email } : null;

  return (
    <html lang={lang === 'zh' ? 'zh-CN' : 'en'}>
      <body className={viewport === 'mobile' ? 'mobile' : 'pc'}>
        <LangWrapper initialLang={lang}>
          {viewport === 'mobile' ? (
            <MobileLayoutShell user={user}>{children}</MobileLayoutShell>
          ) : (
            <PCLayoutShell user={user}>{children}</PCLayoutShell>
          )}
        </LangWrapper>
      </body>
    </html>
  );
}
