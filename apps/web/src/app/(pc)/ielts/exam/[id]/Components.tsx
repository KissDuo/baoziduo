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

// ═══════════════════════════════════════════
// FillBlank — 基础填空题 (Q1-6 那种)
// ═══════════════════════════════════════════
export function FillBlank({ q, ans, attemptId, onSave }: {
  q: any; ans: string; attemptId?: number; onSave: (qid: number, val: string) => void;
}) {
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
        return <span key={i}>{part}</span>;
      })}
    </p>
  );
}

// ═══════════════════════════════════════════
// TableGroup — 表格填空题
// ═══════════════════════════════════════════
function hasBlank(cell: string) { return /_{2,}/.test(cell) || /\.{3,}/.test(cell); }

function parseTable(text: string) {
  // Normalize: ensure every line that starts with | also ends with |
  const normalized = text.trim().split('\n').map(l => {
    let t = l.trim();
    if (t.startsWith('|') && !t.endsWith('|')) t = t + ' |';
    return t;
  });
  const lines = normalized.slice(1).filter(l => l.trim());
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
  // Filter leading/trailing empty strings from headers and rows
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
      {title && <p className="font-bold text-slate-800 mt-2 mb-2 text-sm">{title}</p>}
      <table className="w-full text-sm border-collapse table-auto">
        <thead><tr className="bg-slate-100">
          {headerTrimmed.map((h, i) =>
            <th key={`h-${i}`} className="border border-slate-300 px-3 py-2 text-left font-medium text-slate-700 whitespace-nowrap">{h}</th>
          )}
        </tr></thead>
        <tbody>
          {rowsTrimmed.map((row, ri) => {
            // Count all blanks in prior rows for flat index
            const priorBlanks = rowsTrimmed.slice(0, ri).reduce((s, r) =>
              s + r.filter(c => hasBlank(c)).length, 0);
            return (
              <tr key={ri}>
                {row.map((cell, ci) => {
                  if (hasBlank(cell)) {
                    // Count blanks before this cell in the current row
                    const blanksBefore = row.slice(0, ci).filter(c => hasBlank(c)).length;
                    const flatIdx = priorBlanks + blanksBefore;
                    const q = qMap.get(first.questionIndex + flatIdx);
                    if (q) {
                      // Split cell text on underscores/dots, render text + BlankInput inline
                      const parts = cell.split(/(_{2,}|\.{3,})/);
                      return (
                        <td key={`q-${q.id}`} className="border border-slate-300 px-3 py-2 text-slate-700">
                          {parts.map((part: string, pi: number) => {
                            if (/^_{2,}$/.test(part) || /^\.{3,}$/.test(part)) {
                              return <span key={pi} className="inline-flex items-center gap-0.5 align-baseline">
                                <b className="text-xs text-slate-600">{q.questionIndex}</b>
                                <BlankInput qid={q.id} initial={answers[q.id] || ''} attemptId={attemptId} onSave={onSave} />
                              </span>;
                            }
                            return <span key={pi}>{part}</span>;
                          })}
                        </td>
                      );
                    }
                    return <td key={`e-${ri}-${ci}`} className="border border-slate-300 px-3 py-2 text-slate-400">____</td>;
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

// ═══════════════════════════════════════════
// MultiChoiceGroup — 多选复选框 (选2项)
// ═══════════════════════════════════════════
export const MultiChoiceGroup = memo(function MultiChoiceGroup({
  indices, options, answers, questionIds, onSave, questionText,
}: {
  indices: number[]; options: string[]; answers: Record<string,string>; questionIds: number[];
  onSave: (qid:number,v:string)=>void; attemptId?: number; questionText?: string;
}) {
  return (
    <div className="py-3 border-b border-slate-100">
      <div className="text-xs text-slate-400 mb-1">第 {indices.join(', ')} 题（选择 {indices.length} 项）</div>
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
// MatchingGroup — 拖拽匹配
// ═══════════════════════════════════════════
export const MatchingGroup = memo(function MatchingGroup({
  items, options, answers, onSave,
}: {
  items: {qid:number; qi:number; text:string}[]; options: string[]; answers: Record<string,string>; onSave: (qid:number,v:string)=>void;
}) {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const [dragging, setDragging] = useState<string | null>(null);

  return (
    <div className="py-3 border-b border-slate-100">
      <div className="text-xs text-slate-400 mb-2">第 {items[0]!.qi}-{items[items.length-1]!.qi} 题（将右侧选项拖入左侧虚线框）</div>
      <div className="flex gap-6 justify-start">
        <div className="space-y-2">
          {items.map((item) => {
            const selected = answers[item.qid] || '';
            return (
              <div key={item.qid} className="flex items-center gap-2 text-sm">
                <span className="text-slate-700 whitespace-nowrap">{item.qi}. {item.text}</span>
                <div
                  onDrop={(e) => { e.preventDefault(); if (dragging) { onSave(item.qid, dragging); setDragging(null); } }}
                  onDragOver={(e) => e.preventDefault()}
                  className={`border-2 border-dashed rounded px-3 py-1 text-center text-sm min-w-[60px] transition-colors ${
                    selected ? 'border-primary-400 bg-primary-50' : 'border-slate-300'
                  } ${dragging ? 'border-primary-500 bg-primary-100' : ''}`}
                >{selected || '_____'}</div>
              </div>
            );
          })}
        </div>
        <div className="w-64 border border-slate-200 rounded-lg p-3 bg-slate-50 flex-shrink-0">
          <p className="text-xs font-medium text-slate-500 mb-2">拖动选项到左侧虚线框</p>
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
// SingleChoice — 单选题 (radio)
// ═══════════════════════════════════════════
export const SingleChoice = memo(function SingleChoice({ q, ans, onSave }: {
  q: any; ans: string; onSave: (qid: number, val: string) => void;
}) {
  let options: string[] = [];
  if (q.options) { try { options = JSON.parse(q.options); } catch {} }
  return (
    <div className="py-2.5 border-b border-slate-100 last:border-0">
      <div className="text-xs text-slate-400 mb-1">第 {q.questionIndex} 题</div>
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
// TrueFalse — 判断题 (TRUE / FALSE / NOT GIVEN)
// ═══════════════════════════════════════════
export const TrueFalse = memo(function TrueFalse({ q, ans, onSave }: {
  q: any; ans: string; onSave: (qid: number, val: string) => void;
}) {
  return (
    <div className="py-2.5 border-b border-slate-100 last:border-0">
      <div className="text-xs text-slate-400 mb-1">第 {q.questionIndex} 题</div>
      {q.questionText && <p className="text-sm font-bold text-slate-800 mb-3">{q.questionText}</p>}
      <div className="flex gap-2">
        {['TRUE','FALSE','NOT GIVEN'].map(o => (
          <button key={o} onClick={()=>onSave(q.id,o)} className={`px-4 py-1.5 rounded border text-xs font-medium ${ans===o?'bg-primary-600 text-white border-primary-600':'border-slate-300 text-slate-600 hover:bg-slate-50'}`}>{o}</button>
        ))}
      </div>
    </div>
  );
});

// ═══════════════════════════════════════════
// NoteGroup — {QX} 格式笔记
// ═══════════════════════════════════════════
export const NoteGroup = memo(function NoteGroup({
  instructions, questions, answers, attemptId, onSave,
}: {
  instructions: string; questions: any[]; answers: Record<string,string>; attemptId?: number; onSave: (qid:number,v:string)=>void;
}) {
  const qMap = new Map(questions.map(q => [q.questionIndex, q]));
  const body = instructions.split('\n').slice(1).join('\n');
  const lines = body.split('\n');
  return (
    <div className="text-sm text-slate-800 leading-8 whitespace-pre-line">
      {lines.map((line, li) => {
        if (!line.trim()) return <div key={li} className="h-2" />;
        if (line.trim().startsWith('## ')) return <p key={li} className="font-bold text-slate-800 mt-3 mb-1">{line.trim().slice(3)}</p>;
        if (!/\{Q\d+\}/.test(line)) return <p key={li} className="text-slate-700">{line.trim()}</p>;
        const parts = line.split(/(\{Q\d+\})/);
        return <p key={li} className="leading-8">{parts.map((p, pi) => {
          const m = p.match(/^\{Q(\d+)\}$/);
          if (m) { const qi = parseInt(m[1]!); const q = qMap.get(qi);
            return q ? <BlankInput key={pi} qid={q.id} initial={answers[q.id]||''} attemptId={attemptId} onSave={onSave} />
              : <span key={pi} className="border-b-2 border-slate-400 px-1">______</span>; }
          return <span key={pi}>{p}</span>;
        })}</p>;
      })}
    </div>
  );
});
