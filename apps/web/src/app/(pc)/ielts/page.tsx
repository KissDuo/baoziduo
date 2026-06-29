'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ieltsService } from '@/services/ielts.service';
import { SocialSidebar } from '@/components/pc/social-sidebar';
import type { IeltsExamItem } from '@/services/ielts.service';

type IeltsType = 'listening' | 'reading';

export default function IeltsPage() {
  const [exams, setExams] = useState<IeltsExamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<IeltsType>('listening');
  const [bookFilter, setBookFilter] = useState<string>('all');

  useEffect(() => {
    ieltsService.listExams(typeFilter)
      .then(setExams)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [typeFilter]);

  // Extract book names from exam titles
  const books = useMemo(() => {
    const set = new Set<string>();
    exams.forEach((e) => {
      const m = e.title.match(/剑桥雅思\s*(\d+)/);
      if (m) set.add(`C${m[1]}`);
    });
    return Array.from(set).sort((a, b) => {
      const na = parseInt(a.replace('C', ''));
      const nb = parseInt(b.replace('C', ''));
      return nb - na;
    });
  }, [exams]);

  // Filter and sort
  const filtered = useMemo(() => {
    let list = exams;
    if (bookFilter !== 'all') {
      list = list.filter((e) => e.title.includes(bookFilter.replace('C', '剑桥雅思 ')));
    }
    // Sort by book desc, then test asc
    return [...list].sort((a, b) => {
      const bookA = a.title.match(/剑桥雅思\s*(\d+)/)?.[1] || '0';
      const bookB = b.title.match(/剑桥雅思\s*(\d+)/)?.[1] || '0';
      if (bookA !== bookB) return parseInt(bookB) - parseInt(bookA);
      const testA = a.title.match(/Test\s*(\d+)/i)?.[1] || '0';
      const testB = b.title.match(/Test\s*(\d+)/i)?.[1] || '0';
      return parseInt(testA) - parseInt(testB);
    });
  }, [exams, bookFilter]);

  const TYPE_TABS: { value: IeltsType; label: string }[] = [
    { value: 'listening', label: '🎧 听力' },
    { value: 'reading', label: '📖 阅读' },
  ];

  return (
    <div className="max-w-5xl mx-auto pt-2">
      <SocialSidebar />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">雅思模拟考试</h1>
        <p className="text-slate-500">真实还原雅思机考界面，阅读+听力全真模拟</p>
      </div>

      {/* Type tabs */}
      <div className="flex gap-2 mb-4">
        {TYPE_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setTypeFilter(tab.value); setBookFilter('all'); }}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
              typeFilter === tab.value
                ? 'bg-primary-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Book filter */}
      {books.length > 1 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setBookFilter('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
              bookFilter === 'all'
                ? 'bg-slate-800 text-white'
                : 'border border-slate-300 text-slate-600 hover:bg-slate-50'
            }`}
          >全部</button>
          {books.map((b) => (
            <button
              key={b}
              onClick={() => setBookFilter(b)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                bookFilter === b
                  ? 'bg-slate-800 text-white'
                  : 'border border-slate-300 text-slate-600 hover:bg-slate-50'
              }`}
            >{b}</button>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />)}
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-16">
          <span className="text-5xl block mb-3">📝</span>
          <p className="text-slate-500">
            {typeFilter === 'listening' ? '听力内容即将上线' : '暂无可用考试'}
          </p>
        </div>
      )}

      {/* List */}
      {!loading && filtered.map((exam) => (
        <Link
          key={exam.id}
          href={exam.type === 'listening' ? `/ielts/listening/${exam.id}` : `/ielts/exam/${exam.id}`}
          className={`block bg-white border border-slate-200 rounded-xl p-6 mb-4 transition-all hover:shadow-md hover:border-primary-200`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-1">
                {exam.title}
              </h2>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span>{exam.type === 'reading' ? '📖 阅读' : '🎧 听力'}</span>
                <span>{exam.totalQuestions} 题</span>
                <span>{exam.totalSections} 篇</span>
                <span>{exam.durationMinutes} 分钟</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {exam.type === 'listening' && (
                <button onClick={e => { e.stopPropagation(); e.preventDefault(); window.location.href = '/listening'; }}
                  className="px-3 py-1.5 text-xs font-medium text-primary-600 border border-primary-300 rounded-lg hover:bg-primary-50 transition-colors">
                  🎧 精听
                </button>
              )}
              <div className="text-primary-600 text-2xl">
                {exam.type === 'listening' ? '🔜' : '→'}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
