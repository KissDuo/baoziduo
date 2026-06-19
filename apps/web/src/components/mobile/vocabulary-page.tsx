'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { articleService } from '@/services/article.service';
import type { UserVocabulary } from '@english/shared';

const PAGE_SIZE = 20;

export default function MobileVocabularyPage() {
  const [words, setWords] = useState<UserVocabulary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selected, setSelected] = useState<UserVocabulary | null>(null);
  const loaderRef = useRef<HTMLDivElement>(null);

  const fetchWords = useCallback(async (pageNum: number, replace: boolean) => {
    if (replace) setLoading(true); else setLoadingMore(true);
    setError(null);
    try {
      const result = await articleService.listVocabulary({ page: pageNum, pageSize: PAGE_SIZE });
      if (replace) { setWords(result.items); } else { setWords((prev) => [...prev, ...result.items]); }
      setHasMore(pageNum < result.totalPages);
      setPage(pageNum);
    } catch (err: any) { setError(err.message || '加载失败'); } finally { setLoading(false); setLoadingMore(false); }
  }, []);

  useEffect(() => { fetchWords(1, true); }, [fetchWords]);
  useEffect(() => {
    if (!loaderRef.current || !hasMore) return;
    const observer = new IntersectionObserver((entries) => { if (entries[0]?.isIntersecting && !loadingMore) fetchWords(page + 1, false); }, { threshold: 0.1 });
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, page, fetchWords]);

  const handleRemove = async (vocabId: number) => {
    try { await articleService.removeVocabulary(vocabId); setWords((prev) => prev.filter((w) => w.id !== vocabId)); if (selected?.id === vocabId) setSelected(null); } catch (err: any) { alert(err.message || '删除失败'); }
  };

  return (
    <div>
      <div className="mb-4"><h1 className="text-xl font-bold text-slate-900">我的生词本</h1><p className="text-xs text-slate-500 mt-0.5">{words.length} 个单词</p></div>
      {error && (<div className="text-center py-8"><p className="text-red-500 mb-3 text-sm">{error}</p><button onClick={() => fetchWords(1, true)} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm">重试</button></div>)}
      {loading && (<div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => (<div key={i} className="h-14 bg-slate-100 rounded-lg animate-pulse" />))}</div>)}
      {!loading && !error && words.length === 0 && (<div className="text-center py-12"><span className="text-4xl block mb-3">📭</span><p className="text-slate-500 text-sm">生词本还是空的</p><Link href="/articles" className="inline-block mt-3 text-primary-600 text-sm">去浏览文章 →</Link></div>)}
      {!loading && !error && words.length > 0 && (
        <div className="divide-y">
          {words.map((v) => (
            <div key={v.id} className="flex items-center py-3 gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <button onClick={() => setSelected(v)} className="text-primary-600 font-bold underline text-left">{v.word.word}</button>
                  {v.word.partOfSpeech && <span className="text-xs bg-primary-50 text-primary-600 px-1 py-0.5 rounded">{v.word.partOfSpeech}</span>}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{v.word.phonetic && <span className="mr-2">{v.word.phonetic}</span>}<span className="text-slate-700">{v.word.translation}</span></p>
              </div>
              <button onClick={() => handleRemove(v.id)} className="text-xs text-slate-400 hover:text-red-500 flex-shrink-0">移除</button>
            </div>
          ))}
          {hasMore && (<div ref={loaderRef} className="py-4 text-center">{loadingMore ? <span className="text-xs text-slate-400">加载中...</span> : <span className="text-xs text-slate-300">下拉加载更多</span>}</div>)}
        </div>
      )}

      {/* Word detail modal */}
      {selected && (() => { const w = selected; return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-t-2xl sm:rounded-xl p-5 max-w-lg w-full shadow-2xl max-h-[75vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-4 sm:hidden" />
            <div className="flex items-start justify-between mb-3">
              <h2 className="text-xl font-extrabold text-slate-900">{w.word.word}</h2>
              <button onClick={() => setSelected(null)} className="text-slate-400 p-1"><X size={18} /></button>
            </div>
            {(w.word.phoneticUk || w.word.phonetic) && <p className="text-sm text-slate-500 mb-2">{w.word.phoneticUk || w.word.phonetic}{w.word.phoneticUs ? ` / 美${w.word.phoneticUs}` : ''}</p>}
            <div className="flex items-center gap-2 mb-3">{w.word.partOfSpeech && <span className="text-xs bg-primary-50 text-primary-600 px-2 py-0.5 rounded">{w.word.partOfSpeech}</span>}<span className="text-base font-medium text-slate-800">{w.word.translation}</span></div>
            {w.word.exampleSentence && (<div className="bg-slate-50 rounded-lg p-3 mb-3"><p className="text-sm text-slate-700 italic">{w.word.exampleSentence}</p></div>)}
            {(w as any).word?.examples && ((w as any).word.examples as any[]).length > 0 && (
              <div className="space-y-2 mb-3">{((w as any).word.examples as any[]).map((ex: any, i: number) => (<div key={i} className="bg-slate-50 rounded-lg p-2.5"><p className="text-sm text-slate-700">{ex.en}</p><p className="text-xs text-slate-400 mt-1">{ex.zh}</p></div>))}</div>
            )}
            <button onClick={() => { handleRemove(w.id); }} className="w-full py-2.5 border border-red-200 text-red-500 rounded-lg text-sm">从生词本移除</button>
          </div>
        </div>
      ); })()}
    </div>
  );
}
