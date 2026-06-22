'use client';

import { memo } from 'react';
import { useTextHighlight } from '../../useTextHighlight';
import { SingleChoice, TrueFalse, FillBlank, TableGroup, MultiChoiceGroup, MatchingGroup, NoteGroup } from './Components';

// ── Group detection helpers ──
function getMatchingGroup(qs: any[]) {
  const first = qs.find((q: any) => q.questionType === 'matching');
  if (!first) return null;
  let opts: string[] = [];
  try { opts = JSON.parse(first.options); } catch { return null; }
  const group = qs.filter((q: any) => q.questionType === 'matching' && q.options === first.options);
  if (group.length < 2) return null;
  return { ids: group.map((g:any)=>g.id), items: group.map((g:any)=>({qid:g.id,qi:g.questionIndex,text:g.questionText||''})), options:opts };
}

function getMultiChoiceGroups(qs: any[], exclude: Set<number>) {
  const groups: { ids: number[]; indices: number[]; options: string[]; firstId: number }[] = [];
  for (let i = 0; i < qs.length; i++) {
    const q = qs[i]!;
    if (q.questionType !== 'multiple_choice' || !q.options || exclude.has(q.id)) continue;
    const group = [q];
    for (let j = i+1; j < qs.length && qs[j]!.questionType==='multiple_choice' && qs[j]!.options===q.options && !exclude.has(qs[j]!.id); j++) group.push(qs[j]!);
    if (group.length >= 2) {
      let opts: string[] = [];
      try { opts = JSON.parse(q.options); } catch {}
      groups.push({ ids: group.map(g=>g.id), indices: group.map(g=>g.questionIndex), options:opts, firstId: group[0]!.id });
      i += group.length - 1;
    }
  }
  return groups;
}

function getTableGroup(qs: any[]) {
  const first = qs.find((q: any) => q.passageText && q.passageText.trim().startsWith('[table]'));
  if (!first) return null;
  const start = first.questionIndex;
  // Collect fill_blank questions starting from the table question
  const tableQs = qs.filter((q: any) => q.questionIndex >= start && q.questionIndex < start + 10 &&
    (q.questionType === 'fill_blank' || (q.passageText && q.passageText.trim().startsWith('[table]'))));
  return { questions: tableQs, firstIndex: start };
}

function isNoteMode(instructions: string) { return /\{Q\d+\}/.test(instructions); }

// ── Single question block (dispatches by type) ──
const QuestionBlock = memo(function QB({ q, ans, attemptId, onSave }: { q: any; ans: string; attemptId?: number; onSave: (qid: number, val: string) => void }) {
  if (q.questionType === 'fill_blank') return <FillBlank q={q} ans={ans} attemptId={attemptId} onSave={onSave} />;
  if (q.questionType === 'multiple_choice') return <SingleChoice q={q} ans={ans} onSave={onSave} />;
  if (q.questionType === 'true_false') return <TrueFalse q={q} ans={ans} onSave={onSave} />;
  return null;
});

// ── Main panel ──
export const QuestionsPanel = memo(function QuestionsPanel({
  section, answers, attemptId, onSave, fullWidth,
}: {
  section: { title: string; sectionIndex?: number; instructions?: string | null; questions: any[] } | undefined;
  answers: Record<string, string>; attemptId?: number; onSave: (qid: number, val: string) => void; fullWidth?: boolean;
}) {
  if (!section) return null;
  const inst = section.instructions || '';
  const matching = getMatchingGroup(section.questions);
  const matchingIds = new Set(matching?.ids || []);
  const mcGroups = getMultiChoiceGroups(section.questions, matchingIds);
  const mcAllIds = new Set<number>(); mcGroups.forEach(g => g.ids.forEach(id => mcAllIds.add(id)));
  const mcFirstIds = new Set<number>(); mcGroups.forEach(g => mcFirstIds.add(g.firstId));
  const table = getTableGroup(section.questions);
  const tableIds = new Set(table?.questions.map(q => q.id) || []);
  const noteMode = isNoteMode(inst);
  const hl = useTextHighlight((section as any).sectionIndex ?? 0);

  // Sub-headings from instructions
  const hLines = inst.split('\n').slice(1);
  const headingMap = new Map<number,string>();
  hLines.forEach(l => { const m = l.match(/^##\s*Q(\d+)\s+(.+)/); if (m) headingMap.set(parseInt(m[1]!), m[2]!); });

  return (
    <div className={`${fullWidth ? 'w-full' : 'w-1/2'} overflow-y-auto p-6`} onMouseUp={hl.handleMouseUp}>
      <div className="border-2 border-slate-800 rounded-lg p-5 bg-white">
        <h2 className="text-lg font-bold text-slate-800 mb-2">{fullWidth ? `Part ${(section as any).sectionIndex ?? ''}` : section.title}</h2>
        {inst && !noteMode && <p className="text-xs font-medium text-slate-500 mb-4 border-b pb-2">{inst.split('\n')[0]}</p>}

        {/* Note mode */}
        {noteMode && <NoteGroup instructions={inst} questions={section.questions} answers={answers} attemptId={attemptId} onSave={onSave} />}

        {/* Regular rendering */}
        {!noteMode && section.questions.map((q, idx) => {
          // Matching
          if (matchingIds.has(q.id)) {
            if (q.id === matching!.ids[0]) return <MatchingGroup key="mg" items={matching!.items} options={matching!.options} answers={answers} onSave={onSave} />;
            return null;
          }
          // Table
          if (tableIds.has(q.id)) {
            if (q.id === table!.questions[0]!.id) return <TableGroup key="tg" questions={table!.questions} answers={answers} attemptId={attemptId} onSave={onSave} title={headingMap.get(q.questionIndex)} />;
            return null;
          }
          // Multi-choice group (skip non-first)
          if (mcAllIds.has(q.id) && !mcFirstIds.has(q.id)) return null;
          // Multi-choice group (first)
          if (mcFirstIds.has(q.id)) {
            const g = mcGroups.find(g => g.firstId === q.id)!;
            const heading = headingMap.get(q.questionIndex);
            return <span key={`mg-${g.firstId}`}>{heading && <p className="font-bold text-slate-800 mt-3 mb-1 text-sm">{heading}</p>}<MultiChoiceGroup indices={g.indices} options={g.options} answers={answers} questionIds={g.ids} onSave={onSave} questionText={q.questionText} /></span>;
          }
          // Sub-heading
          const heading = headingMap.get(q.questionIndex);
          return <span key={q.id}>{heading && <p className="font-bold text-slate-800 mt-3 mb-1 text-sm">{heading}</p>}<QuestionBlock q={q} ans={answers[q.id]||''} attemptId={attemptId} onSave={onSave} /></span>;
        })}
      </div>
      {hl.selectionUI}
      {hl.noteModalUI}
      {hl.viewNoteUI}
    </div>
  );
});
