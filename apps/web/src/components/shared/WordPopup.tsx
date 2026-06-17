'use client';

import { X, BookmarkPlus, BookmarkCheck, Loader2 } from 'lucide-react';
import type { WordAnnotationResponse } from '@/services/article.service';
import { useLang } from '@/lib/i18n';

interface WordPopupProps {
  word: WordAnnotationResponse | null;
  inVocabulary: boolean;
  onClose: () => void;
  onAddToVocabulary: () => void;
  onRemoveFromVocabulary: () => void;
  position?: { x: number; y: number };
  isMobile: boolean;
  loading?: boolean;
}

export function WordPopup({
  word,
  inVocabulary,
  onClose,
  onAddToVocabulary,
  onRemoveFromVocabulary,
  position,
  isMobile,
  loading = false,
}: WordPopupProps) {
  const { t } = useLang();
  if (!word && !loading) return null;

  // ── Loading content ──
  if (loading || !word) {
    const loadingContent = (
      <div className="flex items-center justify-center py-6">
        <Loader2 size={20} className="animate-spin text-primary-600" />
        <span className="ml-2 text-slate-500 text-sm">{t('popup.loading')}</span>
      </div>
    );

    if (isMobile) {
      return (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl p-4">
            <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-4" />
            {loadingContent}
          </div>
        </>
      );
    }
    return (
      <div
        className="fixed z-50 bg-white rounded-xl shadow-xl border border-slate-200 p-4 w-[440px]"
        style={position ? { left: `${position.x}px`, top: `${position.y}px` } : undefined}
      >
        {loadingContent}
      </div>
    );
  }

  // ── Full content ──
  const content = (
    <>
      {/* Word header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-2xl font-extrabold text-slate-900">{word.word}</h3>
          {(word.phoneticUk || word.phoneticUs || word.phonetic) && (
            <div className="flex items-center gap-3 mt-0.5 text-sm text-slate-500 flex-wrap">
              {word.phoneticUk && <span>英 {word.phoneticUk}</span>}
              {word.phoneticUs && <span>美 {word.phoneticUs}</span>}
              {!word.phoneticUk && !word.phoneticUs && word.phonetic && <span>{word.phonetic}</span>}
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100 flex-shrink-0"
        >
          <X size={18} />
        </button>
      </div>

      {/* Part of speech + translation */}
      <div className="flex items-center gap-2 mb-3">
        {word.partOfSpeech && (
          <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
            {word.partOfSpeech}
          </span>
        )}
        <span className="text-base font-medium text-slate-800">{word.translation}</span>
      </div>

      {/* Examples from AI */}
      {word.examples && word.examples.length > 0 && (
        <div className="space-y-2 mb-3">
          {word.examples.map((ex, i) => (
            <div key={i} className="bg-slate-50 rounded-lg p-2.5">
              <p className="text-sm text-slate-700 leading-relaxed">{ex.en}</p>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{ex.zh}</p>
            </div>
          ))}
        </div>
      )}

      {/* Fallback: single example */}
      {(!word.examples || word.examples.length === 0) && word.exampleSentence && (
        <div className="bg-slate-50 rounded-lg p-2.5 mb-3">
          <p className="text-sm text-slate-700 italic leading-relaxed">{word.exampleSentence}</p>
        </div>
      )}

      {/* Placeholder */}
      {word.placeholder && (
        <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-2.5 py-1.5 mb-3">
          {word.message || 'AI 生成失败，稍后重试'}
        </p>
      )}

      {/* Action button */}
      <div className="border-t border-slate-100 pt-3 mt-1">
        {inVocabulary ? (
          <button
            onClick={onRemoveFromVocabulary}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          >
            <BookmarkCheck size={16} />
{t('popup.remove_vocab')}
          </button>
        ) : (
          <button
            onClick={onAddToVocabulary}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
          >
            <BookmarkPlus size={16} />
{t('popup.add_vocab')}
          </button>
        )}
      </div>
    </>
  );

  // ── Mobile: Bottom sheet ──
  if (isMobile) {
    return (
      <>
        <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl p-4 max-h-[65vh] overflow-y-auto">
          <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-4" />
          {content}
        </div>
      </>
    );
  }

  // ── PC: Fixed viewport-relative popover ──
  return (
    <div
      className="fixed z-50 bg-white rounded-xl shadow-xl border border-slate-200 p-4 w-[440px]"
      style={position ? { left: `${position.x}px`, top: `${position.y}px` } : undefined}
    >
      {content}
    </div>
  );
}
