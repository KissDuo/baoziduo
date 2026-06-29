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
  position?: { x: number; y: number; useBottom?: boolean };
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
        className="fixed z-50 bg-white rounded-xl shadow-xl border border-slate-200 p-4 w-[440px] min-h-[220px]"
        style={position ? (position.useBottom ? { left: `${position.x}px`, bottom: `${position.y}px` } : { left: `${position.x}px`, top: `${position.y}px` }) : undefined}
      >
        <div className="flex items-center justify-center h-[180px]">
          {loadingContent}
        </div>
      </div>
    );
  }

  const popupWidth = word?.collocations?.length ? 'w-[640px]' : 'w-[440px]';

  // ── Full content ──
  const forms = (word as any).forms;
  const hasForms = forms && (forms.verb || forms.noun || forms.adj || forms.adv || forms.pastTense || forms.pastParticiple);
  // Sort A-Z, take up to 10 collocations
  const displayCollocations = word.collocations?.length
    ? [...word.collocations].sort((a, b) => a.phrase.localeCompare(b.phrase)).slice(0, 15)
    : null;
  const hasCollocations = displayCollocations && displayCollocations.length > 0;

  // Highlight the searched word within a collocation phrase
  const highlightPhrase = (phrase: string, query: string) => {
    const parts = phrase.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((p, i) =>
      p.toLowerCase() === query.toLowerCase()
        ? <strong key={i} className="text-blue-600 font-bold">{p}</strong>
        : <span key={i}>{p}</span>
    );
  };

  const wordInfo = (
    <>
      {/* Word header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-extrabold text-slate-900">{word.word}</h3>
          {(word.phoneticUk || word.phoneticUs || word.phonetic) && (
            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 flex-wrap">
              {word.phoneticUk && <span>英 {word.phoneticUk}</span>}
              {word.phoneticUs && <span>美 {word.phoneticUs}</span>}
              {!word.phoneticUk && !word.phoneticUs && word.phonetic && <span>{word.phonetic}</span>}
            </div>
          )}
        </div>
        {!hasCollocations && (
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 flex-shrink-0">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Part of speech + translation */}
      <div className="flex items-center gap-2 mb-2">
        {word.partOfSpeech && (
          <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded">{word.partOfSpeech === 'phrase' ? t('vocab.phrase') : word.partOfSpeech}</span>
        )}
        <span className="text-sm font-medium text-slate-800">{word.translation}</span>
      </div>

      {/* Related Words (for phrases/collocations) */}
      {(word as any).relatedWords && (word as any).relatedWords.length > 0 && (
        <div className="mb-2">
          <p className="text-[11px] text-slate-400 mb-1">{t('popup.related_words')}</p>
          <div className="space-y-0.5">
            {(word as any).relatedWords.map((rw: any, i: number) => (
              <div key={i}
                onClick={() => {
                  // Trigger search for this word via custom event
                  window.dispatchEvent(new CustomEvent('wordpopup:search', { detail: rw.word }));
                }}
                className="flex items-center gap-2 text-xs px-2 py-1 rounded hover:bg-slate-100 cursor-pointer transition-colors group">
                <span className="font-medium text-slate-700 group-hover:text-primary-600">{rw.word}</span>
                {rw.translation && <span className="text-slate-400 flex-1 text-right">{rw.translation}</span>}
                <span className="text-[10px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">🔍</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {word.tags && word.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {word.tags.map(tag => (
            <span key={tag} className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{tag}</span>
          ))}
        </div>
      )}

      {/* Plural */}
      {word.plural && (
        <div className="mb-2">
          <p className="text-[11px] text-slate-400 mb-0.5">{t('popup.plural')}</p>
          <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-lg font-medium">{word.plural}</span>
        </div>
      )}

      {/* 3rd-person singular */}
      {word.thirdPersonSingular && (
        <div className="mb-2">
          <p className="text-[11px] text-slate-400 mb-0.5">{t('popup.third_singular')}</p>
          <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-lg font-medium">{word.thirdPersonSingular}</span>
        </div>
      )}

      {/* Word Forms */}
      {hasForms && (
        <div className="mb-2">
          <p className="text-[11px] text-slate-400 mb-1">{t('popup.forms_title')}</p>
          <div className="space-y-0.5">
            {forms.verb && <div className="flex items-center gap-1.5 text-xs"><span className="text-slate-400 w-10 text-right flex-shrink-0">{t('popup.verb')}</span><span className="font-medium text-slate-700">{forms.verb.word}</span><span className="text-slate-500">{forms.verb.translation}</span></div>}
            {forms.noun && <div className="flex items-center gap-1.5 text-xs"><span className="text-slate-400 w-10 text-right flex-shrink-0">{t('popup.noun')}</span><span className="font-medium text-slate-700">{forms.noun.word}</span><span className="text-slate-500">{forms.noun.translation}</span></div>}
            {forms.adj && <div className="flex items-center gap-1.5 text-xs"><span className="text-slate-400 w-10 text-right flex-shrink-0">{t('popup.adj')}</span><span className="font-medium text-slate-700">{forms.adj.word}</span><span className="text-slate-500">{forms.adj.translation}</span></div>}
            {forms.adv && <div className="flex items-center gap-1.5 text-xs"><span className="text-slate-400 w-10 text-right flex-shrink-0">{t('popup.adv')}</span><span className="font-medium text-slate-700">{forms.adv.word}</span><span className="text-slate-500">{forms.adv.translation}</span></div>}
            {forms.pastTense && <div className="flex items-center gap-1.5 text-xs"><span className="text-slate-400 w-10 text-right flex-shrink-0">{t('popup.past')}</span><span className="font-medium text-slate-700">{forms.pastTense.word}</span><span className="text-slate-500">{forms.pastTense.translation}</span></div>}
            {forms.pastParticiple && <div className="flex items-center gap-1.5 text-xs"><span className="text-slate-400 w-10 text-right flex-shrink-0">{t('popup.past_participle')}</span><span className="font-medium text-slate-700">{forms.pastParticiple.word}</span><span className="text-slate-500">{forms.pastParticiple.translation}</span></div>}
          </div>
        </div>
      )}

      {/* Examples */}
      {word.examples && word.examples.length > 0 && (
        <div className="space-y-1.5">
          {word.examples.map((ex, i) => (
            <div key={i} className="bg-slate-50 rounded-lg p-2">
              <p className="text-xs text-slate-700 leading-relaxed">
                {ex.en.split(new RegExp(`(${word.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')).map((part: any, j: number) =>
                  part.toLowerCase() === word.word.toLowerCase()
                    ? <strong key={j} className="text-blue-600 font-bold">{part}</strong>
                    : part
                )}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{ex.zh}</p>
            </div>
          ))}
        </div>
      )}

      {/* Placeholder */}
      {word.placeholder && (
        <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-2.5 py-1.5 mt-2">
          {word.message || 'AI generation failed, please retry'}
        </p>
      )}
    </>
  );

  const collocationPanel = hasCollocations ? (
    <div className="w-56 flex-shrink-0 border-l border-slate-100 pl-3 ml-1">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">{t('popup.collocations')}</h4>
        <button onClick={onClose} className="text-slate-300 hover:text-slate-500 p-0.5 rounded-full">
          <X size={14} />
        </button>
      </div>
      <div className="space-y-1.5">
        {displayCollocations.map((c, i) => (
          <div key={i} className="text-xs leading-relaxed">
            <span className="text-slate-700 font-medium">{highlightPhrase(c.phrase, word.word)}</span>
            <span className="text-slate-400 mx-1">—</span>
            <span className="text-slate-500">{c.translation}</span>
          </div>
        ))}
      </div>
    </div>
  ) : null;

  const actionButton = (
    <div className="border-t border-slate-100 pt-2.5 mt-2">
      {inVocabulary ? (
        <button onClick={onRemoveFromVocabulary} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
          <BookmarkCheck size={16} />{t('popup.remove_vocab')}
        </button>
      ) : (
        <button onClick={onAddToVocabulary} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors">
          <BookmarkPlus size={16} />{t('popup.add_vocab')}
        </button>
      )}
    </div>
  );

  const content = hasCollocations ? (
    <div>
      <div className="flex items-start">
        <div className="flex-1 min-w-0">{wordInfo}</div>
        {collocationPanel}
      </div>
      {actionButton}
    </div>
  ) : (
    <div>
      {wordInfo}
      {actionButton}
    </div>
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
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className={`fixed z-50 bg-white rounded-xl shadow-xl border border-slate-200 p-4 min-h-[220px] ${popupWidth}`}
        style={position ? (position.useBottom ? { left: `${position.x}px`, bottom: `${position.y}px` } : { left: `${position.x}px`, top: `${position.y}px` }) : undefined}
      >
        {content}
      </div>
    </>
  );
}
