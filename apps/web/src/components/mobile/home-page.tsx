'use client';

import Link from 'next/link';
import { useLang } from '@/lib/i18n';
import { useGeo } from '@/lib/geo-context';

interface LayoutUser { id: number; email?: string; }

export default function MobileHomePage({ user }: { user?: LayoutUser | null }) {
  const { t } = useLang();
  const { isChina } = useGeo();

  const modules = [
    { icon: '📰', title: t('home.f1_title'), desc: t('home.f1_desc'), href: '/articles' },
    { icon: '🎧', title: t('home.f3_title'), desc: t('home.f3_desc'), href: '/ielts' },
    { icon: '🎙️', title: t('home.f5_title'), desc: t('home.f5_desc'), href: '/listening' },
  ];
  if (isChina === false) {
    modules.push({ icon: '🎬', title: t('home.f4_title'), desc: t('home.f4_desc'), href: '/videos' });
  }
  modules.push({ icon: '📚', title: t('home.f2_title'), desc: t('home.f2_desc'), href: '/vocabulary' });

  return (
    <div className="space-y-8">
      <section className="text-center py-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-3">
          {t('home.title_hl')}
        </h1>
        <p className="text-slate-600 mb-6">
          {t('home.subtitle')}
        </p>
        <Link
          href={user ? '/articles' : '/register'}
          className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg text-lg font-medium"
        >
          {t(user ? 'home.cta_logged' : 'home.cta_guest')}
        </Link>
      </section>

      <section className="space-y-3">
        {modules.map((m) => (
          <MobileFeatureCard key={m.href} icon={m.icon} title={m.title} description={m.desc} href={m.href} />
        ))}
      </section>
    </div>
  );
}

function MobileFeatureCard({ icon, title, description, href }: {
  icon: string; title: string; description: string; href: string;
}) {
  return (
    <Link href={href} className="flex items-center gap-4 border rounded-xl p-4 hover:bg-slate-50 transition-colors">
      <span className="text-3xl">{icon}</span>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
    </Link>
  );
}
