'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ieltsService } from '@/services/ielts.service';
import { QuestionsPanel } from './QuestionsPanel';
import type { IeltsExamDetail, IeltsAttempt } from '@/services/ielts.service';

interface HighlightSpan { text: string; color: string; note?: string }
interface SelectionMenu { text: string; x: number; y: number }

// Resizable split panel with draggable divider
function ResizableSplit({ left, right }: { left: React.ReactNode; right: React.ReactNode }) {
  const [split, setSplit] = useState(50);
  const dragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setSplit(Math.min(70, Math.max(30, pct)));
    };
    const handleUp = () => { dragging.current = false; document.body.style.cursor = ''; document.body.style.userSelect = ''; };
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
    return () => { document.removeEventListener('mousemove', handleMove); document.removeEventListener('mouseup', handleUp); };
  }, []);

  return (
    <div ref={containerRef} className="flex flex-1 overflow-hidden" style={{ minHeight: 0 }}>
      <div className="overflow-y-auto" style={{ width: split + '%', minWidth: 0 }}>{left}</div>
      <div
        className="w-1.5 bg-slate-200 hover:bg-primary-400 cursor-col-resize flex-shrink-0 transition-colors active:bg-primary-500"
        onMouseDown={() => { dragging.current = true; document.body.style.cursor = 'col-resize'; document.body.style.userSelect = 'none'; }}
      />
      <div className="overflow-y-auto" style={{ width: (100 - split) + '%', minWidth: 0 }}>{right}</div>
    </div>
  );
}

// Isolated blank input — uses ref, zero re-renders from parent
function BlankInput({ qid, initial, attemptId, onSave }: {
  qid: number; initial: string; attemptId?: number; onSave: (qid: number, val: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const saveRef = useRef(onSave);
  const attemptRef = useRef(attemptId);
  saveRef.current = onSave;
  attemptRef.current = attemptId;

  useEffect(() => {
    if (inputRef.current && !inputRef.current.value) {
      inputRef.current.value = initial;
    }
  }, []);

  return (
    <input
      ref={inputRef}
      type="text"
      defaultValue={initial}
      onBlur={() => {
        const v = inputRef.current?.value || '';
        if (v.trim() && attemptRef.current) saveRef.current(qid, v);
      }}
      className="inline-block border-b-2 border-slate-400 focus:border-primary-500 px-1 py-0 mx-1 outline-none text-sm bg-transparent align-baseline"
      style={{ width: `${Math.max(60, (initial.length || 8) * 13)}px` }}
    />
  );
}

export default function IeltsExamPage() {
  const router = useRouter();
  const [examId, setExamId] = useState<number>(0);

  // Get exam ID from URL on client side
  useEffect(() => {
    const id = Number(window.location.pathname.split('/').filter(Boolean).pop());
    if (id && !isNaN(id)) setExamId(id);
  }, []);

  const [exam, setExam] = useState<IeltsExamDetail | null>(null);
  const [attempt, setAttempt] = useState<IeltsAttempt | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Highlight & notes state
  const [highlights, setHighlights] = useState<Record<number, HighlightSpan[]>>({});
  const [selMenu, setSelMenu] = useState<SelectionMenu | null>(null);
  const [noteModal, setNoteModal] = useState<{ text: string } | null>(null);
  const [noteText, setNoteText] = useState('');
  const [viewNote, setViewNote] = useState<{ text: string; note: string } | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);
  const passageRef = useRef<HTMLDivElement>(null);

  const sections = exam?.sections || [];
  const section = sections[currentSection];
  const totalQuestions = sections.reduce((sum, s) => sum + s.questions.length, 0);
  const answeredCount = Object.values(answers).filter((v) => v?.trim()).length;

  // ── Init ──
  useEffect(() => {
    if (!examId || examId <= 0) return;
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
        setTimeLeft(Math.max(0, detail.durationMinutes * 60 - (att.timeSpentSeconds || 0)));
      } catch (err: any) {
        if (mountedRef.current) setError(err.message || 'Failed');
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    }
    init();
    return () => { mountedRef.current = false; };
  }, [examId]);

  // ── Timer ──
  useEffect(() => {
    if (!attempt || timeLeft <= 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => prev <= 1 ? 0 : prev - 1);
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [attempt?.id]);

  // ── Save (stable ref for memo) ──
  const saveAnswer = useCallback(async (qid: number, ans: string) => {
    setAnswers((p) => ({ ...p, [qid]: ans }));
    if (!attempt) return;
    try { await ieltsService.saveAnswer(attempt.id, qid, ans); } catch {}
  }, [attempt]);

  const handleSubmit = async () => {
    if (!attempt) return;
    setSubmitting(true);
    try {
      await ieltsService.submitAttempt(attempt.id);
      router.push(`/ielts/exam/${examId}/result?attempt=${attempt.id}`);
    } catch { setSubmitting(false); }
  };

  // ── Text selection handler ──
  const handlePassageMouseUp = () => {
    setTimeout(() => {
      const sel = window.getSelection();
      if (!sel || !mountedRef.current) return;
      const text = sel.toString().trim();
      if (text.length < 2) { setSelMenu(null); return; }
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelMenu({
        text,
        x: rect.right + 8,
        y: rect.top + window.scrollY - 40,
      });
    }, 50);
  };

  // ── Highlight ──
  const addHighlight = (text: string, note?: string) => {
    setHighlights((prev) => {
      const sec = prev[currentSection] || [];
      const exists = sec.find((h) => h.text === text);
      if (exists) {
        return { ...prev, [currentSection]: sec.map((h) => h.text === text ? { ...h, note: note || h.note } : h) };
      }
      return { ...prev, [currentSection]: [...sec, { text, color: 'bg-yellow-200', note }] };
    });
  };

  const removeHighlight = (text: string) => {
    setHighlights((prev) => ({
      ...prev,
      [currentSection]: (prev[currentSection] || []).filter((h) => h.text !== text),
    }));
  };

  const isHighlighted = (text: string) => {
    return (highlights[currentSection] || []).some((h) => h.text === text);
  };

  const getHighlightNote = (text: string): string | undefined => {
    return (highlights[currentSection] || []).find((h) => h.text === text)?.note;
  };

  // ── Render passage with paragraph formatting, line-break fix & highlights ──
  const renderPassage = () => {
    const raw = section?.instructions || '';
    const secHighlights = highlights[currentSection] || [];

    // Split into paragraphs by 2+ newlines
    const rawParagraphs = raw.split(/\n{2,}/);

    // Find boundary: first "Questions X-Y" or "Test X" paragraph ends the passage
    let passageEnd = rawParagraphs.length;
    for (let i = 0; i < rawParagraphs.length; i++) {
      const t = rawParagraphs[i]!.trim();
      if (/^(Questions\s+\d+|Test\s+\d+$)/.test(t)) { passageEnd = i; break; }
    }

    // Filter out purely empty paragraphs (artifacts from boilerplate removal)
    const passageParas = rawParagraphs.slice(0, passageEnd).filter(p => p.trim());

    // Helper: join broken PDF lines into flowing text (handle \r\n and \n)
    const joinLines = (text: string) => text.replace(/\r?\n/g, ' ').replace(/\s{2,}/g, ' ').trim();

    // Helper: apply highlight marks to text
    const highlightText = (text: string): React.ReactNode => {
      if (secHighlights.length === 0) return text;
      const escaped = secHighlights.map((h) => h.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      const regex = new RegExp(`(${escaped.join('|')})`, 'g');
      const parts = text.split(regex);
      if (parts.length === 1) return text;
      return parts.map((part, i) => {
        const hl = secHighlights.find((h) => h.text === part);
        if (hl) {
          return (
            <span key={i}>
              <mark className={hl.color}>{part}</mark>
              {hl.note && (
                <span
                  className="inline-flex items-center justify-center w-5 h-5 ml-0.5 bg-primary-100 text-primary-600 rounded-full cursor-pointer text-xs align-middle hover:bg-primary-200"
                  onClick={(e) => { e.stopPropagation(); setViewNote({ text: part, note: hl.note! }); }}
                  title="View note"
                >📝</span>
              )}
            </span>
          );
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
      });
    };

    // Flatten paragraphs into blocks, splitting at section markers (A-Z) within paragraphs
    type Block = { type: 'text' | 'marker'; content: string };
    const blocks: Block[] = [];
    for (const para of passageParas) {
      const lines = para.split('\n');
      let textBuf: string[] = [];

      for (let li = 0; li < lines.length; li++) {
        const t = lines[li]!.trim();

        // Inline marker: "[A-Z] body text..." (letter + 1+ spaces + body)
        const inline = t.match(/^([A-Z])\s+(.+)$/);
        // Standalone: just "A-Z" on its own line
        const single = /^[A-Z]$/.test(t);

        if (inline || single) {
          const letter = inline ? inline[1]! : t;
          const bodyLen = inline ? inline[2]!.length : 0;
          // Section marker = standalone letter OR inline letter with substantial body text (>=30 chars)
          const isSectionMarker = single || bodyLen >= 30;

          // Is this part of a list of adjacent single-letter lines?
          const prevSingle = li > 0 && /^[A-Z]$/.test(lines[li-1]!.trim());
          const nextSingle = li < lines.length - 1 && /^[A-Z]$/.test(lines[li+1]!.trim());
          const inList = (prevSingle || nextSingle) && single; // only standalone letters can be in a list

          if (isSectionMarker && !inList) {
            if (textBuf.length > 0) { blocks.push({ type: 'text', content: textBuf.join('\n') }); textBuf = []; }
            blocks.push({ type: 'marker', content: letter });
            if (inline) textBuf.push(inline[2]!);
            continue;
          }
        }

        textBuf.push(lines[li]!);
      }
      if (textBuf.length > 0) { blocks.push({ type: 'text', content: textBuf.join('\n') }); }
    }

    // Filter out empty text blocks
    const nonEmptyBlocks = blocks.filter(b => b.type !== 'text' || b.content.trim());

    // Find the first text block that's NOT an instruction line (the actual passage title)
    const firstTextIdx = nonEmptyBlocks.findIndex(b => b.type === 'text' && !/^You should spend/i.test(b.content.trim()));

    return (
      <>
        {nonEmptyBlocks.map((block, bi) => {
          if (block.type === 'marker') {
            return <p key={bi} className="font-bold text-lg text-slate-900 mb-1 mt-4">{block.content}</p>;
          }

          const trimmed = block.content.trim();
          if (!trimmed) return null;

          // Instruction line: lighter color, no bold
          const isInstructionLine = /^You should spend/i.test(trimmed);
          if (isInstructionLine) {
            return <p key={bi} className="mb-3 text-slate-500">{highlightText(joinLines(trimmed))}</p>;
          }
          // First text block (title already in section header) — render as normal body
          if (bi === firstTextIdx) {
            return <p key={bi} className="mb-3">{highlightText(joinLines(trimmed))}</p>;
          }

          // Normal paragraph — join broken PDF lines into flowing text
          return <p key={bi} className="mb-3">{highlightText(joinLines(trimmed))}</p>;
        })}
      </>
    );
  };

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /><span className="ml-3 text-slate-500">Loading exam...</span></div>;
  if (error || !exam) return <div className="text-center py-16 text-red-500">{error || 'Exam not found'}</div>;

  return (
    <div className="fixed inset-0 top-16 bg-white flex flex-col z-40">
      {/* ── Top bar ── */}
      <div className="bg-slate-900 text-white px-6 h-12 flex items-center justify-between flex-shrink-0">
        <h1 className="text-sm font-medium truncate">{exam.title}</h1>
        <div className="flex items-center gap-5 text-sm">
          <span className="text-slate-400">{answeredCount}/{totalQuestions} answered</span>
          <span className={`font-mono font-bold ${timeLeft < 300 ? 'text-red-400' : 'text-white'}`}>{formatTime(timeLeft)}</span>
          <button onClick={() => setShowSubmitModal(true)} className="bg-primary-600 hover:bg-primary-700 px-5 py-1 rounded text-sm font-medium">Submit</button>
        </div>
      </div>

      {/* ── Main split ── */}
      <ResizableSplit
        left={
          <div className="h-full overflow-y-auto p-6 bg-slate-50 relative" ref={passageRef} onMouseUp={handlePassageMouseUp}>
            <h2 className="text-base font-bold text-slate-800 mb-3">{section?.title}</h2>
            <div className="text-sm leading-relaxed text-slate-800 break-words">
              {renderPassage()}
            </div>
          </div>
        }
        right={
          <QuestionsPanel
            section={section}
            answers={answers}
            attemptId={attempt?.id}
            onSave={saveAnswer}
          />
        }
      />

      {/* ── Bottom: Section tabs ── */}
      <div className="border-t bg-white px-6 py-3 flex items-center justify-center gap-3 flex-shrink-0">
        {sections.map((s, idx) => (
          <button key={s.id} onClick={() => { setCurrentSection(idx); setSelMenu(null); }}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${idx === currentSection ? 'bg-primary-600 text-white' : 'border border-slate-300 text-slate-600 hover:bg-slate-50'}`}>
            {s.title}
          </button>
        ))}
      </div>

      {/* ── Selection floating menu ── */}
      {selMenu && (
        <div className="fixed z-50 bg-white rounded-lg shadow-xl border border-slate-200 py-1 min-w-[120px]" style={{ left: selMenu.x, top: selMenu.y }}>
          {isHighlighted(selMenu.text) ? (
            <button className="w-full text-left px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50" onClick={() => { removeHighlight(selMenu.text); setSelMenu(null); }}>
              ✕ Remove highlight
            </button>
          ) : (
            <>
              <button className="w-full text-left px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50" onClick={() => { addHighlight(selMenu.text); setSelMenu(null); }}>
                🖍 Highlight
              </button>
              <button className="w-full text-left px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50" onClick={() => { setNoteModal({ text: selMenu.text }); setNoteText(''); setSelMenu(null); }}>
                📝 Note
              </button>
            </>
          )}
        </div>
      )}

      {/* ── Note input modal ── */}
      {noteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="font-bold mb-2">Add Note</h3>
            <p className="text-xs text-slate-500 mb-3">Selected: &ldquo;{noteModal.text.slice(0, 50)}{noteModal.text.length > 50 ? '...' : ''}&rdquo;</p>
            <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)}
              className="w-full border rounded-lg p-3 text-sm h-24 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter your note..." />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setNoteModal(null)} className="flex-1 py-2 border rounded-lg text-sm">Cancel</button>
              <button onClick={() => { if (noteText.trim()) { addHighlight(noteModal.text, noteText.trim()); setNoteModal(null); } }}
                className="flex-1 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── View note modal ── */}
      {viewNote && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="font-bold mb-2">Note</h3>
            <p className="text-xs text-slate-500 mb-3">Source: &ldquo;{viewNote.text.slice(0, 80)}{viewNote.text.length > 80 ? '...' : ''}&rdquo;</p>
            <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-700">{viewNote.note}</div>
            <button onClick={() => setViewNote(null)} className="mt-4 w-full py-2 border rounded-lg text-sm">Close</button>
          </div>
        </div>
      )}

      {/* ── Submit modal ── */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-bold mb-2">Confirm Submit</h3>
            <p className="text-sm text-slate-600 mb-1">You have answered {answeredCount} / {totalQuestions} questions</p>
            {answeredCount < totalQuestions && <p className="text-sm text-amber-600 mb-4">⚠️ {totalQuestions - answeredCount} question(s) remaining</p>}
            <div className="flex gap-3">
              <button onClick={() => setShowSubmitModal(false)} className="flex-1 py-2 border rounded-lg text-sm">Continue</button>
              <button onClick={handleSubmit} disabled={submitting} className="flex-1 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50">{submitting ? 'Submitting...' : 'Confirm'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
