'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { articleService } from '@/services/article.service';
import type { UserVocabulary } from '@english/shared';

const PAGE_SIZE = 20;

export default function PCVocabularyPage() {
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
      setError(err.message || '加载失败');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchWords(); }, [fetchWords]);

  const handleRemove = async (vocabId: number) => {
    try {
      await articleService.removeVocabulary(vocabId);
      setWords((prev) => prev.filter((w) => w.id !== vocabId));
      setTotal((prev) => prev - 1);
      if (selected?.id === vocabId) setSelected(null);
    } catch (err: any) {
      alert(err.message || '删除失败');
    }
  };

  const w = selected;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">我的生词本</h1>
        <p className="text-sm text-slate-500 mt-1">共 {total} 个单词</p>
      </div>

      {error && (<div className="text-center py-8"><p className="text-red-500 mb-3">{error}</p><button onClick={fetchWords} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm">重试</button></div>)}

      {loading && (<div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => (<div key={i} className="h-14 bg-slate-100 rounded-lg animate-pulse" />))}</div>)}

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
          <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-slate-400 uppercase tracking-wider border-b">
            <div className="col-span-1">#</div><div className="col-span-2">单词</div><div className="col-span-2">音标</div><div className="col-span-1">词性</div><div className="col-span-3">释义</div><div className="col-span-2">添加时间</div><div className="col-span-1"></div>
          </div>
          <div className="divide-y">
            {words.map((v, idx) => (
              <div key={v.id} className="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-slate-50 transition-colors rounded-lg">
                <div className="col-span-1 text-xs text-slate-400">{(page - 1) * PAGE_SIZE + idx + 1}</div>
                <div className="col-span-2 overflow-hidden">
                  <button onClick={() => setSelected(v)} className="text-primary-600 font-bold underline hover:text-primary-800 text-left truncate block w-full">{v.word.word}</button>
                </div>
                <div className="col-span-2 text-sm text-slate-500 font-mono truncate overflow-hidden">{v.word.phonetic || '-'}</div>
                <div className="col-span-1 overflow-hidden">{v.word.partOfSpeech && <span className="text-xs bg-primary-50 text-primary-600 px-1.5 py-0.5 rounded max-w-full truncate inline-block">{v.word.partOfSpeech}</span>}</div>
                <div className="col-span-3 text-sm text-slate-700 truncate overflow-hidden">{v.word.translation}</div>
                <div className="col-span-2 text-xs text-slate-400">{new Date(v.createdAt).toLocaleDateString('zh-CN')}</div>
                <div className="col-span-1 text-right"><button onClick={() => handleRemove(v.id)} className="text-xs text-slate-400 hover:text-red-500">移除</button></div>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="px-4 py-2 rounded-lg border text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-30">上一页</button>
              <span className="text-sm text-slate-500">{page} / {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-4 py-2 rounded-lg border text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-30">下一页</button>
            </div>
          )}
        </>
      )}

      {/* ── Word detail modal ── */}
      {w && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 shadow-2xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">{w.word.word}</h2>
                {(w.word.phoneticUk || w.word.phoneticUs || w.word.phonetic) && (
                  <div className="flex gap-3 mt-1 text-sm text-slate-500">
                    {w.word.phoneticUk && <span>英 {w.word.phoneticUk}</span>}
                    {w.word.phoneticUs && <span>美 {w.word.phoneticUs}</span>}
                    {!w.word.phoneticUk && !w.word.phoneticUs && w.word.phonetic && <span>{w.word.phonetic}</span>}
                  </div>
                )}
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600 p-1"><X size={20} /></button>
            </div>
            <div className="flex items-center gap-2 mb-3">
              {w.word.partOfSpeech && <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded">{w.word.partOfSpeech}</span>}
              <span className="text-lg font-medium text-slate-800">{w.word.translation}</span>
            </div>
            {w.word.definitionEn && <p className="text-sm text-slate-600 mb-3">{w.word.definitionEn}</p>}
            {w.word.exampleSentence && (
              <div className="bg-slate-50 rounded-lg p-3 mb-3">
                <p className="text-sm text-slate-700 italic">{w.word.exampleSentence}</p>
              </div>
            )}
            {'examples' in w.word && w.word.examples && w.word.examples.length > 0 && (
              <div className="space-y-2 mb-3">
                {w.word.examples.map((ex, i) => (
                  <div key={i} className="bg-slate-50 rounded-lg p-2.5">
                    <p className="text-sm text-slate-700">{ex.en}</p>
                    <p className="text-xs text-slate-400 mt-1">{ex.zh}</p>
                  </div>
                ))}
              </div>
            )}
            {w.word.levels && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {(typeof w.word.levels === 'string' ? (() => { try { return JSON.parse(w.word.levels as string); } catch { return [w.word.levels]; } })() : w.word.levels || []).map((lvl: string, i: number) => {
                  const colors: Record<string, string> = { basic: 'bg-slate-100 text-slate-600', cet4: 'bg-blue-50 text-blue-600', cet6: 'bg-purple-50 text-purple-600', ielts: 'bg-amber-50 text-amber-700', toefl: 'bg-green-50 text-green-600', toeic: 'bg-pink-50 text-pink-600' };
                  const labels: Record<string, string> = { basic: '基础', cet4: '四级', cet6: '六级', ielts: '雅思', toefl: '托福', toeic: '托业' };
                  return <span key={i} className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[lvl] || 'bg-slate-100 text-slate-600'}`}>{labels[lvl] || lvl}</span>;
                })}
              </div>
            )}
            <div className="flex gap-4 text-xs text-slate-400 border-t pt-3 mt-2">
              <span>掌握度: {'⭐'.repeat(Math.min(5, w.masteryLevel))}</span>
              <span>复习 {w.reviewCount} 次</span>
              <span>添加于 {new Date(w.createdAt).toLocaleDateString('zh-CN')}</span>
            </div>
            <button onClick={() => { handleRemove(w.id); }} className="mt-3 w-full py-2 border border-red-200 text-red-500 rounded-lg text-sm hover:bg-red-50">从生词本移除</button>
          </div>
        </div>
      )}
    </div>
  );
}
