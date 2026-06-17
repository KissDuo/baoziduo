import prisma from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

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
        word: {
          word: annotation.word,
          phonetic: annotation.phonetic,
          translation: annotation.translation,
          partOfSpeech: annotation.partOfSpeech,
          definitionEn: annotation.definitionEn,
          exampleSentence: annotation.exampleSentence,
          aiAnalysis: annotation.aiAnalysis,
        },
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
      word: {
        word: annotation.word,
        phonetic: annotation.phonetic,
        translation: annotation.translation,
        partOfSpeech: annotation.partOfSpeech,
        definitionEn: annotation.definitionEn,
        exampleSentence: annotation.exampleSentence,
        aiAnalysis: annotation.aiAnalysis,
      },
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
        include: {
          wordAnnotation: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.userVocabulary.count({ where }),
    ]);

    const serialized = items.map((v) => ({
      id: v.id,
      word: {
        word: v.wordAnnotation.word,
        phonetic: v.wordAnnotation.phonetic,
        translation: v.wordAnnotation.translation,
        partOfSpeech: v.wordAnnotation.partOfSpeech,
        definitionEn: v.wordAnnotation.definitionEn,
        exampleSentence: v.wordAnnotation.exampleSentence,
        aiAnalysis: v.wordAnnotation.aiAnalysis,
      },
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
}

export const vocabularyService = new VocabularyService();
