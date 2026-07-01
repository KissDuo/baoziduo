'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLang } from '@/lib/i18n';
import { SocialSidebar } from '@/components/pc/social-sidebar';

interface TranscriptItem {
  id: number; title: string; category: string; sentenceCount: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  ielts: 'listening.cat.ielts',
  numbers: 'listening.cat.numbers',
  names: 'listening.cat.names',
  places: 'listening.cat.places',
  mixed: 'listening.cat.mixed',
};

export default function ListeningListPage() {
  const { t } = useLang();
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5201/api/v1'}/listening`)
      .then(r => r.json())
      .then(d => { setTranscripts(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const categories = ['all', ...new Set(transcripts.map(t => t.category).filter(Boolean))] as string[];
  const filtered = filter === 'all' ? transcripts : transcripts.filter(t => t.category === filter);

  const catLabel = (cat: string) => cat === 'all' ? t('listening.cat.all') : t(CATEGORY_LABELS[cat] || cat);

  return (
    <div className="max-w-4xl mx-auto pt-2 px-6 pb-6">
      <SocialSidebar />
      <h1 className="text-2xl font-bold text-slate-900 mb-6">{t('nav.listening')}</h1>

      {loading && <div className="text-center py-8 text-slate-400">Loading...</div>}

      {!loading && (
        <>
          {categories.length > 1 && (
            <div className="flex gap-2 mb-6">
              {categories.map(cat => (
                <button key={cat} onClick={() => setFilter(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${filter === cat ? 'bg-slate-800 text-white' : 'border border-slate-300 text-slate-600 hover:bg-slate-50'}`}>
                  {catLabel(cat)}
                </button>
              ))}
            </div>
          )}

          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filtered.map(t => (
                <Link key={t.id} href={`/listening/${t.id}`}
                  className="block p-4 border border-slate-200 rounded-lg hover:border-primary-400 hover:bg-primary-50/50 transition-colors">
                  <h3 className="font-medium text-slate-800 text-sm">{t.title}</h3>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                    <span>{t.sentenceCount} 句</span>
                    <span className="capitalize">{t.category}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <p className="text-lg mb-2">暂无精听内容</p>
              <p className="text-sm">转录完成后将在此显示</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
