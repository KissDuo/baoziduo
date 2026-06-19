import { api } from '@/lib/api-client';

export interface IeltsExamItem {
  id: number;
  title: string;
  type: string;
  durationMinutes: number;
  totalQuestions: number;
  totalSections: number;
  isMembershipOnly: boolean;
}

export interface IeltsSection {
  id: number;
  sectionIndex: number;
  title: string;
  instructions: string | null;
  audioUrl: string | null;
  imageUrl: string | null;
  questions: IeltsQuestion[];
}

export interface IeltsQuestion {
  id: number;
  sectionId: number;
  questionIndex: number;
  questionType: string;
  questionText: string | null;
  options: string | null;
  score: number;
  passageText?: string | null;
}

export interface IeltsExamDetail {
  id: number;
  title: string;
  type: string;
  durationMinutes: number;
  totalQuestions: number;
  totalSections: number;
  isMembershipOnly: boolean;
  sections: IeltsSection[];
}

export interface IeltsAttempt {
  id: number;
  examId: number;
  status: string;
  startedAt: string;
  timeSpentSeconds: number;
  savedAnswers: Record<string, string>;
}

export interface IeltsResult {
  id: number;
  examTitle: string;
  examType: string;
  status: string;
  startedAt: string;
  submittedAt: string | null;
  totalScore: number;
  maxScore: number;
  ieltsBand: number;
  timeSpentSeconds: number | null;
  sectionScores: {
    sectionIndex: number;
    sectionTitle: string;
    questions: {
      questionId: number;
      questionIndex: number;
      questionType: string;
      questionText: string | null;
      correctAnswer: string;
      userAnswer: string;
      isCorrect: boolean;
      scoreEarned: number;
      maxScore: number;
    }[];
    score: number;
    maxScore: number;
    correctCount: number;
    totalCount: number;
  }[];
}

export const ieltsService = {
  async listExams(type?: string): Promise<IeltsExamItem[]> {
    const params = type ? { type } : undefined;
    return api.get('/ielts/exams', params);
  },

  async getDetail(examId: number): Promise<IeltsExamDetail> {
    return api.get(`/ielts/exams/${examId}`);
  },

  async startAttempt(examId: number): Promise<IeltsAttempt> {
    return api.post(`/ielts/exams/${examId}/start`);
  },

  async saveAnswer(attemptId: number, questionId: number, answer: string): Promise<{ ok: boolean }> {
    return api.post(`/ielts/attempts/${attemptId}/answer`, { questionId, answer });
  },

  async submitAttempt(attemptId: number): Promise<any> {
    return api.post(`/ielts/attempts/${attemptId}/submit`);
  },

  async getResult(attemptId: number): Promise<IeltsResult> {
    return api.get(`/ielts/attempts/${attemptId}/result`);
  },

  async listAttempts(): Promise<any[]> {
    return api.get('/ielts/attempts');
  },
};
