'use client';

import Link from 'next/link';
import { DifficultyBadge } from './DifficultyBadge';

interface ArticleCardProps {
  article: {
    id: number;
    title: string;
    slug: string;
    summary: string | null;
    difficultyLevel: string;
    wordCount: number;
    estimatedMinutes: number;
    coverImage: string | null;
    source: string | null;
    publishDate: string | null;
  };
  userProgress?: {
    isCompleted: boolean;
    scrollPercent: number;
  } | null;
  compact?: boolean;
}

export function ArticleCard({ article, userProgress, compact = false }: ArticleCardProps) {
  const href = `/articles/${article.slug}`;
  const level = article.difficultyLevel as 'beginner' | 'intermediate' | 'advanced';

  if (compact) {
    // ── Compact (Mobile) layout ──
    return (
      <Link href={href} className="block">
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
          {/* Cover image placeholder */}
          <div className="h-36 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
            {article.coverImage ? (
              <img src={article.coverImage} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-primary-400 text-4xl">📰</span>
            )}
          </div>
          <div className="p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <DifficultyBadge level={level} />
              {userProgress && !userProgress.isCompleted && (
                <span className="text-xs text-primary-600 font-medium">
                  已读 {userProgress.scrollPercent}%
                </span>
              )}
              {userProgress?.isCompleted && (
                <span className="text-xs text-green-600 font-medium">✓ 已读完</span>
              )}
            </div>
            <h3 className="font-semibold text-slate-900 line-clamp-2 mb-1">{article.title}</h3>
            <p className="text-sm text-slate-500 line-clamp-1 mb-2">{article.summary}</p>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span>{article.wordCount} 词</span>
              <span>{article.estimatedMinutes} 分钟</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // ── PC layout ──
  return (
    <Link href={href} className="block">
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-0.5 flex flex-col h-full">
        {/* Cover image */}
        <div className="h-44 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center relative">
          {article.coverImage ? (
            <img src={article.coverImage} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-primary-400 text-5xl">📰</span>
          )}
          {/* Progress overlay */}
          {userProgress && !userProgress.isCompleted && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-200">
              <div
                className="h-full bg-primary-500 transition-all"
                style={{ width: `${userProgress.scrollPercent}%` }}
              />
            </div>
          )}
        </div>
        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-center gap-2 mb-2">
            <DifficultyBadge level={level} />
            {userProgress?.isCompleted && (
              <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
                ✓ 已读完
              </span>
            )}
          </div>
          <h3 className="font-semibold text-slate-900 line-clamp-2 mb-2 leading-snug">
            {article.title}
          </h3>
          <p className="text-sm text-slate-500 line-clamp-2 mb-3 flex-1">{article.summary}</p>
          <div className="flex items-center gap-4 text-xs text-slate-400 pt-3 border-t border-slate-100">
            <span>{article.wordCount} 词</span>
            <span>约 {article.estimatedMinutes} 分钟</span>
            {article.source && <span className="truncate">{article.source}</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}
