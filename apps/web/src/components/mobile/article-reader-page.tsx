'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Languages, Loader2 } from 'lucide-react';
import { DifficultyBadge } from '@/components/shared/DifficultyBadge';
import { WordPopup } from '@/components/shared/WordPopup';
import { articleService } from '@/services/article.service';
import type { ArticleDetail } from '@english/shared';
import type { WordAnnotationResponse } from '@/services/article.service';

interface WordClickState {
  word: WordAnnotationResponse | null;
  inVocabulary: boolean;
}

export default function MobileArticleReaderPage({ slug }: { slug: string }) {
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

  // ── Scroll progress tracking ──
  useEffect(() => {
    if (!article) return;
    let timeout: ReturnType<typeof setTimeout>;
    const handleScroll = () => {
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

  // ── Time tracking + auto-save ──
  useEffect(() => {
    if (!article) return;
    const saveInterval = setInterval(async () => {
      try {
        await articleService.updateProgress(slug, {
          scrollPercent: scrollRef.current,
          timeSpentSeconds: timeSpentRef.current,
        });
      } catch { /* best-effort */ }
    }, 10000);

    const timeInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        timeSpentRef.current += 1;
      }
    }, 1000);

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

  // ── Word click handler (mobile: no position needed) ──
  const handleWordClick = async (e: React.MouseEvent, rawWord: string) => {
    e.stopPropagation();
    // Ignore if user has selected text
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) return;
    const word = rawWord.toLowerCase().replace(/^[^a-z]+|[^a-z]+$/g, '');
    if (!word || word.length < 2) return;

    setSelectedWord({ word: null, inVocabulary: inVocabSet.has(word) });
    setWordLoading(true);

    try {
      const result = await articleService.getWordAnnotation(slug, rawWord);
      if (mountedRef.current) {
        setSelectedWord({ word: result, inVocabulary: result.inVocabulary || inVocabSet.has(word) });
      }
    } catch {
      // Keep position for error display
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
      alert(err.message || '添加生词失败，请先登录');
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
      alert(err.message || '移除生词失败');
    }
  };

  // ── Phrase selection lookup ──
  const handlePhraseLookup = async () => {
    if (!phraseSelection) return;
    const phrase = phraseSelection.text;
    const pos = phraseSelection;
    setSelectedWord({ word: null, inVocabulary: false });
    setPhraseSelection(null);
    setWordLoading(true);
    try {
      const result = await articleService.getWordAnnotation(slug, phrase);
      if (mountedRef.current) {
        setSelectedWord({ word: result, inVocabulary: false });
      }
    } catch { /* ignore */ } finally {
      if (mountedRef.current) setWordLoading(false);
    }
  };

  // ── Text selection handler ──
  const handleMouseUp = () => {
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

  // ── Render paragraph tokens ──
  const renderParagraph = (contentEn: string) => {
    const tokens = contentEn.split(/(\s+)/);
    return tokens.map((token, i) => {
      if (!/[a-zA-Z]/.test(token)) return <span key={i}>{token}</span>;

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

  // ── Loading ──
  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-3 bg-slate-200 rounded w-20" />
        <div className="h-6 bg-slate-200 rounded w-full" />
        <div className="h-4 bg-slate-200 rounded w-1/2" />
        <div className="space-y-2 mt-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-3 bg-slate-100 rounded w-full" />
          ))}
        </div>
      </div>
    );
  }

  // ── Error ──
  if (error || !article) {
    return (
      <div className="text-center py-12">
        <span className="text-5xl block mb-3">📄</span>
        <p className="text-slate-500 mb-4">{error || 'Article not found'}</p>
        <Link href="/articles" className="text-primary-600 font-medium">
          ← 返回
        </Link>
      </div>
    );
  }

  const level = article.difficultyLevel as 'short' | 'medium' | 'long';

  return (
    <div>
      {/* Back link */}
      <Link
        href="/articles"
        className="inline-flex items-center gap-1 text-slate-500 text-sm mb-4"
      >
        <ArrowLeft size={16} />
        返回
      </Link>

      {/* Article header */}
      <h1 className="text-xl font-bold text-slate-900 mb-1 leading-snug">{article.title}</h1>
      {article.titleZh && <p className="text-sm text-slate-500 mb-3">{article.titleZh}</p>}
      <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap mb-4">
        <DifficultyBadge level={level} />
        {article.source && <span>{article.source}</span>}
        <span>{article.wordCount} 词</span>
      </div>

      {/* Cover image */}
      {article.coverImage && (
        <div className="mb-5 rounded-lg overflow-hidden">
          <img src={article.coverImage} alt="" className="w-full object-cover max-h-56" />
        </div>
      )}

      {/* Summary */}
      {article.summary && (
        <div className="mb-5 p-3 bg-slate-50 rounded-lg border-l-4 border-primary-400">
          <p className="text-sm text-slate-600 leading-relaxed">{article.summary}</p>
        </div>
      )}

      {/* Paragraphs */}
      <div className="space-y-5" onMouseUp={handleMouseUp}>
        {article.paragraphs.map((para) => (
          <div key={para.id}>
            <p className="text-base leading-relaxed text-slate-800">
              {renderParagraph(para.contentEn)}
            </p>

            {/* Translate toggle */}
            <button
              onClick={() => toggleTranslation(para.id)}
              className="mt-1.5 inline-flex items-center gap-1 text-xs text-primary-500 active:text-primary-700"
            >
              <Languages size={13} />
              翻译
            </button>

            {/* Translation */}
            {expandedTranslations.has(para.id) && (
              <div className="mt-2 p-2.5 bg-primary-50 rounded-lg border border-primary-100">
                {translations.get(para.id)?.loading ? (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Loader2 size={12} className="animate-spin" />
                    翻译中...
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

      {/* End marker */}
      <p className="text-center text-xs text-slate-400 mt-8 mb-4">— 已阅读完毕 —</p>

      {/* Phrase selection button */}
      {phraseSelection && (
        <button
          className="fixed z-50 bg-primary-600 text-white px-3 py-1.5 rounded-full shadow-lg text-sm font-medium hover:bg-primary-700 transition-colors"
          style={{ left: `${phraseSelection.x}px`, top: `${phraseSelection.y}px` }}
          onClick={handlePhraseLookup}
        >
          查词: &ldquo;{phraseSelection.text}&rdquo;
        </button>
      )}

      {/* Word bottom sheet (mobile) */}
      {selectedWord && (
        <WordPopup
          word={selectedWord.word}
          inVocabulary={selectedWord.inVocabulary}
          onClose={() => setSelectedWord(null)}
          onAddToVocabulary={handleAddToVocabulary}
          onRemoveFromVocabulary={handleRemoveFromVocabulary}
          isMobile={true}
          loading={wordLoading}
        />
      )}
    </div>
  );
}
