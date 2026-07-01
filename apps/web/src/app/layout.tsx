import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { PCLayoutShell } from '@/components/pc/layout-shell';
import { LangWrapper } from '@/components/LangWrapper';
import { DesktopOnlyNotice } from '@/components/DesktopOnlyNotice';
import { GeoWrapper } from '@/components/GeoWrapper';
import type { Lang } from '@/lib/i18n';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: { template: '%s | 宝子多EN', default: '宝子多EN - 英语学习平台' },
  description: '免费在线英语学习平台，提供雅思模拟考试、文章阅读、精听练习、词汇学习等功能，支持电脑和手机。',
  keywords: ['宝子多英语', '宝子多雅思', '英语学习', '雅思', 'IELTS', 'PTE', '托福', '托业', '背单词', '精听', '文章阅读', '英语阅读'],
  authors: [{ name: '宝子多EN' }],
  robots: { index: true, follow: true },
  verification: { other: { 'baidu-site-verification': 'codeva-bVt45auzyZ' } },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: '宝子多EN - 英语学习平台',
    description: '免费在线英语学习平台，雅思模拟考试、文章阅读、精听练习、背单词',
    type: 'website',
    locale: 'zh_CN',
    images: ['/icon-512.png'],
  },
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
          <GeoWrapper>
            {viewport === 'mobile' ? (
              <DesktopOnlyNotice />
            ) : (
              <PCLayoutShell user={user}>{children}</PCLayoutShell>
            )}
          </GeoWrapper>
        </LangWrapper>
      </body>
    </html>
  );
}
