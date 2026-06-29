import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DICTATION_TITLES: Record<string, string> = {
  numbers: '数字精听',
  names: '人名精听',
  places: '地名精听',
  mixed: '混合精听',
};
function getDictationTitle(cat: string | null) { return DICTATION_TITLES[cat || ''] || cat || 'Dictation'; }

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s']/g, '').replace(/\s+/g, ' ').trim();
}

export async function listTranscripts(category?: string) {
  const where: any = { status: 'ready' };
  if (category) where.category = category;

  const transcripts = await prisma.listeningTranscript.findMany({
    where,
    include: {
      section: {
        include: { exam: { select: { title: true, type: true } } },
      },
      _count: { select: { sentences: true } },
    },
    orderBy: { id: 'desc' },
  });

  return transcripts.map(t => ({
    id: t.id,
    sectionId: t.sectionId,
    title: t.section ? (t.section.exam.title + ' - ' + t.section.title) : getDictationTitle(t.category),
    category: t.category,
    sentenceCount: t._count.sentences,
    sourceUrl: t.sourceUrl,
    createdAt: t.createdAt,
  }));
}

export async function getTranscript(id: number) {
  const transcript = await prisma.listeningTranscript.findUnique({
    where: { id },
    include: {
      section: {
        include: { exam: { select: { title: true } } },
      },
      sentences: {
        orderBy: { index: 'asc' },
        select: {
          id: true,
          index: true,
          startTime: true,
          endTime: true,
          text: true,
          translation: true,
        },
      },
    },
  });

  if (!transcript) return null;

  // Check if dictation (no section): include per-sentence audioUrl
  const isDictation = !transcript.sectionId;

  return {
    id: transcript.id,
    title: transcript.section ? (transcript.section.exam.title + ' - ' + transcript.section.title) : getDictationTitle(transcript.category),
    category: transcript.category,
    sourceUrl: transcript.sourceUrl,
    status: transcript.status,
    isDictation,
    sentences: transcript.sentences.map(s => ({
      ...s,
      audioUrl: s.audioUrl || undefined,
    })),
  };
}

export async function checkSentence(transcriptId: number, sentenceIndex: number, userInput: string) {
  const sentence = await prisma.listeningSentence.findFirst({
    where: { transcriptId, index: sentenceIndex },
  });

  if (!sentence) return { error: 'Sentence not found' };

  const normalizedInput = normalizeText(userInput);
  const normalizedAnswer = normalizeText(sentence.text);

  const inputWords = normalizedInput.split(' ').filter(Boolean);
  const answerWords = normalizedAnswer.split(' ').filter(Boolean);

  let correctCount = 0;
  const wordResults = answerWords.map((answerWord, i) => {
    const inputWord = inputWords[i] || '';
    const isCorrect = inputWord === answerWord;
    if (isCorrect) correctCount++;
    return { expected: answerWord, input: inputWord, correct: isCorrect };
  });

  return {
    correct: normalizedInput === normalizedAnswer,
    accuracy: answerWords.length > 0 ? correctCount / answerWords.length : 0,
    answer: sentence.text,
    wordResults,
  };
}

export async function transcribe(audioUrl: string, category: string, sectionId?: number) {
  // Create or update pending transcript
  let transcript;
  if (sectionId) {
    transcript = await prisma.listeningTranscript.upsert({
      where: { sectionId },
      create: { sectionId, sourceUrl: audioUrl, status: 'pending', category },
      update: { sourceUrl: audioUrl, status: 'pending' },
    });
  } else {
    transcript = await prisma.listeningTranscript.create({
      data: { sectionId: 0, sourceUrl: audioUrl, status: 'pending', category },
    });
  }
  return { id: transcript.id, status: transcript.status, message: 'Transcription queued. Run scripts/transcribe-listening.ts to process.' };
}
