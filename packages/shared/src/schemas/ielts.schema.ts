import { z } from 'zod';

export const ieltsExamListItemSchema = z.object({
  id: z.number(),
  title: z.string(),
  type: z.enum(['listening', 'reading']),
  durationMinutes: z.number(),
  totalQuestions: z.number(),
  totalSections: z.number(),
  isMembershipOnly: z.boolean(),
  isPublished: z.boolean(),
});

export const ieltsExamDetailSchema = ieltsExamListItemSchema.extend({
  sections: z.array(z.object({
    id: z.number(),
    sectionIndex: z.number(),
    title: z.string(),
    instructions: z.string().nullable(),
    questionCount: z.number(),
  })),
});

export const ieltsQuestionSchema = z.object({
  id: z.number(),
  sectionId: z.number(),
  questionIndex: z.number(),
  questionType: z.enum(['multiple_choice', 'fill_blank', 'true_false', 'matching', 'short_answer']),
  questionText: z.string().nullable(),
  options: z.string().nullable(), // JSON string
  score: z.number(),
});

export const saveAnswerSchema = z.object({
  questionId: z.number(),
  answer: z.string(),
});

export const batchAnswerSchema = z.object({
  answers: z.array(saveAnswerSchema).min(1).max(100),
});

export const ieltsAttemptResultSchema = z.object({
  id: z.number(),
  examTitle: z.string(),
  examType: z.string(),
  status: z.string(),
  startedAt: z.string(),
  submittedAt: z.string().nullable(),
  totalScore: z.number().nullable(),
  maxScore: z.number(),
  timeSpentSeconds: z.number().nullable(),
  sectionScores: z.array(z.object({
    sectionTitle: z.string(),
    score: z.number(),
    maxScore: z.number(),
    correctCount: z.number(),
    totalCount: z.number(),
  })),
});

export const ieltsAttemptSummarySchema = z.object({
  id: z.number(),
  examTitle: z.string(),
  examType: z.string(),
  status: z.string(),
  totalScore: z.number().nullable(),
  maxScore: z.number(),
  startedAt: z.string(),
  submittedAt: z.string().nullable(),
});

export type IELTSExamListItem = z.infer<typeof ieltsExamListItemSchema>;
export type IELTSExamDetail = z.infer<typeof ieltsExamDetailSchema>;
export type IELTSQuestion = z.infer<typeof ieltsQuestionSchema>;
export type SaveAnswerInput = z.infer<typeof saveAnswerSchema>;
export type BatchAnswerInput = z.infer<typeof batchAnswerSchema>;
export type IELTSAttemptResult = z.infer<typeof ieltsAttemptResultSchema>;
export type IELTSAttemptSummary = z.infer<typeof ieltsAttemptSummarySchema>;
