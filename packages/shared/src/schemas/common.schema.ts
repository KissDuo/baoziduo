import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const paginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    total: z.number(),
    page: z.number(),
    pageSize: z.number(),
    totalPages: z.number(),
  });

export const successResponseSchema = z.object({
  ok: z.literal(true),
});

export const errorResponseSchema = z.object({
  error: z.string(),
  code: z.string().optional(),
  details: z.any().optional(),
});

export const quotaInfoSchema = z.object({
  quotaType: z.string(),
  dailyLimit: z.number(),
  usedToday: z.number(),
  remaining: z.number(),
});

export type PaginationInput = z.infer<typeof paginationSchema>;
export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
export type QuotaInfo = z.infer<typeof quotaInfoSchema>;
