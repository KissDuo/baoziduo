'use client';

import { memo, useState, useRef, useEffect } from 'react';

// ── Stable blank input ──
function BlankInput({ qid, initial, attemptId, onSave }: {
  qid: number; initial: string; attemptId?: number; onSave: (qid: number, val: string) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const cb = useRef(onSave);
  const aid = useRef(attemptId);
  cb.current = onSave;
  aid.current = attemptId;

  return (
    <input
      ref={ref}
      type="text"
      defaultValue={initial}
      onBlur={() => {
        const v = ref.current?.value || '';
        if (v.trim() && aid.current) cb.current(qid, v);
      }}
      className="inline-block border-b-2 border-slate-400 focus:border-primary-500 px-1 py-0 mx-1 outline-none text-sm bg-transparent align-baseline"
      style={{ width: `${Math.max(60, (initial.length || 8) * 13)}px` }}
    />
  );
}

function renderFillBlank(text: string, qid: number, ans: string, attemptId?: number, onSave?: (qid: number, val: string) => void) {
  const parts = text.split(/(_{2,}|\.{3,})/);
  return parts.map((part, i) => {
    if (/^_{2,}$/.test(part) || /^\.{3,}$/.test(part)) {
      return <BlankInput key={`b-${qid}-${i}`} qid={qid} initial={ans} attemptId={attemptId} onSave={onSave!} />;
    }
    return <span key={`t-${qid}-${i}`}>{part}</span>;
  });
}

// ── Single question block ──
const QuestionBlock = memo(function QuestionBlock({
  q, ans, attemptId, onSave,
}: {
  q: any; ans: string; attemptId?: number; onSave: (qid: number, val: string) => void;
}) {
  let options: string[] = [];
  if (q.options) { try { options = JSON.parse(q.options); } catch {} }

  return (
    <div className="py-4 border-b border-slate-100 last:border-0">
      <div className="text-xs text-slate-400 mb-1">第 {q.questionIndex} 题</div>
      {q.questionText && q.questionType !== 'fill_blank' && (
        <p className="text-sm text-slate-800 mb-3">{q.questionText}</p>
      )}
      {q.questionText && q.questionType === 'fill_blank' && (
        <p className="text-sm text-slate-800 mb-3 leading-8">
          {renderFillBlank(q.questionText, q.id, ans, attemptId, onSave)}
        </p>
      )}
      {q.questionType === 'fill_blank' && !q.questionText && (
        <BlankInput qid={q.id} initial={ans} attemptId={attemptId} onSave={onSave} />
      )}
      {q.questionType === 'multiple_choice' && options.length > 0 && (
        <div className="space-y-1.5">
          {options.map((opt, i) => (
            <label key={i} className={`flex items-start gap-2 p-2.5 rounded-lg border cursor-pointer text-sm ${ans === opt ? 'border-primary-400 bg-primary-50' : 'border-slate-200 hover:bg-slate-50'}`}>
              <input type="radio" name={`q-${q.id}`} checked={ans === opt} onChange={() => onSave(q.id, opt)} className="mt-0.5" />
              <span><span className="font-medium text-slate-400 mr-1.5">{String.fromCharCode(65 + i)}.</span>{opt}</span>
            </label>
          ))}
        </div>
      )}
      {q.questionType === 'true_false' && (
        <div className="flex gap-2">
          {['TRUE', 'FALSE', 'NOT GIVEN'].map((o) => (
            <button key={o} onClick={() => onSave(q.id, o)} className={`px-4 py-1.5 rounded border text-xs font-medium ${ans === o ? 'bg-primary-600 text-white border-primary-600' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}>{o}</button>
          ))}
        </div>
      )}
    </div>
  );
});

// ── Questions panel (memoized — immune to parent timer re-renders) ──
export const QuestionsPanel = memo(function QuestionsPanel({
  section, answers, attemptId, onSave,
}: {
  section: { title: string; questions: any[] } | undefined;
  answers: Record<string, string>;
  attemptId?: number;
  onSave: (qid: number, val: string) => void;
}) {
  if (!section) return null;
  return (
    <div className="w-1/2 overflow-y-auto p-6">
      <h2 className="text-base font-bold text-slate-800 mb-4">{section.title} — 题目</h2>
      {section.questions.map((q) => (
        <QuestionBlock key={q.id} q={q} ans={answers[q.id] || ''} attemptId={attemptId} onSave={onSave} />
      ))}
    </div>
  );
});
