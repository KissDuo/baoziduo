'use client';

import Link from 'next/link';
import { useLang } from '@/lib/i18n';
import { useGeo } from '@/lib/geo-context';

interface LayoutUser { id: number; email?: string; }

export default function PCHomePage({ user }: { user?: LayoutUser | null }) {
  const { t } = useLang();
  const { isChina } = useGeo();

  const modules = [
    { icon: '📰', title: t('home.f1_title'), desc: t('home.f1_desc'), href: '/articles' },
    { icon: '🎧', title: t('home.f3_title'), desc: t('home.f3_desc'), href: '/ielts' },
    { icon: '🎙️', title: t('home.f5_title'), desc: t('home.f5_desc'), href: '/listening' },
  ];
  // Only show video module when confirmed outside China
  if (isChina === false) {
    modules.push({ icon: '🎬', title: t('home.f4_title'), desc: t('home.f4_desc'), href: '/videos' });
  }
  modules.push({ icon: '📚', title: t('home.f2_title'), desc: t('home.f2_desc'), href: '/vocabulary' });

  return (
    <div className="space-y-16">
      <section className="text-center py-20">
        <h1 className="text-5xl font-bold text-slate-900 mb-6">
          {t('home.title')}
          <span className="text-primary-600">{t('home.title_hl')}</span>
        </h1>
        <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
          {t('home.subtitle')}
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href={user ? '/articles' : '/register'}
            className="bg-primary-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-primary-700 transition-colors"
          >
            {t(user ? 'home.cta_logged' : 'home.cta_guest')}
          </Link>
          <Link
            href="/articles"
            className="border border-slate-300 text-slate-700 px-8 py-3 rounded-lg text-lg font-medium hover:bg-slate-50 transition-colors"
          >
            {t('home.browse')}
          </Link>
        </div>
      </section>

      <section className={`grid sm:grid-cols-2 lg:grid-cols-3 ${modules.length >= 5 ? 'xl:grid-cols-5' : 'xl:grid-cols-4'} gap-6`}>
        {modules.map((m) => (
          <FeatureCard key={m.href} icon={m.icon} title={m.title} description={m.desc} href={m.href} />
        ))}
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description, href }: { icon: string; title: string; description: string; href?: string }) {
  const card = (
    <div className="border rounded-xl p-6 hover:shadow-lg hover:border-primary-300 transition-all cursor-pointer h-full">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
  if (href) return <Link href={href} className="block">{card}</Link>;
  return card;
}
