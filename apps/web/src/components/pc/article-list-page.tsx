'use client';
import { useLang, tFn } from '@/lib/i18n';

import { useState, useEffect, useCallback } from 'react';
import { ArticleCard } from '@/components/shared/ArticleCard';
import { articleService } from '@/services/article.service';
import type { ArticleListItem } from '@english/shared';
import type { PaginatedResponse } from '@/services/article.service';

function useDifficultyOptions() { const { t } = useLang(); return [
  { value: undefined, label: t('vocab.filter_all') },
  { value: 'short', label: t('difficulty.short') },
  { value: 'medium', label: t('difficulty.medium') },
  { value: 'long', label: t('difficulty.long') },
] as const; }

export default function PCArticleListPage() {
  const { t } = useLang();
  const [articles, setArticles] = useState<ArticleListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [difficultyLevel, setDifficultyLevel] = useState<string | undefined>();

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await articleService.list({ page, pageSize: 12, difficultyLevel });
      setArticles(result.items);
      setTotalPages(result.totalPages);
    } catch (err: any) {
      setError(err.message || 'Failed to load articles');
    } finally {
      setLoading(false);
    }
  }, [page, difficultyLevel]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleDifficultyChange = (level: string | undefined) => {
    setDifficultyLevel(level);
    setPage(1);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">{t('articles.title')}</h1>
        <p className="text-lg text-slate-400 font-medium">{tFn('en')('articles.title')}</p>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-8">
        {useDifficultyOptions().map((opt) => (
          <button
            key={opt.value ?? 'all'}
            onClick={() => handleDifficultyChange(opt.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              difficultyLevel === opt.value
                ? 'bg-primary-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Error state */}
      {error && (
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchArticles}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            {t('common.retry')}
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden animate-pulse">
              <div className="h-44 bg-slate-200" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-slate-200 rounded w-16" />
                <div className="h-5 bg-slate-200 rounded w-full" />
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/2 mt-3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Article grid */}
      {!loading && !error && (
        <>
          {articles.length === 0 ? (
            <div className="text-center py-16">
              <span className="text-6xl mb-4 block">📭</span>
              <p className="text-slate-500 text-lg">{t('articles.empty')}</p>
              <p className="text-slate-400 text-sm mt-1">{t('articles.empty_hint')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  userProgress={article.userProgress}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-10">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {t('common.prev')}
              </button>
              <span className="text-sm text-slate-500">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {t('common.next')}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
