'use client';

import { memo } from 'react';
import { BlankInput, RichText } from './SharedComponents';

// ═══════════════════════════════════════════
// SummaryCompletion — 阅读填空段落 (整段框起来，空在段落中)
// ═══════════════════════════════════════════
export const SummaryCompletion = memo(function SummaryCompletion({
  questions, answers, attemptId, onSave,
}: {
  questions: any[]; answers: Record<string,string>; attemptId?: number; onSave: (qid:number,v:string)=>void;
}) {
  if (!questions.length) return null;
  const first = questions[0];
  const raw = first.passageText || '';
  const lines = raw.split('\n');
  const title = lines[0]?.replace(/^##\s*/, '') || '';
  const hint = lines[1] || '';
  const paraStart = raw.indexOf('\n\n') >= 0 ? raw.indexOf('\n\n') + 2 : lines.slice(2).join('\n');
  const paraText = paraStart > 1 ? raw.substring(paraStart) : raw;

  const qMap = new Map(questions.map(q => [q.questionIndex, q]));

  const parts = paraText.split(/(\(\d+\)\s*_{2,})/);

  return (
    <div className="my-3">
      {title && <p className="font-bold text-slate-900 text-base text-center mt-1 mb-3">{title}</p>}
      {hint && <p className="text-xs text-slate-500 mb-2">{hint}</p>}
      <div className="border-2 border-slate-300 rounded-lg p-4 text-sm text-slate-800 leading-8">
        {parts.map((part: string, pi: number) => {
          const m = part.match(/\((\d+)\)\s*(_{2,})/);
          if (m) {
            const qi = parseInt(m[1]!);
            const q = qMap.get(qi);
            if (q) {
              return (
                <span key={pi} className="inline-flex items-center gap-0.5 align-baseline">
                  <b className="text-xs text-slate-600">{qi}</b>
                  <BlankInput qid={q.id} initial={answers[q.id] || ''} attemptId={attemptId} onSave={onSave} />
                </span>
              );
            }
            return <span key={pi} className="text-slate-400">______</span>;
          }
          // Use RichText to render **bold**, ●, ○ and other formatting in body
          return <RichText key={pi} text={part} />;
        })}
      </div>
    </div>
  );
});

// ═══════════════════════════════════════════
// TrueFalse — 判断题 TRUE/FALSE/NOT GIVEN (阅读)
// ═══════════════════════════════════════════
export const TrueFalse = memo(function TrueFalse({ q, ans, onSave }: {
  q: any; ans: string; onSave: (qid: number, val: string) => void;
}) {
  return (
    <div className="py-2.5 border-b border-slate-100 last:border-0">
      {q.questionText && <p className="text-sm text-slate-800 mb-3"><RichText text={q.questionText} /></p>}
      <div className="flex gap-2">
        {['TRUE','FALSE','NOT GIVEN'].map(o => (
          <button key={o} onClick={()=>onSave(q.id,o)} className={`px-4 py-1.5 rounded border text-xs font-medium ${ans===o?'bg-primary-600 text-white border-primary-600':'border-slate-300 text-slate-600 hover:bg-slate-50'}`}>{o}</button>
        ))}
      </div>
    </div>
  );
});
