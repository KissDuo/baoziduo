import { z } from 'zod';

const articleProgressBriefSchema = z.object({
  isCompleted: z.boolean(),
  scrollPercent: z.number(),
  timeSpentSeconds: z.number().optional(),
});

export const articleListItemSchema = z.object({
  id: z.number(),
  title: z.string(),
  titleZh: z.string().nullable(),
  slug: z.string(),
  source: z.string().nullable(),
  summary: z.string().nullable(),
  difficultyLevel: z.enum(['short', 'medium', 'long']),
  wordCount: z.number(),
  isMembershipOnly: z.boolean(),
  coverImage: z.string().nullable(),
  publishDate: z.string().nullable(),
  createdAt: z.string(),
  userProgress: articleProgressBriefSchema.nullable().optional(),
});

export const articleParagraphSchema = z.object({
  id: z.number(),
  paragraphIndex: z.number(),
  contentEn: z.string(),
  contentZh: z.string().nullable(),
});

export const articleDetailSchema = articleListItemSchema.extend({
  content: z.string(),
  paragraphs: z.array(articleParagraphSchema),
  vocabularyWords: z.array(z.string()).optional(),
});

const wordExampleSchema = z.object({
  en: z.string(),
  zh: z.string(),
});

export const wordAnnotationSchema = z.object({
  word: z.string(),
  phonetic: z.string().nullable(),
  phoneticUk: z.string().nullable(),
  phoneticUs: z.string().nullable(),
  translation: z.string(),
  partOfSpeech: z.string().nullable(),
  examples: z.array(wordExampleSchema).nullable(),
});

export const userVocabularySchema = z.object({
  id: z.number(),
  word: wordAnnotationSchema.extend({
    phoneticUk: z.string().nullable().optional(),
    phoneticUs: z.string().nullable().optional(),
    examples: z.array(wordExampleSchema).nullable().optional(),
  }),
  masteryLevel: z.number().min(0).max(5),
  nextReviewAt: z.string().nullable(),
  reviewCount: z.number(),
  addedFrom: z.string().nullable(),
  createdAt: z.string(),
});

export const articleProgressSchema = z.object({
  articleId: z.number(),
  isCompleted: z.boolean(),
  scrollPercent: z.number(),
  timeSpentSeconds: z.number(),
});

export const articleTranslationResponseSchema = z.object({
  paragraphId: z.number(),
  translation: z.string(),
  isCached: z.boolean(),
  quotaRemaining: z.number().optional(),
});

// ── Input types ──
export const updateProgressSchema = z.object({
  scrollPercent: z.number().min(0).max(100).optional(),
  timeSpentSeconds: z.number().min(0).optional(),
  isCompleted: z.boolean().optional(),
});

export const addVocabularySchema = z.object({
  word: z.string().min(1),
  addedFrom: z.string().optional(),
});

export type ArticleListItem = z.infer<typeof articleListItemSchema>;
export type ArticleDetail = z.infer<typeof articleDetailSchema>;
export type WordAnnotation = z.infer<typeof wordAnnotationSchema>;
export type UserVocabulary = z.infer<typeof userVocabularySchema>;
export type ArticleProgress = z.infer<typeof articleProgressSchema>;
export type ArticleTranslationResponse = z.infer<typeof articleTranslationResponseSchema>;
export type UpdateProgressInput = z.infer<typeof updateProgressSchema>;
export type AddVocabularyInput = z.infer<typeof addVocabularySchema>;
