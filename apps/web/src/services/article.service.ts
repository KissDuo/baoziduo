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
  examples: WordExample[] | null;
  tags?: string[];
  inVocabulary: boolean;
  placeholder?: boolean;
  message?: string;
  // Word form associations
  thirdPersonSingular?: string;
  plural?: string;
  books?: { name: string; slug: string; category: string }[];
  forms?: {
    noun?: { word: string; translation: string; partOfSpeech: string | null } | null;
    verb?: { word: string; translation: string; partOfSpeech: string | null } | null;
    adj?: { word: string; translation: string; partOfSpeech: string | null } | null;
    adv?: { word: string; translation: string; partOfSpeech: string | null } | null;
    pastTense?: { word: string; translation: string; partOfSpeech: string | null } | null;
    pastParticiple?: { word: string; translation: string; partOfSpeech: string | null } | null;
  };
  // Collocations (常用搭配)
  collocations?: { phrase: string; translation: string }[];
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
