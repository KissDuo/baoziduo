'use client';

import { useState } from 'react';

interface HighlightSpan { text: string; color: string; note?: string }
interface SelectionMenu { text: string; x: number; y: number }

export function useTextHighlight(sectionId = 0) {
  const sid = sectionId;
  const [highlights, setHighlights] = useState<Record<number, HighlightSpan[]>>({});
  const [selMenu, setSelMenu] = useState<SelectionMenu | null>(null);
  const [noteModal, setNoteModal] = useState<{ text: string } | null>(null);
  const [noteText, setNoteText] = useState('');
  const [viewNote, setViewNote] = useState<{ text: string; note: string } | null>(null);

  const handleMouseUp = () => {
    setTimeout(() => {
      const sel = window.getSelection();
      if (!sel) return;
      const text = sel.toString().trim();
      if (text.length < 2) { setSelMenu(null); return; }
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelMenu({ text, x: rect.right + 8, y: rect.top + window.scrollY - 40 });
    }, 50);
  };

  const addHighlight = (sectionId: number, text: string, note?: string) => {
    setHighlights((prev) => {
      const sec = prev[sectionId] || [];
      const exists = sec.find((h) => h.text === text);
      if (exists) {
        return { ...prev, [sectionId]: sec.map((h) => h.text === text ? { ...h, note: note || h.note } : h) };
      }
      return { ...prev, [sectionId]: [...sec, { text, color: 'bg-yellow-200', note }] };
    });
  };

  const removeHighlight = (sectionId: number, text: string) => {
    setHighlights((prev) => ({ ...prev, [sectionId]: (prev[sectionId] || []).filter((h) => h.text !== text) }));
  };

  const isHighlighted = (sectionId: number, text: string) => {
    return (highlights[sectionId] || []).some((h) => h.text === text);
  };

  // Render text with highlights applied
  const renderWithHighlights = (sectionId: number, raw: string) => {
    const secHighlights = highlights[sectionId] || [];
    if (secHighlights.length === 0) return raw;
    const escaped = secHighlights.map((h) => h.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const regex = new RegExp(`(${escaped.join('|')})`, 'g');
    const parts = raw.split(regex);
    return parts.map((part, i) => {
      const hl = secHighlights.find((h) => h.text === part);
      if (hl) {
        return (
          <span key={i}>
            <mark className={hl.color}>{part}</mark>
            {hl.note && (
              <span className="inline-flex items-center justify-center w-5 h-5 ml-0.5 bg-primary-100 text-primary-600 rounded-full cursor-pointer text-xs align-middle hover:bg-primary-200"
                onClick={(e) => { e.stopPropagation(); setViewNote({ text: part, note: hl.note! }); }}
                title="查看笔记">📝</span>
            )}
          </span>
        );
      }
      return part;
    });
  };

  const selectionUI = selMenu && (
    <>
      <div className="fixed inset-0 z-40" onClick={() => setSelMenu(null)} />
      <div className="fixed z-50 bg-white rounded-lg shadow-xl border border-slate-200 py-1 min-w-[120px]" style={{ left: selMenu.x, top: selMenu.y }}>
      {isHighlighted(sid, selMenu.text) ? (
        <button className="w-full text-left px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50" onClick={() => { removeHighlight(sid, selMenu.text); setSelMenu(null); }}>
          ✕ 取消高亮
        </button>
      ) : (
        <>
          <button className="w-full text-left px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50" onClick={() => { addHighlight(sid, selMenu.text); setSelMenu(null); }}>
            🖍 高亮
          </button>
          <button className="w-full text-left px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50" onClick={() => { setNoteModal({ text: selMenu.text }); setNoteText(''); setSelMenu(null); }}>
            📝 笔记
          </button>
        </>
      )}
    </div>
    </>
  );

  const noteModalUI = noteModal && (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <h3 className="font-bold mb-2">添加笔记</h3>
        <p className="text-xs text-slate-500 mb-3">选中文本: &ldquo;{noteModal.text.slice(0, 50)}{noteModal.text.length > 50 ? '...' : ''}&rdquo;</p>
        <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)}
          className="w-full border rounded-lg p-3 text-sm h-24 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="输入笔记内容..." />
        <div className="flex gap-3 mt-4">
          <button onClick={() => setNoteModal(null)} className="flex-1 py-2 border rounded-lg text-sm">取消</button>
          <button onClick={() => { if (noteText.trim()) { addHighlight(sid, noteModal.text, noteText.trim()); setNoteModal(null); } }}
            className="flex-1 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">保存笔记</button>
        </div>
      </div>
    </div>
  );

  const viewNoteUI = viewNote && (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <h3 className="font-bold mb-2">笔记</h3>
        <p className="text-xs text-slate-500 mb-3">原文: &ldquo;{viewNote.text.slice(0, 80)}{viewNote.text.length > 80 ? '...' : ''}&rdquo;</p>
        <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-700">{viewNote.note}</div>
        <button onClick={() => setViewNote(null)} className="mt-4 w-full py-2 border rounded-lg text-sm">关闭</button>
      </div>
    </div>
  );

  return {
    highlights, selMenu, setSelMenu, noteModal, noteText, setNoteText, viewNote, setViewNote,
    handleMouseUp, addHighlight, removeHighlight, isHighlighted, renderWithHighlights,
    selectionUI, noteModalUI, viewNoteUI,
  };
}
