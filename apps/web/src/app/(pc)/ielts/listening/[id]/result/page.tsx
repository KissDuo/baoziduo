'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ieltsService } from '@/services/ielts.service';
import type { IeltsResult } from '@/services/ielts.service';

export default function IeltsListeningResultPage() {
  const searchParams = useSearchParams();
  const attemptId = Number(searchParams.get('attempt'));

  const [result, setResult] = useState<IeltsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState<number | null>(0);

  useEffect(() => {
    if (!attemptId) return;
    ieltsService.getResult(attemptId)
      .then(setResult)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [attemptId]);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;
  if (!result) return <div className="text-center py-16 text-red-500">未找到成绩</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center py-10">
        <div className="text-6xl font-extrabold text-primary-600 mb-2">{result.ieltsBand}</div>
        <p className="text-slate-500 text-lg">IELTS Band Score</p>
        <p className="text-sm text-slate-400 mt-1">{result.totalScore} / {result.maxScore} 正确</p>
      </div>

      <div className="space-y-4 mb-8">
        {result.sectionScores.map((s, idx) => (
          <div key={idx} className="border rounded-xl overflow-hidden">
            <button onClick={() => setExpandedSection(expandedSection === idx ? null : idx)}
              className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 text-left">
              <div>
                <h3 className="font-semibold text-slate-800">{s.sectionTitle}</h3>
                <p className="text-sm text-slate-500">{s.correctCount}/{s.totalCount} 正确 · {s.score}/{s.maxScore} 分</p>
              </div>
              <span className="text-slate-400">{expandedSection === idx ? '▲' : '▼'}</span>
            </button>
            {expandedSection === idx && (
              <div className="border-t divide-y">
                {s.questions.map((q) => (
                  <div key={q.questionId} className="px-5 py-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-slate-400">第{q.questionIndex}题</span>
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${q.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{q.isCorrect ? '✓' : '✗'}</span>
                    </div>
                    {q.questionText && <p className="text-sm text-slate-700 mb-1">{q.questionText}</p>}
                    <div className="flex gap-4 text-sm">
                      <span className={q.isCorrect ? 'text-green-600' : 'text-red-600'}>你的答案: {q.userAnswer || '(未作答)'}</span>
                      {!q.isCorrect && <span className="text-green-600">正确答案: {q.correctAnswer}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="text-center">
        <Link href="/ielts" className="text-primary-600 hover:underline text-sm">← 返回考试列表</Link>
      </div>
    </div>
  );
}
