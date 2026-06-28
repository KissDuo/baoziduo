import { PrismaClient } from '@prisma/client';
import { config } from '../src/config/index.js';

const p = new PrismaClient();
const DEEPSEEK_API = 'https://api.deepseek.com/chat/completions';

interface AIResult {
  phoneticUk: string;
  phoneticUs: string;
  partOfSpeech: string;
  translation: string;
  examples: { en: string; zh: string }[];
  forms?: { noun?: string; verb?: string; adj?: string; adv?: string; pastTense?: string; pastParticiple?: string; thirdPerson?: string; plural?: string };
  commonPhrases?: { phrase: string; translation: string }[];
}

// Only query phrases for common words (short, basic vocabulary)
const isCommon = word.length <= 10 && !word.includes('-') && !/[0-9]/.test(word);

async function enrichWord(word: string): Promise<AIResult | null> {
  const phrasesPart = isCommon ? `,
  "commonPhrases": [
    {"phrase": "common phrase using this word (at least 2 words)", "translation": "Chinese translation"},
    ... (up to 3 most frequently used phrases, e.g. for 'out': 'out of sight', 'out of date', 'work out')
  ],` : '';

  const prompt = `Annotate the English word "${word}" as a dictionary entry. Return ONLY valid JSON:

{
  "phoneticUk": "UK IPA pronunciation",
  "phoneticUs": "US IPA pronunciation",
  "partOfSpeech": "n./v./adj./adv./etc.",
  "translation": "Chinese translation (concise, 2-8 characters)",
  "examples": [
    {"en": "English example sentence 1", "zh": "Chinese translation 1"},
    {"en": "English example sentence 2", "zh": "Chinese translation 2"},
    {"en": "English example sentence 3", "zh": "Chinese translation 3"}
  ]${phrasesPart}
  "forms": {
    "noun": "noun form of this word, or null",
    "verb": "verb form of this word, or null",
    "adj": "adjective form of this word, or null",
    "adv": "adverb form of this word, or null",
    "pastTense": "past tense if a verb, or null",
    "pastParticiple": "past participle if a verb, or null",
    "thirdPerson": "third person singular form, or null",
    "plural": "plural form, or null"
  }
}`;

  try {
    const response = await fetch(DEEPSEEK_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.deepseek.apiKey}` },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: 'You are a precise English dictionary. Return only valid JSON.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
        max_tokens: isCommon ? 1800 : 1200,
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.error(`  API error ${response.status}: ${errText.slice(0, 200)}`);
      return null;
    }

    const data = await response.json() as any;
    const content = data.choices?.[0]?.message?.content || '';
    const jsonStr = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

    try {
      const result = JSON.parse(jsonStr) as AIResult;
      if (!result.phoneticUk || !result.translation) return null;
      return result;
    } catch {
      console.error(`  JSON parse failed: ${jsonStr.slice(0, 100)}`);
      return null;
    }
  } catch (err: any) {
    console.error(`  Fetch error: ${err.message}`);
    return null;
  }
}

async function main() {
  const arg = process.argv[2] || 'ielts-vocab-real';

  let words: any[];
  let label: string;

  if (arg === 'all') {
    // Process ALL WordAnnotations directly (not via VocabularyWord)
    const annotations = await p.wordAnnotation.findMany({
      orderBy: { id: 'asc' },
    });
    words = annotations.map(a => ({ id: a.id, word: a.word, partOfSpeech: a.partOfSpeech, translation: a.translation, wordAnnotation: a }));
    label = `all ${annotations.length} WordAnnotations`;
  } else {
    const book = await p.vocabularyBook.findUnique({ where: { slug: arg } });
    if (!book) { console.error(`Book not found: ${arg}`); return; }
    words = await p.vocabularyWord.findMany({
      where: { bookId: book.id },
      orderBy: { wordIndex: 'asc' },
      include: { wordAnnotation: { select: { phoneticUk: true } } },
    });
    label = `${words.length} words from ${book.name}`;
  }

  console.log(`Processing ${label}...`);

  let done = 0;
  let success = 0;

  for (const w of words) {
    // Target specific words if IDs provided via env var, otherwise skip already-good words
    const targetIds = process.env.TARGET_IDS ? process.env.TARGET_IDS.split(',').map(Number) : null;
    if (targetIds) {
      if (!targetIds.includes(w.id)) { done++; continue; }
    } else {
      const ann = w.wordAnnotation;
      if (ann?.phoneticUk && w.partOfSpeech && w.translation.length > 2 && !w.translation.startsWith('.')) {
        // In 'all' mode, also check if thirdPersonSingular or plural are missing (added later to schema)
        if (arg === 'all') {
          const pos = (w.partOfSpeech || '').toLowerCase();
          const needsThird = pos.includes('v') && !ann.thirdPersonSingular;  // verb missing third-person singular
          const needsPlural = pos.includes('n') && !ann.plural;              // noun missing plural
          if (!needsThird && !needsPlural) { done++; continue; }
        } else {
          done++;
          continue;
        }
      }
    }

    console.log(`[${done + 1}/${words.length}] ${w.word}...`);
    const ai = await enrichWord(w.word);

    if (ai) {
      // Update WordAnnotation with full data
      const ann = await p.wordAnnotation.upsert({
        where: { word: w.word },
        create: {
          word: w.word,
          phoneticUk: ai.phoneticUk,
          phoneticUs: ai.phoneticUs,
          partOfSpeech: ai.partOfSpeech,
          translation: ai.translation,
          examplesJson: JSON.stringify(ai.examples),
          ...(ai.forms?.thirdPerson && { thirdPersonSingular: ai.forms.thirdPerson }),
          ...(ai.forms?.plural && { plural: ai.forms.plural }),
        },
        update: {
          phoneticUk: ai.phoneticUk,
          phoneticUs: ai.phoneticUs,
          partOfSpeech: ai.partOfSpeech,
          translation: ai.translation,
          examplesJson: JSON.stringify(ai.examples),
          ...(ai.forms?.thirdPerson && { thirdPersonSingular: ai.forms.thirdPerson }),
          ...(ai.forms?.plural && { plural: ai.forms.plural }),
        },
      });

      // Update VocabularyWord if processing a book
      if (arg !== 'all') {
        await p.vocabularyWord.update({ where: { id: w.id }, data: { partOfSpeech: ai.partOfSpeech, translation: ai.translation, wordAnnotationId: ann.id } });
      }

      // Process word forms
      if (ai.forms) {
        const formFields = ['noun', 'verb', 'adj', 'adv', 'pastTense', 'pastParticiple'] as const;
        const formUpdates: Record<string, number | null> = {};
        // Reverse link: when A links to form B, also link B back to A
        const reverseField: Record<string, string> = {
          noun: 'verbId',         // noun form's verb is the current word
          verb: 'nounId',         // verb form's noun is the current word
          adj: 'advId',           // adj form's adverb is the current word
          adv: 'adjId',           // adv form's adjective is the current word
          pastTense: 'verbId',    // past tense form's verb is the current word
          pastParticiple: 'verbId', // past participle form's verb is the current word
        };
        for (const field of formFields) {
          const formWord = ai.forms[field as keyof typeof ai.forms];
          if (!formWord || formWord.toLowerCase() === w.word.toLowerCase()) continue;
          const formAnn = await p.wordAnnotation.upsert({
            where: { word: formWord.toLowerCase() },
            create: { word: formWord.toLowerCase(), translation: '[Pending]' },
            update: {},
          });
          if (!formAnn.phoneticUk) {
            try {
              const formAI = await enrichWord(formWord.toLowerCase());
              if (formAI) {
                await p.wordAnnotation.update({
                  where: { id: formAnn.id },
                  data: { phoneticUk: formAI.phoneticUk.replace(/^\/|\/$/g, ''), phoneticUs: formAI.phoneticUs.replace(/^\/|\/$/g, ''), partOfSpeech: formAI.partOfSpeech, translation: formAI.translation, examplesJson: JSON.stringify(formAI.examples) },
                });
              }
            } catch { /* skip */ }
          }
          const tags = await p.wordAnnotationTag.findMany({ where: { wordAnnotationId: ann.id } });
          for (const t of tags) {
            await p.wordAnnotationTag.upsert({ where: { wordAnnotationId_tagId: { wordAnnotationId: formAnn.id, tagId: t.tagId } }, create: { wordAnnotationId: formAnn.id, tagId: t.tagId }, update: {} });
          }
          formUpdates[field + 'Id'] = formAnn.id;
          // Set reverse link: form word points back to current word
          const revField = reverseField[field];
          if (revField && !(formAnn as any)[revField]) {
            await p.wordAnnotation.update({ where: { id: formAnn.id }, data: { [revField]: ann.id } });
          }
        }
        if (Object.keys(formUpdates).length > 0) {
          await p.wordAnnotation.update({ where: { id: ann.id }, data: formUpdates as any });
        }
      }

      // Save common phrases as Collocations
      if (ai.commonPhrases && ai.commonPhrases.length > 0) {
        for (const cp of ai.commonPhrases) {
          if (!cp.phrase || !cp.translation || cp.phrase.length < 3) continue;
          const phrase = cp.phrase.toLowerCase().trim();
          // Check if collocation already exists
          const existing = await p.collocation.findFirst({ where: { phrase } });
          if (!existing) {
            // Extract component words (remove stop words)
            const stopWords = new Set(['a','an','the','of','to','for','in','on','at','by','with','from','as','or','and','that','this','is','be','are','was','were','been','no','not','nor','but','per']);
            const componentWords = [...new Set(phrase.split(/[\s-]+/).filter((w: string) => w.length > 0 && !stopWords.has(w)))];
            if (componentWords.length >= 2) {
              try {
                await p.collocation.create({
                  data: {
                    phrase,
                    translation: cp.translation,
                    words: { create: componentWords.map((w: string) => ({ word: w })) },
                  },
                });
              } catch { /* duplicate, skip */ }
            }
          }
        }
      }

      success++;
    }

    done++;

    // Rate limit: small delay between requests
    if (done % 10 === 0) {
      console.log(`  Progress: ${done}/${words.length} (${success} enriched)`);
      await new Promise(r => setTimeout(r, 500)); // 500ms pause every 10
    }

    // Longer pause every 50 to avoid rate limits
    if (done % 50 === 0) {
      console.log(`  Cooling down...`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  console.log(`\nDone! Enriched ${success}/${words.length} words`);
  await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
