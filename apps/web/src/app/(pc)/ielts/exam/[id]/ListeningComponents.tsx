'use client';

import { useState, memo } from 'react';
import { BlankInput, MatchingGroup } from './SharedComponents';

// ═══════════════════════════════════════════
// FormFillBlank — 表单式填空 (听力P1)
// ═══════════════════════════════════════════
export function FormFillBlank({ title, questions, answers, attemptId, onSave }: {
  title: string;
  questions: any[];
  answers: Record<number, string>;
  attemptId?: number;
  onSave: (qid: number, val: string) => void;
}) {
  const firstPt = questions[0]?.passageText || '';
  const formTitleMatch = firstPt.match(/^\[form\]\s*(.+)/);
  const displayTitle = formTitleMatch ? formTitleMatch[1]!.split('\n')[0]!.trim() : title;

  const hasSubs = questions.some((q: any) => q.passageText?.match(/(?:^|\n)#sub\s+/));

  if (hasSubs) {
    const sections: { sub: string; items: { q: any; prefix: string; suffix: string }[] }[] = [];
    for (const q of questions) {
      const subMatch = q.passageText?.match(/(?:^|\n)#sub\s+(.+)/)?.[1];
      let prefix = '', suffix = '';
      if (q.questionText) {
        const m = q.questionText.match(/^(.*?)\s*(_{2,}|\.{3,})\s*(.*)$/);
        if (m) { prefix = m[1]!.trim(); suffix = m[3]!.trim(); }
      }
      if (subMatch) {
        sections.push({ sub: subMatch, items: [{ q, prefix, suffix }] });
      } else if (sections.length > 0) {
        sections[sections.length - 1]!.items.push({ q, prefix, suffix });
      } else {
        sections.push({ sub: '', items: [{ q, prefix, suffix }] });
      }
    }
    return (
      <div className="my-3">
        <h3 className="font-bold text-slate-900 text-base text-center mb-3">{displayTitle}</h3>
        <div className="border border-slate-400 rounded-lg overflow-hidden">
          {sections.map((sec, si) => (
            <div key={si} className="flex items-start">
              {sec.sub && (
                <span className="text-sm text-slate-800 font-bold w-[40%] px-3 pt-2 flex-shrink-0 text-right">{sec.sub}</span>
              )}
              <span className="flex-1 min-w-0">
                {sec.items.map((item, ii) => (
                  <div key={item.q.id} className="flex items-center gap-1 px-3 py-2">
                    {item.prefix ? <span className="text-sm text-slate-700">{item.prefix}</span> : null}
                    <b className="text-xs text-slate-500 flex-shrink-0">{item.q.questionIndex}</b>
                    <BlankInput qid={item.q.id} initial={answers[item.q.id] || ''} attemptId={attemptId} onSave={onSave} />
                    {item.suffix ? <span className="text-sm text-slate-600 ml-1">{item.suffix}</span> : null}
                  </div>
                ))}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const rows2: { label: string; items: { q: any; prefix: string; suffix: string }[] }[] = [];
  for (const q of questions) {
    let label = `Question ${q.questionIndex}`;
    let prefix = '', suffix = '';
    if (q.questionText) {
      const text = q.questionText;
      const colonIdx = text.indexOf(':');
      if (colonIdx >= 0) {
        label = text.slice(0, colonIdx).trim();
        const afterColon = text.slice(colonIdx + 1).trim();
        const blankMatch = afterColon.match(/^(.*?)\s*(_{2,}|\.{3,})\s*(.*)$/);
        if (blankMatch) { prefix = blankMatch[1]!.trim(); suffix = blankMatch[3]!.trim(); }
        else { prefix = afterColon; }
      } else {
        const blankMatch = text.match(/^(.*?)\s*(_{2,}|\.{3,})\s*(.*)$/);
        if (blankMatch) { label = blankMatch[1]!.trim(); suffix = blankMatch[3]!.trim(); }
        else { label = text.trim(); }
      }
    }
    if (rows2.length > 0 && rows2[rows2.length - 1]!.label === label) {
      rows2[rows2.length - 1]!.items.push({ q, prefix, suffix });
    } else {
      rows2.push({ label, items: [{ q, prefix, suffix }] });
    }
  }
  return (
    <div className="my-3">
      <h3 className="font-bold text-slate-900 text-base text-center mb-3">{displayTitle}</h3>
      <div className="border border-slate-400 rounded-lg overflow-hidden">
        {rows2.map((row, ri) => (
          <div key={ri} className="flex items-start">
            <span className="text-sm text-slate-800 font-bold w-[45%] px-3 pt-2 flex-shrink-0 text-right">{row.label}</span>
            <span className="flex-1 min-w-0">
              {row.items.map((item, ii) => (
                <div key={item.q.id} className="flex items-center gap-1 px-3 py-2">
                  {item.prefix ? <span className="text-sm text-slate-700">{item.prefix}</span> : null}
                  <b className="text-xs text-slate-500 flex-shrink-0">{item.q.questionIndex}</b>
                  <BlankInput qid={item.q.id} initial={answers[item.q.id] || ''} attemptId={attemptId} onSave={onSave} />
                  {item.suffix ? <span className="text-sm text-slate-600 ml-1">{item.suffix}</span> : null}
                </div>
              ))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// FlowchartMatching — 流程图拖拽匹配 (听力)
// ═══════════════════════════════════════════
export const FlowchartMatching = memo(function FlowchartMatching({
  questions, options, answers, attemptId, onSave,
}: {
  questions: any[]; options: string[]; answers: Record<number,string>; attemptId?: number; onSave: (qid:number,v:string)=>void;
}) {
  const first = questions[0];
  if (!first?.passageText) return null;
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const [dragging, setDragging] = useState<string | null>(null);

  type LinePart = { text: string; qid?: number; qi?: number };
  const steps: LinePart[][] = [];
  let currentStep: LinePart[] = [];
  const flowLines = first.passageText.replace(/^\[flowchart\]\n?/, '').split('\n');
  for (const line of flowLines) {
    if (line.startsWith('## Step')) {
      if (currentStep.length > 0) steps.push(currentStep);
      currentStep = [];
      continue;
    }
    const trimmed = line.trim();
    if (!trimmed) continue;
    currentStep.push({ text: trimmed });
  }
  if (currentStep.length > 0) steps.push(currentStep);

  return (
    <div className="flex gap-6 items-start max-w-2xl">
      <div className="flex-1 max-w-md">
        {steps.map((step, si) => (
          <div key={si} className="flex flex-col items-center">
            {si > 0 && (
              <div className="flex justify-center py-1">
                <svg width="16" height="24" viewBox="0 0 16 24">
                  <line x1="8" y1="0" x2="8" y2="16" stroke="currentColor" strokeWidth="2" className="text-slate-500" />
                  <polyline points="2,12 8,20 14,12" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-500" />
                </svg>
              </div>
            )}
            <div className="border-2 border-slate-700 rounded-lg p-4 w-full bg-white">
              {step.map((line, li) => {
                const text = line.text;
                const qMatch = text.match(/\{Q(\d+)\}/);
                if (qMatch) {
                  const qi = parseInt(qMatch[1]!);
                  const q = questions.find((q: any) => q.questionIndex === qi);
                  const parts = text.split(/\{Q\d+\}/);
                  const selected = q ? (answers[q.id] || '') : '';
                  const onDrop = (e: React.DragEvent) => { e.preventDefault(); if (dragging && q) { onSave(q.id, dragging); setDragging(null); } };
                  return (
                    <div key={li} className="text-sm text-slate-700 leading-7">
                      {parts[0] && <span>{parts[0]}</span>}
                      <b className="text-xs text-slate-500 mx-1">{qi}</b>
                      <span onDrop={onDrop} onDragOver={(e) => e.preventDefault()}
                        className={`inline-flex items-center justify-center border-2 border-dashed rounded px-2 py-0.5 text-sm font-medium min-w-[36px] h-7 transition-colors ${
                          selected ? 'border-primary-400 bg-primary-50 text-primary-700' : 'border-slate-300 text-slate-400'
                        } ${dragging ? 'border-primary-500 bg-primary-100' : ''}`}
                      >{selected || '______'}</span>
                      {parts[1] && <span>{parts[1]}</span>}
                    </div>
                  );
                }
                return <div key={li} className="text-sm text-slate-700 leading-7">{text}</div>;
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="w-52 border border-slate-200 rounded-lg p-3 bg-slate-50 flex-shrink-0">
        <p className="text-xs font-medium text-slate-500 mb-2">Drag options into the blanks</p>
        <div className="space-y-1">
          {options.map((opt, oi) => {
            const used = questions.some((q: any) => answers[q.id] === opt);
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
  );
});

// ═══════════════════════════════════════════
// NoteModeGroup — 笔记填空 {QX} 格式 (听力P1/P4)
// ═══════════════════════════════════════════
export function NoteModeGroup({ content, questions, answers, attemptId, onSave }: {
  content: string; questions: any[]; answers: Record<string,string>; attemptId?: number; onSave: (qid:number,v:string)=>void;
}) {
  const qMap = new Map(questions.map(q => [q.questionIndex, q]));
  const body = content.replace(/^\[note\]\n?/, '');
  const lines = body.split('\n');
  let firstHeading = true;
  return (
    <div className="text-sm text-slate-800 leading-8 whitespace-pre-line">
      {lines.map((line, li) => {
        if (!line.trim()) return <div key={li} className="h-2" />;
        if (line.trim().startsWith('## ')) {
          const title = line.trim().slice(3);
          const isFirst = firstHeading;
          firstHeading = false;
          return <p key={li} className={isFirst ? 'font-bold text-slate-900 text-base text-center mt-1 mb-3' : 'font-bold text-slate-800 mt-3 mb-1 text-sm'}>{title}</p>;
        }
        if (!/\{Q\d+\}/.test(line)) return <p key={li} className="text-slate-700">{line.trim()}</p>;
        const parts = line.split(/(\{Q\d+\})/);
        return <p key={li} className="leading-8">{parts.map((p, pi) => {
          const m = p.match(/^\{Q(\d+)\}$/);
          if (m) { const qi = parseInt(m[1]!); const q = qMap.get(qi);
            return q ? <span key={pi} className="inline-flex items-center gap-0.5 align-baseline"><b className="text-xs text-slate-600">{q.questionIndex}</b><BlankInput qid={q.id} initial={answers[q.id]||''} attemptId={attemptId} onSave={onSave} /></span>
              : <span key={pi} className="border-b-2 border-slate-400 px-1">______</span>; }
          return <span key={pi}>{p}</span>;
        })}</p>;
      })}
    </div>
  );
}

// ═══════════════════════════════════════════
// MapLabelling — 地图标注题 (听力P2): 地图图片 + MatchingGroup
// ═══════════════════════════════════════════
export function MapLabelling({
  questions, imageUrl, answers, attemptId, onSave,
}: {
  questions: any[]; imageUrl?: string | null; answers: Record<string,string>; attemptId?: number; onSave: (qid:number,v:string)=>void;
}) {
  const items = questions.map((q: any) => ({ qid: q.id, qi: q.questionIndex, text: q.questionText || '' }));
  let options: string[] = [];
  try { options = JSON.parse(questions[0]?.options || '[]'); } catch {}

  return (
    <div className="flex gap-4 items-start">
      {imageUrl && (
        <div className="flex-shrink-0" style={{ width: '40%' }}>
          <img src={imageUrl} alt="Map" className="w-full border border-slate-300 rounded-lg" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <MatchingGroup items={items} options={options} answers={answers} onSave={onSave} />
      </div>
    </div>
  );
}
