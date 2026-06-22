'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ieltsService } from '@/services/ielts.service';
import { QuestionsPanel } from '../../exam/[id]/QuestionsPanel';
import type { IeltsExamDetail, IeltsAttempt } from '@/services/ielts.service';

export default function IeltsListeningPage() {
  const router = useRouter();
  const [examId, setExamId] = useState<number>(0);

  useEffect(() => {
    const id = Number(window.location.pathname.split('/').filter(Boolean).pop());
    if (id && !isNaN(id)) setExamId(id);
  }, []);

  const [exam, setExam] = useState<IeltsExamDetail | null>(null);
  const [attempt, setAttempt] = useState<IeltsAttempt | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const mountedRef = useRef(true);

  const sections = exam?.sections || [];
  const section = sections[currentSection];
  const totalQuestions = sections.reduce((sum, s) => sum + s.questions.length, 0);
  const answeredCount = Object.values(answers).filter((v) => v?.trim()).length;

  // Init
  useEffect(() => {
    if (!examId) return;
    mountedRef.current = true;
    async function init() {
      try {
        const [detail, att] = await Promise.all([
          ieltsService.getDetail(examId),
          ieltsService.startAttempt(examId),
        ]);
        if (!mountedRef.current) return;
        setExam(detail);
        setAttempt(att);
        setAnswers(att.savedAnswers || {});
      } catch (err: any) {
        if (mountedRef.current) setError(err.message || 'Failed');
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    }
    init();
    return () => { mountedRef.current = false; };
  }, [examId]);

  // Save
  const saveAnswer = useCallback(async (qid: number, ans: string) => {
    setAnswers((p) => ({ ...p, [qid]: ans }));
    if (!attempt) return;
    try { await ieltsService.saveAnswer(attempt.id, qid, ans); } catch {}
  }, [attempt]);

  // Submit
  const handleSubmit = async () => {
    if (!attempt) return;
    setSubmitting(true);
    try {
      await ieltsService.submitAttempt(attempt.id);
      router.push(`/ielts/listening/${examId}/result?attempt=${attempt.id}`);
    } catch { setSubmitting(false); }
  };

  // Audio controls
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); } else { audioRef.current.play(); }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };

  const seekBack = () => { if (audioRef.current) audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10); };
  const seekForward = () => { if (audioRef.current) audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 10); };

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /><span className="ml-3 text-slate-500">加载中...</span></div>;
  if (error || !exam) return <div className="text-center py-16 text-red-500">{error || '未找到考试'}</div>;

  return (
    <div className="fixed inset-0 top-16 bg-white flex flex-col z-40">
      {/* ── Top bar ── */}
      <div className="bg-slate-900 text-white px-6 h-12 flex items-center justify-between flex-shrink-0">
        <h1 className="text-sm font-medium truncate">{exam.title}</h1>
        <div className="flex items-center gap-5 text-sm">
          <span className="text-slate-400">{answeredCount}/{totalQuestions} 已答</span>
          <button onClick={() => setShowSubmitModal(true)} className="bg-primary-600 hover:bg-primary-700 px-5 py-1 rounded text-sm font-medium">提交</button>
        </div>
      </div>

      {/* ── Audio Player ── */}
      <div className="bg-slate-50 border-b px-6 py-3 flex items-center gap-4 flex-shrink-0">
        <audio
          ref={audioRef}
          src={section?.audioUrl || undefined}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
        />

        <button onClick={togglePlay} className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 flex-shrink-0">
          {isPlaying ? '⏸' : '▶'}
        </button>

        <button onClick={seekBack} className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-sm flex-shrink-0">⏪</button>
        <button onClick={seekForward} className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-sm flex-shrink-0">⏩</button>

        {/* Progress bar */}
        <div className="flex-1 mx-2">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={(e) => { if (audioRef.current) audioRef.current.currentTime = Number(e.target.value); setCurrentTime(Number(e.target.value)); }}
            className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-600"
          />
        </div>

        <span className="text-sm text-slate-600 font-mono flex-shrink-0">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        {/* Volume */}
        <input
          type="range"
          min={0}
          max={1}
          step={0.1}
          defaultValue={0.8}
          onChange={(e) => { if (audioRef.current) audioRef.current.volume = Number(e.target.value); }}
          className="w-20 h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer flex-shrink-0 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-slate-400"
        />
      </div>

      {/* ── Section image (e.g. map for labelling) ── */}
      {section?.imageUrl && (
        <div className="bg-white border-b px-6 py-3 flex-shrink-0">
          <img src={section.imageUrl} alt={section.title} className="max-w-full max-h-96 object-contain mx-auto" />
        </div>
      )}

      {/* ── Questions (full width) ── */}
      <div className="flex-1 overflow-hidden flex">
        <QuestionsPanel
          section={section}
          answers={answers}
          attemptId={attempt?.id}
          onSave={saveAnswer}
          fullWidth
        />
      </div>

      {/* ── Bottom: Section tabs ── */}
      <div className="border-t bg-white px-6 py-3 flex items-center justify-center gap-3 flex-shrink-0">
        {sections.map((s, idx) => (
          <button
            key={s.id}
            onClick={() => setCurrentSection(idx)}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
              idx === currentSection ? 'bg-primary-600 text-white' : 'border border-slate-300 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Part {idx + 1}
          </button>
        ))}
      </div>

      {/* ── Submit modal ── */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-bold mb-2">确认提交</h3>
            <p className="text-sm text-slate-600 mb-1">你已回答 {answeredCount} / {totalQuestions} 题</p>
            {answeredCount < totalQuestions && <p className="text-sm text-amber-600 mb-4">⚠️ 还有 {totalQuestions - answeredCount} 题未作答</p>}
            <div className="flex gap-3">
              <button onClick={() => setShowSubmitModal(false)} className="flex-1 py-2 border rounded-lg text-sm">继续答题</button>
              <button onClick={handleSubmit} disabled={submitting} className="flex-1 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50">{submitting ? '提交中...' : '确认提交'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
