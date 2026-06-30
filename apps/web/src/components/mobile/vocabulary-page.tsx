'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { X, BookOpen, List } from 'lucide-react';
import { useLang } from '@/lib/i18n';
import { articleService } from '@/services/article.service';
import { vocabStudyService, type VocabBook } from '@/services/vocabulary.service';
import type { UserVocabulary } from '@english/shared';

const PAGE_SIZE = 20;

export default function MobileVocabularyPage() {
  const { t } = useLang();
  const [tab, setTab] = useState<'study' | 'mywords'>('study');

  return (
    <div className="px-4 py-6">
      <h1 className="text-xl font-bold text-slate-900 mb-1">{t('vocab.title')}</h1>
      <p className="text-xs text-slate-400 mb-3">{t('vocab.overlap_hint')}</p>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-lg p-1 mb-4 w-fit">
        <button onClick={() => setTab('study')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === 'study' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>
          <BookOpen size={14} /> Study
        </button>
        <button onClick={() => setTab('mywords')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === 'mywords' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>
          <List size={14} /> My Words
        </button>
      </div>

      {tab === 'study' ? <MobileStudyTab /> : <MobileMyWordsTab />}
    </div>
  );
}

function MobileStudyTab() {
  const { t } = useLang();
  const [books, setBooks] = useState<VocabBook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    vocabStudyService.listBooks().then(setBooks).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600" /></div>;
  if (books.length === 0) return <p className="text-center text-slate-400 py-12">No word books yet.</p>;

  return (
    <div className="space-y-3">
      {books.map(book => (
        <Link key={book.id} href={`/vocabulary/study/${book.slug}`}
          className="block bg-white rounded-xl border border-slate-200 p-4 hover:border-primary-300 transition-colors">
          <div className="flex items-start justify-between mb-1">
            <h3 className="font-semibold text-slate-900">{t(`vocab.book.${book.slug}`) !== `vocab.book.${book.slug}` ? t(`vocab.book.${book.slug}`) : book.name}</h3>
            <span className="text-xs text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">{t(`vocab.category.${book.category}`) !== `vocab.category.${book.category}` ? t(`vocab.category.${book.category}`) : book.category}</span>
          </div>
          {(t(`vocab.desc.${book.slug}`) !== `vocab.desc.${book.slug}` || book.description) && (
            <p className="text-sm text-slate-500 mb-2">{t(`vocab.desc.${book.slug}`) !== `vocab.desc.${book.slug}` ? t(`vocab.desc.${book.slug}`) : book.description}</p>
          )}
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span>{t('vocab.words_count', { n: book.totalWords })}</span>
            {book.studiedCount != null && book.studiedCount > 0 && (
              <span className="text-primary-500 font-medium">已背{book.studiedCount}词</span>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}

function MobileMyWordsTab() {
  const [words, setWords] = useState<UserVocabulary[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<UserVocabulary | null>(null);
  const loaderRef = useRef<HTMLDivElement>(null);

  const fetchWords = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const result = await articleService.listVocabulary({ page: p, pageSize: PAGE_SIZE });
      if (p === 1) { setWords(result.items); } else { setWords(prev => [...prev, ...result.items]); }
      setTotal(result.total);
      setPage(p);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchWords(1); }, [fetchWords]);

  // Infinite scroll
  useEffect(() => {
    const el = loaderRef.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e?.isIntersecting && words.length < total && !loading) fetchWords(page + 1); }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [words.length, total, loading, page, fetchWords]);

  const handleRemove = async (id: number) => {
    try { await articleService.removeVocabulary(id); setSelected(null); fetchWords(1); }
    catch (err: any) { alert(err.message || 'Failed'); }
  };

  if (words.length === 0 && !loading) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400 mb-3">No words saved yet.</p>
        <Link href="/articles" className="text-primary-600 text-sm font-medium">Browse articles →</Link>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {words.map(v => (
          <div key={v.id} className="bg-white rounded-lg border border-slate-200 p-3 flex items-center justify-between" onClick={() => setSelected(v)}>
            <div className="min-w-0">
              <span className="font-medium text-slate-900">{v.word.word}</span>
              {v.word.partOfSpeech && <span className="text-xs text-primary-600 bg-primary-50 px-1.5 py-0.5 rounded ml-2">{v.word.partOfSpeech}</span>}
              <p className="text-sm text-slate-500 mt-0.5 truncate">{v.word.translation}</p>
            </div>
            <button onClick={(e) => { e.stopPropagation(); handleRemove(v.id); }} className="text-slate-300 hover:text-red-500 flex-shrink-0 ml-2"><X size={16} /></button>
          </div>
        ))}
      </div>
      <div ref={loaderRef} className="h-8" />
      {loading && <div className="flex justify-center py-4"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600" /></div>}

      {/* Detail Sheet */}
      {selected && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end" onClick={() => setSelected(null)}>
          <div className="fixed inset-0 bg-black/30" />
          <div className="relative bg-white rounded-t-2xl p-5 max-h-[70vh] overflow-y-auto z-10" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-4" />
            <h3 className="text-xl font-extrabold text-slate-900 mb-2">{selected.word.word}</h3>
            {(selected.word.phoneticUk || selected.word.phoneticUs) && (
              <p className="text-sm text-slate-500 mb-2">{selected.word.phoneticUk && <span>UK /{selected.word.phoneticUk}/ </span>}{selected.word.phoneticUs && <span>US /{selected.word.phoneticUs}/</span>}</p>
            )}
            <div className="flex items-center gap-2 mb-3">
              {selected.word.partOfSpeech && <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded">{selected.word.partOfSpeech}</span>}
              <span className="text-base font-medium text-slate-800">{selected.word.translation}</span>
            </div>
            {selected.word.examples && selected.word.examples.length > 0 && (
              <div className="space-y-2 mb-3">
                {selected.word.examples.slice(0, 3).map((ex: any, i: number) => (
                  <div key={i} className="bg-slate-50 rounded-lg p-2.5"><p className="text-sm text-slate-700">{ex.en}</p><p className="text-xs text-slate-400 mt-1">{ex.zh}</p></div>
                ))}
              </div>
            )}
            <button onClick={() => handleRemove(selected.id)} className="w-full py-2.5 text-sm font-medium text-red-600 bg-red-50 rounded-xl mt-2">Remove</button>
          </div>
        </div>
      )}
    </>
  );
}
