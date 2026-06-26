'use client';

import { useState, useRef, memo } from 'react';

// ═══════════════════════════════════════════
// BlankInput — 所有填空共用的输入框
// ═══════════════════════════════════════════
export function BlankInput({ qid, initial, attemptId, onSave }: {
  qid: number; initial: string; attemptId?: number; onSave: (qid: number, val: string) => void;
}) {
  const [val, setVal] = useState(initial);
  const cb = useRef(onSave); cb.current = onSave;
  const aid = useRef(attemptId); aid.current = attemptId;
  const w = Math.max(60, Math.min(200, (val.length || 8) * 12));
  return (
    <input type="text" value={val} autoComplete="off"
      onChange={function(e){setVal(e.target.value)}}
      onBlur={function(){const t=val.trim();if(t&&aid.current)cb.current(qid,t)}}
      className="border border-dashed border-slate-400 rounded px-2 py-0.5 text-sm bg-transparent text-center focus:border-primary-500"
      style={{width:w+'px',outline:'none'}} />
  );
}

// ── Text formatter: handles \n → <br>, **text** → <strong> ──
function RichText({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <>
      {lines.map((line, li) => (
        <span key={li}>
          {li > 0 && <br />}
          {line.split(/(\*\*[^*]+\*\*)/).map((seg, si) => {
            if (/^\*\*[^*]+\*\*$/.test(seg)) {
              return <strong key={si} className="font-bold text-slate-900">{seg.slice(2, -2)}</strong>;
            }
            return <span key={si}>{seg}</span>;
          })}
        </span>
      ))}
    </>
  );
}

// ═══════════════════════════════════════════
// FillBlank — 基础填空题 (听力和阅读共用)
// ═══════════════════════════════════════════
export function FillBlank({ q, ans, attemptId, onSave }: {
  q: any; ans: string; attemptId?: number; onSave: (qid: number, val: string) => void;
}) {
  const boxTitle = q.passageText?.match(/^##\s*(.+)/m)?.[1];
  const boxHint = q.passageText?.replace(/^##\s*.+\n?/m, '').trim();

  const renderInput = () => {
    if (!q.questionText) {
      return (
        <div className="py-1 text-sm text-slate-800 leading-8">
          <span className="inline-flex items-center gap-1">
            <b className="text-xs text-slate-600">{q.questionIndex}</b>
            <BlankInput qid={q.id} initial={ans} attemptId={attemptId} onSave={onSave} />
          </span>
        </div>
      );
    }
    const parts = q.questionText.split(/(_{2,}|\.{3,})/);
    const hasBlank = parts.some((p: string) => /^_{2,}$/.test(p) || /^\.{3,}$/.test(p));
    return (
      <p className="py-1 text-sm text-slate-800 leading-8">
        {parts.map((part: string, i: number) => {
          if (/^_{2,}$/.test(part) || /^\.{3,}$/.test(part)) {
            return (
              <span key={i} className="inline-flex items-center gap-0.5 mx-0.5">
                <b className="text-xs text-slate-600">{q.questionIndex}</b>
                <BlankInput qid={q.id} initial={ans} attemptId={attemptId} onSave={onSave} />
              </span>
            );
          }
          return <RichText key={i} text={part} />;
        })}
        {!hasBlank && (
          <span className="inline-flex items-center gap-0.5 ml-1">
            <b className="text-xs text-slate-600">{q.questionIndex}</b>
            <BlankInput qid={q.id} initial={ans} attemptId={attemptId} onSave={onSave} />
          </span>
        )}
      </p>
    );
  };

  if (boxTitle) {
    return (
      <div className="my-3">
        <p className="font-bold text-slate-800 text-sm mb-1">{boxTitle}</p>
        {boxHint && <p className="text-xs text-slate-500 mb-2">{boxHint}</p>}
        <div className="border-2 border-slate-300 rounded-lg p-4">
          {renderInput()}
        </div>
      </div>
    );
  }

  return renderInput();
}

// ═══════════════════════════════════════════
// SingleChoice — 单选题 radio (共用)
// ═══════════════════════════════════════════
export const SingleChoice = memo(function SingleChoice({ q, ans, onSave }: {
  q: any; ans: string; onSave: (qid: number, val: string) => void;
}) {
  let options: string[] = [];
  if (q.options) { try { options = JSON.parse(q.options); } catch {} }
  return (
    <div className="py-2.5 border-b border-slate-100 last:border-0">
      {q.questionText && <p className="text-sm font-bold text-slate-800 mb-3">{q.questionText}</p>}
      {options.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {options.map((opt, i) => (
            <label key={i} className={`flex items-start gap-2 p-2.5 rounded border cursor-pointer text-sm ${ans===opt?'border-primary-400 bg-primary-50':'border-slate-200 hover:bg-slate-50'}`}>
              <input type="radio" name={`q-${q.id}`} checked={ans===opt} onChange={()=>onSave(q.id,opt)} className="mt-0.5 flex-shrink-0" />
              <span className="text-slate-800">{opt}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
});

// ═══════════════════════════════════════════
// MultiChoiceGroup — 多选复选框 选N项 (共用)
// ═══════════════════════════════════════════
export const MultiChoiceGroup = memo(function MultiChoiceGroup({
  indices, options, answers, questionIds, onSave, questionText,
}: {
  indices: number[]; options: string[]; answers: Record<string,string>; questionIds: number[];
  onSave: (qid:number,v:string)=>void; attemptId?: number; questionText?: string;
}) {
  return (
    <div className="py-3 border-b border-slate-100">
      {questionText && <p className="text-sm font-bold text-slate-800 mb-3">{questionText}</p>}
      <div className="grid grid-cols-1 gap-2">
        {options.map((opt, oi) => {
          const checked = questionIds.some(qid => answers[qid] === opt);
          return (
            <label key={oi} className={`flex items-start gap-2 p-2.5 rounded border cursor-pointer text-sm transition-colors ${checked ? 'border-primary-400 bg-primary-50' : 'border-slate-200 hover:bg-slate-50'}`}>
              <input type="checkbox" checked={checked} onChange={() => {
                if (checked) { const qid = questionIds.find(qid => answers[qid] === opt); if (qid) onSave(qid, ''); }
                else { const emptyQid = questionIds.find(qid => !answers[qid]?.trim()); if (emptyQid) onSave(emptyQid, opt); }
              }} className="mt-0.5 flex-shrink-0" />
              <span className="text-slate-800">{opt}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
});

// ═══════════════════════════════════════════
// MatchingGroup — 拖拽匹配 (共用)
// ═══════════════════════════════════════════
export const MatchingGroup = memo(function MatchingGroup({
  items, options, answers, onSave, hint,
}: {
  items: {qid:number; qi:number; text:string}[]; options: string[]; answers: Record<string,string>; onSave: (qid:number,v:string)=>void; hint?: string;
}) {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const [dragging, setDragging] = useState<string | null>(null);

  return (
    <div className="py-3 border-b border-slate-100">
      {hint && <div className="text-xs text-amber-600 font-medium mb-2 italic">{hint}</div>}
      <div className="flex gap-6 justify-start min-w-0">
        <div className="space-y-2.5 min-w-0">
          {items.map((item) => {
            const selected = answers[item.qid] || '';
            return (
              <div key={item.qid} className="flex items-start gap-2 text-sm">
                <span className="text-slate-500 shrink-0 w-5 text-right text-xs">{item.qi}</span>
                <span className="text-slate-700">{item.text}</span>
                <div
                  onDrop={(e) => { e.preventDefault(); if (dragging) { onSave(item.qid, dragging); setDragging(null); } }}
                  onDragOver={(e) => e.preventDefault()}
                  className={`border-2 border-dashed rounded px-3 py-0.5 text-center text-sm min-w-[70px] flex-shrink-0 transition-colors ${
                    selected ? 'border-primary-400 bg-primary-50 text-primary-700' : 'border-slate-300 text-slate-400'
                  } ${dragging ? 'border-primary-500 bg-primary-100' : ''}`}
                >{selected || '______'}</div>
              </div>
            );
          })}
        </div>
        <div className="w-64 border border-slate-200 rounded-lg p-3 bg-slate-50 flex-shrink-0">
          <p className="text-xs font-medium text-slate-500 mb-2">Drag options into the boxes</p>
          <div className="space-y-1">
            {options.map((opt, oi) => {
              const used = items.some(it => answers[it.qid] === opt);
              return (
                <div key={oi} draggable onDragStart={() => setDragging(opt)} onDragEnd={() => setDragging(null)}
                  className={`text-xs px-2.5 py-1.5 rounded border cursor-grab active:cursor-grabbing transition-colors ${
                    used ? 'opacity-40 bg-slate-100 text-slate-400' : 'bg-white hover:border-primary-300 hover:bg-primary-50 text-slate-700'
                  }`}
                ><b className="mr-1">{letters[oi]}.</b> {opt}</div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
});

// ═══════════════════════════════════════════
// TableGroup — 表格填空题 (共用)
// ═══════════════════════════════════════════
function hasBlank(cell: string) { return /_{2,}/.test(cell) || /\.{3,}/.test(cell); }
function countBlanks(cell: string) { const m = cell.match(/(_{2,}|\.{3,})/g); return m ? m.length : 0; }

function parseTable(text: string) {
  const normalized = text.trim().split('\n').map(l => {
    let t = l.trim();
    if (t.startsWith('|') && !t.endsWith('|')) t = t + ' |';
    return t;
  });
  const lines = normalized.slice(1).filter(l => l.trim() && l.trim().startsWith('|'));
  if (lines.length < 1) return null;
  const headers = lines[0]!.split('|').map(h => h.trim());
  const rows = lines.slice(1).map(l => l.split('|').map(c => c.trim()));
  return { headers, rows };
}

export const TableGroup = memo(function TableGroup({
  questions, answers, attemptId, onSave, title,
}: {
  questions: any[]; answers: Record<string,string>; attemptId?: number; onSave: (qid:number,v:string)=>void; title?: string;
}) {
  if (!questions.length) return null;
  const first = questions[0]!;
  const table = parseTable(first.passageText || '');
  if (!table) return null;

  const qMap = new Map(questions.map(q => [q.questionIndex, q]));
  const headerTrimmed = table.headers.filter((h, i, arr) => {
    if (i === 0 && h === '') return false;
    if (i === arr.length - 1 && h === '') return false;
    return true;
  });
  const rowsTrimmed = table.rows.map(row =>
    row.filter((c, i, arr) => {
      if (i === 0 && c === '') return false;
      if (i === arr.length - 1 && c === '') return false;
      return true;
    })
  );

  return (
    <div className="py-3 border-b border-slate-100 overflow-x-auto">
      {title && <p className="font-bold text-slate-900 text-base text-center mt-2 mb-2">{title}</p>}
      <table className="w-full text-sm border-collapse table-auto">
        <thead><tr className="bg-slate-100">
          {headerTrimmed.map((h, i) =>
            <th key={`h-${i}`} className="border border-slate-300 px-3 py-2 text-left font-medium text-slate-700 whitespace-nowrap">{h}</th>
          )}
        </tr></thead>
        <tbody>
          {rowsTrimmed.map((row, ri) => {
            const priorBlanks = rowsTrimmed.slice(0, ri).reduce((s, r) =>
              s + r.reduce((sum, c) => sum + countBlanks(c), 0), 0);
            return (
              <tr key={ri}>
                {row.map((cell, ci) => {
                  if (hasBlank(cell)) {
                    const blanksBefore = row.slice(0, ci).reduce((s, c) => s + countBlanks(c), 0);
                    let blankIdx = -1;
                    const parts = cell.split(/(_{2,}|\.{3,})/);
                    return (
                      <td key={`c-${ri}-${ci}`} className="border border-slate-300 px-3 py-2 text-slate-700">
                        {parts.map((part: string, pi: number) => {
                          if (/^_{2,}$/.test(part) || /^\.{3,}$/.test(part)) {
                            blankIdx++;
                            const q = qMap.get(first.questionIndex + priorBlanks + blanksBefore + blankIdx);
                            if (q) {
                              return <span key={pi} className="inline-flex items-center gap-0.5 align-baseline">
                                <b className="text-xs text-slate-600">{q.questionIndex}</b>
                                <BlankInput qid={q.id} initial={answers[q.id] || ''} attemptId={attemptId} onSave={onSave} />
                              </span>;
                            }
                            return <span key={pi} className="text-slate-400">____</span>;
                          }
                          return <span key={pi}>{part}</span>;
                        })}
                      </td>
                    );
                  }
                  return <td key={`c-${ri}-${ci}`} className="border border-slate-300 px-3 py-2 text-slate-700">{cell}</td>;
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
});
