import { z } from 'zod';

export const vocabularyBookSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  category: z.enum(['cet4', 'cet6', 'ielts', 'toefl', 'gre', 'custom']),
  totalWords: z.number(),
  isMembershipOnly: z.boolean(),
  isPublished: z.boolean(),
});

export const vocabularyWordSchema = z.object({
  id: z.number(),
  word: z.string(),
  phonetic: z.string().nullable(),
  partOfSpeech: z.string().nullable(),
  translation: z.string(),
  wordIndex: z.number(),
});

export const bookProgressSchema = z.object({
  bookId: z.number(),
  learnedCount: z.number(),
  reviewingCount: z.number(),
  masteredCount: z.number(),
  lastStudiedAt: z.string().nullable(),
});

export const reviewResultSchema = z.object({
  wordId: z.number(),
  quality: z.number().min(0).max(5), // FSRS quality rating
  reviewDurationMs: z.number().min(0),
});

export const submitReviewSchema = z.object({
  results: z.array(reviewResultSchema).min(1).max(50),
});

export type VocabularyBook = z.infer<typeof vocabularyBookSchema>;
export type VocabularyWord = z.infer<typeof vocabularyWordSchema>;
export type BookProgress = z.infer<typeof bookProgressSchema>;
export type ReviewResult = z.infer<typeof reviewResultSchema>;
export type SubmitReviewInput = z.infer<typeof submitReviewSchema>;
