import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const DEEPSEEK_API = 'https://api.deepseek.com/chat/completions';
const API_KEY = process.env.DEEPSEEK_API_KEY || '';

const STOP_WORDS = new Set(['a','an','the','of','to','for','in','on','at','by','with','from','as','or','and','that','this','is','be','are','was','were','been','no','not','nor','but','per']);

async function annotateWord(word: string) {
  const prompt = `Annotate the English word "${word}" as a dictionary entry. Return ONLY valid JSON:
{
  "phoneticUk": "UK IPA pronunciation",
  "phoneticUs": "US IPA pronunciation",
  "partOfSpeech": "n./v./adj./adv./etc.",
  "translation": "Chinese translation (concise, 2-8 characters)",
  "examples": [{"en": "example", "zh": "translation"}],
  "forms": {"noun": null, "verb": null, "adj": null, "adv": null, "pastTense": null, "pastParticiple": null, "thirdPerson": null, "plural": null},
  "commonPhrases": [{"phrase": "phrase", "translation": "translation"}]
}`;
  try {
    const res = await fetch(DEEPSEEK_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
      body: JSON.stringify({ model: 'deepseek-chat', messages: [{ role: 'user', content: prompt }], temperature: 0.2, max_tokens: 1500 }),
    });
    if (!res.ok) return null;
    const data = await res.json() as any;
    const content = data.choices?.[0]?.message?.content?.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim() || '';
    return JSON.parse(content);
  } catch { return null; }
}

export async function aiSearch(query: string) {
  const q = query.trim().toLowerCase();
  const isPhrase = q.includes(' ');

  if (isPhrase) {
    // Check existing collocation
    const existingCol = await prisma.collocation.findFirst({
      where: { phrase: q },
      include: { words: true },
    });
    if (existingCol) {
      const relatedWords = await Promise.all(
        existingCol.words.map(async cw => {
          const wa = await prisma.wordAnnotation.findFirst({ where: { word: cw.word } });
          return { word: cw.word, translation: wa?.translation || '' };
        })
      );
      let examples = null;
      try { if (existingCol.examplesJson) examples = JSON.parse(existingCol.examplesJson); } catch {}
      return { word: q, partOfSpeech: 'phrase', translation: existingCol.translation, relatedWords, examples, cached: true };
    }

    // Create new collocation via AI
    const ai = await annotateWord(q); // AI can also define phrases
    if (!ai) return { error: 'AI query failed' };

    const translation = ai.translation || '';
    const col = await prisma.collocation.create({
      data: {
        phrase: q,
        translation,
        words: {
          create: q.split(/\s+/).filter(w => w.length > 0 && !STOP_WORDS.has(w)).map(w => ({ word: w })),
        },
      },
    });
    const relatedWords = await Promise.all(
      (col as any).words?.map(async (cw: any) => {
        const wa = await prisma.wordAnnotation.findFirst({ where: { word: cw.word } });
        return { word: cw.word, translation: wa?.translation || '' };
      }) || []
    );
    return { word: q, partOfSpeech: 'phrase', translation, relatedWords, id: col.id, cached: false };
  }

  // Single word
  const existing = await prisma.wordAnnotation.findUnique({
    where: { word: q },
    include: { tags: { include: { tag: true } } },
  });

  if (existing) {
    // Return existing word data
    let examples = null;
    try { if (existing.examplesJson) examples = JSON.parse(existing.examplesJson); } catch {}
    const noun = existing.nounId ? await prisma.wordAnnotation.findUnique({ where: { id: existing.nounId }, select: { word: true, translation: true, partOfSpeech: true } }) : null;
    const verb = existing.verbId ? await prisma.wordAnnotation.findUnique({ where: { id: existing.verbId }, select: { word: true, translation: true, partOfSpeech: true } }) : null;
    const adj = existing.adjId ? await prisma.wordAnnotation.findUnique({ where: { id: existing.adjId }, select: { word: true, translation: true, partOfSpeech: true } }) : null;
    const adv = existing.advId ? await prisma.wordAnnotation.findUnique({ where: { id: existing.advId }, select: { word: true, translation: true, partOfSpeech: true } }) : null;
    const pastTense = existing.pastTenseId ? await prisma.wordAnnotation.findUnique({ where: { id: existing.pastTenseId }, select: { word: true, translation: true, partOfSpeech: true } }) : null;
    const pastParticiple = existing.pastParticipleId ? await prisma.wordAnnotation.findUnique({ where: { id: existing.pastParticipleId }, select: { word: true, translation: true, partOfSpeech: true } }) : null;

    const colRows = await prisma.collocationWord.findMany({
      where: { word: q },
      include: { collocation: { select: { phrase: true, translation: true } } },
    });
    const collocations = colRows.length > 0 ? colRows.map(c => ({ phrase: c.collocation.phrase, translation: c.collocation.translation })) : undefined;

    return {
      word: existing.word, phoneticUk: existing.phoneticUk, phoneticUs: existing.phoneticUs,
      translation: existing.translation, partOfSpeech: existing.partOfSpeech, examples,
      tags: existing.tags.map(t => t.tag.name),
      plural: existing.plural || undefined, thirdPersonSingular: existing.thirdPersonSingular || undefined,
      forms: { noun, verb, adj, adv, pastTense, pastParticiple },
      collocations,
      cached: true,
    };
  }

  // New word — AI annotate
  const ai = await annotateWord(q);
  if (!ai) return { error: 'AI query failed' };

  // Create WordAnnotation
  const ann = await prisma.wordAnnotation.upsert({
    where: { word: q },
    create: {
      word: q, phoneticUk: ai.phoneticUk, phoneticUs: ai.phoneticUs,
      partOfSpeech: ai.partOfSpeech, translation: ai.translation,
      examplesJson: JSON.stringify(ai.examples || []),
      ...(ai.forms?.thirdPerson && { thirdPersonSingular: ai.forms.thirdPerson }),
      ...(ai.forms?.plural && { plural: ai.forms.plural }),
    },
    update: {
      phoneticUk: ai.phoneticUk, phoneticUs: ai.phoneticUs,
      partOfSpeech: ai.partOfSpeech, translation: ai.translation,
      examplesJson: JSON.stringify(ai.examples || []),
    },
  });

  // Handle forms
  if (ai.forms) {
    const formFields = ['noun', 'verb', 'adj', 'adv', 'pastTense', 'pastParticiple'] as const;
    for (const field of formFields) {
      const formWord = ai.forms[field as keyof typeof ai.forms];
      if (!formWord || formWord.toLowerCase() === q) continue;
      const formAnn = await prisma.wordAnnotation.upsert({
        where: { word: formWord.toLowerCase() },
        create: { word: formWord.toLowerCase(), translation: '[Pending]' },
        update: {},
      });
      await prisma.wordAnnotation.update({ where: { id: ann.id }, data: { [`${field}Id`]: formAnn.id } });
    }
  }

  // Handle collocations
  if (ai.commonPhrases) {
    for (const cp of ai.commonPhrases) {
      if (!cp.phrase || !cp.translation) continue;
      const phrase = cp.phrase.toLowerCase().trim();
      const exists = await prisma.collocation.findFirst({ where: { phrase } });
      if (exists) continue;
      const componentWords = [...new Set(phrase.split(/[\s-]+/).filter(w => w.length > 0 && !STOP_WORDS.has(w)))];
      if (componentWords.length >= 2) {
        try {
          await prisma.collocation.create({
            data: { phrase, translation: cp.translation, words: { create: componentWords.map(w => ({ word: w })) } },
          });
        } catch {}
      }
    }
  }

  const colRows = await prisma.collocationWord.findMany({
    where: { word: q },
    include: { collocation: { select: { phrase: true, translation: true } } },
  });

  return {
    word: ann.word, phoneticUk: ann.phoneticUk, phoneticUs: ann.phoneticUs,
    translation: ann.translation, partOfSpeech: ann.partOfSpeech,
    examples: ai.examples || [],
    tags: [], plural: ann.plural || undefined, thirdPersonSingular: ann.thirdPersonSingular || undefined,
    forms: {},
    collocations: colRows.length > 0 ? colRows.map(c => ({ phrase: c.collocation.phrase, translation: c.collocation.translation })) : undefined,
    cached: false,
  };
}
