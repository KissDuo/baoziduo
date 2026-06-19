'use client';

import { memo, useRef } from 'react';
import { useTextHighlight } from '../../useTextHighlight';

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
      className="border border-dashed border-slate-400 rounded px-2 py-0.5 outline-none text-sm bg-transparent text-center focus:border-primary-500"
      style={{ width: `${Math.max(60, (initial.length || 8) * 11)}px` }}
    />
  );
}

function renderFillBlank(text: string, qid: number, ans: string, label: string, attemptId?: number, onSave?: (qid: number, val: string) => void) {
  const parts = text.split(/(_{2,}|\.{3,})/);
  return parts.map((part, i) => {
    if (/^_{2,}$/.test(part) || /^\.{3,}$/.test(part)) {
      return (
        <span key={`b-${qid}-${i}`} className="inline-flex items-center gap-0.5 mx-0.5">
          <b className="text-xs text-slate-600">{label}</b>
          <BlankInput qid={qid} initial={ans} attemptId={attemptId} onSave={onSave!} />
        </span>
      );
    }
    return <span key={`t-${qid}-${i}`}>{part}</span>;
  });
}

// ── Parse [table] data from passageText ──
function parseTableData(text: string): { headers: string[]; rows: string[][] } | null {
  if (!text || !text.trim().startsWith('[table]')) return null;
  const lines = text.trim().split('\n').slice(1).filter(l => l.trim());
  if (lines.length < 2) return null;
  const headers = lines[0]!.split('|').map(h => h.trim());
  const rows = lines.slice(1).map(line => line.split('|').map(c => c.trim()));
  return { headers, rows };
}

// ── Table question component ──
const TableQuestionGroup = memo(function TableQuestionGroup({
  questions, answers, attemptId, onSave,
}: {
  questions: any[]; answers: Record<string, string>; attemptId?: number; onSave: (qid: number, val: string) => void;
}) {
  if (!questions.length) return null;
  const firstQ = questions[0]!;
  const table = parseTableData(firstQ.passageText || '');
  if (!table) return null;

  // Map questions to table cells by questionIndex
  const qMap = new Map(questions.map(q => [q.questionIndex, q]));

  return (
    <div className="py-4 border-b border-slate-100 overflow-x-auto">
      <table className="w-full text-sm border-collapse table-auto">
        <thead>
          <tr className="bg-slate-100">
            {table.headers.map((h, i) => (
              <th key={i} className="border border-slate-300 px-3 py-2 text-left font-medium text-slate-700 whitespace-nowrap">{h || ' '}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => {
                if (/^_{2,}$/.test(cell) || /^\.{3,}$/.test(cell)) {
                  const flatBlankIndex = table.rows.slice(0, ri).reduce((sum, r) => sum + r.filter(c => /^_{2,}$/.test(c) || /^\.{3,}$/.test(c)).length, 0)
                    + row.slice(0, ci).filter(c => /^_{2,}$/.test(c) || /^\.{3,}$/.test(c)).length;
                  const targetIndex = firstQ.questionIndex + flatBlankIndex;
                  const q = qMap.get(targetIndex);
                  if (q) {
                    return (
                      <td key={ci} className="border border-slate-300 px-3 py-2 whitespace-nowrap">
                        <BlankInput qid={q.id} initial={answers[q.id] || ''} attemptId={attemptId} onSave={onSave} />
                      </td>
                    );
                  }
                  return <td key={ci} className="border border-slate-300 px-3 py-2 text-slate-400">____</td>;
                }
                return <td key={ci} className="border border-slate-300 px-3 py-2 text-slate-700 whitespace-nowrap">{cell}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

// ── Single question block ──
const QuestionBlock = memo(function QuestionBlock({
  q, ans, attemptId, onSave,
}: {
  q: any; ans: string; attemptId?: number; onSave: (qid: number, val: string) => void;
}) {
  // Skip questions that are part of a table group (rendered separately)
  if (q.passageText && q.passageText.trim().startsWith('[table]')) return null;

  let options: string[] = [];
  if (q.options) { try { options = JSON.parse(q.options); } catch {} }

  return (
    <div className={q.questionType === 'fill_blank' ? 'py-1' : 'py-2.5 border-b border-slate-100 last:border-0'}>
      {q.questionType !== 'fill_blank' && (
        <div className="text-xs text-slate-400 mb-1">第 {q.questionIndex} 题</div>
      )}
      {q.questionText && q.questionType !== 'fill_blank' && (
        <p className={`text-sm text-slate-800 mb-3 ${q.questionType === 'multiple_choice' || q.questionType === 'true_false' ? 'font-bold' : ''}`}>{q.questionText}</p>
      )}
      {q.questionText && q.questionType === 'fill_blank' && (
        <p className="text-sm text-slate-800 leading-8">
          {renderFillBlank(q.questionText, q.id, ans, String(q.questionIndex), attemptId, onSave)}
        </p>
      )}
      {q.questionType === 'fill_blank' && !q.questionText && (
        <div className="text-sm text-slate-800 leading-8">
          <span className="inline-flex items-center gap-1">
            <b className="text-xs text-slate-600">{q.questionIndex}</b>
            <BlankInput qid={q.id} initial={ans} attemptId={attemptId} onSave={onSave} />
          </span>
        </div>
      )}
      {q.questionType === 'multiple_choice' && options.length > 0 && (() => {
        const avgLen = options.reduce((s, o) => s + o.length, 0) / options.length;
        const isInline = avgLen < 40;
        return (
          <div className={isInline ? 'flex flex-wrap gap-1.5' : 'space-y-1.5'}>
            {options.map((opt, i) => (
              <label key={i} className={`flex items-center gap-1.5 rounded-lg border cursor-pointer text-xs transition-colors ${
                ans === opt ? 'border-primary-400 bg-primary-50' : 'border-slate-200 hover:bg-slate-50'
              } ${isInline ? 'px-2.5 py-1' : 'p-2.5 text-sm'}`}>
                <input type="radio" name={`q-${q.id}`} checked={ans === opt} onChange={() => onSave(q.id, opt)} className="mt-0.5" />
                <span className="whitespace-nowrap">{opt}</span>
              </label>
            ))}
          </div>
        );
      })()}
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

// ── Note-style rendering ──
function renderNotes(instructions: string, questions: any[], answers: Record<string,string>, attemptId?: number, onSave?: (qid:number,v:string)=>void) {
  const qMap = new Map(questions.map(q => [q.questionIndex, q]));
  const lines = instructions.split('\n');
  return lines.map((line, li) => {
    if (!line.trim()) return <div key={`nl-${li}`} className="h-2" />;
    if (line.trim().startsWith('## ')) {
      return <p key={`nl-${li}`} className="font-bold text-slate-800 mt-3 mb-1">{line.trim().slice(3)}</p>;
    }
    if (!/\{Q\d+\}/.test(line)) return <p key={`nl-${li}`} className="text-slate-700">{line.trim()}</p>;

    // Pre-process: replace "N{QX}" pattern with blank placeholder
    const processed = line.replace(/(\d+)\{Q(\d+)\}/g, '|||BLANK|$1|$2|||');
    const parts = processed.split(/(\|\|\|BLANK\|\d+\|\d+\|\|\|)/);
    return (
      <p key={`nl-${li}`} className="leading-8">
        {parts.map((part, pi) => {
          const bm = part.match(/^\|\|\|BLANK\|(\d+)\|(\d+)\|\|\|$/);
          if (bm) {
            const label = bm[1]!;
            const qi = parseInt(bm[2]!);
            const q = qMap.get(qi);
            return (
              <span key={`nb-${li}-${pi}`} className="inline-flex items-center gap-0.5 mx-0.5">
                <b className="text-xs text-slate-700">{label}</b>
                {q ? <BlankInput qid={q.id} initial={answers[q.id]||''} attemptId={attemptId} onSave={onSave!} /> : <span className="border-b-2 border-slate-400 px-1 ml-0.5">______</span>}
              </span>
            );
          }
          return <span key={`nb-${li}-${pi}`}>{part}</span>;
        })}
      </p>
    );
  });
}

function isNoteMode(instructions: string): boolean {
  return /\{Q\d+\}/.test(instructions);
}

// ── Find table groups in question list ──
function groupTableQuestions(questions: any[]): { tableQuestions: any[]; firstIndex: number } | null {
  const first = questions.find(q => q.passageText && q.passageText.trim().startsWith('[table]'));
  if (!first) return null;
  const startIdx = first.questionIndex;
  // Collect all consecutive questions from this section that belong to the table
  const tableQs = questions.filter(q => q.questionIndex >= startIdx &&
    (!q.passageText || q.passageText.trim().startsWith('[table]') || q.passageText === first.passageText || q.questionType === 'fill_blank'));
  return { tableQuestions: tableQs, firstIndex: startIdx };
}

// ── Questions panel ──
export const QuestionsPanel = memo(function QuestionsPanel({
  section, answers, attemptId, onSave, fullWidth,
}: {
  section: { title: string; sectionIndex?: number; instructions?: string | null; questions: any[] } | undefined;
  answers: Record<string, string>;
  attemptId?: number;
  onSave: (qid: number, val: string) => void;
  fullWidth?: boolean;
}) {
  if (!section) return null;

  const secInstructions = section.instructions || '';
  const tableGroup = groupTableQuestions(section.questions);
  const tableQuestionIds = new Set(tableGroup?.tableQuestions.map(q => q.id) || []);
  const hl = useTextHighlight((section as any).sectionIndex ?? 0);

  return (
    <div className={`${fullWidth ? 'w-full' : 'w-1/2'} overflow-y-auto p-6`} onMouseUp={hl.handleMouseUp}>
      <div className="border-2 border-slate-800 rounded-lg p-5 bg-white">
        <h2 className="text-lg font-bold text-slate-800 mb-2">{section.title}</h2>
        {secInstructions && (
          <p className="text-xs font-medium text-slate-500 mb-4 border-b pb-2">{secInstructions.split('\n')[0]}</p>
        )}

        {/* Render table questions as a group */}
        {tableGroup && (
          <TableQuestionGroup
            questions={tableGroup.tableQuestions}
            answers={answers}
            attemptId={attemptId}
            onSave={onSave}
          />
        )}

        {/* Render individual questions */}
        {section.questions.filter(q => !tableQuestionIds.has(q.id)).map((q) => (
          <QuestionBlock key={q.id} q={q} ans={answers[q.id] || ''} attemptId={attemptId} onSave={onSave} />
        ))}
      </div>
      {hl.selectionUI}
      {hl.noteModalUI}
      {hl.viewNoteUI}
    </div>
  );
});
