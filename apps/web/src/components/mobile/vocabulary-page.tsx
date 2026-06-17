'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
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
  const loaderRef = useRef<HTMLDivElement>(null);

  const fetchWords = useCallback(async (pageNum: number, replace: boolean) => {
    if (replace) setLoading(true); else setLoadingMore(true);
    setError(null);
    try {
      const result = await articleService.listVocabulary({ page: pageNum, pageSize: PAGE_SIZE });
      if (replace) {
        setWords(result.items);
      } else {
        setWords((prev) => [...prev, ...result.items]);
      }
      setHasMore(pageNum < result.totalPages);
      setPage(pageNum);
    } catch (err: any) {
      setError(err.message || '加载失败');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchWords(1, true);
  }, [fetchWords]);

  // Infinite scroll observer
  useEffect(() => {
    if (!loaderRef.current || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !loadingMore) {
          fetchWords(page + 1, false);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, page, fetchWords]);

  const handleRemove = async (vocabId: number) => {
    try {
      await articleService.removeVocabulary(vocabId);
      setWords((prev) => prev.filter((w) => w.id !== vocabId));
    } catch (err: any) {
      alert(err.message || '删除失败');
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl font-bold text-slate-900">我的生词本</h1>
        <p className="text-xs text-slate-500 mt-0.5">{words.length} 个单词</p>
      </div>

      {error && (
        <div className="text-center py-8">
          <p className="text-red-500 mb-3 text-sm">{error}</p>
          <button onClick={() => fetchWords(1, true)} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm">重试</button>
        </div>
      )}

      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {!loading && !error && words.length === 0 && (
        <div className="text-center py-12">
          <span className="text-4xl block mb-3">📭</span>
          <p className="text-slate-500 text-sm">生词本还是空的</p>
          <Link href="/articles" className="inline-block mt-3 text-primary-600 text-sm">去浏览文章 →</Link>
        </div>
      )}

      {!loading && !error && words.length > 0 && (
        <div className="divide-y">
          {words.map((v) => (
            <div key={v.id} className="flex items-center py-3 gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900">{v.word.word}</span>
                  {v.word.partOfSpeech && (
                    <span className="text-xs bg-primary-50 text-primary-600 px-1 py-0.5 rounded">{v.word.partOfSpeech}</span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {v.word.phonetic && <span className="mr-2">{v.word.phonetic}</span>}
                  <span className="text-slate-700">{v.word.translation}</span>
                </p>
              </div>
              <button
                onClick={() => handleRemove(v.id)}
                className="text-xs text-slate-400 hover:text-red-500 flex-shrink-0"
              >
                移除
              </button>
            </div>
          ))}

          {/* Load more trigger */}
          {hasMore && (
            <div ref={loaderRef} className="py-4 text-center">
              {loadingMore ? (
                <span className="text-xs text-slate-400">加载中...</span>
              ) : (
                <span className="text-xs text-slate-300">下拉加载更多</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
