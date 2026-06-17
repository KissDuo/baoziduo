'use client';

import Link from 'next/link';
import { useLang } from '@/lib/i18n';

interface LayoutUser { id: number; email?: string; }

export default function PCHomePage({ user }: { user?: LayoutUser | null }) {
  const { t } = useLang();

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

      <section className="grid md:grid-cols-3 gap-8">
        <FeatureCard icon="📰" title={t('home.f1_title')} description={t('home.f1_desc')} />
        <FeatureCard icon="📚" title={t('home.f2_title')} description={t('home.f2_desc')} />
        <FeatureCard icon="🎧" title={t('home.f3_title')} description={t('home.f3_desc')} />
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="border rounded-xl p-6 hover:shadow-lg transition-shadow">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-slate-600">{description}</p>
    </div>
  );
}
