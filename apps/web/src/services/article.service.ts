import { api } from '@/lib/api-client';
import type {
  ArticleListItem,
  ArticleDetail,
  ArticleProgress,
  ArticleTranslationResponse,
  UserVocabulary,
  UpdateProgressInput,
  AddVocabularyInput,
} from '@english/shared';

export interface ArticleListParams {
  page?: number;
  pageSize?: number;
  difficultyLevel?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface WordExample {
  en: string;
  zh: string;
}

export interface WordAnnotationResponse {
  word: string;
  phonetic: string | null;
  phoneticUk: string | null;
  phoneticUs: string | null;
  translation: string;
  partOfSpeech: string | null;
  definitionEn: string | null;
  exampleSentence: string | null;
  examples: WordExample[] | null;
  aiAnalysis: string | null;
  inVocabulary: boolean;
  placeholder?: boolean;
  message?: string;
}

export const articleService = {
  // ── Articles ──

  async list(params: ArticleListParams = {}): Promise<PaginatedResponse<ArticleListItem>> {
    const searchParams: Record<string, string> = {};
    if (params.page) searchParams.page = String(params.page);
    if (params.pageSize) searchParams.pageSize = String(params.pageSize);
    if (params.difficultyLevel) searchParams.difficultyLevel = params.difficultyLevel;
    return api.get<PaginatedResponse<ArticleListItem>>('/articles', searchParams);
  },

  async getDetail(slug: string): Promise<ArticleDetail> {
    return api.get<ArticleDetail>(`/articles/${slug}`);
  },

  async getWordAnnotation(slug: string, word: string): Promise<WordAnnotationResponse> {
    return api.get<WordAnnotationResponse>(
      `/articles/${slug}/words/${encodeURIComponent(word)}`,
    );
  },

  async getProgress(slug: string): Promise<ArticleProgress> {
    return api.get<ArticleProgress>(`/articles/${slug}/progress`);
  },

  async updateProgress(slug: string, data: UpdateProgressInput): Promise<ArticleProgress> {
    return api.patch<ArticleProgress>(`/articles/${slug}/progress`, data);
  },

  async translateParagraph(slug: string, paragraphId: number): Promise<ArticleTranslationResponse> {
    return api.post<ArticleTranslationResponse>(`/articles/${slug}/translate/${paragraphId}`);
  },

  // ── Vocabulary ──

  async addVocabulary(data: AddVocabularyInput): Promise<UserVocabulary> {
    return api.post<UserVocabulary>('/vocabulary', data);
  },

  async listVocabulary(params: { page?: number; pageSize?: number } = {}): Promise<PaginatedResponse<UserVocabulary>> {
    const searchParams: Record<string, string> = {};
    if (params.page) searchParams.page = String(params.page);
    if (params.pageSize) searchParams.pageSize = String(params.pageSize);
    return api.get<PaginatedResponse<UserVocabulary>>('/vocabulary', searchParams);
  },

  async removeVocabulary(id: number): Promise<{ ok: boolean }> {
    return api.delete<{ ok: boolean }>(`/vocabulary/${id}`);
  },
};
