import prisma from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { aiService } from './ai.service.js';

// ── In-memory rate limiter for anonymous users ──
const anonQuota = new Map<string, { used: number; date: string }>();

function getAnonKey(ip: string, type: string): string {
  return `${ip}:${type}`;
}

function checkAnonQuota(ip: string, type: string, limit: number): boolean {
  const today = new Date().toISOString().slice(0, 10);
  const key = getAnonKey(ip, type);
  const entry = anonQuota.get(key);

  if (!entry || entry.date !== today) {
    anonQuota.set(key, { used: 1, date: today });
    return true;
  }

  if (entry.used >= limit) {
    return false;
  }

  entry.used += 1;
  return true;
}

// ── Quota helpers for authenticated users ──
async function checkUserQuota(userId: number, quotaType: string, dailyLimit: number): Promise<{ allowed: boolean; remaining: number }> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let quota = await prisma.userUsageQuota.findUnique({
    where: { userId_quotaType: { userId, quotaType } },
  });

  if (!quota) {
    quota = await prisma.userUsageQuota.create({
      data: { userId, quotaType, dailyLimit, usedToday: 0, lastResetDate: today },
    });
  }

  // Reset if new day
  const lastReset = new Date(quota.lastResetDate);
  lastReset.setHours(0, 0, 0, 0);
  if (lastReset < today) {
    quota = await prisma.userUsageQuota.update({
      where: { id: quota.id },
      data: { usedToday: 0, lastResetDate: today },
    });
  }

  if (quota.usedToday >= quota.dailyLimit) {
    return { allowed: false, remaining: 0 };
  }

  await prisma.userUsageQuota.update({
    where: { id: quota.id },
    data: { usedToday: { increment: 1 } },
  });

  return { allowed: true, remaining: quota.dailyLimit - quota.usedToday - 1 };
}

// ── Helpers ──
function serializeArticle(article: any) {
  return {
    ...article,
    publishDate: article.publishDate?.toISOString() ?? null,
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),
    paragraphs: article.paragraphs?.map((p: any) => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
    })),
    userProgress: article.userProgress
      ? {
          isCompleted: article.userProgress.isCompleted,
          scrollPercent: article.userProgress.scrollPercent,
          timeSpentSeconds: article.userProgress.timeSpentSeconds,
        }
      : null,
  };
}

export class ArticleService {
  // ── List Articles ──
  async listArticles(
    page: number,
    pageSize: number,
    difficultyLevel?: string,
    userId?: number,
  ) {
    const where: any = { isPublished: true };
    if (difficultyLevel) {
      where.difficultyLevel = difficultyLevel;
    }

    const [items, total] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy: { publishDate: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.article.count({ where }),
    ]);

    // If user is authenticated, attach their progress for these articles
    let progressMap: Map<number, any> = new Map();
    if (userId && items.length > 0) {
      const progressEntries = await prisma.articleProgress.findMany({
        where: {
          userId,
          articleId: { in: items.map((a) => a.id) },
        },
      });
      progressMap = new Map(progressEntries.map((p) => [p.articleId, p]));
    }

    const serialized = items.map((article) => {
      const progress = progressMap.get(article.id);
      return {
        id: article.id,
        title: article.title,
        slug: article.slug,
        source: article.source,
        summary: article.summary,
        difficultyLevel: article.difficultyLevel,
        wordCount: article.wordCount,
        estimatedMinutes: article.estimatedMinutes,
        isMembershipOnly: article.isMembershipOnly,
        coverImage: article.coverImage,
        publishDate: article.publishDate?.toISOString() ?? null,
        createdAt: article.createdAt.toISOString(),
        userProgress: progress
          ? {
              isCompleted: progress.isCompleted,
              scrollPercent: progress.scrollPercent,
            }
          : null,
      };
    });

    return {
      items: serialized,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  // ── Get Article Detail ──
  async getArticleBySlug(slug: string, userId?: number) {
    const article = await prisma.article.findUnique({
      where: { slug },
      include: {
        paragraphs: {
          orderBy: { paragraphIndex: 'asc' },
        },
      },
    });

    if (!article || !article.isPublished) {
      throw new AppError(404, 'Article not found', 'NOT_FOUND');
    }

    // Load user progress and vocabulary words if authenticated
    let userProgress = null;
    let vocabularyWords: string[] = [];
    if (userId) {
      const [progress, vocabEntries] = await Promise.all([
        prisma.articleProgress.findUnique({
          where: { userId_articleId: { userId, articleId: article.id } },
        }),
        // Extract all unique lowercase words from paragraphs
        (async () => {
          const allWords = new Set<string>();
          for (const p of article.paragraphs) {
            const tokens = p.contentEn.split(/[^a-zA-Z'-]+/);
            for (const t of tokens) {
              const w = t.toLowerCase().trim();
              if (w.length >= 2) allWords.add(w);
            }
          }
          if (allWords.size === 0) return [];

          const wordAnnotations = await prisma.wordAnnotation.findMany({
            where: { word: { in: Array.from(allWords) } },
            select: { id: true, word: true },
          });
          if (wordAnnotations.length === 0) return [];

          const wordAnnotationIds = wordAnnotations.map((w) => w.id);
          const userVocab = await prisma.userVocabulary.findMany({
            where: {
              userId,
              wordAnnotationId: { in: wordAnnotationIds },
            },
            select: { wordAnnotation: { select: { word: true } } },
          });
          return userVocab.map((v) => v.wordAnnotation.word);
        })(),
      ]);
      userProgress = progress;
      vocabularyWords = vocabEntries;
    }

    const result: any = {
      id: article.id,
      title: article.title,
      slug: article.slug,
      source: article.source,
      summary: article.summary,
      content: article.content,
      difficultyLevel: article.difficultyLevel,
      wordCount: article.wordCount,
      estimatedMinutes: article.estimatedMinutes,
      isMembershipOnly: article.isMembershipOnly,
      coverImage: article.coverImage,
      publishDate: article.publishDate?.toISOString() ?? null,
      createdAt: article.createdAt.toISOString(),
      paragraphs: article.paragraphs.map((p) => ({
        id: p.id,
        paragraphIndex: p.paragraphIndex,
        contentEn: p.contentEn,
        contentZh: p.contentZh,
      })),
      userProgress: userProgress
        ? {
            isCompleted: userProgress.isCompleted,
            scrollPercent: userProgress.scrollPercent,
            timeSpentSeconds: userProgress.timeSpentSeconds,
          }
        : null,
      vocabularyWords,
    };

    return result;
  }

  // ── Get Word Annotation ──
  async getWordAnnotation(
    articleSlug: string,
    rawWord: string,
    userId?: number,
    ip?: string,
  ) {
    // Verify article exists
    const article = await prisma.article.findUnique({
      where: { slug: articleSlug },
      select: { id: true },
    });
    if (!article) {
      throw new AppError(404, 'Article not found', 'NOT_FOUND');
    }

    // Normalize word: lowercase, trim, strip surrounding punctuation
    const word = rawWord.toLowerCase().trim().replace(/^[^a-z]+|[^a-z]+$/g, '');

    if (!word) {
      throw new AppError(400, 'Invalid word', 'INVALID_WORD');
    }

    // Look up in WordAnnotation
    const annotation = await prisma.wordAnnotation.findUnique({
      where: { word },
    });

    // Check if word is in user's vocabulary
    let inVocabulary = false;
    if (userId && annotation) {
      const vocab = await prisma.userVocabulary.findUnique({
        where: { userId_wordAnnotationId: { userId, wordAnnotationId: annotation.id } },
      });
      inVocabulary = !!vocab;
    }

    if (annotation) {
      // Parse examplesJson if present
      let examples = null;
      if ((annotation as any).examplesJson) {
        try { examples = JSON.parse((annotation as any).examplesJson); } catch { /* ignore */ }
      }
      return {
        word: annotation.word,
        phonetic: annotation.phonetic,
        phoneticUk: (annotation as any).phoneticUk || annotation.phonetic || null,
        phoneticUs: (annotation as any).phoneticUs || annotation.phonetic || null,
        translation: annotation.translation,
        partOfSpeech: annotation.partOfSpeech,
        definitionEn: annotation.definitionEn,
        exampleSentence: annotation.exampleSentence,
        examples,
        aiAnalysis: annotation.aiAnalysis,
        inVocabulary,
        placeholder: false,
      };
    }

    // Word not found — check quota before calling AI
    if (userId) {
      const { allowed } = await checkUserQuota(userId, 'word_annotation', 50);
      if (!allowed) {
        throw new AppError(429, 'Daily word lookup quota exceeded. Try again tomorrow.', 'QUOTA_EXCEEDED');
      }
    } else {
      const ipAddr = ip || 'unknown';
      if (!checkAnonQuota(ipAddr, 'word_annotation', 10)) {
        throw new AppError(429, 'Daily word lookup quota exceeded. Sign up for more.', 'QUOTA_EXCEEDED');
      }
    }

    // Call DeepSeek AI to annotate the word
    let aiResult;
    try {
      aiResult = await aiService.annotateWord(word);
    } catch (aiErr: any) {
      console.error(`[AI] Failed to annotate "${word}":`, aiErr.message);
      // Fallback: create placeholder and return
      await prisma.wordAnnotation.upsert({
        where: { word },
        create: { word, translation: '[Pending]' },
        update: {},
      });
      return {
        word,
        phonetic: null,
        phoneticUk: null,
        phoneticUs: null,
        translation: '[Pending]',
        partOfSpeech: null,
        definitionEn: null,
        exampleSentence: null,
        examples: null,
        aiAnalysis: null,
        inVocabulary: false,
        placeholder: true,
        message: 'AI annotation failed, will retry later.',
      };
    }

    // Save AI result to database
    const examplesJson = JSON.stringify(aiResult.examples);
    const exampleSentence = aiResult.examples?.[0]
      ? `${aiResult.examples[0].en} (${aiResult.examples[0].zh})`
      : null;

    await prisma.wordAnnotation.upsert({
      where: { word },
      create: {
        word,
        phonetic: aiResult.phoneticUk,
        phoneticUk: aiResult.phoneticUk,
        phoneticUs: aiResult.phoneticUs,
        partOfSpeech: aiResult.partOfSpeech,
        translation: aiResult.translation,
        exampleSentence,
        examplesJson,
      } as any,
      update: {
        phonetic: aiResult.phoneticUk,
        phoneticUk: aiResult.phoneticUk,
        phoneticUs: aiResult.phoneticUs,
        partOfSpeech: aiResult.partOfSpeech,
        translation: aiResult.translation,
        exampleSentence,
        examplesJson,
      } as any,
    });

    return {
      word,
      phonetic: aiResult.phoneticUk,
      phoneticUk: aiResult.phoneticUk,
      phoneticUs: aiResult.phoneticUs,
      translation: aiResult.translation,
      partOfSpeech: aiResult.partOfSpeech,
      definitionEn: null,
      exampleSentence,
      examples: aiResult.examples,
      aiAnalysis: null,
      inVocabulary: false,
      placeholder: false,
    };
  }

  // ── Get Article Progress ──
  async getArticleProgress(slug: string, userId: number) {
    const article = await prisma.article.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!article) {
      throw new AppError(404, 'Article not found', 'NOT_FOUND');
    }

    const progress = await prisma.articleProgress.findUnique({
      where: { userId_articleId: { userId, articleId: article.id } },
    });

    if (!progress) {
      return {
        articleId: article.id,
        isCompleted: false,
        scrollPercent: 0,
        timeSpentSeconds: 0,
      };
    }

    return {
      articleId: progress.articleId,
      isCompleted: progress.isCompleted,
      scrollPercent: progress.scrollPercent,
      timeSpentSeconds: progress.timeSpentSeconds,
    };
  }

  // ── Update Article Progress ──
  async updateArticleProgress(
    slug: string,
    userId: number,
    data: { scrollPercent?: number; timeSpentSeconds?: number; isCompleted?: boolean },
  ) {
    const article = await prisma.article.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!article) {
      throw new AppError(404, 'Article not found', 'NOT_FOUND');
    }

    const updateData: any = { lastReadAt: new Date() };
    if (data.scrollPercent !== undefined) updateData.scrollPercent = Math.round(data.scrollPercent);
    if (data.timeSpentSeconds !== undefined) updateData.timeSpentSeconds = Math.round(data.timeSpentSeconds);
    if (data.isCompleted !== undefined) updateData.isCompleted = data.isCompleted;

    const progress = await prisma.articleProgress.upsert({
      where: { userId_articleId: { userId, articleId: article.id } },
      create: {
        userId,
        articleId: article.id,
        ...updateData,
      },
      update: updateData,
    });

    return {
      articleId: progress.articleId,
      isCompleted: progress.isCompleted,
      scrollPercent: progress.scrollPercent,
      timeSpentSeconds: progress.timeSpentSeconds,
    };
  }

  // ── Translate Paragraph ──
  async translateParagraph(
    articleSlug: string,
    paragraphId: number,
    userId?: number,
    ip?: string,
  ) {
    // Find article and verify
    const article = await prisma.article.findUnique({
      where: { slug: articleSlug },
      select: { id: true },
    });
    if (!article) {
      throw new AppError(404, 'Article not found', 'NOT_FOUND');
    }

    // Find paragraph
    const paragraph = await prisma.articleParagraph.findUnique({
      where: { id: paragraphId },
    });
    if (!paragraph || paragraph.articleId !== article.id) {
      throw new AppError(404, 'Paragraph not found', 'NOT_FOUND');
    }

    // If cached translation exists, return it
    if (paragraph.contentZh) {
      return {
        paragraphId: paragraph.id,
        translation: paragraph.contentZh,
        isCached: true,
      };
    }

    // Check quota
    let quotaRemaining: number | undefined;
    if (userId) {
      const { allowed, remaining } = await checkUserQuota(userId, 'paragraph_translation', 10);
      if (!allowed) {
        throw new AppError(429, 'Daily translation quota exceeded. Try again tomorrow.', 'QUOTA_EXCEEDED');
      }
      quotaRemaining = remaining;
    } else {
      const ipAddr = ip || 'unknown';
      if (!checkAnonQuota(ipAddr, 'paragraph_translation', 1)) {
        throw new AppError(429, 'Daily translation quota exceeded. Sign up for more.', 'QUOTA_EXCEEDED');
      }
      quotaRemaining = 0;
    }

    return {
      paragraphId: paragraph.id,
      translation: '[Translation pending...]',
      isCached: false,
      quotaRemaining,
    };
  }
}

export const articleService = new ArticleService();
