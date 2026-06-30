import prisma from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

function formatWordAnnotation(wa: any) {
  let examples = null;
  if (wa.examplesJson) { try { examples = JSON.parse(wa.examplesJson); } catch {} }
  return {
    word: wa.word,
    phoneticUk: wa.phoneticUk || null,
    phoneticUs: wa.phoneticUs || null,
    translation: wa.translation,
    partOfSpeech: wa.partOfSpeech,
    examples,
  };
}

export class VocabularyService {
  // ── Add Word to Vocabulary ──
  async addWord(userId: number, rawWord: string, addedFrom?: string) {
    // Normalize word
    const word = rawWord.toLowerCase().trim().replace(/^[^a-z]+|[^a-z]+$/g, '');

    if (!word) {
      throw new AppError(400, 'Invalid word', 'INVALID_WORD');
    }

    // Find or create WordAnnotation
    let annotation = await prisma.wordAnnotation.findUnique({
      where: { word },
    });

    if (!annotation) {
      annotation = await prisma.wordAnnotation.create({
        data: {
          word,
          translation: '[Pending]',
        },
      });
    }

    // Upsert UserVocabulary — only set addedFrom on creation
    const existing = await prisma.userVocabulary.findUnique({
      where: {
        userId_wordAnnotationId: {
          userId,
          wordAnnotationId: annotation.id,
        },
      },
    });

    if (existing) {
      // Already in vocabulary — return existing with word annotation
      return {
        id: existing.id,
        word: formatWordAnnotation(annotation),
        masteryLevel: existing.masteryLevel,
        nextReviewAt: existing.nextReviewAt?.toISOString() ?? null,
        reviewCount: existing.reviewCount,
        addedFrom: existing.addedFrom,
        createdAt: existing.createdAt.toISOString(),
      };
    }

    const vocab = await prisma.userVocabulary.create({
      data: {
        userId,
        wordAnnotationId: annotation.id,
        addedFrom: addedFrom || 'article_reader',
      },
    });

    return {
      id: vocab.id,
      word: formatWordAnnotation(annotation),
      masteryLevel: vocab.masteryLevel,
      nextReviewAt: vocab.nextReviewAt?.toISOString() ?? null,
      reviewCount: vocab.reviewCount,
      addedFrom: vocab.addedFrom,
      createdAt: vocab.createdAt.toISOString(),
    };
  }

  // ── List User Vocabulary ──
  async listVocabulary(userId: number, page: number, pageSize: number) {
    const where = { userId };

    const [items, total] = await Promise.all([
      prisma.userVocabulary.findMany({
        where,
        include: { wordAnnotation: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.userVocabulary.count({ where }),
    ]);

    const serialized = items.map((v) => ({
      id: v.id,
      word: formatWordAnnotation(v.wordAnnotation),
      masteryLevel: v.masteryLevel,
      nextReviewAt: v.nextReviewAt?.toISOString() ?? null,
      reviewCount: v.reviewCount,
      addedFrom: v.addedFrom,
      createdAt: v.createdAt.toISOString(),
    }));

    return {
      items: serialized,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  // ── Remove Word from Vocabulary ──
  async removeWord(vocabId: number, userId: number) {
    const vocab = await prisma.userVocabulary.findUnique({
      where: { id: vocabId },
    });

    if (!vocab || vocab.userId !== userId) {
      throw new AppError(404, 'Vocabulary word not found', 'NOT_FOUND');
    }

    await prisma.userVocabulary.delete({ where: { id: vocabId } });

    return { ok: true };
  }

  // ── List Vocabulary Books ──
  async listBooks() {
    const books = await prisma.vocabularyBook.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true, name: true, slug: true, description: true, category: true,
        totalWords: true, isMembershipOnly: true,
      },
    });
    return books;
  }

  // ── Get Words for Study ──
  async getBookWords(slug: string, userId?: number) {
    const book = await prisma.vocabularyBook.findUnique({ where: { slug } });
    if (!book) throw new AppError(404, 'Book not found', 'NOT_FOUND');

    const words = await prisma.vocabularyWord.findMany({
      where: { bookId: book.id },
      orderBy: { wordIndex: 'asc' },
      include: { wordAnnotation: true },
    });

    // Get user progress if authenticated
    let userProgress: any = null;
    if (userId) {
      userProgress = await prisma.vocabularyBookProgress.findUnique({
        where: { userId_bookId: { userId, bookId: book.id } },
      });
    }

    return {
      book: { id: book.id, name: book.name, slug: book.slug, totalWords: book.totalWords },
      words: words.map(w => ({
        id: w.id,
        wordIndex: w.wordIndex,
        word: w.word,
        chapter: w.chapter,
        phoneticUk: w.wordAnnotation?.phoneticUk || null,
        phoneticUs: w.wordAnnotation?.phoneticUs || null,
        partOfSpeech: w.partOfSpeech || w.wordAnnotation?.partOfSpeech || null,
        translation: w.translation || w.wordAnnotation?.translation || '',
        examples: (() => { try { return w.wordAnnotation?.examplesJson ? JSON.parse(w.wordAnnotation.examplesJson) : null; } catch { return null; } })(),
      })),
      progress: userProgress ? {
        learnedCount: userProgress.learnedCount,
        reviewingCount: userProgress.reviewingCount,
        masteredCount: userProgress.masteredCount,
        lastStudiedIndex: userProgress.lastStudiedIndex,
      } : null,
    };
  }

  // ── Update Study Progress (simple spaced repetition) ──
  async updateStudyProgress(userId: number, slug: string, results: { wordId: number; known: boolean }[]) {
    const book = await prisma.vocabularyBook.findUnique({ where: { slug } });
    if (!book) throw new AppError(404, 'Book not found', 'NOT_FOUND');

    let learned = 0, reviewing = 0, mastered = 0;

    for (const r of results) {
      const vocabWord = await prisma.vocabularyWord.findUnique({ where: { id: r.wordId } });
      if (!vocabWord || vocabWord.bookId !== book.id) continue;

      // Link word to WordAnnotation if not already
      if (!vocabWord.wordAnnotationId) {
        const ann = await prisma.wordAnnotation.upsert({
          where: { word: vocabWord.word.toLowerCase() },
          create: { word: vocabWord.word.toLowerCase(), translation: vocabWord.translation || '[Pending]' },
          update: {},
        });
        await prisma.vocabularyWord.update({ where: { id: vocabWord.id }, data: { wordAnnotationId: ann.id } });
      }

      const annId = vocabWord.wordAnnotationId || (await prisma.wordAnnotation.findUnique({ where: { word: vocabWord.word.toLowerCase() } }))?.id;
      if (!annId) continue;

      // Upsert UserVocabulary with spaced repetition
      const existing = await prisma.userVocabulary.findUnique({
        where: { userId_wordAnnotationId: { userId, wordAnnotationId: annId } },
      });

      const intervals = [1, 3, 7, 30]; // masteryLevel 0→1→2→3→4→5(mastered)
      if (r.known) {
        const newLevel = Math.min(5, (existing?.masteryLevel ?? 0) + 1);
        const intervalDays = newLevel >= 5 ? null : intervals[Math.min(newLevel - 1, intervals.length - 1)] ?? 30;
        const nextReview = intervalDays ? new Date(Date.now() + intervalDays * 86400000) : null;

        await prisma.userVocabulary.upsert({
          where: { userId_wordAnnotationId: { userId, wordAnnotationId: annId } },
          create: { userId, wordAnnotationId: annId, masteryLevel: newLevel, nextReviewAt: nextReview, reviewCount: 1 },
          update: { masteryLevel: newLevel, nextReviewAt: nextReview, reviewCount: { increment: 1 }, lastReviewedAt: new Date() },
        });

        if (newLevel >= 5) mastered++; else reviewing++;
      } else {
        // Reset to level 0, review tomorrow
        await prisma.userVocabulary.upsert({
          where: { userId_wordAnnotationId: { userId, wordAnnotationId: annId } },
          create: { userId, wordAnnotationId: annId, masteryLevel: 0, nextReviewAt: new Date(Date.now() + 86400000), reviewCount: 1 },
          update: { masteryLevel: 0, nextReviewAt: new Date(Date.now() + 86400000), reviewCount: { increment: 1 }, lastReviewedAt: new Date() },
        });
        learned++;
      }
    }

    // Compute max wordIndex from submitted results
    let maxWordIndex = -1;
    for (const r of results) {
      const vw = await prisma.vocabularyWord.findUnique({ where: { id: r.wordId }, select: { wordIndex: true } });
      if (vw && vw.wordIndex > maxWordIndex) maxWordIndex = vw.wordIndex;
    }

    // Update book progress
    await prisma.vocabularyBookProgress.upsert({
      where: { userId_bookId: { userId, bookId: book.id } },
      create: { userId, bookId: book.id, learnedCount: learned, reviewingCount: reviewing, masteredCount: mastered, lastStudiedIndex: maxWordIndex, lastStudiedAt: new Date() },
      update: {
        learnedCount: { increment: learned },
        reviewingCount: reviewing > 0 ? { increment: reviewing } : undefined,
        masteredCount: { increment: mastered },
        lastStudiedIndex: maxWordIndex,   // always update to the furthest position
        lastStudiedAt: new Date(),
      },
    });

    return { learned, reviewing, mastered };
  }

  // ── Search Word in Dictionary ──
  async searchWord(query: string) {
    const q = query.toLowerCase().trim();

    // If query contains space, search Collocation table first
    if (q.includes(' ')) {
      const colMatches = await prisma.collocation.findMany({
        where: { phrase: { startsWith: q } },
        take: 8,
        orderBy: { phrase: 'asc' },
        include: { words: true },
      });
      const results = await Promise.all(colMatches.map(async c => {
        const relatedWords = await Promise.all(
          c.words.map(async cw => {
            const wa = await prisma.wordAnnotation.findFirst({ where: { word: cw.word } });
            return { word: cw.word, translation: wa?.translation || '' };
          })
        );
        let examples = null;
        try { if ((c as any).examplesJson) examples = JSON.parse((c as any).examplesJson); } catch {}
        return {
          word: c.phrase,
          phoneticUk: null,
          phoneticUs: null,
          translation: c.translation,
          partOfSpeech: 'phrase',
          isCollocation: true,
          relatedWords,
          examples,
        };
      }));
      return results;
    }

    // Try exact/starts-with match first
    let annotations = await prisma.wordAnnotation.findMany({
      where: { word: { startsWith: q } },
      take: 10,
      orderBy: { word: 'asc' },
      include: { tags: { include: { tag: true } } },
    });

    // If no results, try stripping common suffixes to find root word
    if (annotations.length === 0) {
      const suffixes = ['tion', 'sion', 'ness', 'ment', 'ity', 'ly', 'able', 'ible', 'ful', 'less', 'ous', 'ive', 'al', 'er', 'est', 'ed', 'ing'];
      for (const suffix of suffixes) {
        if (q.endsWith(suffix) && q.length > suffix.length + 2) {
          const root = q.slice(0, -suffix.length);
          annotations = await prisma.wordAnnotation.findMany({
            where: { word: { startsWith: root } },
            take: 10,
            orderBy: { word: 'asc' },
            include: { tags: { include: { tag: true } } },
          });
          if (annotations.length > 0) break;
        }
      }
    }

    // Also try removing trailing 's' (plural/third-person)
    if (annotations.length === 0 && q.endsWith('s') && q.length > 3) {
      annotations = await prisma.wordAnnotation.findMany({
        where: { word: { startsWith: q.slice(0, -1) } },
        take: 10,
        orderBy: { word: 'asc' },
        include: { tags: { include: { tag: true } } },
      });
    }

    // Load books, derived forms, and form texts for all annotations
    const results = await Promise.all(annotations.map(async a => {
      let examples = null;
      try { if (a.examplesJson) examples = JSON.parse(a.examplesJson); } catch {}

      // Books this word appears in
      const vocabWords = await prisma.vocabularyWord.findMany({
        where: { wordAnnotationId: a.id },
        include: { book: { select: { name: true, slug: true, category: true } } },
      });
      const books = vocabWords.map(v => v.book);

      // Load associated forms via self-referencing fields (categorized)
      const noun = a.nounId ? await prisma.wordAnnotation.findUnique({ where: { id: a.nounId }, select: { word: true, translation: true, partOfSpeech: true } }) : null;
      const verb = a.verbId ? await prisma.wordAnnotation.findUnique({ where: { id: a.verbId }, select: { word: true, translation: true, partOfSpeech: true } }) : null;
      const adj = a.adjId ? await prisma.wordAnnotation.findUnique({ where: { id: a.adjId }, select: { word: true, translation: true, partOfSpeech: true } }) : null;
      const adv = a.advId ? await prisma.wordAnnotation.findUnique({ where: { id: a.advId }, select: { word: true, translation: true, partOfSpeech: true } }) : null;
      const pastTense = a.pastTenseId ? await prisma.wordAnnotation.findUnique({ where: { id: a.pastTenseId }, select: { word: true, translation: true, partOfSpeech: true } }) : null;
      const pastParticiple = a.pastParticipleId ? await prisma.wordAnnotation.findUnique({ where: { id: a.pastParticipleId }, select: { word: true, translation: true, partOfSpeech: true } }) : null;

      // Collocations for this word
      const colRows = await prisma.collocationWord.findMany({
        where: { word: a.word },
        include: { collocation: { select: { phrase: true, translation: true } } },
      });
      const collocations = colRows.length > 0 ? colRows.map(cw => ({ phrase: cw.collocation.phrase, translation: cw.collocation.translation })) : undefined;

      return {
        word: a.word,
        phoneticUk: a.phoneticUk,
        phoneticUs: a.phoneticUs,
        translation: a.translation,
        partOfSpeech: a.partOfSpeech,
        examples,
        tags: a.tags.map(t => t.tag.name),
        thirdPersonSingular: a.thirdPersonSingular || undefined,
        plural: a.plural || undefined,
        books: books.length > 0 ? books : undefined,
        forms: {
          noun, verb, adj, adv,
          pastTense, pastParticiple,
        },
        collocations,
      };
    }));

    // Also search Collocation table for phrase matches
    const colMatches = await prisma.collocation.findMany({
      where: { phrase: { startsWith: q } },
      take: 5,
      orderBy: { phrase: 'asc' },
      select: { phrase: true, translation: true },
    });
    const collocationResults = colMatches.map(c => ({
      word: c.phrase,
      phoneticUk: null,
      phoneticUs: null,
      translation: c.translation,
      partOfSpeech: 'phrase',
      isCollocation: true,
    }));

    return [...results, ...collocationResults];
  }
}

export const vocabularyService = new VocabularyService();
