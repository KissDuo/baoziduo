import prisma from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

export class IeltsService {
  // ── List published exams ──
  async listExams(type?: string) {
    const where: any = { isPublished: true };
    if (type) where.type = type;

    const exams = await prisma.iELTSExam.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        type: true,
        durationMinutes: true,
        totalQuestions: true,
        totalSections: true,
        isMembershipOnly: true,
        isPublished: true,
      },
    });

    return exams;
  }

  // ── Get exam detail (with sections, without question answers) ──
  async getExamDetail(examId: number) {
    const exam = await prisma.iELTSExam.findUnique({
      where: { id: examId },
      include: {
        sections: {
          orderBy: { sectionIndex: 'asc' },
          include: {
            questions: {
              orderBy: { questionIndex: 'asc' },
              select: {
                id: true,
                sectionId: true,
                questionIndex: true,
                questionType: true,
                questionText: true,
                options: true,
                score: true,
                passageText: true,
                // correctAnswer is NOT sent to client
              },
            },
          },
        },
      },
    });

    if (!exam || !exam.isPublished) {
      throw new AppError(404, 'Exam not found', 'NOT_FOUND');
    }

    return {
      id: exam.id,
      title: exam.title,
      type: exam.type,
      durationMinutes: exam.durationMinutes,
      totalQuestions: exam.totalQuestions,
      totalSections: exam.totalSections,
      isMembershipOnly: exam.isMembershipOnly,
      sections: exam.sections.map((s) => ({
        id: s.id,
        sectionIndex: s.sectionIndex,
        title: s.title,
        instructions: s.instructions,
        questions: s.questions.map((q) => ({
          id: q.id,
          sectionId: q.sectionId,
          questionIndex: q.questionIndex,
          questionType: q.questionType,
          questionText: q.questionText,
          options: q.options,
          score: q.score,
          passageText: q.passageText,
        })),
      })),
    };
  }

  // ── Start or resume an attempt ──
  async startAttempt(userId: number, examId: number) {
    // Check if there's an in-progress attempt
    let attempt = await prisma.iELTSAttempt.findFirst({
      where: { userId, examId, status: 'in_progress' },
      orderBy: { startedAt: 'desc' },
    });

    if (attempt) {
      // Return existing attempt with saved answers
      const answers = await prisma.iELTSUserAnswer.findMany({
        where: { attemptId: attempt.id },
        select: { questionId: true, userAnswer: true },
      });

      return {
        id: attempt.id,
        examId: attempt.examId,
        status: attempt.status,
        startedAt: attempt.startedAt.toISOString(),
        timeSpentSeconds: attempt.timeSpentSeconds || 0,
        savedAnswers: Object.fromEntries(answers.map((a) => [a.questionId, a.userAnswer])),
      };
    }

    // Create new attempt
    const exam = await prisma.iELTSExam.findUnique({ where: { id: examId } });
    if (!exam) throw new AppError(404, 'Exam not found', 'NOT_FOUND');

    attempt = await prisma.iELTSAttempt.create({
      data: {
        userId,
        examId,
        status: 'in_progress',
        maxScore: exam.totalQuestions,
        startedAt: new Date(),
      },
    });

    return {
      id: attempt.id,
      examId: attempt.examId,
      status: attempt.status,
      startedAt: attempt.startedAt.toISOString(),
      timeSpentSeconds: 0,
      savedAnswers: {},
    };
  }

  // ── Save a single answer ──
  async saveAnswer(userId: number, attemptId: number, questionId: number, answer: string) {
    const attempt = await prisma.iELTSAttempt.findUnique({ where: { id: attemptId } });
    if (!attempt || attempt.userId !== userId) {
      throw new AppError(404, 'Attempt not found', 'NOT_FOUND');
    }
    if (attempt.status !== 'in_progress') {
      throw new AppError(400, 'Attempt already submitted', 'ALREADY_SUBMITTED');
    }

    await prisma.iELTSUserAnswer.upsert({
      where: { attemptId_questionId: { attemptId, questionId } },
      create: { attemptId, questionId, userAnswer: answer },
      update: { userAnswer: answer },
    });

    return { ok: true };
  }

  // ── Submit and score ──
  async submitAttempt(userId: number, attemptId: number) {
    const attempt = await prisma.iELTSAttempt.findUnique({ where: { id: attemptId } });
    if (!attempt || attempt.userId !== userId) {
      throw new AppError(404, 'Attempt not found', 'NOT_FOUND');
    }
    if (attempt.status !== 'in_progress') {
      throw new AppError(400, 'Attempt already submitted', 'ALREADY_SUBMITTED');
    }

    // Fetch all answers and the correct answers
    const [userAnswers, exam] = await Promise.all([
      prisma.iELTSUserAnswer.findMany({ where: { attemptId } }),
      prisma.iELTSExam.findUnique({
        where: { id: attempt.examId },
        include: {
          sections: {
            include: { questions: { select: { id: true, correctAnswer: true, score: true } } },
          },
        },
      }),
    ]);

    const answerMap = new Map(userAnswers.map((a) => [a.questionId, a.userAnswer]));
    let totalScore = 0;
    const questionDetails: any[] = [];

    for (const section of exam!.sections) {
      for (const q of section.questions) {
        const userAnswer = answerMap.get(q.id) || '';
        const isCorrect = userAnswer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
        const scoreEarned = isCorrect ? Number(q.score) : 0;
        totalScore += scoreEarned;

        questionDetails.push({
          questionId: q.id,
          userAnswer,
          correctAnswer: q.correctAnswer,
          isCorrect,
          scoreEarned,
        });

        // Update the user answer record with correctness
        await prisma.iELTSUserAnswer.updateMany({
          where: { attemptId, questionId: q.id },
          data: { isCorrect, scoreEarned },
        });
      }
    }

    // Update attempt
    const maxScore = Number(attempt.maxScore);
    await prisma.iELTSAttempt.update({
      where: { id: attemptId },
      data: {
        status: 'submitted',
        submittedAt: new Date(),
        totalScore,
      },
    });

    // Build section scores
    const sectionScores = exam!.sections.map((s) => {
      const qIds = s.questions.map((q) => q.id);
      const correct = questionDetails.filter((d) => qIds.includes(d.questionId) && d.isCorrect);
      return {
        sectionTitle: s.title,
        score: correct.reduce((sum, d) => sum + d.scoreEarned, 0),
        maxScore: s.questions.reduce((sum, q) => sum + Number(q.score), 0),
        correctCount: correct.length,
        totalCount: s.questions.length,
      };
    });

    return {
      id: attempt.id,
      examTitle: exam!.title,
      examType: exam!.type,
      status: 'submitted',
      startedAt: attempt.startedAt.toISOString(),
      submittedAt: new Date().toISOString(),
      totalScore,
      maxScore,
      timeSpentSeconds: attempt.timeSpentSeconds,
      sectionScores,
      questions: questionDetails,
    };
  }

  // ── Get attempt result ──
  async getResult(userId: number, attemptId: number) {
    const attempt = await prisma.iELTSAttempt.findUnique({
      where: { id: attemptId },
      include: {
        exam: {
          include: {
            sections: {
              orderBy: { sectionIndex: 'asc' },
              include: {
                questions: {
                  orderBy: { questionIndex: 'asc' },
                  select: {
                    id: true,
                    questionIndex: true,
                    questionType: true,
                    questionText: true,
                    correctAnswer: true,
                    score: true,
                    sectionId: true,
                  },
                },
              },
            },
          },
        },
        answers: true,
      },
    });

    if (!attempt || attempt.userId !== userId) {
      throw new AppError(404, 'Result not found', 'NOT_FOUND');
    }

    const answerMap = new Map(attempt.answers.map((a) => [a.questionId, a]));
    const sectionScores = attempt.exam.sections.map((s) => {
      const qs = s.questions.map((q) => {
        const ans = answerMap.get(q.id);
        return {
          questionId: q.id,
          questionIndex: q.questionIndex,
          questionType: q.questionType,
          questionText: q.questionText,
          correctAnswer: q.correctAnswer,
          userAnswer: ans?.userAnswer || '',
          isCorrect: ans?.isCorrect ?? false,
          scoreEarned: Number(ans?.scoreEarned || 0),
          maxScore: Number(q.score),
        };
      });
      return {
        sectionIndex: s.sectionIndex,
        sectionTitle: s.title,
        questions: qs,
        score: qs.reduce((sum, q) => sum + q.scoreEarned, 0),
        maxScore: qs.reduce((sum, q) => sum + q.maxScore, 0),
        correctCount: qs.filter((q) => q.isCorrect).length,
        totalCount: qs.length,
      };
    });

    const totalScore = Number(attempt.totalScore || 0);
    const ieltsBand = this.estimateBand(totalScore, Number(attempt.maxScore));

    return {
      id: attempt.id,
      examTitle: attempt.exam.title,
      examType: attempt.exam.type,
      status: attempt.status,
      startedAt: attempt.startedAt.toISOString(),
      submittedAt: attempt.submittedAt?.toISOString() || null,
      totalScore,
      maxScore: Number(attempt.maxScore),
      ieltsBand,
      timeSpentSeconds: attempt.timeSpentSeconds,
      sectionScores,
    };
  }

  // ── List user's attempts ──
  async listAttempts(userId: number) {
    const attempts = await prisma.iELTSAttempt.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
      include: { exam: { select: { title: true, type: true } } },
      take: 20,
    });

    return attempts.map((a) => ({
      id: a.id,
      examTitle: a.exam.title,
      examType: a.exam.type,
      status: a.status,
      totalScore: Number(a.totalScore || 0),
      maxScore: Number(a.maxScore),
      startedAt: a.startedAt.toISOString(),
      submittedAt: a.submittedAt?.toISOString() || null,
    }));
  }

  // ── Estimate IELTS band score (rough) ──
  private estimateBand(score: number, maxScore: number): number {
    const pct = maxScore > 0 ? score / maxScore : 0;
    if (pct >= 0.97) return 9.0;
    if (pct >= 0.92) return 8.5;
    if (pct >= 0.87) return 8.0;
    if (pct >= 0.83) return 7.5;
    if (pct >= 0.75) return 7.0;
    if (pct >= 0.67) return 6.5;
    if (pct >= 0.58) return 6.0;
    if (pct >= 0.50) return 5.5;
    if (pct >= 0.42) return 5.0;
    if (pct >= 0.33) return 4.5;
    if (pct >= 0.25) return 4.0;
    if (pct >= 0.17) return 3.5;
    return 3.0;
  }
}

export const ieltsService = new IeltsService();
