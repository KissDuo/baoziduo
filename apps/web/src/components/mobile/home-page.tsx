'use client';

import Link from 'next/link';
import { useLang } from '@/lib/i18n';

interface LayoutUser { id: number; email?: string; }

export default function MobileHomePage({ user }: { user?: LayoutUser | null }) {
  const { t } = useLang();

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

      <section className="space-y-4">
        <MobileFeatureCard icon="📰" title={t('home.f1_title')} description={t('home.f1_desc')} href="/articles" />
        <MobileFeatureCard icon="📚" title={t('home.f2_title')} description={t('home.f2_desc')} href="/vocabulary" />
        <MobileFeatureCard icon="👤" title={t('nav.my_vocab')} description={t('popup.add_vocab')} href="/vocabulary" />
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
