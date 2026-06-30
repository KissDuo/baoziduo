import { api } from '@/lib/api-client';

export interface VocabBook {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  totalWords: number;
  isMembershipOnly: boolean;
}

export interface VocabWord {
  id: number;
  wordIndex: number;
  word: string;
  chapter?: string | null;
  phonetic: string | null;
  phoneticUk: string | null;
  phoneticUs: string | null;
  partOfSpeech: string | null;
  translation: string;
  examples: { en: string; zh: string }[] | null;
}

export interface BookWordsResponse {
  book: { id: number; name: string; slug: string; totalWords: number };
  words: VocabWord[];
  progress: { learnedCount: number; reviewingCount: number; masteredCount: number; lastStudiedIndex: number } | null;
}

export interface StudyProgressResult {
  learned: number;
  reviewing: number;
  mastered: number;
}

export const vocabStudyService = {
  async listBooks(): Promise<VocabBook[]> {
    return api.get<VocabBook[]>('/vocabulary/books');
  },

  async getBookWords(slug: string): Promise<BookWordsResponse> {
    return api.get<BookWordsResponse>(`/vocabulary/books/${slug}/words`);
  },

  async submitProgress(slug: string, results: { wordId: number; known: boolean }[]): Promise<StudyProgressResult> {
    return api.post<StudyProgressResult>(`/vocabulary/books/${slug}/progress`, { results });
  },
};
