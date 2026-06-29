'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { X, BookOpen, List } from 'lucide-react';
import { useLang } from '@/lib/i18n';
import { articleService } from '@/services/article.service';
import { vocabStudyService, type VocabBook } from '@/services/vocabulary.service';
import type { UserVocabulary } from '@english/shared';

const PAGE_SIZE = 20;

export default function PCVocabularyPage() {
  const { t } = useLang();
  const [tab, setTab] = useState<'study' | 'mywords'>('study');

  return (
    <div className="max-w-4xl mx-auto pt-2 pb-8 px-4">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">{t('vocab.title')}</h1>
      <p className="text-xs text-slate-400 mb-5">{t('vocab.overlap_hint')}</p>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-lg p-1 mb-6 w-fit">
        <button onClick={() => setTab('study')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === 'study' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
          <BookOpen size={16} /> {t('vocab.study')}
        </button>
        <button onClick={() => setTab('mywords')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === 'mywords' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
          <List size={16} /> {t('vocab.mywords')}
        </button>
      </div>

      {tab === 'study' ? <StudyTab /> : <MyWordsTab />}
    </div>
  );
}

// ── Study Tab: Word Books ──
function StudyTab() {
  const { t } = useLang();
  const [books, setBooks] = useState<VocabBook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    vocabStudyService.listBooks()
      .then(setBooks)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;
  }

  if (books.length === 0) {
    return <p className="text-center text-slate-400 py-12">No word books available yet.</p>;
  }

  const groups: { title: string; slugs: string[] }[] = [
    { title: t('vocab.group.basic'), slugs: ['gaokao-3500'] },
    { title: t('vocab.group.domestic'), slugs: ['cet4-4500', 'cet6-core', 'kaoyan-core'] },
    { title: t('vocab.group.international'), slugs: ['ielts-vocab-real', 'toefl-core', 'toeic-core', 'pte-core'] },
  ];

  const groupedBooks = groups.map(g => ({
    title: g.title,
    books: g.slugs.map(slug => books.find(b => b.slug === slug)).filter(Boolean) as VocabBook[],
  })).filter(g => g.books.length > 0);

  return (
    <div className="space-y-8">
      {groupedBooks.map(group => (
        <div key={group.title}>
          <h2 className="flex items-center gap-[10px] font-bold text-slate-800 text-lg mb-4">
            <span className="block w-0.5 h-[1em] bg-slate-700 rounded-full flex-shrink-0" />
            {group.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {group.books.map(book => (
              <Link key={book.id} href={`/vocabulary/study/${book.slug}`}
                className="block bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-primary-300 hover:bg-primary-500 transition-all group">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-slate-900 text-base group-hover:text-white transition-colors">{t(`vocab.book.${book.slug}`) !== `vocab.book.${book.slug}` ? t(`vocab.book.${book.slug}`) : book.name}</h3>
                </div>
                {(t(`vocab.desc.${book.slug}`) !== `vocab.desc.${book.slug}` || book.description) && (
                  <p className="text-sm text-slate-500 mb-3 group-hover:text-primary-100 transition-colors">{t(`vocab.desc.${book.slug}`) !== `vocab.desc.${book.slug}` ? t(`vocab.desc.${book.slug}`) : book.description}</p>
                )}
                <div className="flex items-center gap-4 text-xs text-slate-400 group-hover:text-primary-100 transition-colors">
                  <span>{t('vocab.words_count', { n: book.totalWords })}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── My Words Tab: Personal Word Collection ──
function MyWordsTab() {
  const [words, setWords] = useState<UserVocabulary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<UserVocabulary | null>(null);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const fetchWords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await articleService.listVocabulary({ page, pageSize: PAGE_SIZE });
      setWords(result.items);
      setTotal(result.total);
    } catch (err: any) {
      setError(err.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchWords(); }, [fetchWords]);

  const handleRemove = async (id: number) => {
    try {
      await articleService.removeVocabulary(id);
      setSelected(null);
      fetchWords();
    } catch (err: any) {
      alert(err.message || 'Failed to remove');
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;
  }

  if (error) {
    return <div className="text-center py-12 text-red-500">{error}</div>;
  }

  if (words.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400 mb-3">No words saved yet.</p>
        <Link href="/articles" className="text-primary-600 hover:underline text-sm font-medium">Browse articles to add words →</Link>
      </div>
    );
  }

  return (
    <>
      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 w-12">#</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Word</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 hidden md:table-cell">Phonetic</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 hidden md:table-cell">Part</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Translation</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {words.map((v, i) => (
              <tr key={v.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => setSelected(v)}>
                <td className="px-4 py-3 text-sm text-slate-400">{(page - 1) * PAGE_SIZE + i + 1}</td>
                <td className="px-4 py-3 text-sm font-medium text-slate-900">{v.word.word}</td>
                <td className="px-4 py-3 text-sm text-slate-500 hidden md:table-cell">{v.word.phoneticUk || v.word.phonetic || '-'}</td>
                <td className="px-4 py-3 text-sm text-slate-500 hidden md:table-cell">{v.word.partOfSpeech || '-'}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{v.word.translation}</td>
                <td className="px-4 py-3">
                  <button onClick={(e) => { e.stopPropagation(); handleRemove(v.id); }}
                    className="text-slate-300 hover:text-red-500 transition-colors"><X size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
            className="px-4 py-2 text-sm border rounded-lg disabled:opacity-30">Prev</button>
          <span className="text-sm text-slate-500">{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
            className="px-4 py-2 text-sm border rounded-lg disabled:opacity-30">Next</button>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-2xl font-extrabold text-slate-900">{selected.word.word}</h3>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            {(selected.word.phoneticUk || selected.word.phoneticUs) && (
              <p className="text-sm text-slate-500 mb-3">
                {selected.word.phoneticUk && <span>UK /{selected.word.phoneticUk}/ </span>}
                {selected.word.phoneticUs && <span>US /{selected.word.phoneticUs}/</span>}
              </p>
            )}
            <div className="flex items-center gap-2 mb-3">
              {selected.word.partOfSpeech && <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded">{selected.word.partOfSpeech}</span>}
              <span className="text-base font-medium text-slate-800">{selected.word.translation}</span>
            </div>
            {selected.word.examples && selected.word.examples.length > 0 && (
              <div className="space-y-2 mb-3">
                {selected.word.examples.map((ex: any, i: number) => (
                  <div key={i} className="bg-slate-50 rounded-lg p-3"><p className="text-sm text-slate-700">{ex.en}</p><p className="text-xs text-slate-400 mt-1">{ex.zh}</p></div>
                ))}
              </div>
            )}
            <button onClick={() => handleRemove(selected.id)}
              className="w-full py-2.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors mt-2">
              Remove from Vocabulary
            </button>
          </div>
        </div>
      )}
    </>
  );
}
