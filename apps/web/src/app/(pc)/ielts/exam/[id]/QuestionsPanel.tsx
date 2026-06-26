'use client';

import { memo } from 'react';
import { useTextHighlight } from '../../useTextHighlight';
import { SingleChoice, TrueFalse, FillBlank, FormFillBlank, TableGroup, MultiChoiceGroup, MatchingGroup, SummaryCompletion, FlowchartMatching, NoteModeGroup, MapLabelling } from './Components';

// ── Group detection helpers ──
function getMatchingGroups(qs: any[]) {
  const groups: { ids: number[]; items: {qid:number; qi:number; text:string}[]; options: string[] }[] = [];
  const seen = new Set<number>();
  for (const q of qs) {
    if (q.questionType !== 'matching' || seen.has(q.id) || !q.options) continue;
    let opts: string[] = [];
    try { opts = JSON.parse(q.options); } catch { continue; }
    const group = qs.filter((g: any) => g.questionType === 'matching' && g.options === q.options);
    if (group.length >= 2) {
      groups.push({
        ids: group.map((g:any) => g.id),
        items: group.map((g:any) => ({ qid: g.id, qi: g.questionIndex, text: g.questionText || '' })),
        options: opts,
      });
      group.forEach((g: any) => seen.add(g.id));
    }
  }
  return groups;
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

function getSummaryGroup(qs: any[]) {
  const first = qs.find((q: any) => q.passageText && q.passageText.trim().match(/^##\s/));
  if (!first) return null;
  const start = first.questionIndex;
  const group = qs.filter((q: any) => q.questionIndex >= start && q.questionType === 'fill_blank');
  if (group.length < 2) return null;
  return { questions: group, firstIndex: start };
}

function getTableGroup(qs: any[]) {
  const first = qs.find((q: any) => q.passageText && q.passageText.trim().startsWith('[table]'));
  if (!first) return null;
  const start = first.questionIndex;
  const tableQs = qs.filter((q: any) => q.questionIndex >= start && q.questionIndex < start + 10 &&
    (q.questionType === 'fill_blank' || (q.passageText && q.passageText.trim().startsWith('[table]'))));
  return { questions: tableQs, firstIndex: start };
}

function getNoteGroup(qs: any[]) {
  const first = qs.find((q: any) => q.passageText && q.passageText.trim().startsWith('[note]'));
  if (!first) return null;
  const start = first.questionIndex;
  // Collect all questions mentioned in the note text via {QX} markers
  const noteText = first.passageText!;
  const qiMatches = [...noteText.matchAll(/\{Q(\d+)\}/g)].map(m => parseInt(m[1]!));
  const noteQs = qs.filter((q: any) => qiMatches.includes(q.questionIndex));
  return { questions: noteQs, content: noteText, firstIndex: start };
}

function getMapGroups(qs: any[]) {
  const groups: { ids: number[]; questions: any[]; options: string[] }[] = [];
  const seen = new Set<number>();
  for (const q of qs) {
    if (seen.has(q.id) || q.questionType !== 'map_labelling') continue;
    const opts = q.options || '[]';
    const group = qs.filter((g: any) => g.questionType === 'map_labelling' && (g.options || '[]') === opts && !seen.has(g.id));
    group.forEach((g: any) => seen.add(g.id));
    if (group.length >= 1) groups.push({ ids: group.map((g: any) => g.id), questions: group, options: JSON.parse(opts) });
  }
  return groups;
}

// ── Detect sequential groups for individual question types ──
function getSequentialGroups(qs: any[], exclude: Set<number>): Map<number, number[]> {
  // Returns Map<firstQuestionId, questionIds[]>
  const map = new Map<number, number[]>();
  const individualTypes = ['fill_blank', 'true_false', 'multiple_choice'];
  let i = 0;
  while (i < qs.length) {
    const q = qs[i]!;
    if (exclude.has(q.id) || !individualTypes.includes(q.questionType)) { i++; continue; }
    const group = [q];
    let j = i + 1;
    while (j < qs.length) {
      const next = qs[j]!;
      if (exclude.has(next.id) || next.questionType !== q.questionType) break;
      group.push(next);
      j++;
    }
    if (group.length >= 1) {
      map.set(group[0]!.id, group.map(g => g.id));
      group.forEach(g => exclude.add(g.id));
    }
    i = j;
  }
  return map;
}

// ── Helper: compute question range string from array of questionIndex values ──
function qRange(indices: number[]): string {
  if (indices.length === 0) return '';
  const sorted = [...indices].sort((a, b) => a - b);
  const first = sorted[0]!;
  const last = sorted[sorted.length - 1]!;
  return first === last ? `Question ${first}` : `Questions ${first}-${last}`;
}

// ── Single question block (dispatches by type, adds question number prefix) ──
const QuestionBlock = memo(function QB({ q, ans, attemptId, onSave }: { q: any; ans: string; attemptId?: number; onSave: (qid: number, val: string) => void }) {
  const num = <span className="text-xs text-slate-500 font-medium mr-1">{q.questionIndex}.</span>;
  if (q.questionType === 'fill_blank') {
    return <FillBlank q={q} ans={ans} attemptId={attemptId} onSave={onSave} />;
  }
  if (q.questionType === 'multiple_choice') {
    return <div className="flex items-baseline gap-1">{num}<div className="flex-1"><SingleChoice q={q} ans={ans} onSave={onSave} /></div></div>;
  }
  if (q.questionType === 'true_false') {
    return <div className="flex items-baseline gap-1">{num}<div className="flex-1"><TrueFalse q={q} ans={ans} onSave={onSave} /></div></div>;
  }
  return null;
});

// ═══════════════════════════════════════════════════════════════
// Standard hints per question type — DO NOT MODIFY without user request
// ═══════════════════════════════════════════════════════════════
function extractWordLimit(instructions: string, qiStart: number, qiEnd: number): string | null {
  const lines = instructions.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i]!;
    const rm = l.match(new RegExp(`Questions\\s+${qiStart}\\s*[-–]\\s*${qiEnd}`, 'i'));
    if (!rm) continue;
    // Search subsequent lines for word limit pattern
    for (let j = i; j < Math.min(i + 5, lines.length); j++) {
      // Reading: "Choose ONE WORD from the passage"
      let m = lines[j]!.match(/choose\s+(.+?)\s+from\s+the\s+passage/i);
      if (m) return m[1]!.trim().toUpperCase();
      // Listening: "Write ONE WORD AND/OR A NUMBER for each answer" or "Write ONE WORD ONLY."
      m = lines[j]!.match(/write\s+(.+?)(?:\s+for\s+each\s+answer)?\.?$/i);
      if (m) return m[1]!.trim().toUpperCase();
    }
  }
  // Fallback: search entire instructions for "Write X" pattern
  const writeMatch = instructions.match(/write\s+(.+?)(?:\s+for\s+each\s+answer)?\.?$/im);
  if (writeMatch) return writeMatch[1]!.trim().toUpperCase();
  return null;
}

function getStandardHint(questions: any[], sectionIndex: number, qiStart: number, qiEnd: number, instructions?: string | null): React.ReactNode {
  const first = questions[0];
  if (!first) return null;
  switch (first.questionType) {
    case 'true_false':
      return (
        <span>
          Do the following statements agree with the information given in Reading Passage {sectionIndex}?<br />
          In boxes {qiStart}–{qiEnd} on your answer sheet, write<br />
          <b>TRUE</b> if the statement agrees with the information<br />
          <b>FALSE</b> if the statement contradicts the information<br />
          <b>NOT GIVEN</b> if there is no information on this
        </span>
      );
    case 'fill_blank': {
      const raw = first.passageText || '';
      const wordLimit = extractWordLimit(instructions, qiStart, qiEnd);
      const isListening = instructions?.toLowerCase().includes('write');
      const limitText = wordLimit ? (
        isListening
          ? <span>Write <b>{wordLimit}</b> for each answer.</span>
          : <span>Choose <b>{wordLimit}</b> from the passage for each answer.</span>
      ) : null;
      if (raw.startsWith('[form]'))
        return <span>Complete the form below.<br />{limitText}</span>;
      if (raw.startsWith('##'))
        return <span>Complete the summary below.<br />{limitText}</span>;
      if (raw.startsWith('[table]'))
        return <span>Complete the table below.<br />{limitText}</span>;
      return <span>Complete the notes below.<br />{limitText}</span>;
    }
    case 'multiple_choice': {
      // Search instructions for "Choose N letters, A-E" or "Choose TWO letters, A-E" pattern
      const ctx = findMatchContext(instructions, qiStart, qiEnd);
      if (ctx) {
        const m = ctx.match(/choose\s+(\w+)\s+letters?,?\s*([A-Z])-([A-Z])/i);
        if (m) {
          const count = m[1]!;  // TWO
          const startL = m[2]!; // A
          const endL = m[3]!;  // E
          return <span>Choose <b>{count}</b> letters, <b>{startL}-{endL}</b>.</span>;
        }
      }
      // Fallback: dynamic from actual options
      let letters: string[] = [];
      try { letters = JSON.parse(first.options || '[]'); } catch {}
      const letterList = letters.map((o: string) => o.trim()[0]).filter(Boolean) as string[];
      if (letterList.length >= 2) {
        const last = letterList.pop();
        return <span>Choose the correct letter, {letterList.map((l, i) => <span key={i}><b>{l}</b>, </span>)}or <b>{last}</b>.</span>;
      }
      return <span>Choose the correct letter, <b>A</b>, <b>B</b>, <b>C</b> or <b>D</b>.</span>;
    }
    case 'matching':
      return null;
    default:
      return null;
  }
}

// ── Matching type detection ──
type MatchKind = 'sentence' | 'paragraph' | 'person' | 'generic';

function detectMatchKind(instructions: string, qiStart: number, qiEnd: number): MatchKind {
  const ctx = findMatchContext(instructions, qiStart, qiEnd);
  if (!ctx) return 'generic';
  const lower = ctx.toLowerCase();
  if (lower.includes('complete each sentence') || lower.includes('correct ending')) return 'sentence';
  if (lower.includes('list of people') || lower.includes('match each statement with the correct person')) return 'person';
  if (lower.includes('which paragraph') || lower.includes('which section') || lower.includes('contains the following information')) return 'paragraph';
  return 'generic';
}

function findMatchContext(instructions: string, qiStart: number, qiEnd: number): string | null {
  const lines = instructions.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i]!.trim();
    const rm = l.match(new RegExp(`Questions\\s+${qiStart}\\s*[-–]\\s*${qiEnd}`, 'i'));
    if (!rm) continue;
    const parts: string[] = [];
    for (let j = i; j < lines.length; j++) {
      const t = lines[j]!.trim();
      // Stop at: blank line, next Questions group, or numbered question item
      if (j > i) {
        if (!t) break;
        if (t.match(/^Questions\s+\d/)) break;
        if (/^\d{1,2}[.)](\s|$)/.test(t)) break;
      }
      if (t) parts.push(t);
    }
    return parts.join(' ').trim();
  }
  return null;
}

// ── Matching hints ──
function getPersonMatchHint(
  options: string[], qiStart: number, qiEnd: number, instructions: string
): React.ReactNode {
  const ctx = findMatchContext(instructions, qiStart, qiEnd) || '';
  const nbMatch = ctx.match(/NB\s+.+/i);
  const people = options.map(o => o.trim()[0]).filter(Boolean);
  const peopleList = people.length > 1
    ? people.slice(0, -1).join(', ') + ' or ' + people[people.length - 1] + '.'
    : people[0] + '.';
  return (
    <span>
      Look at the following statements (Questions {qiStart}–{qiEnd}) and the list of people below.<br />
      Match each statement with the correct person, {peopleList}<br />
      {nbMatch && <><i>{nbMatch[0]}</i></>}
    </span>
  );
}

function getSentenceMatchHint(options: string[], qiStart: number, qiEnd: number): React.ReactNode {
  const letters = options.map(o => o.trim()[0]).filter(Boolean).join('');
  const range = letters.length > 0 ? `${letters[0]}–${letters[letters.length - 1]}` : '';
  return <span>Complete each sentence with the correct ending, {range}, below.</span>;
}

function getParagraphMatchHint(
  options: string[], sectionIndex: number, qiStart: number, qiEnd: number, instructions: string
): React.ReactNode {
  const ctx = findMatchContext(instructions, qiStart, qiEnd) || '';
  const letters = options.map(o => o.trim()[0]).filter(Boolean).join('');
  const range = letters.length > 0 ? `${letters[0]}–${letters[letters.length - 1]}` : '';
  // Extract section count from instructions (e.g. "seven sections")
  const secMatch = ctx.match(/(\w+)\s+sections?/i);
  const secCount = secMatch ? secMatch[1] : '';
  const nbMatch = ctx.match(/NB\s+.+/i);
  const nb = nbMatch ? nbMatch[0] : '';
  return (
    <span>
      Reading Passage {sectionIndex} has {secCount} sections,{range}.<br />
      Which section contains the following information?<br />
      Write the correct letter,{range}, in boxes {qiStart}–{qiEnd} on your answer sheet.<br />
      {nb && <><i>{nb}</i></>}
    </span>
  );
}

// ── Listening matching hint (Choose N answers from the box) ──
function getListeningMatchHint(instructions: string, qiStart: number, qiEnd: number): React.ReactNode | null {
  const ctx = findMatchContext(instructions, qiStart, qiEnd);
  if (!ctx) return null;
  // Match: "Choose FOUR answers from the box and write the correct letter, A-F, next to Questions 25-28."
  const m = ctx.match(/choose\s+(\w+)\s+answers?\s+from\s+the\s+box\s+and\s+write\s+the\s+correct\s+letter,\s*([A-Z])-([A-Z]),?\s*next\s+to\s+Questions\s+(\d+)[-–](\d+)/i);
  if (m) {
    const count = m[1]!;  // FOUR
    const startLetter = m[2]!; // A
    const endLetter = m[3]!; // F
    return <span>Choose <b>{count}</b> answers from the box and write the correct letter, <b>{startLetter}-{endLetter}</b>, next to Questions <b>{qiStart}–{qiEnd}</b>.</span>;
  }
  return ctx;
}

// ── Main panel ──
export const QuestionsPanel = memo(function QuestionsPanel({
  section, answers, attemptId, onSave, fullWidth,
}: {
  section: { title: string; sectionIndex?: number; instructions?: string | null; questions: any[] } | undefined;
  answers: Record<string, string>; attemptId?: number; onSave: (qid: number, val: string) => void; fullWidth?: boolean;
}) {
  if (!section) return null;
  const inst = section.instructions || '';
  const matchingGroups = getMatchingGroups(section.questions);
  const matchingIds = new Set<number>();
  matchingGroups.forEach(g => g.ids.forEach(id => matchingIds.add(id)));
  const matchingFirstIds = new Set<number>();
  matchingGroups.forEach(g => matchingFirstIds.add(g.ids[0]!));
  const mcGroups = getMultiChoiceGroups(section.questions, matchingIds);
  const mcAllIds = new Set<number>(); mcGroups.forEach(g => g.ids.forEach(id => mcAllIds.add(id)));
  const mcFirstIds = new Set<number>(); mcGroups.forEach(g => mcFirstIds.add(g.firstId));
  const summary = getSummaryGroup(section.questions);
  const summaryIds = new Set(summary?.questions.map(q => q.id) || []);
  const table = getTableGroup(section.questions);
  const tableIds = new Set(table?.questions.map(q => q.id) || []);
  const note = getNoteGroup(section.questions);
  const noteIds = new Set(note?.questions.map(q => q.id) || []);
  const mapGroups = getMapGroups(section.questions);
  const mapIds = new Set<number>(); mapGroups.forEach(g => g.ids.forEach(id => mapIds.add(id)));
  const mapFirstIds = new Set<number>(); mapGroups.forEach(g => mapFirstIds.add(g.ids[0]!));
  // Detect form-style section (listening P1)
  const hasForm = section.questions.some((q: any) => q.passageText && q.passageText.trim().startsWith('[form]'));
  const formWordLimit = hasForm ? (extractWordLimit(inst, 1, 40) || 'ONE WORD AND/OR A NUMBER') : null;
  const formHint = formWordLimit ? <span>Complete the form below.<br/>Write <b>{formWordLimit}</b> for each answer.</span> : null;
  // Sequential groups for individual question types (fill_blank, true_false, single MC)
  const allGroupedIds = new Set([...matchingIds, ...mcAllIds, ...summaryIds, ...tableIds, ...noteIds, ...mapIds]);
  const seqGroups = getSequentialGroups(section.questions, new Set(allGroupedIds));
  const seqFirstIds = new Set(seqGroups.keys());
  const seqAllIds = new Set<number>();
  seqGroups.forEach(ids => ids.forEach(id => seqAllIds.add(id)));

  const hl = useTextHighlight((section as any).sectionIndex ?? 0);

  // Sub-headings from instructions (## QX Title format)
  const hLines = inst.split('\n').slice(1);
  const headingMap = new Map<number,string>();
  hLines.forEach(l => { const m = l.match(/^##\s*Q(\d+)\s+(.+)/); if (m) headingMap.set(parseInt(m[1]!), m[2]!); });

  return (
    <div className={`${fullWidth ? 'w-full' : ''} p-6 break-words`} onMouseUp={hl.handleMouseUp}>
      <div className="border-2 border-slate-800 rounded-lg p-5 bg-white">

        {/* Regular rendering */}
        {section.questions.map((q, idx) => {
          // NoteGroup
          if (noteIds.has(q.id)) {
            if (q.id === note!.questions[0]!.id) {
              const qiVals = note!.questions.map(q => q.questionIndex);
              const header = qRange(qiVals);
              const firstLine = inst.split('\n')[0] || '';
              const wordLimit = extractWordLimit(inst, qiVals[0]!, qiVals[qiVals.length - 1]!);
              const noteHint = wordLimit ? (
                <span>Complete the notes below.<br/>Write <b>{wordLimit}</b> for each answer.</span>
              ) : firstLine;
              return (
                <div key="note" className="mb-4">
                  <h3 className="font-bold text-slate-800 text-sm mb-2">{header}</h3>
                  <p className="text-xs text-slate-600 mb-2">{noteHint}</p>
                  <NoteModeGroup content={note!.content} questions={note!.questions} answers={answers} attemptId={attemptId} onSave={onSave} />
                </div>
              );
            }
            return null;
          }
          // Map labelling (skip non-first in each group)
          if (mapIds.has(q.id) && !mapFirstIds.has(q.id)) return null;
          if (mapFirstIds.has(q.id)) {
            const g = mapGroups.find(g => g.ids[0] === q.id)!;
            const qiVals = g.questions.map((mq: any) => mq.questionIndex);
            const header = qRange(qiVals);
            return (
              <div key={`map-${g.ids[0]}`} className="mb-4">
                <h3 className="font-bold text-slate-800 text-sm mb-2">{header}</h3>
                <p className="text-xs text-slate-600 mb-2">Label the map below. Write the correct letter next to Questions {Math.min(...qiVals)}-{Math.max(...qiVals)}.</p>
                <MapLabelling questions={g.questions} imageUrl={(section as any).imageUrl} answers={answers} attemptId={attemptId} onSave={onSave} />
              </div>
            );
          }
          // Matching (skip non-first in each group)
          if (matchingIds.has(q.id) && !matchingFirstIds.has(q.id)) return null;
          if (matchingFirstIds.has(q.id)) {
            const g = matchingGroups.find(g => g.ids[0] === q.id)!;
            const qiVals = g.items.map(it => it.qi);
            const header = qRange(qiVals);
            // Check for flowchart matching
            const firstItemQid = g.items[0]?.qid;
            const firstQ = firstItemQid ? section.questions.find((sq: any) => sq.id === firstItemQid) : null;
            const isFlowchart = firstQ?.passageText?.startsWith('[flowchart]');
            if (isFlowchart) {
              const flowQs = g.items.map((it: any) => section.questions.find((sq: any) => sq.id === it.qid)).filter(Boolean);
              const flowHint = getListeningMatchHint(inst, qiVals[0]!, qiVals[qiVals.length - 1]!) || findMatchContext(inst, qiVals[0]!, qiVals[qiVals.length - 1]!);
              return (
                <div key={`mg-${g.ids[0]}`} className="mb-4">
                  <h3 className="font-bold text-slate-800 text-sm mb-2">{header}</h3>
                  {flowHint && <p className="text-xs text-slate-600 mb-2">{flowHint}</p>}
                  <FlowchartMatching questions={flowQs} options={g.options} answers={answers} attemptId={attemptId} onSave={onSave} />
                </div>
              );
            }
            const kind = detectMatchKind(inst, qiVals[0]!, qiVals[qiVals.length - 1]!);
            let hint: React.ReactNode = null;
            if (kind === 'sentence') {
              hint = getSentenceMatchHint(g.options, qiVals[0]!, qiVals[qiVals.length - 1]!);
            } else if (kind === 'person') {
              hint = getPersonMatchHint(g.options, qiVals[0]!, qiVals[qiVals.length - 1]!, inst);
            } else if (kind === 'paragraph') {
              hint = getParagraphMatchHint(g.options, section.sectionIndex, qiVals[0]!, qiVals[qiVals.length - 1]!, inst);
            } else {
              // Try listening match hint first ("Choose N answers from the box")
              const listenHint = getListeningMatchHint(inst, qiVals[0]!, qiVals[qiVals.length - 1]!);
              hint = listenHint || findMatchContext(inst, qiVals[0]!, qiVals[qiVals.length - 1]!);
            }
            const stemQ = headingMap.get(qiVals[0]!);
            // Detect "Write the correct letter, A, B or C next to Questions 15-18" hint
            const writeLetterHint = (() => {
              const ctx = findMatchContext(inst, qiVals[0]!, qiVals[qiVals.length - 1]!);
              if (ctx) {
                const m = ctx.match(/write\s+the\s+correct\s+letter,?\s*([A-Z](?:,\s*[A-Z])*\s*(?:or\s+[A-Z])?)\s+next\s+to\s+Questions\s+(\d+)[-–](\d+)/i);
                if (m) return <span>Write the correct letter, <b>{m[1]}</b> next to Questions <b>{m[2]}–{m[3]}</b>.</span>;
              }
              return null;
            })();
            return (
              <div key={`mg-${g.ids[0]}`} className="mb-4">
                <h3 className="font-bold text-slate-800 text-sm mb-2">{header}</h3>
                {stemQ && <p className="text-sm text-slate-800 font-medium mb-2">{stemQ}</p>}
                {writeLetterHint && <p className="text-xs text-slate-600 mb-2">{writeLetterHint}</p>}
                {!writeLetterHint && hint && <p className="text-xs text-slate-600 mb-2">{hint}</p>}
                <MatchingGroup items={g.items} options={g.options} answers={answers} onSave={onSave} />
              </div>
            );
          }
          // Summary completion
          if (summaryIds.has(q.id)) {
            if (q.id === summary!.questions[0]!.id) {
              const qiVals = summary!.questions.map(q => q.questionIndex);
              const header = qRange(qiVals);
              const sumHint = getStandardHint(summary!.questions, section.sectionIndex || 1, qiVals[0]!, qiVals[qiVals.length - 1]!, inst);
              return (
                <div key="sc" className="mb-4">
                  <h3 className="font-bold text-slate-800 text-sm mb-2">{header}</h3>
                  {sumHint && <p className="text-xs text-slate-600 mb-2">{sumHint}</p>}
                  <SummaryCompletion questions={summary!.questions} answers={answers} attemptId={attemptId} onSave={onSave} />
                </div>
              );
            }
            return null;
          }
          // Table
          if (tableIds.has(q.id)) {
            if (q.id === table!.questions[0]!.id) {
              const qiVals = table!.questions.map(q => q.questionIndex);
              const header = qRange(qiVals);
              const heading = headingMap.get(q.questionIndex);
              // Try extract table-specific hint from passageText (second line after [table] Title)
              const tablePt = table!.questions[0]?.passageText || '';
              const tablePtLines = tablePt.split('\n');
              let tblHint: React.ReactNode = null;
              if (tablePtLines.length > 1 && !tablePtLines[1]!.startsWith('|')) {
                tblHint = <span className="text-xs text-slate-600">{tablePtLines[1]}</span>;
              }
              if (!tblHint) tblHint = formHint || getStandardHint(table!.questions, section.sectionIndex || 1, qiVals[0]!, qiVals[qiVals.length - 1]!, inst);
              return (
                <div key="tg" className="mb-4">
                  <h3 className="font-bold text-slate-800 text-sm mb-2">{header}</h3>
                  {tblHint && <p className="text-xs text-slate-600 mb-2">{tblHint}</p>}
                  <TableGroup questions={table!.questions} answers={answers} attemptId={attemptId} onSave={onSave} title={heading} />
                </div>
              );
            }
            return null;
          }
          // Multi-choice group (skip non-first)
          if (mcAllIds.has(q.id) && !mcFirstIds.has(q.id)) return null;
          if (mcFirstIds.has(q.id)) {
            const g = mcGroups.find(g => g.firstId === q.id)!;
            const header = qRange(g.indices);
            const mcGroupQs = g.ids.map(id => section.questions.find((sq: any) => sq.id === id)!).filter(Boolean);
            const hint = getStandardHint(mcGroupQs, section.sectionIndex, g.indices[0]!, g.indices[g.indices.length - 1]!, inst);
            const heading = headingMap.get(q.questionIndex);
            return (
              <div key={`mcg-${g.firstId}`} className="mb-4">
                {heading && <p className="font-bold text-slate-800 mt-3 mb-1 text-sm">{heading}</p>}
                <h3 className="font-bold text-slate-800 text-sm mb-2">{header}</h3>
                {hint && <p className="text-xs text-slate-600 mb-2">{hint}</p>}
                <MultiChoiceGroup indices={g.indices} options={g.options} answers={answers} questionIds={g.ids} onSave={onSave} questionText={q.questionText} />
              </div>
            );
          }
          // Sequential group (fill_blank, true_false, individual MC): skip non-first, render header for first
          if (seqAllIds.has(q.id) && !seqFirstIds.has(q.id)) return null;
          if (seqFirstIds.has(q.id)) {
            const groupIds = seqGroups.get(q.id)!;
            const groupQs = groupIds.map(gid => section.questions.find((sq: any) => sq.id === gid)!).filter(Boolean);
            const qiVals = groupQs.map(gq => gq.questionIndex);
            const header = qRange(qiVals);
            const hint = getStandardHint(groupQs, section.sectionIndex, qiVals[0]!, qiVals[qiVals.length - 1]!, inst);
            // Check for form-style: first question's passageText starts with ##
            const formTitle = groupQs[0]?.passageText?.match(/^\[form\]\s*(.+)/)?.[1];
            if (formTitle && groupQs.every(gq => gq.questionType === 'fill_blank')) {
              return (
                <div key={`sg-${q.id}`} className="mb-4">
                  <h3 className="font-bold text-slate-800 text-sm mb-2">{header}</h3>
                  {hint && <p className="text-xs text-slate-600 mb-2">{hint}</p>}
                  <FormFillBlank title={formTitle} questions={groupQs} answers={answers} attemptId={attemptId} onSave={onSave} />
                </div>
              );
            }
            return (
              <div key={`sg-${q.id}`} className="mb-4">
                <h3 className="font-bold text-slate-800 text-sm mb-2">{header}</h3>
                {hint && <p className="text-xs text-slate-600 mb-2">{hint}</p>}
                {groupQs.map(gq => (
                  <QuestionBlock key={gq.id} q={gq} ans={answers[gq.id]||''} attemptId={attemptId} onSave={onSave} />
                ))}
              </div>
            );
          }
          // Individual questions (ungrouped single MC etc.)
          const heading = headingMap.get(q.questionIndex);
          return (
            <div key={q.id} className="mb-2">
              {heading && <p className="font-bold text-slate-800 mt-3 mb-1 text-sm">{heading}</p>}
              <QuestionBlock q={q} ans={answers[q.id]||''} attemptId={attemptId} onSave={onSave} />
            </div>
          );
        })}
      </div>
      {hl.selectionUI}
      {hl.noteModalUI}
      {hl.viewNoteUI}
    </div>
  );
});
