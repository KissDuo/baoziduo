'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useLang } from '@/lib/i18n';
import { vocabStudyService, type VocabWord, type BookWordsResponse } from '@/services/vocabulary.service';
import { WordPopup } from '@/components/shared/WordPopup';
import { api } from '@/lib/api-client';

// ═══════════════════════════════════════════
// Flashcard Mode
// ═══════════════════════════════════════════
function FlashcardMode({ words, onComplete, onWordDone }: { words: VocabWord[]; onComplete: (results: { wordId: number; known: boolean }[]) => void; onWordDone: (result: { wordId: number; known: boolean }) => void }) {
  const { t } = useLang();
  const [index, setIndex] = useState(0);
  const [showDetail, setShowDetail] = useState(false);
  const [detailData, setDetailData] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [finished, setFinished] = useState(false);
  const knownCountRef = useRef(0);

  const word = words[index];
  if (!word) return null;

  const openDetail = async () => {
    setShowDetail(true);
    setDetailData(null);
    setDetailLoading(true);
    try {
      const results = await api.get<any[]>('/vocabulary/search', { q: word.word });
      if (results && results.length > 0) {
        setDetailData(results[0]);
      }
    } catch {} finally { setDetailLoading(false); }
  };

  const goPrev = () => { if (index > 0) { setIndex(index - 1); setShowDetail(false); } };
  const goNext = () => { if (index + 1 < words.length) { setIndex(index + 1); setShowDetail(false); } };

  const handleKnown = () => {
    onWordDone({ wordId: word.id, known: true });
    knownCountRef.current += 1;
    setShowDetail(false);
    if (index + 1 < words.length) {
      setIndex(index + 1);
    } else {
      setFinished(true);
      onComplete([]);
    }
  };

  if (finished) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">{t('vocab.session_done')}</h2>
        <p className="text-slate-500 mb-6">{knownCountRef.current} / {words.length} {t('vocab.mastered')}</p>
        <Link href="/vocabulary" className="text-primary-600 hover:underline text-sm font-medium">← {t('vocab.title')}</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-primary-500 transition-all rounded-full" style={{ width: `${((index + 1) / words.length) * 100}%` }} />
        </div>
        <span className="text-xs text-slate-500 font-medium">{index + 1}/{words.length}</span>
      </div>

      {/* Card */}
      <div
        onClick={openDetail}
        className="bg-white rounded-2xl border-2 border-slate-200 px-10 py-8 flex flex-col items-center justify-center cursor-pointer hover:shadow-lg hover:border-primary-300 transition-all select-none"
      >
        <h2 className="text-4xl font-extrabold text-slate-900 mb-3">{word.word}</h2>

        {(word.phoneticUk || word.phoneticUs) && (
          <p className="text-sm text-slate-400 mb-2">
            {word.phoneticUk && <span>英[{word.phoneticUk.replace(/^\/|\/$/g, '')}]</span>}
            {word.phoneticUk && word.phoneticUs && word.phoneticUk !== word.phoneticUs && <span> 美[{word.phoneticUs.replace(/^\/|\/$/g, '')}]</span>}
          </p>
        )}

        {word.partOfSpeech && (
          <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2.5 py-0.5 rounded-full">
            {word.partOfSpeech}
          </span>
        )}
      </div>

      <p className="text-center text-xs text-slate-400 mt-2">{t('vocab.tap_flip')}</p>

      {/* Actions */}
      <div className="flex gap-3 mt-5 items-center">
        <button onClick={goPrev} disabled={index === 0}
          className="px-4 py-3 rounded-xl border border-slate-200 text-slate-500 font-medium hover:bg-slate-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
          ← {t('vocab.prev_word')}
        </button>
        <button onClick={handleKnown} className="flex-1 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors">
          {t('vocab.know')}
        </button>
        <button onClick={goNext} disabled={index + 1 >= words.length}
          className="px-4 py-3 rounded-xl border border-slate-200 text-slate-500 font-medium hover:bg-slate-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
          {t('vocab.next_word')}
        </button>
      </div>

      <p className="text-center text-xs text-slate-300 mt-4">{t('vocab.study_hint')}</p>

      {/* Detail Popup */}
      {showDetail && (
        <WordPopup
          word={detailData || {
            word: word.word,
            phoneticUk: word.phoneticUk,
            phoneticUs: word.phoneticUs,
            partOfSpeech: word.partOfSpeech,
            translation: word.translation,
            examples: word.examples || [],
          } as any}
          inVocabulary={false}
          isMobile={false}
          loading={detailLoading}
          onClose={() => setShowDetail(false)}
          onAddToVocabulary={() => {}}
          onRemoveFromVocabulary={() => {}}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// Spell Mode (character-by-character)
// ═══════════════════════════════════════════
function SpellMode({ words, onComplete, onWordDone }: { words: VocabWord[]; onComplete: (results: { wordId: number; known: boolean }[]) => void; onWordDone: (result: { wordId: number; known: boolean }) => void }) {
  const { t } = useLang();
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState<string[]>([]);
  const [status, setStatus] = useState<'typing' | 'correct' | 'wrong'>('typing');
  const [results, setResults] = useState<{ wordId: number; known: boolean }[]>([]);
  const [finished, setFinished] = useState(false);

  const word = words[index];
  if (!word) return null;

  const targetLetters = word.word.split('');
  const firstLetter = targetLetters[0] || '';
  const remaining = targetLetters.slice(1);

  // Reset input when word changes
  useEffect(() => {
    setInput([]);
    setStatus('typing');
  }, [index]);

  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-focus when word changes or component mounts
  useEffect(() => {
    containerRef.current?.focus();
  }, [index]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Enter to advance when result is shown
    if (e.key === 'Enter' && status === 'correct') {
      handleCorrect();
      return;
    }
    if (e.key === 'Enter' && status === 'wrong') {
      handleSkip();
      return;
    }
    if (status !== 'typing') return;
    if (e.key === 'Backspace') {
      setInput(prev => prev.slice(0, -1));
      return;
    }
    if (/^[a-zA-Z]$/.test(e.key) && e.key.length === 1) {
      const next = [...input, e.key.toLowerCase()];
      setInput(next);
      if (next.length === remaining.length) {
        const isCorrect = next.join('') === remaining.join('');
        setStatus(isCorrect ? 'correct' : 'wrong');
      }
    }
  };

  const handlePrev = () => { if (index > 0) { setIndex(index - 1); } };

  const handleCorrect = () => {
    const result = { wordId: word.id, known: true };
    setResults([...results, result]);
    onWordDone(result);  // only save on explicit "correct" advance
    if (index + 1 < words.length) {
      setIndex(index + 1);
    } else {
      setFinished(true);
      onComplete([]);
    }
  };

  const handleSkip = () => {
    // skip without saving — just advance
    if (index + 1 < words.length) {
      setIndex(index + 1);
    } else {
      setFinished(true);
      onComplete([]);
    }
  };

  const handleRetry = () => {
    setInput([]);
    setStatus('typing');
  };

  if (finished) {
    const correct = results.filter(r => r.known).length;
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">{t('vocab.session_done')}</h2>
        <p className="text-slate-500 mb-6">{correct} / {words.length} {t('vocab.mastered')}</p>
        <Link href="/vocabulary" className="text-primary-600 hover:underline text-sm font-medium">← {t('vocab.title')}</Link>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="max-w-lg mx-auto outline-none" onKeyDown={handleKeyDown} tabIndex={0}>
      {/* Progress */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-primary-500 transition-all rounded-full" style={{ width: `${((index + 1) / words.length) * 100}%` }} />
        </div>
        <span className="text-xs text-slate-500 font-medium">{index + 1}/{words.length}</span>
      </div>

      {/* Hint */}
      <div className="text-center mb-8">
        <p className="text-lg font-semibold text-slate-800">{word.translation}</p>
        {word.partOfSpeech && (
          <p className="text-xs text-slate-400 mt-1">{word.partOfSpeech}</p>
        )}
      </div>

      {/* Letter boxes */}
      <div className="flex items-center justify-center gap-1.5 mb-8">
        {/* First letter (shown) */}
        <span className="w-10 h-12 flex items-center justify-center text-xl font-bold text-slate-900 border-b-3 border-primary-500 bg-primary-50 rounded-t-lg">
          {firstLetter}
        </span>
        {/* Remaining letters (input) */}
        {remaining.map((correctLetter, i) => {
          const userLetter = input[i];
          const isFilled = userLetter !== undefined;
          const isCurrent = i === input.length; // next position to fill
          const showResult = status !== 'typing';
          const isMatch = showResult && userLetter === correctLetter;
          return (
            <span key={i}
              className={`relative w-10 h-12 flex items-center justify-center text-xl font-bold rounded-t-lg border-b-3 transition-colors ${
                showResult
                  ? (isMatch ? 'bg-green-50 border-green-400 text-green-700' : 'bg-red-50 border-red-400 text-red-700')
                  : isFilled ? 'bg-white border-primary-400 text-slate-900'
                  : isCurrent ? 'bg-blue-50 border-blue-400 border-b-4 shadow-sm'
                  : 'bg-slate-50 border-blue-300 border-dashed border-b-2'
              }`}>
              {showResult ? correctLetter : (userLetter || (isCurrent ? <span className="animate-pulse text-blue-400">|</span> : ''))}
            </span>
          );
        })}
      </div>

      {/* Status feedback */}
      {status === 'correct' && (
        <div className="text-center mb-4">
          <p className="text-green-600 font-semibold text-lg">✓ {t('vocab.correct')}</p>
          {(word.phoneticUk || word.phoneticUs) && (
            <p className="text-sm text-slate-400 mt-1">
              {word.phoneticUk && <span>英[{word.phoneticUk.replace(/^\/|\/$/g, '')}]</span>}
              {word.phoneticUk && word.phoneticUs && word.phoneticUk !== word.phoneticUs && <span> 美[{word.phoneticUs.replace(/^\/|\/$/g, '')}]</span>}
            </p>
          )}
          <div className="flex gap-3 justify-center items-center mt-4">
            <button onClick={handleRetry} className="px-6 py-2.5 border-2 border-slate-300 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition-colors">
              {t('vocab.retry')}
            </button>
            <button onClick={handleCorrect} className="px-8 py-2.5 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors">
              {t('vocab.next_word')}
            </button>
          </div>
        </div>
      )}

      {status === 'wrong' && (
        <div className="text-center mb-4">
          <p className="text-red-600 font-semibold text-lg">✗ {t('vocab.wrong')}</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{word.word}</p>
          {(word.phoneticUk || word.phoneticUs) && (
            <p className="text-sm text-slate-400 mt-1">
              {word.phoneticUk && <span>英[{word.phoneticUk.replace(/^\/|\/$/g, '')}]</span>}
              {word.phoneticUk && word.phoneticUs && word.phoneticUk !== word.phoneticUs && <span> 美[{word.phoneticUs.replace(/^\/|\/$/g, '')}]</span>}
            </p>
          )}
          <div className="flex gap-3 justify-center items-center mt-4">
            <button onClick={handleRetry} className="px-6 py-2.5 border-2 border-slate-300 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition-colors">
              {t('vocab.retry')}
            </button>
            <button onClick={handleSkip} className="px-8 py-2.5 bg-slate-800 text-white rounded-xl font-semibold hover:bg-slate-900 transition-colors">
              {t('vocab.next_word')}
            </button>
          </div>
        </div>
      )}

      {status === 'typing' && (
        <div>
          <div className="flex gap-3 justify-center mb-4">
            <button onClick={handlePrev} disabled={index === 0}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-500 text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
              ← {t('vocab.prev_word')}
            </button>
          </div>
          <p className="text-center text-xs text-slate-400">{t('vocab.type_hint')}</p>
        </div>
      )}

      <p className="text-center text-xs text-slate-300 mt-4">{t('vocab.spell_hint')}</p>
    </div>
  );
}

// ═══════════════════════════════════════════
// Study Page
// ═══════════════════════════════════════════
export default function VocabStudyPage() {
  const { t } = useLang();
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const mode = searchParams.get('mode') || 'flashcard';

  const [data, setData] = useState<BookWordsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'chapter' | 'letter'>('all');
  const [selectedChapter, setSelectedChapter] = useState<string>('');
  const [selectedLetter, setSelectedLetter] = useState<string>('');
  const [studyFilter, setStudyFilter] = useState<'unstudied' | 'studied' | 'all'>('unstudied');

  useEffect(() => {
    vocabStudyService.getBookWords(slug)
      .then(setData)
      .catch((err: any) => setError(err.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, [slug]);

  const lastStudiedIndex = data?.progress?.lastStudiedIndex ?? -1;
  const studiedCount = lastStudiedIndex < 0 ? 0 : (data?.words || []).filter(w => w.wordIndex <= lastStudiedIndex).length;
  const unstudiedCount = (data?.words.length || 0) - studiedCount;

  // Filter words based on study progress and chapter/letter filters
  const filteredWords = useMemo(() => {
    let result = (data?.words || [])
      .filter(w => {
        if (studyFilter === 'studied') return w.wordIndex <= lastStudiedIndex;
        if (studyFilter === 'unstudied') return w.wordIndex > lastStudiedIndex;
        return true; // 'all'
      })
      .filter(w => {
        if (filterType === 'chapter' && selectedChapter) return w.chapter === selectedChapter;
        if (filterType === 'letter' && selectedLetter) return w.word[0]?.toLowerCase() === selectedLetter.toLowerCase();
        return true;
      });
    return result;
  }, [data?.words, filterType, selectedChapter, selectedLetter, studyFilter, lastStudiedIndex]);

  // Get unique chapters and first letters
  const chapters = [...new Set(data?.words.map(w => w.chapter).filter(Boolean) || [])];
  const letters = [...new Set(data?.words.map(w => w.word[0]?.toLowerCase()).filter(Boolean) || [])].sort();

  const handleComplete = async (results: { wordId: number; known: boolean }[]) => {
    try {
      await vocabStudyService.submitProgress(slug, results);
    } catch { /* silent */ }
  };

  // Save progress for a single word (called after each word, so progress persists on early exit)
  const saveSingleWord = async (result: { wordId: number; known: boolean }) => {
    try {
      await vocabStudyService.submitProgress(slug, [result]);
    } catch { /* silent */ }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (error || !data) {
    return <div className="text-center py-16 text-red-500">{error || 'Not found'}</div>;
  }

  return (
    <div className="max-w-3xl mx-auto py-4 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <Link href="/vocabulary" className="text-sm text-slate-400 hover:text-primary-600 transition-colors">← {t('vocab.title')}</Link>
          <h1 className="text-lg font-bold text-slate-900 mt-0">{t(`vocab.book.${data.book.slug}`) !== `vocab.book.${data.book.slug}` ? t(`vocab.book.${data.book.slug}`) : data.book.name}</h1>
        </div>
        {/* Mode toggle */}
        <div className="flex bg-slate-100 rounded-lg p-1">
          <Link
            href={`/vocabulary/study/${slug}?mode=flashcard`}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${mode === 'flashcard' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {t('vocab.cards')}
          </Link>
          <Link
            href={`/vocabulary/study/${slug}?mode=spell`}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${mode === 'spell' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {t('vocab.spell')}
          </Link>
        </div>
      </div>

{/* Filter bar — hidden for now */}
      {/* <div className="flex items-center gap-3 mb-6 flex-wrap">
        ...
      </div> */}

      {/* Study filter chips */}
      <div className="flex gap-1 bg-slate-100 rounded-lg p-1 mb-6 w-fit">
        {([
          { key: 'unstudied' as const, label: `未背 ${unstudiedCount} 词` },
          { key: 'studied' as const, label: `已背 ${studiedCount} 词` },
        ]).map(f => (
          <button key={f.key} onClick={() => setStudyFilter(f.key)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${studyFilter === f.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Mode content */}
      {filteredWords.length === 0 ? (
        <div className="text-center py-16">
          {studiedCount > 0 && studiedCount >= (data?.words.length || 0) ? (
            <>
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">All words completed!</h2>
              <p className="text-slate-500 mb-6">You've studied all {data?.words.length} words in this book.</p>
              <Link href="/vocabulary" className="text-primary-600 hover:underline text-sm font-medium">← {t('vocab.title')}</Link>
            </>
          ) : (
            <p className="text-slate-400">{t('vocab.books_empty')}</p>
          )}
        </div>
      ) : mode === 'flashcard' ? (
        <FlashcardMode words={filteredWords} onComplete={handleComplete} onWordDone={saveSingleWord} />
      ) : (
        <SpellMode words={filteredWords} onComplete={handleComplete} onWordDone={saveSingleWord} />
      )}
    </div>
  );
}
