'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { articleService } from '@/services/article.service';
import type { UserVocabulary } from '@english/shared';

const PAGE_SIZE = 20;

export default function PCVocabularyPage() {
  const [words, setWords] = useState<UserVocabulary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const fetchWords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await articleService.listVocabulary({ page, pageSize: PAGE_SIZE });
      setWords(result.items);
      setTotal(result.total);
    } catch (err: any) {
      setError(err.message || '加载失败');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchWords();
  }, [fetchWords]);

  const handleRemove = async (vocabId: number) => {
    try {
      await articleService.removeVocabulary(vocabId);
      setWords((prev) => prev.filter((w) => w.id !== vocabId));
      setTotal((prev) => prev - 1);
    } catch (err: any) {
      alert(err.message || '删除失败');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">我的生词本</h1>
        <p className="text-sm text-slate-500 mt-1">共 {total} 个单词</p>
      </div>

      {error && (
        <div className="text-center py-8">
          <p className="text-red-500 mb-3">{error}</p>
          <button onClick={fetchWords} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm">重试</button>
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
        <div className="text-center py-16">
          <span className="text-5xl block mb-3">📭</span>
          <p className="text-slate-500">生词本还是空的</p>
          <p className="text-sm text-slate-400 mt-1">去阅读文章，点击单词加入生词本吧</p>
          <Link href="/articles" className="inline-block mt-4 text-primary-600 hover:underline text-sm">浏览文章 →</Link>
        </div>
      )}

      {!loading && !error && words.length > 0 && (
        <>
          {/* Table header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-slate-400 uppercase tracking-wider border-b">
            <div className="col-span-1">#</div>
            <div className="col-span-2">单词</div>
            <div className="col-span-2">音标</div>
            <div className="col-span-1">词性</div>
            <div className="col-span-3">释义</div>
            <div className="col-span-2">添加时间</div>
            <div className="col-span-1"></div>
          </div>

          {/* Word rows */}
          <div className="divide-y">
            {words.map((v, idx) => (
              <div
                key={v.id}
                className="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-slate-50 transition-colors rounded-lg"
              >
                <div className="col-span-1 text-xs text-slate-400">
                  {(page - 1) * PAGE_SIZE + idx + 1}
                </div>
                <div className="col-span-2 font-semibold text-slate-900">
                  {v.word.word}
                </div>
                <div className="col-span-2 text-sm text-slate-500 font-mono">
                  {v.word.phonetic || '-'}
                </div>
                <div className="col-span-1">
                  {v.word.partOfSpeech && (
                    <span className="text-xs bg-primary-50 text-primary-600 px-1.5 py-0.5 rounded">
                      {v.word.partOfSpeech}
                    </span>
                  )}
                </div>
                <div className="col-span-3 text-sm text-slate-700">
                  {v.word.translation}
                </div>
                <div className="col-span-2 text-xs text-slate-400">
                  {new Date(v.createdAt).toLocaleDateString('zh-CN')}
                </div>
                <div className="col-span-1 text-right">
                  <button
                    onClick={() => handleRemove(v.id)}
                    className="text-xs text-slate-400 hover:text-red-500 transition-colors"
                  >
                    移除
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-4 py-2 rounded-lg border text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-30"
              >
                上一页
              </button>
              <span className="text-sm text-slate-500">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-4 py-2 rounded-lg border text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-30"
              >
                下一页
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
