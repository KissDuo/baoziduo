'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useLang } from '@/lib/i18n';
import { vocabStudyService, type VocabWord, type BookWordsResponse } from '@/services/vocabulary.service';

// ═══════════════════════════════════════════
// Flashcard Mode
// ═══════════════════════════════════════════
function FlashcardMode({ words, onComplete }: { words: VocabWord[]; onComplete: (results: { wordId: number; known: boolean }[]) => void }) {
  const { t } = useLang();
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [results, setResults] = useState<{ wordId: number; known: boolean }[]>([]);
  const [finished, setFinished] = useState(false);

  const word = words[index];
  if (!word) return null;

  const handleKnown = (known: boolean) => {
    const next = [...results, { wordId: word.id, known }];
    setResults(next);
    setFlipped(false);
    if (index + 1 < words.length) {
      setIndex(index + 1);
    } else {
      setFinished(true);
      onComplete(next);
    }
  };

  if (finished) {
    const known = results.filter(r => r.known).length;
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">{t('vocab.session_done')}</h2>
        <p className="text-slate-500 mb-6">{known} / {words.length} {t('vocab.mastered')}</p>
        <Link href="/vocabulary" className="text-primary-600 hover:underline text-sm font-medium">← {t('vocab.title')}</Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Progress */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-primary-500 transition-all rounded-full" style={{ width: `${((index + 1) / words.length) * 100}%` }} />
        </div>
        <span className="text-xs text-slate-500 font-medium">{index + 1}/{words.length}</span>
      </div>

      {/* Card */}
      <div
        onClick={() => setFlipped(!flipped)}
        className="bg-white rounded-2xl border-2 border-slate-200 p-8 min-h-[320px] flex flex-col items-center justify-center cursor-pointer hover:shadow-lg transition-all select-none"
      >
        <h2 className="text-3xl font-extrabold text-slate-900 mb-4">{word.word}</h2>

        {(word.phoneticUk || word.phoneticUs) && (
          <p className="text-sm text-slate-400 mb-3">
            {word.phoneticUk && <span>英[{word.phoneticUk.replace(/^\/|\/$/g, '')}]</span>}
            {word.phoneticUk && word.phoneticUs && word.phoneticUk !== word.phoneticUs && <span> 美[{word.phoneticUs.replace(/^\/|\/$/g, '')}]</span>}
          </p>
        )}

        {word.partOfSpeech && (
          <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2.5 py-0.5 rounded-full mb-3">
            {word.partOfSpeech}
          </span>
        )}

        {/* Flipped content */}
        {flipped && (
          <div className="mt-4 text-center w-full border-t border-slate-100 pt-4">
            <p className="text-lg font-semibold text-slate-800 mb-4">{word.translation}</p>
            {(word.examples && word.examples.length > 0) && (
              <div className="space-y-2 text-left">
                {word.examples.slice(0, 3).map((ex, i) => (
                  <div key={i} className="bg-slate-50 rounded-lg p-3">
                    <p className="text-sm text-slate-700">
                      {ex.en.split(new RegExp(`(${word.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')).map((part: string, j: number) =>
                        part.toLowerCase() === word.word.toLowerCase()
                          ? <strong key={j} className="text-blue-600 font-bold">{part}</strong> : part
                      )}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">{ex.zh}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <p className="text-center text-xs text-slate-400 mt-3">{t('vocab.tap_flip')}</p>

      {/* Actions — always visible */}
      <div className="flex gap-3 mt-6">
        <button onClick={() => handleKnown(false)} className="flex-1 py-3 rounded-xl border-2 border-red-200 text-red-600 font-semibold hover:bg-red-50 transition-colors">
          {t('vocab.dont_know')}
        </button>
        <button onClick={() => handleKnown(true)} className="flex-1 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors">
          {t('vocab.know')}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// Spell Mode (character-by-character)
// ═══════════════════════════════════════════
function SpellMode({ words, onComplete }: { words: VocabWord[]; onComplete: (results: { wordId: number; known: boolean }[]) => void }) {
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
    if (e.key === 'Enter' && status !== 'typing') {
      handleNext();
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

  const handleNext = () => {
    const isCorrect = status === 'correct';
    const next = [...results, { wordId: word.id, known: isCorrect }];
    setResults(next);
    if (index + 1 < words.length) {
      setIndex(index + 1);
    } else {
      setFinished(true);
      onComplete(next);
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
          <div className="flex gap-3 justify-center mt-4">
            <button onClick={handleRetry} className="px-6 py-2.5 border-2 border-slate-300 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition-colors">
              {t('vocab.retry')}
            </button>
            <button onClick={handleNext} className="px-8 py-2.5 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors">
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
          <div className="flex gap-3 justify-center mt-4">
            <button onClick={handleRetry} className="px-6 py-2.5 border-2 border-slate-300 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition-colors">
              {t('vocab.retry')}
            </button>
            <button onClick={handleNext} className="px-8 py-2.5 bg-slate-800 text-white rounded-xl font-semibold hover:bg-slate-900 transition-colors">
              {t('vocab.next_word')}
            </button>
          </div>
        </div>
      )}

      {status === 'typing' && (
        <p className="text-center text-xs text-slate-400">{t('vocab.type_hint')}</p>
      )}
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
  const [randomMode, setRandomMode] = useState(false);

  useEffect(() => {
    vocabStudyService.getBookWords(slug)
      .then(setData)
      .catch((err: any) => setError(err.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, [slug]);

  // Filter words
  const filteredWords = useMemo(() => {
    let result = data?.words.filter(w => {
      if (filterType === 'chapter' && selectedChapter) return w.chapter === selectedChapter;
      if (filterType === 'letter' && selectedLetter) return w.word[0]?.toLowerCase() === selectedLetter.toLowerCase();
      return true;
    }) || [];
    if (randomMode) {
      // Fisher-Yates shuffle
      const arr = [...result];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j]!, arr[i]!];
      }
      return arr;
    }
    return result;
  }, [data?.words, filterType, selectedChapter, selectedLetter, randomMode]);

  // Get unique chapters and first letters
  const chapters = [...new Set(data?.words.map(w => w.chapter).filter(Boolean) || [])];
  const letters = [...new Set(data?.words.map(w => w.word[0]?.toLowerCase()).filter(Boolean) || [])].sort();

  const handleComplete = async (results: { wordId: number; known: boolean }[]) => {
    try {
      await vocabStudyService.submitProgress(slug, results);
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
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/vocabulary" className="text-sm text-slate-400 hover:text-primary-600 transition-colors">← {t('vocab.title')}</Link>
          <h1 className="text-lg font-bold text-slate-900 mt-1">{data.book.name}</h1>
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

      {/* Filter bar */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="flex bg-slate-100 rounded-lg p-1">
          {(['all', 'chapter', 'letter'] as const).map(f => (
            <button key={f} onClick={() => { setFilterType(f); setSelectedChapter(''); setSelectedLetter(''); }}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${filterType === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              {f === 'all' ? t('vocab.filter_all') : f === 'chapter' ? t('vocab.filter_chapter') : t('vocab.filter_letter')}
            </button>
          ))}
        </div>
        {filterType === 'chapter' && (
          <select value={selectedChapter} onChange={e => setSelectedChapter(e.target.value)}
            className="text-sm border border-slate-300 rounded-lg px-3 py-1.5 bg-white text-slate-700">
            <option value="">All Chapters</option>
            {chapters.map(c => <option key={c} value={c!}>{c}</option>)}
          </select>
        )}
        {filterType === 'letter' && (
          <select value={selectedLetter} onChange={e => setSelectedLetter(e.target.value)}
            className="text-sm border border-slate-300 rounded-lg px-3 py-1.5 bg-white text-slate-700">
            <option value="">All Letters</option>
            {letters.map(l => <option key={l} value={l!}>{l!.toUpperCase()}</option>)}
          </select>
        )}
        <button onClick={() => setRandomMode(!randomMode)}
          className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${randomMode ? 'bg-primary-600 text-white shadow-md shadow-primary-200 scale-105' : 'bg-slate-100 text-slate-500 hover:text-slate-700'}`}>
          🔀 {t('vocab.random')}
        </button>
        <span className="text-xs text-slate-400">{t('vocab.words_count', { n: filteredWords.length })}</span>
      </div>

      {/* Progress info */}
      {data.progress && (
        <div className="flex gap-4 mb-6 text-xs text-slate-500">
          <span>{t('vocab.mastered')}: {data.progress.masteredCount}</span>
          <span>{t('vocab.reviewing')}: {data.progress.reviewingCount}</span>
          <span>{t('vocab.learning')}: {data.progress.learnedCount}</span>
        </div>
      )}

      {/* Mode content */}
      {filteredWords.length === 0 ? (
        <p className="text-center text-slate-400 py-12">{t('vocab.books_empty')}</p>
      ) : mode === 'flashcard' ? (
        <FlashcardMode words={filteredWords} onComplete={handleComplete} />
      ) : (
        <SpellMode words={filteredWords} onComplete={handleComplete} />
      )}
    </div>
  );
}
