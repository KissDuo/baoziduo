'use client';
import { useLang, tFn } from '@/lib/i18n';

import { useState, useEffect, useCallback } from 'react';
import { ArticleCard } from '@/components/shared/ArticleCard';
import { articleService } from '@/services/article.service';
import type { ArticleListItem } from '@english/shared';

function useDifficultyOptions() { const { t } = useLang(); return [
  { value: undefined, label: t('vocab.filter_all') },
  { value: 'short', label: t('difficulty.short') },
  { value: 'medium', label: t('difficulty.medium') },
  { value: 'long', label: t('difficulty.long') },
] as const; }

const PAGE_SIZE = 10;

export default function MobileArticleListPage() {
  const { t } = useLang();
  const [articles, setArticles] = useState<ArticleListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [difficultyLevel, setDifficultyLevel] = useState<string | undefined>();
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchArticles = useCallback(async (pageNum: number, replace: boolean) => {
    if (replace) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);
    try {
      const result = await articleService.list({ page: pageNum, pageSize: PAGE_SIZE, difficultyLevel });
      if (replace) {
        setArticles(result.items);
      } else {
        setArticles((prev) => [...prev, ...result.items]);
      }
      setHasMore(pageNum < result.totalPages);
      setPage(pageNum);
    } catch (err: any) {
      setError(err.message || t('article.load_fail'));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [difficultyLevel]);

  useEffect(() => {
    fetchArticles(1, true);
  }, [fetchArticles]);

  const handleDifficultyChange = (level: string | undefined) => {
    setDifficultyLevel(level);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchArticles(page + 1, false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-slate-900">{t('articles.title')}</h1>
        <p className="text-sm text-slate-400 font-medium mt-0.5">{tFn('en')('articles.title')}</p>
      </div>

      {/* Horizontal scroll filter chips */}
      <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1 -mx-4 px-4">
        {useDifficultyOptions().map((opt) => (
          <button
            key={opt.value ?? 'all'}
            onClick={() => handleDifficultyChange(opt.value)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              difficultyLevel === opt.value
                ? 'bg-primary-600 text-white'
                : 'bg-slate-100 text-slate-600 active:bg-slate-200'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Error state */}
      {error && (
        <div className="text-center py-8">
          <p className="text-red-500 mb-3 text-sm">{error}</p>
          <button
            onClick={() => fetchArticles(1, true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm"
          >
            {t('common.retry_label')}
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && !error && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-slate-200 overflow-hidden animate-pulse">
              <div className="h-36 bg-slate-200" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-slate-200 rounded w-12" />
                <div className="h-4 bg-slate-200 rounded w-full" />
                <div className="h-3 bg-slate-200 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Article list */}
      {!loading && !error && (
        <>
          {articles.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-5xl block mb-3">📭</span>
              <p className="text-slate-500">{t('articles.empty')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {articles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  userProgress={article.userProgress}
                  compact
                />
              ))}
            </div>
          )}

          {/* Load more */}
          {hasMore && articles.length > 0 && (
            <div className="text-center mt-6 mb-4">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-full text-sm font-medium hover:bg-slate-200 disabled:opacity-50 transition-colors"
              >
                {loadingMore ? t('article.loading_more') : t('article.load_more')}
              </button>
            </div>
          )}

          {!hasMore && articles.length > 0 && (
            <p className="text-center text-xs text-slate-400 mt-6 mb-4">{t('article.all_loaded')}</p>
          )}
        </>
      )}
    </div>
  );
}
