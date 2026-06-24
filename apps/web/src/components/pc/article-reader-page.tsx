'use client';
import { useLang } from '@/lib/i18n';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Languages, Loader2 } from 'lucide-react';
import { DifficultyBadge } from '@/components/shared/DifficultyBadge';
import { WordPopup } from '@/components/shared/WordPopup';
import { articleService } from '@/services/article.service';
import type { ArticleDetail } from '@english/shared';
import type { WordAnnotationResponse } from '@/services/article.service';

interface WordClickState {
  word: WordAnnotationResponse | null;
  position: { x: number; y: number; useBottom?: boolean };
  inVocabulary: boolean;
}

export default function PCArticleReaderPage({ slug }: { slug: string }) {
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWord, setSelectedWord] = useState<WordClickState | null>(null);
  const [wordLoading, setWordLoading] = useState(false);
  const [expandedTranslations, setExpandedTranslations] = useState<Set<number>>(new Set());
  const [translations, setTranslations] = useState<Map<number, { text: string; loading: boolean }>>(new Map());
  const [inVocabSet, setInVocabSet] = useState<Set<string>>(new Set());
  const [phraseSelection, setPhraseSelection] = useState<{ text: string; x: number; y: number } | null>(null);

  const scrollRef = useRef(0);
  const timeSpentRef = useRef(0);
  const mountedRef = useRef(true);

  // ── Fetch article ──
  useEffect(() => {
    mountedRef.current = true;
    async function load() {
      try {
        const data = await articleService.getDetail(slug);
        if (mountedRef.current) {
          setArticle(data);
          if (data.vocabularyWords) {
            setInVocabSet(new Set(data.vocabularyWords));
          }
          // Restore scroll position from progress
          if (data.userProgress?.scrollPercent) {
            setTimeout(() => {
              const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
              window.scrollTo(0, (totalHeight * data.userProgress!.scrollPercent) / 100);
            }, 100);
          }
          timeSpentRef.current = data.userProgress?.timeSpentSeconds || 0;
        }
      } catch (err: any) {
        if (mountedRef.current) setError(err.message || 'Article not found');
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    }
    load();
    return () => { mountedRef.current = false; };
  }, [slug]);

  // ── Scroll progress tracking (debounced 5s) ──
  useEffect(() => {
    if (!article) return;
    let timeout: ReturnType<typeof setTimeout>;
    const handleScroll = () => {
      // Close word popup on scroll
      setSelectedWord(null);
      setPhraseSelection(null);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (totalHeight > 0) {
          scrollRef.current = Math.round((window.scrollY / totalHeight) * 100);
        }
      }, 5000);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeout);
    };
  }, [article]);

  // ── Time tracking (1s interval) + auto-save every 10s ──
  useEffect(() => {
    if (!article) return;
    const saveInterval = setInterval(async () => {
      try {
        await articleService.updateProgress(slug, {
          scrollPercent: scrollRef.current,
          timeSpentSeconds: timeSpentRef.current,
        });
      } catch {
        // Silently fail — progress saving is best-effort
      }
    }, 10000);

    const timeInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        timeSpentRef.current += 1;
      }
    }, 1000);

    // Save on page unload
    const handleUnload = () => {
      const body = JSON.stringify({
        scrollPercent: scrollRef.current,
        timeSpentSeconds: timeSpentRef.current,
      });
      navigator.sendBeacon(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/articles/${slug}/progress`,
        new Blob([body], { type: 'application/json' }),
      );
    };
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      clearInterval(saveInterval);
      clearInterval(timeInterval);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [article, slug]);

  // ── Word click handler ──
  const handleWordClick = async (e: React.MouseEvent, rawWord: string) => {
    e.stopPropagation();
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) return;
    const word = rawWord.toLowerCase().replace(/^[^a-z]+|[^a-z]+$/g, '');
    if (!word || word.length < 2) return;

    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const popupW = 456; // 440px + 16px margin
    const popupMinH = 240; // min-height of popup
    // Horizontal: clamp to viewport
    let x = rect.left;
    if (x + popupW > window.innerWidth - 16) {
      x = window.innerWidth - popupW - 16;
    }
    if (x < 16) x = 16;
    // Vertical: prefer below the word. If not enough space, anchor popup bottom to word top (grows upward)
    let y = rect.bottom + 8;
    let useBottom = false;
    if (y + popupMinH > window.innerHeight - 16) {
      // Position above: anchor bottom edge to word's top edge
      y = window.innerHeight - rect.top + 8;
      useBottom = true;
    }

    setSelectedWord({ word: null, position: { x, y, useBottom }, inVocabulary: inVocabSet.has(word) });
    setWordLoading(true);

    try {
      const result = await articleService.getWordAnnotation(slug, rawWord);
      if (mountedRef.current) {
        setSelectedWord({ word: result, position: { x, y, useBottom }, inVocabulary: result.inVocabulary || inVocabSet.has(word) });
      }
    } catch {
      // keep loading state
    } finally {
      if (mountedRef.current) setWordLoading(false);
    }
  };

  // ── Add to vocabulary ──
  const handleAddToVocabulary = async () => {
    if (!selectedWord?.word) return;
    try {
      await articleService.addVocabulary({ word: selectedWord.word.word, addedFrom: 'article_reader' });
      setInVocabSet((prev) => new Set(prev).add(selectedWord.word!.word.toLowerCase()));
      setSelectedWord((prev) => prev ? { ...prev, inVocabulary: true } : null);
    } catch (err: any) {
      alert(err.message || t('article.vocab_failed'));
    }
  };

  const handleRemoveFromVocabulary = async () => {
    if (!selectedWord?.word) return;
    try {
      const allVocab = await articleService.listVocabulary({ page: 1, pageSize: 200 });
      const found = allVocab.items.find(
        (v) => v.word.word.toLowerCase() === selectedWord.word!.word.toLowerCase()
      );
      if (found) {
        await articleService.removeVocabulary(found.id);
      }
      setInVocabSet((prev) => {
        const next = new Set(prev);
        next.delete(selectedWord.word!.word.toLowerCase());
        return next;
      });
      setSelectedWord((prev) => prev ? { ...prev, inVocabulary: false } : null);
    } catch (err: any) {
      alert(err.message || t('article.vocab_remove_failed'));
    }
  };

  // ── Phrase selection lookup ──
  const handlePhraseLookup = async () => {
    if (!phraseSelection) return;
    const phrase = phraseSelection.text;
    const pos = phraseSelection;
    setSelectedWord({ word: null, position: { x: pos.x, y: pos.y, useBottom: false }, inVocabulary: false });
    setPhraseSelection(null);
    setWordLoading(true);
    try {
      const result = await articleService.getWordAnnotation(slug, phrase);
      if (mountedRef.current) {
        setSelectedWord({ word: result, position: { x: pos.x, y: pos.y, useBottom: false }, inVocabulary: false });
      }
    } catch { /* ignore */ } finally {
      if (mountedRef.current) setWordLoading(false);
    }
  };

  // ── Text selection handler ──
  const handleMouseUp = () => {
    // Small delay so selection is available
    setTimeout(() => {
      const sel = window.getSelection();
      if (!sel || !mountedRef.current) return;
      const text = sel.toString().trim();
      if (text.length < 2 || text.split(/\s+/).length > 6) {
        setPhraseSelection(null);
        return;
      }
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setPhraseSelection({
        text,
        x: Math.min(rect.left, window.innerWidth - 200),
        y: rect.bottom + 6,
      });
    }, 50);
  };

  // ── Toggle translation ──
  const toggleTranslation = async (paragraphId: number) => {
    const current = expandedTranslations.has(paragraphId);
    if (current) {
      setExpandedTranslations((prev) => {
        const next = new Set(prev);
        next.delete(paragraphId);
        return next;
      });
      return;
    }

    setExpandedTranslations((prev) => new Set(prev).add(paragraphId));

    // Fetch translation if not cached
    if (!translations.has(paragraphId)) {
      setTranslations((prev) => {
        const next = new Map(prev);
        next.set(paragraphId, { text: '', loading: true });
        return next;
      });
      try {
        const result = await articleService.translateParagraph(slug, paragraphId);
        setTranslations((prev) => {
          const next = new Map(prev);
          next.set(paragraphId, { text: result.translation, loading: false });
          return next;
        });
      } catch {
        setTranslations((prev) => {
          const next = new Map(prev);
          next.set(paragraphId, { text: 'Translation failed, please retry', loading: false });
          return next;
        });
      }
    }
  };

  // ── Parse paragraph into word tokens ──
  const renderParagraph = (contentEn: string) => {
    const tokens = contentEn.split(/(\s+)/);
    return tokens.map((token, i) => {
      if (!/[a-zA-Z]/.test(token)) return <span key={i}>{token}</span>;

      // Strip surrounding punctuation to get the clean word
      const clean = token.replace(/^[^a-zA-Z]+|[^a-zA-Z]+$/g, '');
      if (clean.length < 1) return <span key={i}>{token}</span>;

      const wordLower = clean.toLowerCase();
      const isInVocab = wordLower.length >= 2 && inVocabSet.has(wordLower);

      return (
        <span
          key={i}
          className={isInVocab ? 'word-in-vocab' : 'word-clickable'}
          onClick={(e) => handleWordClick(e, clean)}
        >
          {token}
        </span>
      );
    });
  };

  // ── Loading state ──
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-slate-200 rounded w-24" />
          <div className="h-8 bg-slate-200 rounded w-3/4" />
          <div className="h-4 bg-slate-200 rounded w-1/2" />
          <div className="space-y-2 mt-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-4 bg-slate-100 rounded w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (error || !article) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center">
        <span className="text-6xl block mb-4">📄</span>
        <p className="text-slate-500 text-lg mb-4">{error || 'Article not found'}</p>
        <Link href="/articles" className="text-primary-600 hover:text-primary-700 font-medium">
          ← 返回文章列表
        </Link>
      </div>
    );
  }

  const level = article.difficultyLevel as 'short' | 'medium' | 'long';

  return (
    <div className="relative">
      {/* Back navigation */}
      <div className="mb-6">
        <Link
          href="/articles"
          className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-700 transition-colors text-sm"
        >
          <ArrowLeft size={16} />
          返回文章列表
        </Link>
      </div>

      <div className="flex gap-8">
        {/* Main reading area */}
        <article className="flex-1 min-w-0 max-w-3xl" onMouseUp={handleMouseUp}>
          {/* Article header */}
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2 leading-tight">
              {article.title}
            </h1>
            {article.titleZh && <p className="text-lg text-slate-500 mb-4">{article.titleZh}</p>}
            <div className="flex items-center gap-4 text-sm text-slate-500 flex-wrap">
              <DifficultyBadge level={level} />
              {article.source && <span>Source: {article.source}</span>}
              <span>{article.wordCount} words</span>
              {article.publishDate && (
                <span>{new Date(article.publishDate).toLocaleDateString('zh-CN')}</span>
              )}
            </div>
          </header>

          {/* Cover image */}
          {article.coverImage && (
            <div className="mb-8 rounded-xl overflow-hidden">
              <img src={article.coverImage} alt="" className="w-full object-cover max-h-96" />
            </div>
          )}

          {/* Article summary */}
          {article.summary && (
            <div className="mb-8 p-4 bg-slate-50 rounded-lg border-l-4 border-primary-400">
              <p className="text-slate-600 leading-relaxed">{article.summary}</p>
            </div>
          )}

          {/* Paragraphs */}
          <div className="space-y-6">
            {article.paragraphs.map((para) => (
              <div key={para.id} className="group">
                <p className="text-lg leading-relaxed text-slate-800">
                  {renderParagraph(para.contentEn)}
                </p>

                {/* Translate button */}
                <div className="mt-2">
                  <button
                    onClick={() => toggleTranslation(para.id)}
                    className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-primary-600 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Languages size={14} />
                    翻译
                  </button>
                </div>

                {/* Translation */}
                {expandedTranslations.has(para.id) && (
                  <div className="mt-2 p-3 bg-primary-50 rounded-lg border border-primary-100">
                    {translations.get(para.id)?.loading ? (
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Loader2 size={14} className="animate-spin" />
                        Translating...
                      </div>
                    ) : (
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {translations.get(para.id)?.text || para.contentZh || 'No translation yet'}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Article footer */}
          <div className="mt-12 pt-6 border-t border-slate-200 text-center text-sm text-slate-400">
            <p>— 已阅读完毕 —</p>
          </div>
        </article>

        {/* Sidebar spacer - keeps reading area centered */}
        <div className="hidden lg:block w-80 flex-shrink-0" />
      </div>

      {/* Phrase selection button */}
      {phraseSelection && (
        <button
          className="fixed z-50 bg-primary-600 text-white px-3 py-1.5 rounded-lg shadow-lg text-sm font-medium hover:bg-primary-700 transition-colors"
          style={{ left: `${phraseSelection.x}px`, top: `${phraseSelection.y}px` }}
          onClick={handlePhraseLookup}
        >
          查词: &ldquo;{phraseSelection.text}&rdquo;
        </button>
      )}

      {/* Word popup */}
      {selectedWord && (
        <WordPopup
          word={selectedWord.word}
          inVocabulary={selectedWord.inVocabulary}
          onClose={() => setSelectedWord(null)}
          onAddToVocabulary={handleAddToVocabulary}
          onRemoveFromVocabulary={handleRemoveFromVocabulary}
          position={selectedWord.position}
          isMobile={false}
          loading={wordLoading}
        />
      )}
    </div>
  );
}
