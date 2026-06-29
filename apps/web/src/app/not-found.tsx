import Link from 'next/link';
import { cookies } from 'next/headers';

const messages: Record<string, { message: string; home: string }> = {
  zh: { message: '该页面已消失在太空中了 🚀', home: '← 返回首页' },
  en: { message: 'This page has vanished into space 🚀', home: '← Back to Home' },
};

export default async function NotFound() {
  const cookieStore = await cookies();
  const lang = cookieStore.get('lang')?.value === 'en' ? 'en' : 'zh';
  const m = messages[lang];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center bg-white">
      <div className="text-8xl mb-6 animate-bounce select-none">
        🚀
      </div>
      <h1 className="text-4xl font-bold text-slate-800 mb-3">404</h1>
      <p className="text-lg text-slate-500">{m.message}</p>
      <Link href="/" className="mt-6 text-primary-600 hover:text-primary-700 font-medium">
        {m.home}
      </Link>
    </div>
  );
}
